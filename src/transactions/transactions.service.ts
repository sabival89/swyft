import { Injectable, NotFoundException } from '@nestjs/common';
import { Table } from 'src/database/tables.database';
import { Repository } from '../repositories/repository';

@Injectable()
export class TransactionsService {
  /**
   * Inject dependencies
   * @param tables
   */
  constructor(private readonly tables: Table, private repo: Repository) {}
  /**
   * Find all transactions
   * @returns Array of transactions
   */
  findAllTransactions() {
    const dbResult = this.repo.findAll(this.tables.TRANSACTIONS);

    return !dbResult
      ? new NotFoundException('Wrong table provided.')
      : Array.isArray(dbResult) && {
          count: dbResult.length,
          result: dbResult,
        };
  }
}
