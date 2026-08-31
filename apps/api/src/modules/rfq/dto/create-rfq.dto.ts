import { IsString, IsOptional, IsArray, ValidateNested, IsInt, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class RFQItemDto {
  @ApiProperty()
  @IsString()
  variantId: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  qty: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateRFQDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  customerId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({ type: [RFQItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RFQItemDto)
  items: RFQItemDto[];
}
