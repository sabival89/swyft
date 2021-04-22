import { Module } from '@nestjs/common';
import { AccountsController } from './accounts/accounts.controller';
import { AccountsService } from './accounts/accounts.service';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [AccountsModule, TransactionsModule],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AppModule {}
