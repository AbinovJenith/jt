import { Injectable, NotFoundException } from '@nestjs/common';
import { S3Client, HeadObjectCommand, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UploadService {
  private s3: S3Client;
  private bucket: string;
  private publicBase: string;

  constructor(private prisma: PrismaService) {
    const accountId = process.env.R2_ACCOUNT_ID ?? '';
    this.bucket = process.env.R2_BUCKET ?? 'jothi-traders';
    this.publicBase = process.env.R2_PUBLIC_URL ?? `https://pub-${accountId}.r2.dev`;

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
      },
    });
  }

  async getPresignedUploadUrl(dto: { fileName: string; contentType: string; folder: string }) {
    const ext = dto.fileName.split('.').pop();
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const key = `${dto.folder}/${timestamp}-${random}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: dto.contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    const publicUrl = `${this.publicBase}/${key}`;

    return { uploadUrl, key, publicUrl };
  }

  async confirmUpload(key: string) {
    try {
      await this.s3.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      const publicUrl = `${this.publicBase}/${key}`;
      return { data: { key, publicUrl, confirmed: true } };
    } catch {
      throw new NotFoundException(`File not found: ${key}`);
    }
  }

  async deleteFile(key: string) {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    return { message: 'File deleted' };
  }
}
