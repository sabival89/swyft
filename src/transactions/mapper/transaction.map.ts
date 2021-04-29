import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { Transaction } from '../entities/transaction.entity';

import { v4 as uuidv4 } from 'uuid';
import { DepositTransactionDto } from '../dto/deposit-transaction.dto';
import { WithdrawTransactionDto } from '../dto/withdraw-transaction.dto';

export class TransactionMapper {
  /**
   * Transactions table create mapper
   * @param accountId
   * @param raw
   * @returns
   */
  public static toDomain(
    accountId: string,
    targetAccountId: string | null,
    raw: CreateTransactionDto | DepositTransactionDto | WithdrawTransactionDto
  ): Transaction {
    return new Transaction(
      uuidv4().toString(),
      targetAccountId,
      raw.note.trim(),
      {
        amount: raw.amount_money.amount.toFixed(2),
        ...raw.amount_money,
      },
      accountId
    );
  }
}
