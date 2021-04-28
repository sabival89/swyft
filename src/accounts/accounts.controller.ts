import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TableFetchInfo } from 'src/typings/types';
import { CreateTransactionDto } from '../transactions/dto/create-transaction.dto';
import { Transaction } from '../transactions/entities/transaction.entity';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';
import { ValidationPipe } from './pipes/validation.pipe';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  async createAccount(
    @Body(new ValidationPipe()) createAccountDto: CreateAccountDto
  ): Promise<HttpException> {
    return this.accountsService.createAccount(createAccountDto);
  }

  @Get()
  async findAllAccounts(): Promise<TableFetchInfo | HttpException> {
    return this.accountsService.findAllAccounts();
  }

  @Get(':id')
  async findOneAccount(
    @Param('id') accountId: string
  ): Promise<Array<Account | Transaction> | HttpException> {
    return this.accountsService.findOneAccount(accountId);
  }

  @Patch(':id')
  async updateAccount(
    @Param('id') accountId: string,
    @Body(new ValidationPipe()) updateAccountDto: UpdateAccountDto
  ): Promise<HttpException> {
    return this.accountsService.updateAccount(accountId, updateAccountDto);
  }

  @Delete(':id')
  async removeAccount(
    @Param('id', ParseUUIDPipe) accountId: string
  ): Promise<HttpException> {
    return this.accountsService.removeAccount(accountId);
  }

  @Get(':id/transactions/')
  async findOneTransaction(@Param('id') accountId: string) {
    return this.accountsService.findOneTransaction(accountId);
  }

  @Post(':id/transactions/add/')
  async addFundsToAccount(
    @Param('id') account_id: string,
    @Body(new ValidationPipe()) createTransactionDto: CreateTransactionDto
  ) {
    return this.accountsService.addFundsToAccount({
      ...createTransactionDto,
      account_id,
    });
  }

  @Post(':id/transactions/withdraw/')
  async withdrawFundsFromAccount(
    @Param('id') accountId: string,
    @Body(new ValidationPipe()) createTransactionDto: CreateTransactionDto
  ) {
    return this.accountsService.withdrawFundsFromAccount(
      accountId,
      createTransactionDto
    );
  }

  @Post(':id/transactions/send')
  async sendFundsToAccount(
    @Param('id') accountId: string,
    @Body(new ValidationPipe()) createTransactionDto: CreateTransactionDto
  ) {
    return this.accountsService.sendFundsToAccount(
      accountId,
      createTransactionDto
    );
  }
}
