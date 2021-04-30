import { ApiProperty, ApiTags } from '@nestjs/swagger';
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
import { AvailableCurrencies } from 'src/core/enums/currency.enum';

export class BalanceAttributes {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  readonly amount: number;

  @ApiProperty()
  @IsString()
  @IsEnum(AvailableCurrencies)
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
