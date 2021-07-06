import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import isTableEmpty from '../core/decorators/is-table-empty.decorator';
import isTableInDB from '../core/decorators/is-table-in-db.decorator';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountMapper } from './mappers/account.map';
import { TransactionMapper } from '../transactions/mapper/transaction.map';
import { CreateTransactionDto } from '../transactions/dto/create-transaction.dto';
import { toCurrencyFormat } from '../utilities/swyft-string-methods';
import { Swyft_OKException } from '../core/errors/exceptions/swyft-ok.exception';
import { Swyft_AccountNotFound } from '../core/errors/exceptions/swyft-account-not-found.exception';
import { Table } from '../core/database/tables.database';
import { Repository } from '../repositories/repository';
import { SwyftAccountQuery } from '../typings/types';
import { SwyftSession } from '../core/sessions/swyft-session.session';
import { DepositTransactionDto } from '../transactions/dto/deposit-transaction.dto';
import { WithdrawTransactionDto } from '../transactions/dto/withdraw-transaction.dto';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountsService {
  /**
   * The minimum amount to withdraw from a given account
   */
  private readonly MIN_WITHDRAWAL_AMOUNT: number = 20;

  /**
   * The maximum amount to send
   */
  private readonly MAX_AMOUNT: number = 1000;

  /**
   * The minimum amount to send
   */
  private readonly MIN_AMOUNT: number = 1;

  /**
   * Inject dependencies
   * @param tables All tables in the database
   * @param repository Database utilities
   * @param session The session storage
   */
  constructor(
    private readonly tables: Table,
    private repository: Repository,
    private session: SwyftSession
  ) {}

  /**
   * Create a new Account
   * @param createAccountDto
   * @returns
   */
  @isTableInDB('accounts')
  async createAccount(createAccountDto: CreateAccountDto) {
    return await this.repository
      .findByKey(this.tables.ACCOUNTS, {
        key: 'email_address',
        id: createAccountDto.email_address,
      })
      .then(async (account) => {
        // Check if account already exists
        if (Array.isArray(account) && account.length)
          return new ConflictException(
            `An account already exists for the user with email ${createAccountDto.email_address}`
          );

        // Insert new account to the database
        return await this.repository
          .insert(
            this.tables.ACCOUNTS,
            AccountMapper.toDomain({ ...createAccountDto })
          )
          .then(() => new Swyft_OKException('Account was successfully created'))
          .catch(
            () =>
              new InternalServerErrorException(
                'An error occurred while trying to create account. Please try again!'
              )
          );
      });
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
    // Throw an error if balance fields are included
    if (Object.keys(updateAccountDto).includes('balance'))
      return new BadRequestException(
        'Error! Cannot update amount. Please make a deposit or contact support'
      );

    return await this.repository
      .isExistingAccount(accountId)
      .then(async (existingAccount) => {
        const updatedAttributes: Account = {
          ...existingAccount.account,
          ...updateAccountDto,
        };

        // Update the account if it exists
        return await this.repository
          .update(
            this.tables.ACCOUNTS,
            existingAccount.index,
            AccountMapper.toUpdateDomain(
              accountId,
              updatedAttributes,
              updatedAttributes.balance
            )
          )
          .then(() => new Swyft_OKException(`Account was successfully updated`))
          .catch(
            () =>
              new InternalServerErrorException(
                'Could not update account. Please try again later'
              )
          );
      })
      .catch(() => {
        return new Swyft_AccountNotFound();
      });
  }

  /**
   * Remove/Delete an existing account
   * @param accountId
   * @returns
   */
  @isTableInDB('accounts')
  @isTableEmpty('accounts')
  async removeAccount(accountId: string) {
    return await this.repository
      .isExistingAccount(accountId)
      .then(async (existingAccount: SwyftAccountQuery) => {
        if (existingAccount.account.balance.amount > 0)
          return new ForbiddenException(
            'Account balance requires settlement. Please contact support'
          );

        // Delete the account if it exists
        return await this.repository
          .delete(this.tables.ACCOUNTS, existingAccount.index)
          .then(() => new Swyft_OKException(`Account was successfully removed`))
          .catch(
            () =>
              new InternalServerErrorException(
                'Could not remove account. Please try again later'
              )
          );
      })
      .catch(() => new Swyft_AccountNotFound());
  }

  /**
   * Retrieve all existing accounts
   * @returns
   */
  @isTableInDB('accounts')
  async findAllAccounts() {
    return await this.repository
      .findAll(this.tables.ACCOUNTS)
      .then((response) => ({
        count: response.length,
        result: response,
      }))
      .catch(() => new NotFoundException('Could not retrieve accounts.'));
  }

  /**
   * Find and retrive existing account details
   * @param accountId
   * @returns The account tied to the accountId provided
   */

  @isTableInDB('accounts')
  @isTableEmpty('accounts')
  async findOneAccount(accountId: string) {
    const isAccountInDB:
      | boolean
      | Array<Account | Transaction> = await this.repository.findById(
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
    return await this.repository
      .isExistingAccount(accountId)
      .then(async () => {
        const transactionsByAccountId:
          | boolean
          | Array<Account | Transaction> = await this.repository.findByKey(
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
      })
      .catch(() => {
        return new Swyft_AccountNotFound();
      });
  }

  /**
   * Add funds to an existing account
   * @param createTransactionDto
   * @returns
   */
  @isTableInDB('accounts')
  @isTableEmpty('accounts')
  async addFundsToAccount(
    accountId: string,
    createTransactionDto: DepositTransactionDto
  ) {
    return await this.repository
      .isExistingAccount(accountId)
      .then(async (isAccountInDB) => {
        // Check if account is already in session and block concurrent transactions
        if (this.session.isInSession(accountId).status)
          return new ConflictException(
            `Only one transaction at a time is allowed`
          );
        // Add account to session
        else this.session.initSession(accountId);

        return await this.repository
          .update(
            this.tables.ACCOUNTS,
            isAccountInDB.index,
            this.credit(isAccountInDB, createTransactionDto.amount_money.amount)
          )
          .then(
            async () =>
              await this.repository.insert(
                this.tables.TRANSACTIONS,
                TransactionMapper.toDomain(
                  accountId,
                  null,
                  createTransactionDto
                )
              )
          )
          .then(
            () =>
              new Swyft_OKException(
                `Deposit of ${toCurrencyFormat(
                  createTransactionDto.amount_money.amount
                )} was successfull`
              )
          )
          .catch(
            () =>
              new InternalServerErrorException(
                'Could not deposit funds. Please try again later'
              )
          );
      })
      .catch(() => new Swyft_AccountNotFound())
      .finally(() => this.session.killSession(accountId));
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
    createTransactionDto: WithdrawTransactionDto
  ) {
    return await this.repository
      .isExistingAccount(accountId)
      .then(async (isAccountInDB) => {
        // Check if accountis already in session and block concurrent trjansactions
        if (this.session.isInSession(accountId).status)
          return new ConflictException(
            `Only one transaction at a time is allowed`
          );
        // Add account to session
        else this.session.initSession(accountId);

        // Check that the requested withdrawal amount is less than balance
        if (
          isAccountInDB.account.balance.amount <
          createTransactionDto.amount_money.amount
        )
          return new NotAcceptableException(
            `You cannot withdraw more than the amount in your account. Your current balance is ${toCurrencyFormat(
              isAccountInDB.account.balance.amount
            )}`
          );

        // Check that the requested withdrawal amount is above minimum
        if (
          createTransactionDto.amount_money.amount < this.MIN_WITHDRAWAL_AMOUNT
        )
          return new NotAcceptableException(
            `The minimum you are allowed to withdraw is ${toCurrencyFormat(
              this.MIN_WITHDRAWAL_AMOUNT
            )}`
          );

        return await this.repository
          .update(
            this.tables.ACCOUNTS,
            isAccountInDB.index,
            this.debit(isAccountInDB, createTransactionDto.amount_money.amount)
          )
          .then(
            async () =>
              await this.repository.insert(
                this.tables.TRANSACTIONS,
                TransactionMapper.toDomain(
                  accountId,
                  null,
                  createTransactionDto
                )
              )
          )
          .then(
            () =>
              new Swyft_OKException(
                `Withrawal of ${toCurrencyFormat(
                  createTransactionDto.amount_money.amount
                )} was successfull`
              )
          )
          .catch(
            () =>
              new InternalServerErrorException(
                'Could not withdraw funds. Please try again later'
              )
          );
      })
      .catch(() => new Swyft_AccountNotFound())
      .finally(() => this.session.killSession(accountId));
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
    return await this.repository
      .isExistingAccount(accountId)
      .then(
        async (sourceAccount) =>
          await this.repository
            .isExistingAccount(createTransactionDto.target_account_id)
            .then(async (targetAccount) => {
              // Check if accountis already in session and block concurrent trjansactions
              if (this.session.isInSession(accountId).status)
                return new ConflictException(
                  `Only one transaction at a time is allowed`
                );
              // Add account to session
              else this.session.initSession(accountId);

              // Check that both source and target accounts are different
              if (accountId === createTransactionDto.target_account_id)
                return new ConflictException(
                  'Cannot send to same source account'
                );

              // Check that the requested amount is within the balance range
              if (
                sourceAccount.account.balance.amount <
                  createTransactionDto.amount_money.amount ||
                sourceAccount.account.balance.amount <= 0
              )
                return new NotAcceptableException(
                  'The amount you specified exceeds your balance.'
                );

              // Check that the amount to send is less than limit
              if (createTransactionDto.amount_money.amount > this.MAX_AMOUNT)
                return new NotAcceptableException(
                  `You cannot send more than ${toCurrencyFormat(
                    this.MAX_AMOUNT
                  )}`
                );

              // Check that the amount to send is greater than minimum
              if (createTransactionDto.amount_money.amount < this.MIN_AMOUNT)
                return new NotAcceptableException(
                  `You cannot send less than ${toCurrencyFormat(
                    this.MIN_AMOUNT
                  )}`
                );

              return await this.repository
                .update(
                  this.tables.ACCOUNTS,
                  sourceAccount.index,
                  this.debit(
                    sourceAccount,
                    createTransactionDto.amount_money.amount
                  )
                )
                .then(
                  async () =>
                    await this.repository.update(
                      this.tables.ACCOUNTS,
                      targetAccount.index,
                      this.credit(
                        targetAccount,
                        createTransactionDto.amount_money.amount
                      )
                    )
                )
                .then(
                  async () =>
                    await this.repository.insert(
                      this.tables.TRANSACTIONS,
                      TransactionMapper.toDomain(
                        accountId,
                        createTransactionDto.target_account_id,
                        createTransactionDto
                      )
                    )
                )
                .then(
                  () =>
                    new Swyft_OKException(
                      `${toCurrencyFormat(
                        createTransactionDto.amount_money.amount
                      )} was successfully sent`
                    )
                )
                .catch(
                  () =>
                    new InternalServerErrorException(
                      'Could not send funds. Please try again later'
                    )
                );
            })
            .catch(() => new Swyft_AccountNotFound('Target'))
      )
      .catch(() => new Swyft_AccountNotFound('Source'))
      .finally(() => this.session.killSession(accountId));
  }

  /**
   * Debit a given account
   * @param accountDto Source/Target account payload
   * @param amount Amount to debit
   * @returns
   */
  private debit(accountDto: SwyftAccountQuery, amount: number) {
    return this.updateAccountFields(
      accountDto,
      accountDto.account.balance.amount - amount
    );
  }

  /**
   * Credit a given account
   * @param accountDto Source/Target account payload
   * @param amount Amount to credit
   * @returns
   */
  private credit(accountDto: SwyftAccountQuery, amount: number) {
    return this.updateAccountFields(
      accountDto,
      accountDto.account.balance.amount + amount
    );
  }

  /**
   * Update fields for debitted/credited accounts
   * @param accountDto Source/Target account payload
   * @param amountBalance Balance value
   * @returns
   */
  private updateAccountFields(
    accountDto: SwyftAccountQuery,
    amountBalance: number
  ) {
    return {
      ...accountDto.account,
      ...{
        balance: {
          amount: Number(amountBalance.toFixed(2)),
          currency: accountDto.account.balance.currency,
        },
      },
    };
  }
}
