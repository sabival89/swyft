import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import isTableEmpty from 'src/core/decorators/is-table-empty.decorator';
import isTableInDB from 'src/core/decorators/is-table-in-db.decorator';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountMapper } from './mappers/account.map';
import { TransactionMapper } from '../transactions/mapper/transaction.map';
import { CreateTransactionDto } from '../transactions/dto/create-transaction.dto';
import { toCurrencyFormat } from '../utilities/swyft-string-methods';
import { Swyft_OKException } from '../core/errors/exceptions/swyft-ok.exception';
import { Swyft_AccountNotFound } from 'src/core/errors/exceptions/swyft-account-not-found.exception';
import { Table } from 'src/database/tables.database';
import { Repository } from 'src/repositories/repository';

@Injectable()
export class AccountsService {
  /**
   * Constant initilizations for boolean thruthy
   */
  private readonly SUCCESS: boolean = true;

  /**
   * Constant initilizations for boolean falsy
   */
  private readonly FAILURE: boolean = false;

  /**
   * The minimum amount to withdraw from a given account
   */
  private readonly MIN_WITHDRAWAL_AMOUNT: number = 20;

  /**
   * The maximum amount to send
   */
  private readonly MAX_TO_SEND_AMOUNT: number = 1000;

  /**
   * The minimum amount to send
   */
  private readonly MIN_TO_SEND_AMOUNT: number = 1;

  /**
   * Inject dependencies
   * @param tables
   */
  constructor(private readonly tables: Table, private repository: Repository) {}

  /**
   * Create a new Account
   * @param createAccountDto
   * @returns
   */
  async createAccount(createAccountDto: CreateAccountDto) {
    const isAccountInDB = await this.repository.isExistingAccount(
      createAccountDto.email_address,
      {
        key: 'email_address',
      }
    );
    if (isAccountInDB.length > 0)
      return new ConflictException(
        `An account already exists for user with the email ${createAccountDto.email_address}`
      );

    return this.repository.insert(
      this.tables.ACCOUNTS,
      AccountMapper.toDomain({ ...createAccountDto })
    )
      ? new Swyft_OKException('Account was successfully created')
      : new InternalServerErrorException(
          'An error occurred while trying to create account. Please try again!'
        );
  }

  /**
   * Update an existing account
   * @param accountId
   * @param updateAccountDto
   * @returns
   */
  @isTableInDB('accounts')
  @isTableEmpty('accounts')
  async updateAccount(accountId: string, updateAccountDto: UpdateAccountDto) {
    if (Object.keys(updateAccountDto).includes('balance'))
      return new BadRequestException(
        'Error! Cannot update amount. Please make a deposit or contact support'
      );

    const [isAccountInDB] = await this.repository.isExistingAccount(accountId);

    switch (isAccountInDB !== undefined) {
      case this.SUCCESS: {
        const updatedAttributes = {
          ...isAccountInDB.account,
          ...updateAccountDto,
        };

        this.repository.update(
          this.tables.ACCOUNTS,
          isAccountInDB.index,
          AccountMapper.toUpdateDomain(updatedAttributes)
        );

        return new Swyft_OKException(`Account was successfully updated`);
      }
      case this.FAILURE:
        return new Swyft_AccountNotFound();

      default:
        return new InternalServerErrorException(
          'A problem occured while trying to update account'
        );
    }
  }

  /**
   * Remove/Delete an existing account
   * @param accountId
   * @returns
   */
  @isTableInDB('accounts')
  @isTableEmpty('accounts')
  async removeAccount(accountId: string) {
    const [isAccountInDB] = await this.repository.isExistingAccount(accountId);

    switch (isAccountInDB !== undefined) {
      case this.SUCCESS: {
        if (isAccountInDB.account.isAmountPositive())
          return new ForbiddenException(
            'Account requires review. Please contact support'
          );

        return (
          this.repository.delete(this.tables.ACCOUNTS, isAccountInDB.index) &&
          new Swyft_OKException(`Account was successfully removed`)
        );
      }

      case this.FAILURE:
        return new Swyft_AccountNotFound();

      default:
        return new InternalServerErrorException(
          'A problem occured while trying to delete account'
        );
    }
  }

