import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { Transaction } from '../entities/transaction.entity';

import { v4 as uuidv4 } from 'uuid';

export class TransactionMapper {
  /**
   * Transactions table create mapper
   * @param raw
   * @returns
   */
  public static toDomain(raw: CreateTransactionDto): Transaction {
    return new Transaction(
      uuidv4().toString(),
      raw.target_account_id || null,
      raw.note.trim(),
      {
        amount: raw.amount_money.amount.toFixed(2),
        ...raw.amount_money,
      },
      raw.account_id
    );
  }
}
