import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { BalanceAttributes } from './create-account.dto';

export class UpdateAccountDto {
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  readonly id?: string;

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

  @Type(() => BalanceAttributes)
  @ApiProperty()
  @ValidateNested()
  @IsOptional()
  readonly balance?: BalanceAttributes;
}
