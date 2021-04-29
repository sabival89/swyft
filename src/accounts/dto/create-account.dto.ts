import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Contains,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class BalanceAttributes {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  readonly amount: number;

  @ApiProperty()
  @IsString()
  @Contains('USD')
  readonly currency: string;
}

export class CreateAccountDto {
  // @ApiProperty()
  // @IsUUID()
  // @IsOptional()
  // readonly id?: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  readonly given_name: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  readonly family_name: string;

  @ApiProperty()
  @IsEmail()
  readonly email_address: string;

  @ApiProperty()
  @IsString()
  readonly note: string;

  @Type(() => BalanceAttributes)
  @ApiProperty()
  @ValidateNested()
  readonly balance: BalanceAttributes;
}
