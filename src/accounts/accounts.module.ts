import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { Table } from 'src/core/database/tables.database';
import { Repository } from 'src/repositories/repository';
import { SwyftSession } from 'src/core/sessions/swyft-session.session';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService, Table, Repository, SwyftSession],
  exports: [AccountsService],
})
export class AccountsModule {}
