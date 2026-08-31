import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@jothitraders.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Secret@123' })
  @IsString()
  @MinLength(8)
  password: string;
}
