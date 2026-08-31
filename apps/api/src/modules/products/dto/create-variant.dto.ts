import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AttributeValueDto {
  @ApiProperty()
  @IsString()
  attributeId: string;

  @ApiProperty()
  @IsString()
  value: string;
}

export class CreateVariantDto {
  @ApiProperty({ example: 'LED-9W-WW-001' })
  @IsString()
  sku: string;

  @ApiProperty({ example: '9W Warm White' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ type: [AttributeValueDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeValueDto)
  attributes?: AttributeValueDto[];
}
