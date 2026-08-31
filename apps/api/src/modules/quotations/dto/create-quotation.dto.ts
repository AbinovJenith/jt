import { IsString, IsOptional, IsArray, ValidateNested, IsInt, IsNumber, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class QuotationItemDto {
  @ApiPropertyOptional({ description: 'RFQ item this responds to' })
  @IsOptional()
  @IsString()
  rfqItemId?: string;

  @ApiProperty()
  @IsString()
  variantId: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  qty: number;

  @ApiProperty({ description: 'Unit price before discount' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ default: 0, description: 'Discount %' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({ default: 18, description: 'GST rate %' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  gstRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateQuotationDto {
  @ApiProperty({ description: 'RFQ ID this quotation responds to' })
  @IsString()
  rfqId: string;

  @ApiProperty({ description: 'Validity date (ISO 8601)' })
  @IsDateString()
  validUntil: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  termsConditions?: string;

  @ApiProperty({ type: [QuotationItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items: QuotationItemDto[];
}
