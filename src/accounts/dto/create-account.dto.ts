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
  readonly amount: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @IsEnum(AvailableCurrencies, { message: 'Currency must be USD' })
  readonly currency: string;
}

export class CreateAccountDto {
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
