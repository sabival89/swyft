import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsNumber,
  Min,
  IsString,
  Contains,
} from 'class-validator';

export class TransactionAmountAttributes {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  readonly amount: number;

  @ApiProperty()
  @IsString()
  @Contains('USD')
  readonly currency: string;
}

export class WithdrawTransactionDto {
  @ApiProperty()
  readonly note?: string;

  @ApiProperty()
  @Type()
  @ValidateNested()
  readonly amount_money: TransactionAmountAttributes;
}
