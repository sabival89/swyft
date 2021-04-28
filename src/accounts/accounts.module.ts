import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { Table } from 'src/database/tables.database';
import { Repository } from 'src/repositories/repository';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService, Table, Repository],
  exports: [AccountsService],
})
export class AccountsModule {}
