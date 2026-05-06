import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class FilesService {
    private prisma;
    private configService;
    private drive;
    private bot;
    constructor(prisma: PrismaService, configService: ConfigService);
    private ensureFoldersExist;
    uploadFiles(userId: string, files: Express.Multer.File[], path?: string, relativePaths?: string[], provider?: string): Promise<{
        path: string;
        url: string;
        name: string;
        id: string;
        createdAt: Date;
        type: string;
        size: number;
        isFolder: boolean;
        provider: string;
        providerFileId: string | null;
        ownerId: string;
    }[]>;
    findAll(userId: string, path?: string): Promise<{
        path: string;
        url: string;
        name: string;
        id: string;
        createdAt: Date;
        type: string;
        size: number;
        isFolder: boolean;
        provider: string;
        providerFileId: string | null;
        ownerId: string;
    }[]>;
    getStats(userId: string): Promise<{
        providers: {
            provider: string;
            size: number;
            count: number;
        }[];
        totalFiles: number;
        totalFolders: number;
        totalSize: number;
    }>;
    deleteFile(userId: string, fileId: string): Promise<{
        path: string;
        url: string;
        name: string;
        id: string;
        createdAt: Date;
        type: string;
        size: number;
        isFolder: boolean;
        provider: string;
        providerFileId: string | null;
        ownerId: string;
    }>;
    replaceFile(userId: string, fileId: string, newFile: Express.Multer.File, provider?: string): Promise<{
        path: string;
        url: string;
        name: string;
        id: string;
        createdAt: Date;
        type: string;
        size: number;
        isFolder: boolean;
        provider: string;
        providerFileId: string | null;
        ownerId: string;
    }[]>;
    renameFile(userId: string, fileId: string, newName: string): Promise<{
        path: string;
        url: string;
        name: string;
        id: string;
        createdAt: Date;
        type: string;
        size: number;
        isFolder: boolean;
        provider: string;
        providerFileId: string | null;
        ownerId: string;
    }>;
    migrateFile(userId: string, fileId: string, targetProvider: string): Promise<{
        path: string;
        url: string;
        name: string;
        id: string;
        createdAt: Date;
        type: string;
        size: number;
        isFolder: boolean;
        provider: string;
        providerFileId: string | null;
        ownerId: string;
    } | null>;
}