  /**
   * Retrieve all existing accounts
   * @returns
   */
  findAllAccounts() {
    const dbResult = this.repository.findAll(this.tables.ACCOUNTS);

    return !dbResult
      ? new NotFoundException('Wrong table provided.')
      : Array.isArray(dbResult) && {
          count: dbResult.length,
          result: dbResult,
        };
  }

  /**
   * Find and retrive existing account details
   * @param accountId
   * @returns The account tied to the accountId provided
   */

  @isTableInDB('accounts')
  @isTableEmpty('accounts')
  findOneAccount(accountId: string) {
    const isAccountInDB = this.repository.findById(
      accountId,
      this.tables.ACCOUNTS
    );

    return Array.isArray(isAccountInDB) && isAccountInDB.length
      ? isAccountInDB
      : new Swyft_AccountNotFound();
  }

  /**
   * Find a given transaction by accountId
   * @param accountId
   * @returns All transactions tied to the accountId provided
   */

  @isTableInDB('transactions')
  @isTableEmpty('transactions')
  async findOneTransaction(accountId: string) {
    const [isAccountInDB] = await this.repository.isExistingAccount(accountId);

    if (isAccountInDB === undefined) return new Swyft_AccountNotFound();

    const transactionsByAccountId = this.repository.findByKey(
      this.tables.TRANSACTIONS,
      {
        key: 'account_id',
        id: accountId,
      }
    );

    return (
      Array.isArray(transactionsByAccountId) && {
        count: transactionsByAccountId.length,
        result: transactionsByAccountId,
      }
    );
  }

  /**
   * Add funds to an existing account
   * @param createTransactionDto
   * @returns
   */
  @isTableInDB('accounts')
  @isTableEmpty('accounts')
  async addFundsToAccount(createTransactionDto: CreateTransactionDto) {
    const [isAccountInDB] = await this.repository.isExistingAccount(
      createTransactionDto.account_id
    );

    switch (isAccountInDB !== undefined) {
      case this.SUCCESS: {
        const isDepositSuccessfull = this.repository.update(
          this.tables.ACCOUNTS,
          isAccountInDB.index,
          {
            ...isAccountInDB.account,
            ...{
              balance: {
                amount:
                  isAccountInDB.account.balance.amount +
                  createTransactionDto.amount_money.amount,
                currency: isAccountInDB.account.balance.currency,
              },
            },
          }
        );

        isDepositSuccessfull
          ? this.repository.insert(
              this.tables.TRANSACTIONS,
              TransactionMapper.toDomain({ ...createTransactionDto })
            )
          : new InternalServerErrorException(
              'Could not deposit funds. Please try again later'
            );

        return new Swyft_OKException(
          `Deposit of ${toCurrencyFormat(
            createTransactionDto.amount_money.amount
          )} was successfull`
        );
      }

      case this.FAILURE:
        return new Swyft_AccountNotFound();

      default:
        return new InternalServerErrorException(
          'A problem occured while trying to deposit funds'
        );
    }
  }

