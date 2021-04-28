import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Table } from 'src/database/tables.database';
import { Repository } from 'src/repositories/repository';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, Table, Repository],
  exports: [TransactionsService],
})
export class TransactionsModule {}
