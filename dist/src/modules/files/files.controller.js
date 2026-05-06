"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const files_service_1 = require("./files.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const common_2 = require("@nestjs/common");
let FilesController = class FilesController {
    filesService;
    constructor(filesService) {
        this.filesService = filesService;
    }
    async uploadFiles(files, req, relativePaths, path, provider) {
        const pathsArray = Array.isArray(relativePaths)
            ? relativePaths
            : [relativePaths];
        return this.filesService.uploadFiles(req.user.id, files, path || '/', pathsArray, provider || 'google-drive');
    }
    async getFiles(req, path) {
        return this.filesService.findAll(req.user.id, path || '/');
    }
    async getStats(req) {
        return this.filesService.getStats(req.user.id);
    }
    async deleteFile(id, req) {
        return this.filesService.deleteFile(req.user.id, id);
    }
    async replaceFile(id, file, provider, req) {
        console.log('Replacing file:', id, 'New provider:', provider);
        return this.filesService.replaceFile(req.user.id, id, file, provider);
    }
    async renameFile(id, name, req) {
        return this.filesService.renameFile(req.user.id, id, name);
    }
    async migrateFile(id, provider, req) {
        return this.filesService.migrateFile(req.user.id, id, provider);
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files')),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_2.Body)('relativePaths')),
    __param(3, (0, common_1.Query)('path')),
    __param(4, (0, common_2.Body)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadFiles", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('path')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getFiles", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_2.Body)('provider')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "replaceFile", null);
__decorate([
    (0, common_1.Patch)(':id/rename'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_2.Body)('name')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "renameFile", null);
__decorate([
    (0, common_1.Patch)(':id/migrate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_2.Body)('provider')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "migrateFile", null);
exports.FilesController = FilesController = __decorate([
    (0, common_1.Controller)('files'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map