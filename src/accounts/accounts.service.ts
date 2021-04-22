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

type AccountQuery = Array<{ account: Account; index: number }>;

@Injectable()
export class AccountsService {
  private readonly accountsDatabase: Array<Account> = [];
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

    return !this.accountsDatabase.push(
      AccountMapper.toDomain({ ...createAccountDto })
    )
      ? new InternalServerErrorException(
          'An error occurred while trying to create account. Please try again!'
        )
      : new HttpException(
          {
            status: HttpStatus.OK,
            message: 'Account Was successfully created',
          },
          HttpStatus.OK
        );
  }

  /**
   * Retrieve all accounts
   * @TODO Restructure the result of the returned data
   * @returns
   */
  findAllAccounts() {
    return this.accountsDatabase.length <= 0
      ? new NotFoundException('Database is empty')
      : {
          count: this.accountsDatabase.length,
          result: this.accountsDatabase,
        };
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

        this.accountsDatabase.splice(
          isAccountInDB.index,
          1,
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
        return (
          this.accountsDatabase.splice(isAccountInDB['index'], 1).length &&
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

  /**
   *
   * @param keyToMatch
   * @param searchItem
   * @returns
   */
  query = (keyToMatch: string | number, searchItem: string | number): Account =>
    this.accountsDatabase.find((account) => account[keyToMatch] === searchItem);

  /**
   * Find accoujt by Id
   * @param accountId
   * @returns
   */
  findAccountById = (accountId: string | number): Account =>
    this.query('id', accountId);

  /**
   * Check if requested account exists in the database
   * @param accountId
   * @param accountDB
   * @returns
   */
  isExistingAccount = (searchOptions: {
    key: string;
    search: string | number;
  }): AccountQuery =>
    this.accountsDatabase
      .map(
        (account, idx) =>
          this.query(searchOptions.key, searchOptions.search) && {
            account: { ...account },
            index: idx,
          }
      )
      .filter((account) => account);
}
