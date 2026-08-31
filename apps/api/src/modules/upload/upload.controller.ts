import { Controller, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'upload', version: '1' })
export class UploadController {
  constructor(private service: UploadService) {}

  @Post('presign')
  @ApiOperation({ summary: 'Get presigned URL for file upload' })
  getPresignedUploadUrl(@Body() body: { fileName: string; contentType: string; folder: string }) {
    return this.service.getPresignedUploadUrl(body);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete a file from storage' })
  deleteFile(@Body('key') key: string) {
    return this.service.deleteFile(key);
  }
}
