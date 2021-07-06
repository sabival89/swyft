import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsUUID,
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

export class CreateTransactionDto {
  @IsUUID()
  @IsOptional()
  readonly id?: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  readonly target_account_id: string;

  @ApiProperty()
  readonly note?: string;

  @ApiProperty()
  @Type()
  @ValidateNested()
  readonly amount_money: TransactionAmountAttributes;
}
