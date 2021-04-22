import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { BalanceAttributes } from 'src/accounts/dto/create-account.dto';

export class CreateTransactionDto {
  @IsUUID()
  readonly id: string;

  @ApiProperty()
  @IsUUID()
  readonly target_account_id: string;

  @ApiProperty()
  @IsOptional()
  readonly note: string;

  @ApiProperty()
  @Type()
  readonly account_money: BalanceAttributes;

  @ApiProperty()
  @IsUUID()
  @ValidateNested()
  readonly account_id: string;
}
