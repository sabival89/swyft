import { Module } from '@nestjs/common';
import { AccountsController } from './accounts/accounts.controller';
import { AccountsService } from './accounts/accounts.service';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TransactionsService } from './transactions/transactions.service';
import { TransactionsController } from './transactions/transactions.controller';
import { DatabaseModule } from './core/database/database.module';
import { RepositoryModule } from './repositories/repository.module';
import { SwyftSesssionModule } from './core/sessions/swyft-session.module';

@Module({
  imports: [
    AccountsModule,
    TransactionsModule,
    DatabaseModule,
    RepositoryModule,
    SwyftSesssionModule,
  ],
  controllers: [AccountsController, TransactionsController],
  providers: [AccountsService, TransactionsService],
})
export class AppModule {}
