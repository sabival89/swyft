import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AccountsService {
  private readonly accountsDatabase: Array<Account> = [];

  /**
   * @TODO check if id already exists before saving to DB
   * @TODO convert amount to currency $1.00
   * @TODO Befor storing the new user account,
   * 1. check if id already exists before saving to DB
   * 2. Ensure the provided currency is USD,either lower or uppercase
   * 3. Verify email address
   * 4. Account balance must be greater or equal to zero
   * @param createAccountDto
   * @returns
   */
  createAccount(createAccountDto: CreateAccountDto) {
    return this.accountsDatabase.push({ id: uuidv4(), ...createAccountDto });
  }

  /**
   * Retrieve all accounts
   * @returns
   */
  findAllAccounts() {
    return this.accountsDatabase;
  }

  /**
   * @TODO Return the account if found and return not found if account doesn't exist
   * @param accountId
   * @returns
   */
  findOneAccount(accountId: string) {
    return this.accountsDatabase.find(
      (customerAccount) => customerAccount.id === accountId
    );
  }

  /**
   * @TODO - Before you update and account
   * 1. Check if UUID is valid
   * 2. Check if it exists in the database
   * 3. Update if it exists
   *
   * @param accountId
   * @param updateAccountDto
   * @returns
   */
  updateAccount(accountId: string, updateAccountDto: UpdateAccountDto) {
    const updatedAccountInfo = this.accountsDatabase.map((customerAccount) => {
      if (accountId === customerAccount.id) {
        return { ...customerAccount, ...updateAccountDto };
      }
      return customerAccount;
    });
    return Object.assign(this.accountsDatabase, updatedAccountInfo);
  }

  /**
   * @TODO Before you remove account
   * 1. Check if UUID is valid
   * @param id
   * @returns
   */
  removeAccount(id: string) {
    // Check if UUID exists in the database
    const isAccountInStore = this.accountsDatabase.filter(
      (customerAccount) => customerAccount.id === id
    );

    // Return statuses based on the existence of the queried account
    return isAccountInStore.length
      ? this.accountsDatabase.splice(
          this.accountsDatabase.indexOf(isAccountInStore.pop()),
          1
        ).length
        ? new HttpException(
            {
              status: HttpStatus.OK,
              message: 'User was successfully removed',
            },
            HttpStatus.OK
          )
        : new HttpException(
            {
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              error: 'Could not delete account',
            },
            HttpStatus.INTERNAL_SERVER_ERROR
          )
      : new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Account not found',
          },
          HttpStatus.NOT_FOUND
        );
  }
}
