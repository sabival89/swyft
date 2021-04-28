import { Module } from '@nestjs/common';
import { AccountsController } from './accounts/accounts.controller';
import { AccountsService } from './accounts/accounts.service';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TransactionsService } from './transactions/transactions.service';
import { TransactionsController } from './transactions/transactions.controller';
import { DatabaseModule } from './database/database.module';
import { RepositoryModule } from './repositories/repository.module';

@Module({
  imports: [
    AccountsModule,
    TransactionsModule,
    DatabaseModule,
    RepositoryModule,
  ],
  controllers: [AccountsController, TransactionsController],
  providers: [AccountsService, TransactionsService],
})
export class AppModule {}
