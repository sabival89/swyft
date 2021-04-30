import { Injectable, NotFoundException } from '@nestjs/common';
import { Table } from '../core/database/tables.database';
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
  async findAllTransactions() {
    const dbResult = await this.repo.findAll(this.tables.TRANSACTIONS);

    return !dbResult
      ? new NotFoundException('Wrong table provided.')
      : Array.isArray(dbResult) && {
          count: dbResult.length,
          result: dbResult,
        };
  }
}
