import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';

export class UpdateAccountDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @IsOptional()
  readonly given_name?: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @IsOptional()
  readonly family_name?: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  readonly email_address?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly note?: string;
}
