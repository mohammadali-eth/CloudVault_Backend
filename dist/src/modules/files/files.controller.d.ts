import { FilesService } from './files.service';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    uploadFiles(files: Express.Multer.File[], req: any, relativePaths: string | string[], path: string, provider: string): Promise<{
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
    getFiles(req: any, path: string): Promise<{
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
    getStats(req: any): Promise<{
        providers: {
            provider: string;
            size: number;
            count: number;
        }[];
        totalFiles: number;
        totalFolders: number;
        totalSize: number;
    }>;
    deleteFile(id: string, req: any): Promise<{
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
    replaceFile(id: string, file: Express.Multer.File, provider: string, req: any): Promise<{
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
    renameFile(id: string, name: string, req: any): Promise<{
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
    migrateFile(id: string, provider: string, req: any): Promise<{
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
