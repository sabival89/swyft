import { Controller, Get } from '@nestjs/common';
import { TableFetchInfo } from 'src/typings/types';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async findAllTransactions(): Promise<TableFetchInfo> {
    return this.transactionsService.findAllTransactions();
  }
}
