import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  async createAccount(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.createAccount(createAccountDto);
  }

  @Get()
  async findAllAccounts(): Promise<Array<Account>> {
    return this.accountsService.findAllAccounts();
  }

  @Get(':id')
  async findOneAccount(@Param('id') accountId: string): Promise<Account> {
    return this.accountsService.findOneAccount(accountId);
  }

  @Patch(':id')
  async updateAccount(
    @Param('id') accountId: string,
    @Body() updateAccountDto: UpdateAccountDto
  ): Promise<Array<Account>> {
    return this.accountsService.updateAccount(accountId, updateAccountDto);
  }

  @Delete(':id')
  async removeAccount(@Param('id') accountId: string): Promise<HttpException> {
    return this.accountsService.removeAccount(accountId);
  }
}
