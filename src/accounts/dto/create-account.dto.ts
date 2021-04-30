import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AvailableCurrencies } from '../../core/enums/currency.enum';

export class BalanceAttributes {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @IsEnum(AvailableCurrencies, { message: 'Currency must be USD' })
  currency: string;
}

export class CreateAccountDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  given_name: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  family_name: string;

  @ApiProperty()
  @IsEmail()
  email_address: string;

  @ApiProperty()
  @IsString()
  note: string;

  @Type(() => BalanceAttributes)
  @ApiProperty()
  @ValidateNested()
  balance: BalanceAttributes;
}
