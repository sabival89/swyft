import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';
import { AccountMapper } from './mappers/account.map';
import { Transaction } from '../transactions/entities/transaction.entity';

type AccountQuery = Array<{ account: Account; index: number }>;
type AccountStore = {
  accounts: Array<Account>;
  transactions: Array<Transaction>;
};

@Injectable()
export class AccountsService {
  private readonly accountsDatabase: Array<AccountStore> = [
    {
      accounts: [],
      transactions: [],
    },
  ];

  private readonly SUCCESS: boolean = true;
  private readonly FAILURE: boolean = false;

  /**
   * Create a new Account
   * @param createAccountDto
   * @returns
   */
  createAccount(createAccountDto: CreateAccountDto) {
    if (
      this.isExistingAccount({
        key: 'email_address',
        search: createAccountDto.email_address,
      }).length > 0
    )
      return new ConflictException(
        `An account already exists for user with the email ${createAccountDto.email_address}`
      );

    return this.insertInto(
      'accounts',
      AccountMapper.toDomain({ ...createAccountDto })
    )
      ? new HttpException(
          {
            status: HttpStatus.OK,
            message: 'Account was successfully created',
          },
          HttpStatus.OK
        )
      : new InternalServerErrorException(
          'An error occurred while trying to create account. Please try again!'
        );
  }

  /**
   * Retrieve all accounts
   * @TODO Restructure the result of the returned data
   * @returns
   */
  findAllAccounts() {
    const dbResult = this.queryFrom('accounts');

    return (
      Array.isArray(dbResult) && {
        count: dbResult.length,
        result: dbResult,
      }
    );
  }

  /**
   * Find a given account
   * @param accountId
   * @returns
   */
  findOneAccount(accountId: string) {
    if (this.accountsDatabase.length <= 0)
      return new BadRequestException('Database is empty');

    const isAccountFound = this.findAccountById(accountId);

    return isAccountFound !== undefined
      ? isAccountFound
      : new NotFoundException('Account does not exist');
  }

  /**
   * Update a given account
   * @param accountId
   * @param updateAccountDto
   * @returns
   */
  updateAccount(accountId: string, updateAccountDto: UpdateAccountDto) {
    if (this.accountsDatabase.length <= 0)
      return new BadRequestException('Database is empty');

    const [isAccountInDB] = this.isExistingAccount({
      key: 'id',
      search: accountId,
    });

    switch (isAccountInDB !== undefined) {
      case this.SUCCESS: {
        const updatedAccount = {
          ...isAccountInDB.account,
          ...updateAccountDto,
        };

        this.updateInto(
          'accounts',
          isAccountInDB.index,
          AccountMapper.toUpdateDomain(updatedAccount)
        );

        return new HttpException(
          {
            status: HttpStatus.OK,
            meessage: `Account was successfully updated`,
          },
          HttpStatus.OK
        );
      }
      case this.FAILURE:
        return new NotFoundException('Account does not exist');

      default:
        return new InternalServerErrorException(
          'A problem occured while trying to update account'
        );
    }
  }

  /**
   * @TODO Before you remove account
   * 1. Check if UUID is valid
   * 2. Extract isAccountInDDB to it's own class
   * 3. Cannot delete account with amount greater than zero
   * @param id
   * @returns
   */
  removeAccount(accountId: string) {
    if (this.accountsDatabase.length <= 0)
      return new BadRequestException('Database is empty');
    // Check if account exists
    const [isAccountInDB] = this.isExistingAccount({
      key: 'id',
      search: accountId,
    });

    switch (isAccountInDB !== undefined) {
      case this.SUCCESS: {
        if (isAccountInDB.account.isAmountPositive()) {
          return new ForbiddenException(
            'Account requires review. Contact Admin'
          );
        }

        // accountsDatabase.splice(isAccountInDB.index, 1).length
        return (
          this.deleteFrom('accounts', isAccountInDB.index) &&
          new HttpException(
            {
              status: HttpStatus.OK,
              message: `Account was successfully removed`,
              result: true,
            },
            HttpStatus.OK
          )
        );
      }

      case this.FAILURE:
        return new NotFoundException('Account does not exist');

      default:
        return new InternalServerErrorException(
          'A problem occured while trying to delete account'
        );
    }
  }

  findAllTransactions = () => {
    return 'All transactions records';
  };

  addMoneyToAccount = () => {
    return 'Add money to account';
  };

  withdrawFundsFromAccount = () => {
    return 'Withdraw money from account';
  };

  sendFundsToAccount = () => {
    return 'Send money to account';
  };

  deleteFrom = (
    table: string,
    deleteAtIndex: number
  ): boolean | HttpException => {
    const [tables] = this.accountsDatabase;
    if (!Object.keys(tables).includes(table))
      return new NotFoundException('Wrong table provided.');

    return tables[table].splice(deleteAtIndex, 1).length
      ? this.SUCCESS
      : this.FAILURE;
  };

  insertInto = (
    toTable: string,
    dataToInsert: any
  ): boolean | HttpException => {
    const [tables] = this.accountsDatabase;
    //Check if provided table is valid
    if (!Object.keys(tables).includes(toTable))
      return new NotFoundException('Wrong table provided.');

    return tables[toTable].push(dataToInsert) ? this.SUCCESS : this.FAILURE;
  };

  updateInto = (
    table: string,
    updateAtIndex: number,
    dataToInsert: any
  ): boolean | HttpException => {
    const [tables] = this.accountsDatabase;
    //Check if provided table is valid
    if (!Object.keys(tables).includes(table))
      return new NotFoundException('Wrong table provided.');

    return tables[table].splice(updateAtIndex, 1, dataToInsert)
      ? this.SUCCESS
      : this.FAILURE;
  };

  queryFrom = (
    table: string
  ): Array<Account> | Array<Transaction> | HttpException => {
    const [tables] = this.accountsDatabase;
    if (!Object.keys(tables).includes(table))
      return new NotFoundException('Wrong table provided.');
    return tables[table].length > 0 ? tables[table] : [];
  };

  /**
   *
   * @param keyToMatch
   * @param searchItem
   * @returns
   */
  queryOne = (
    tableToQuery: string,
    keyToMatch: string | number,
    searchItem: string | number
  ): Account | any => {
    const [tables] = this.accountsDatabase;

    return tables[tableToQuery].find(
      (account: Account) => account[keyToMatch] === searchItem
    );
  };

  /**
   * Find accoujt by Id
   * @param accountId
   * @returns
   */
  findAccountById = (accountId: string | number): Account =>
    this.queryOne('accounts', 'id', accountId);

  /**
   * Check if requested account exists in the database
   * @param accountId
   * @param accountDB
   * @returns
   */
  isExistingAccount = (searchOptions: {
    key: string;
    search: string | number;
  }): AccountQuery => {
    const [tables] = this.accountsDatabase;
    return tables.accounts
      .map(
        (account, idx) =>
          this.queryOne(
            'accounts',
            searchOptions.key,
            searchOptions.search
          ) && {
            account: { ...account },
            index: idx,
          }
      )
      .filter((account) => account);
  };
}