  /**
   * Withdraw money from account
   * @param accountId
   * @param createTransactionDto
   * @returns
   */
  @isTableInDB('accounts')
  @isTableEmpty('accounts')
  async withdrawFundsFromAccount(
    accountId: string,
    createTransactionDto: CreateTransactionDto
  ) {
    const [isAccountInDB] = await this.repository.isExistingAccount(accountId);

    switch (isAccountInDB !== undefined) {
      case this.SUCCESS: {
        if (
          isAccountInDB.account.balance.amount <
          createTransactionDto.amount_money.amount
        )
          return new NotAcceptableException(
            `Error! You cannot withdraw more than the amount in your account. Your current balance is ${toCurrencyFormat(
              isAccountInDB.account.balance.amount
            )}`
          );

        if (
          createTransactionDto.amount_money.amount < this.MIN_WITHDRAWAL_AMOUNT
        )
          return new NotAcceptableException(
            `The minimum you are allowed to withdraw is ${toCurrencyFormat(
              this.MIN_WITHDRAWAL_AMOUNT
            )}`
          );

        const isDebitSuccessfull = this.repository.update(
          this.tables.ACCOUNTS,
          isAccountInDB.index,
          {
            ...isAccountInDB.account,
            ...{
              balance: {
                amount:
                  isAccountInDB.account.balance.amount -
                  createTransactionDto.amount_money.amount,
                currency: isAccountInDB.account.balance.currency,
              },
            },
          }
        );

        isDebitSuccessfull
          ? this.repository.insert(
              this.tables.TRANSACTIONS,
              TransactionMapper.toDomain({
                ...createTransactionDto,
                account_id: accountId,
              })
            )
          : new InternalServerErrorException(
              'Could not withdraw funds. Please try again later'
            );

        return new Swyft_OKException(
          `Withrawal of ${toCurrencyFormat(
            createTransactionDto.amount_money.amount
          )} was successfull`
        );
      }

      case this.FAILURE:
        return new Swyft_AccountNotFound();

      default:
        return new InternalServerErrorException(
          'A problem occured while trying to withdraw funds'
        );
    }
  }

  /**
   * Send money to an existing account
   * @param accountId
   * @param createTransactionDto
   * @returns
   */
  @isTableInDB('accounts')
  @isTableEmpty('accounts')
  async sendFundsToAccount(
    accountId: string,
    createTransactionDto: CreateTransactionDto
  ) {
    const [isSourceAccountInDB] = await this.repository.isExistingAccount(
      accountId
    );
    const [isTargetAccountInDB] = await this.repository.isExistingAccount(
      createTransactionDto.target_account_id
    );

    if (isSourceAccountInDB === undefined)
      return new Swyft_AccountNotFound('Source');

    if (isTargetAccountInDB === undefined)
      return new Swyft_AccountNotFound('Target');

    if (
      isSourceAccountInDB.account.balance.amount <
        createTransactionDto.amount_money.amount ||
      isSourceAccountInDB.account.balance.amount <= 0
    )
      return new NotAcceptableException(
        'The amount you specified exceeds your balance.'
      );

    if (createTransactionDto.amount_money.amount > this.MAX_TO_SEND_AMOUNT)
      return new NotAcceptableException(
        `You cannot send more than ${toCurrencyFormat(this.MAX_TO_SEND_AMOUNT)}`
      );

    if (createTransactionDto.amount_money.amount < this.MIN_TO_SEND_AMOUNT)
      return new NotAcceptableException(
        `You cannot send less than ${toCurrencyFormat(this.MIN_TO_SEND_AMOUNT)}`
      );

    const isDebitTargetSuccessfull = this.repository.update(
      this.tables.ACCOUNTS,
      isSourceAccountInDB.index,
      {
        ...isSourceAccountInDB.account,
        ...{
          balance: {
            amount:
              isSourceAccountInDB.account.balance.amount -
              createTransactionDto.amount_money.amount,
            currency: isSourceAccountInDB.account.balance.currency,
          },
        },
      }
    );

    const isCreditTargetSuccessful = this.repository.update(
      this.tables.ACCOUNTS,
      isTargetAccountInDB.index,
      {
        ...isTargetAccountInDB.account,
        ...{
          balance: {
            amount:
              isTargetAccountInDB.account.balance.amount +
              createTransactionDto.amount_money.amount,
            currency: isTargetAccountInDB.account.balance.currency,
          },
        },
      }
    );

    isDebitTargetSuccessfull && isCreditTargetSuccessful
      ? this.repository.insert(
          this.tables.TRANSACTIONS,
          TransactionMapper.toDomain({
            ...createTransactionDto,
            account_id: accountId,
          })
        )
      : new InternalServerErrorException(
          'Could not send funds. Please try again later'
        );

    return new Swyft_OKException(
      `${toCurrencyFormat(
        createTransactionDto.amount_money.amount
      )} was successfully sent`
    );
  }
}
