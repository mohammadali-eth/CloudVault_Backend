import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { google, drive_v3 } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';
import { Telegraf } from 'telegraf';

@Injectable()
export class FilesService {
  private drive: drive_v3.Drive;
  private bot: Telegraf;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');
    const refreshToken = this.configService.get<string>(
      'GOOGLE_DRIVE_REFRESH_TOKEN',
    );

    if (clientId && clientSecret && refreshToken) {
      const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri,
      );
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      this.drive = google.drive({ version: 'v3', auth: oauth2Client });
    } else {
      // Fallback to service account if refresh token is not set
      const clientEmail = this.configService.get<string>(
        'GOOGLE_DRIVE_CLIENT_EMAIL',
      );
      const privateKey = this.configService
        .get<string>('GOOGLE_DRIVE_PRIVATE_KEY')
        ?.replace(/\\n/g, '\n');

      if (clientEmail && privateKey) {
        const auth = new google.auth.JWT({
          email: clientEmail,
          key: privateKey,
          scopes: ['https://www.googleapis.com/auth/drive'],
        });
        this.drive = google.drive({ version: 'v3', auth });
      }
    }

    // Initialize Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });

    // Initialize Telegram Bot
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (botToken) {
      this.bot = new Telegraf(botToken);
    }
  }

  private async ensureFoldersExist(
    userId: string,
    basePath: string,
    relativePath: string,
    provider: string = 'google-drive',
  ) {
    if (!relativePath || !relativePath.includes('/')) return basePath;

    const parts = relativePath.split('/');
    parts.pop(); // remove the file name
    let currentPath = basePath;

    for (const folderName of parts) {
      if (!folderName || folderName === '.') continue;

      const normalizedPath = currentPath.endsWith('/')
        ? currentPath
        : `${currentPath}/`;

      const existingFolder = await this.prisma.file.findFirst({
        where: {
          ownerId: userId,
          path: normalizedPath,
          name: folderName,
          isFolder: true,
        },
      });

      if (!existingFolder) {
        await this.prisma.file.create({
          data: {
            name: folderName,
            url: '',
            size: 0,
            type: 'folder',
            path: normalizedPath,
            isFolder: true,
            provider: provider,
            ownerId: userId,
          },
        });
      }

      currentPath = `${normalizedPath}${folderName}/`;
    }

    return currentPath.endsWith('/') ? currentPath : `${currentPath}/`;
  }

  async uploadFiles(
    userId: string,
    files: Express.Multer.File[],
    path: string = '/',
    relativePaths: string[] = [],
    provider: string = 'google-drive',
  ) {
    const results = [];
    const folderId = this.configService.get<string>('GOOGLE_DRIVE_FOLDER_ID');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relativePath = relativePaths[i] || file.originalname;
      const finalPath = await this.ensureFoldersExist(userId, path, relativePath, provider);

      try {
        let uploadResult;
        let fileUrl = '';
        let providerFileId = '';

        if (provider === 'cloudinary') {
          uploadResult = (await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: 'cloud-vault',
                resource_type: 'auto',
              },
              (error, result) => {
                if (error) reject(new Error(error.message));
                else resolve(result);
              },
            );
            Readable.from(file.buffer).pipe(uploadStream);
          })) as any;
          fileUrl = uploadResult.secure_url;
          providerFileId = uploadResult.public_id;
        } else if (provider === 'telegram') {
          if (!this.bot) throw new Error('Telegram Bot not configured');
          const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');
          if (!chatId) throw new Error('TELEGRAM_CHAT_ID not set');

          const message = await this.bot.telegram.sendDocument(chatId, {
            source: file.buffer,
            filename: file.originalname,
          }) as any;

          const telegramFileId = message.document?.file_id || message.video?.file_id || message.audio?.file_id;
          fileUrl = `https://t.me/c/${chatId.replace('-100', '')}/${message.message_id}`;
          providerFileId = `${chatId}:${message.message_id}:${telegramFileId}`;
        } else {
          // Default to Google Drive
          if (!this.drive) {
            throw new Error('Google Drive not configured');
          }
          const driveResponse = await this.drive.files.create({
            requestBody: {
              name: file.originalname,
              parents: folderId ? [folderId] : [],
            },
            media: {
              mimeType: file.mimetype,
              body: Readable.from(file.buffer),
            },
            fields: 'id, webViewLink',
            supportsAllDrives: true,
          });
          fileUrl = driveResponse.data.webViewLink || '';
          providerFileId = driveResponse.data.id || '';
        }

        const dbFile = await this.prisma.file.create({
          data: {
            name: file.originalname,
            url: fileUrl,
            size: file.size,
            type: file.mimetype,
            path: finalPath,
            isFolder: false,
            provider: provider,
            providerFileId: providerFileId,
            ownerId: userId,
          },
        });

        results.push(dbFile);
      } catch (error) {
        console.error(`${provider} upload error:`, error);
        throw new InternalServerErrorException(
          `Failed to upload ${file.originalname} to ${provider}`,
        );
      }
    }

    return results;
  }

  async findAll(userId: string, path: string = '/') {
    return this.prisma.file.findMany({
      where: {
        ownerId: userId,
        path: path,
      },
      orderBy: [{ isFolder: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getStats(userId: string) {
    const stats = await this.prisma.file.groupBy({
      by: ['provider'],
      where: { ownerId: userId, isFolder: false },
      _sum: { size: true },
      _count: { id: true },
    });

    const totalFiles = await this.prisma.file.count({
      where: { ownerId: userId, isFolder: false },
    });

    const totalFolders = await this.prisma.file.count({
      where: { ownerId: userId, isFolder: true },
    });

    const totalSize = await this.prisma.file.aggregate({
      where: { ownerId: userId, isFolder: false },
      _sum: { size: true },
    });

    return {
      providers: stats.map((s) => ({
        provider: s.provider,
        size: s._sum.size || 0,
        count: s._count.id,
      })),
      totalFiles,
      totalFolders,
      totalSize: totalSize._sum.size || 0,
    };
  }

  async deleteFile(userId: string, fileId: string) {
    const file = await this.prisma.file.findFirst({
      where: { id: fileId, ownerId: userId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Attempt to delete from provider
    try {
      if (file.provider === 'cloudinary' && file.providerFileId) {
        await cloudinary.uploader.destroy(file.providerFileId);
      } else if (file.provider === 'telegram' && file.providerFileId) {
        const [chatId, messageId] = file.providerFileId.split(':');
        await this.bot.telegram.deleteMessage(chatId, parseInt(messageId));
      } else if (file.provider === 'google-drive' || !file.provider) {
        if (file.providerFileId) {
          await this.drive.files.delete({
            fileId: file.providerFileId,
            supportsAllDrives: true,
          });
        } else if (file.url) {
          // Fallback for older files
          const match = file.url.match(/d\/([a-zA-Z0-9_-]+)/);
          if (match && match[1]) {
            await this.drive.files.delete({
              fileId: match[1],
              supportsAllDrives: true,
            });
          }
        }
      }
    } catch (error) {
      console.error(
        `${file.provider || 'Drive'} delete error (ignoring):`,
        error,
      );
    }

    return this.prisma.file.delete({
      where: { id: fileId },
    });
  }

  async replaceFile(
    userId: string,
    fileId: string,
    newFile: Express.Multer.File,
    provider?: string,
  ) {
    const oldFile = await this.prisma.file.findFirst({
      where: { id: fileId, ownerId: userId },
    });

    if (!oldFile) throw new NotFoundException('File not found');

    const filePath = oldFile.path;
    const finalProvider = provider || oldFile.provider;
    await this.deleteFile(userId, fileId);
    return this.uploadFiles(userId, [newFile], filePath, [], finalProvider);
  }

  async renameFile(userId: string, fileId: string, newName: string) {
    const file = await this.prisma.file.findFirst({
      where: { id: fileId, ownerId: userId },
    });

    if (!file) throw new NotFoundException('File not found');

    // Update provider name if Google Drive
    if (file.provider === 'google-drive' && file.providerFileId) {
      try {
        await this.drive.files.update({
          fileId: file.providerFileId,
          requestBody: { name: newName },
        });
      } catch (error) {
        console.error('Google Drive rename error:', error);
      }
    }

    return this.prisma.file.update({
      where: { id: fileId },
      data: { name: newName },
    });
  }

  async migrateFile(userId: string, fileId: string, targetProvider: string) {
    const file = await this.prisma.file.findFirst({
      where: { id: fileId, ownerId: userId },
    });

    if (!file) throw new NotFoundException('File not found');
    if (file.provider === targetProvider) return file;

    if (file.isFolder) {
      // For folders, we update the provider for this folder and its children recursively
      // Note: This only changes where NEW files will be uploaded within these folders
      await this.prisma.file.update({
        where: { id: fileId },
        data: { provider: targetProvider },
      });

      // Also update all sub-folders/files path prefix (simplified recursive update)
      const folderPathPrefix = `${file.path}${file.name}/`;
      await this.prisma.file.updateMany({
        where: {
          ownerId: userId,
          path: { startsWith: folderPathPrefix },
        },
        data: { provider: targetProvider },
      });

      return this.prisma.file.findUnique({ where: { id: fileId } });
    }

    // File migration logic
    try {
      let buffer: Buffer;

      if (file.provider === 'google-drive' && file.providerFileId) {
        const response = await this.drive.files.get(
          {
            fileId: file.providerFileId,
            alt: 'media',
          },
          { responseType: 'arraybuffer' },
        );
        buffer = Buffer.from(response.data as ArrayBuffer);
      } else if (file.provider === 'cloudinary') {
        const response = await fetch(file.url);
        if (!response.ok) throw new Error('Failed to download from Cloudinary');
        buffer = Buffer.from(await response.arrayBuffer());
      } else if (file.provider === 'telegram' && file.providerFileId) {
        const [,, telegramFileId] = file.providerFileId.split(':');
        if (!telegramFileId) throw new Error('Telegram file_id not found in record');
        
        const fileLink = await this.bot.telegram.getFileLink(telegramFileId);
        const response = await fetch(fileLink.href);
        if (!response.ok) throw new Error('Failed to download from Telegram');
        buffer = Buffer.from(await response.arrayBuffer());
      } else {
        throw new Error('Unsupported source provider for migration');
      }

      const multerFile: any = {
        buffer,
        originalname: file.name,
        mimetype: file.type,
        size: file.size,
      };

      const originalPath = file.path;

      // Delete from old provider
      await this.deleteFile(userId, fileId);

      // Upload to new provider (this creates a new DB record)
      const results = await this.uploadFiles(
        userId,
        [multerFile],
        originalPath,
        [],
        targetProvider,
      );
      return results[0];
    } catch (error) {
      console.error('Migration error:', error);
      throw new InternalServerErrorException(
        `Failed to migrate file: ${error.message}`,
      );
    }
  }
}
