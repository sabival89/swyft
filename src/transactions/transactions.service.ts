import { Injectable } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { Repository } from '../repositories/repository';

@Injectable()
export class TransactionsService extends AccountsService {
  /**
   * Find all transactions
   * @returns Array of transactions
   */
  findAllTransactions() {
    const dbResult = Repository.query('transactions');

    return (
      Array.isArray(dbResult) && {
        count: dbResult.length,
        result: dbResult,
      }
    );
  }
}
