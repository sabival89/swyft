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
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';
import { ValidationPipe } from './pipes/validation.pipe';

/**
 * Type declarations
 */
type AccountInfo = { count: number; result: Array<Account> };

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
  async findAllAccounts(): Promise<AccountInfo | HttpException> {
    return this.accountsService.findAllAccounts();
  }

  @Get(':id')
  async findOneAccount(
    @Param('id') accountId: string
  ): Promise<Account | HttpException> {
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
  ): Promise<HttpException | string> {
    console.log('Controller: ', accountId);
    return this.accountsService.removeAccount(accountId);
  }
}
