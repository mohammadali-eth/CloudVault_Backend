import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Request,
  Query,
  Put,
  Patch,
  UploadedFile,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { Body } from '@nestjs/common';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
    @Body('relativePaths') relativePaths: string | string[],
    @Query('path') path: string,
    @Body('provider') provider: string,
  ) {
    const pathsArray = Array.isArray(relativePaths)
      ? relativePaths
      : [relativePaths];
    return this.filesService.uploadFiles(
      req.user.id,
      files,
      path || '/',
      pathsArray,
      provider || 'google-drive',
    );
  }

  @Get()
  async getFiles(@Request() req: any, @Query('path') path: string) {
    return this.filesService.findAll(req.user.id, path || '/');
  }

  @Get('stats')
  async getStats(@Request() req: any) {
    return this.filesService.getStats(req.user.id);
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string, @Request() req: any) {
    return this.filesService.deleteFile(req.user.id, id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  async replaceFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('provider') provider: string,
    @Request() req: any,
  ) {
    console.log('Replacing file:', id, 'New provider:', provider);
    return this.filesService.replaceFile(req.user.id, id, file, provider);
  }

  @Patch(':id/rename')
  async renameFile(
    @Param('id') id: string,
    @Body('name') name: string,
    @Request() req: any,
  ) {
    return this.filesService.renameFile(req.user.id, id, name);
  }

  @Patch(':id/migrate')
  async migrateFile(
    @Param('id') id: string,
    @Body('provider') provider: string,
    @Request() req: any,
  ) {
    return this.filesService.migrateFile(req.user.id, id, provider);
  }
}
