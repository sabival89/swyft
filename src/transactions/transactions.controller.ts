import { Controller, Get, HttpException } from '@nestjs/common';
import { SwyftTablesInfo } from 'src/typings/types';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Handler for all exsiting transactions retrieval
   * @returns
   */
  @Get()
  async findAllTransactions(): Promise<SwyftTablesInfo | HttpException> {
    return this.transactionsService.findAllTransactions();
  }
}
