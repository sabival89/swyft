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
import { ApiTags } from '@nestjs/swagger';
import { DepositTransactionDto } from 'src/transactions/dto/deposit-transaction.dto';
import { WithdrawTransactionDto } from 'src/transactions/dto/withdraw-transaction.dto';
import { SwyftTablesInfo } from 'src/typings/types';
import { CreateTransactionDto } from '../transactions/dto/create-transaction.dto';
import { Transaction } from '../transactions/entities/transaction.entity';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';
import { ValidationPipe } from './pipes/swyft-validation.pipe';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  /**
   * Handler for creating an account
   * @param createAccountDto payload
   * @returns
   */
  @Post()
  async createAccount(
    @Body(new ValidationPipe()) createAccountDto: CreateAccountDto
  ): Promise<HttpException> {
    return this.accountsService.createAccount(createAccountDto);
  }

  /**
   * Handler for retrieving all accounts information
   * @returns
   */
  @Get()
  async findAllAccounts(): Promise<SwyftTablesInfo | HttpException> {
    return this.accountsService.findAllAccounts();
  }

  /**
   * Handler for retrieving individual account information
   * @param accountId Account ID of the target account for retrieval
   * @returns
   */
  @Get(':id')
  async findOneAccount(
    @Param('id', ParseUUIDPipe) accountId: string
  ): Promise<Array<Account | Transaction> | HttpException> {
    return this.accountsService.findOneAccount(accountId);
  }

  /**
   * Handler for account update
   * @param accountId Account ID of the target account for update
   * @param updateAccountDto payload
   * @returns
   */
  @Patch(':id')
  async updateAccount(
    @Param('id', ParseUUIDPipe) accountId: string,
    @Body(new ValidationPipe()) updateAccountDto: UpdateAccountDto
  ): Promise<HttpException> {
    return this.accountsService.updateAccount(accountId, updateAccountDto);
  }

  /**
   * Handler for account removal
   * @param accountId Account ID of the target account for removal
   * @returns
   */
  @Delete(':id')
  async removeAccount(
    @Param('id', ParseUUIDPipe) accountId: string
  ): Promise<HttpException> {
    return this.accountsService.removeAccount(accountId);
  }

  /**
   * Handler for retrieving individual transactions
   * @param accountId Account ID to use for querying transactions table
   * @returns
   */
  @Get(':id/transactions/')
  async findOneTransaction(@Param('id', ParseUUIDPipe) accountId: string) {
    return this.accountsService.findOneTransaction(accountId);
  }

  /**
   * Handler for funds deposit
   * @param account_id Source account ID
   * @param createTransactionDto payload
   * @returns
   */
  @Post(':id/transactions/add/')
  async addFundsToAccount(
    @Param('id', ParseUUIDPipe) account_id: string,
    @Body(new ValidationPipe()) createTransactionDto: DepositTransactionDto
  ) {
    return this.accountsService.addFundsToAccount(account_id, {
      ...createTransactionDto,
    });
  }

  /**
   * Handler for funds withdrawal
   * @param accountId Source account ID
   * @param createTransactionDto payload
   * @returns
   */
  @Post(':id/transactions/withdraw/')
  async withdrawFundsFromAccount(
    @Param('id', ParseUUIDPipe) accountId: string,
    @Body(new ValidationPipe()) createTransactionDto: WithdrawTransactionDto
  ) {
    return this.accountsService.withdrawFundsFromAccount(
      accountId,
      createTransactionDto
    );
  }

  /**
   * Handler for funds transfer
   * @param accountId Source account ID
   * @param createTransactionDto Paylaod
   * @returns
   */
  @Post(':id/transactions/send')
  async sendFundsToAccount(
    @Param('id', ParseUUIDPipe) accountId: string,
    @Body(new ValidationPipe()) createTransactionDto: CreateTransactionDto
  ) {
    return this.accountsService.sendFundsToAccount(
      accountId,
      createTransactionDto
    );
  }
}
