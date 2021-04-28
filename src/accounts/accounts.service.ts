import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountMapper } from './mappers/account.map';
import { Repository } from '../repositories/repository';
import { TransactionMapper } from '../transactions/mapper/transaction.map';
import { CreateTransactionDto } from '../transactions/dto/create-transaction.dto';
import { toCurrencyFormat } from '../utilities/SwyftStringMethods';
import { Swyft_OKException } from '../core/errors/exceptions/ok.exception';
import isTableEmpty from 'src/core/decorators/is-table-empty.decorator';
import isTableInDB from 'src/core/decorators/is-table-in-db.decorator';

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
  private readonly MIN_WITHDRAWAL_AMOUNT = 20;

  /**
   * The maximum amount to send
   */
  private readonly MAX_TO_SEND_AMOUNT = 1000;

  /**
   * The minimum amount to send
   */
  private readonly MIN_TO_SEND_AMOUNT = 1;

  /**
   * Create a new Account
   * @param createAccountDto
   * @returns
   */
  createAccount(createAccountDto: CreateAccountDto) {
    if (
      Repository.isExistingAccount(createAccountDto.email_address, {
        key: 'email_address',
      }).length > 0
    )
      return new ConflictException(
        `An account already exists for user with the email ${createAccountDto.email_address}`
      );

    return Repository.insert(
      'accounts',
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
  updateAccount(accountId: string, updateAccountDto: UpdateAccountDto) {
    if (Repository.isTableEmpty('accounts') === this.FAILURE)
      return new BadRequestException('Database is empty');
    else if (Repository.isTableEmpty('accounts') === null)
      return new BadRequestException('The table does not exist');

    if (Object.keys(updateAccountDto).includes('balance'))
      return new BadRequestException(
        'Error! Cannot update amount. Please make a deposit or contact support'
      );

    const [isAccountInDB] = Repository.isExistingAccount(accountId);

    switch (isAccountInDB !== undefined) {
      case this.SUCCESS: {
        const updatedAttributes = {
          ...isAccountInDB.account,
          ...updateAccountDto,
        };

        Repository.update(
          'accounts',
          isAccountInDB.index,
          AccountMapper.toUpdateDomain(updatedAttributes)
        );

        return new Swyft_OKException(`Account was successfully updated`);
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
   * Remove/Delete an existing account
   * @param accountId
   * @returns
   */
  removeAccount(accountId: string) {
    if (Repository.isTableEmpty('accounts') === this.FAILURE)
      return new BadRequestException('Database is empty');
    else if (Repository.isTableEmpty('accounts') === null)
      return new BadRequestException('The table does not exist');

    const [isAccountInDB] = Repository.isExistingAccount(accountId);

    switch (isAccountInDB !== undefined) {
      case this.SUCCESS: {
        if (isAccountInDB.account.isAmountPositive())
          return new ForbiddenException(
            'Account requires review. Please contact support'
          );

        return (
          Repository.delete('accounts', isAccountInDB.index) &&
          new Swyft_OKException(`Account was successfully removed`)
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
   * Retrieve all existing accounts
   * @returns
   */
  findAllAccounts() {
    const dbResult = Repository.findAll('accounts');

    if (!dbResult) return new NotFoundException('Wrong table provided.');

    return (
      Array.isArray(dbResult) && {
        count: dbResult.length,
        result: dbResult,
      }
    );
  }

  /**
   * Find and retrive existing account details
   * @param accountId
   * @returns The account tied to the accountId provided
   */

  @isTableInDB('accounts')
  @isTableEmpty('accounts')
  findOneAccount(accountId: string) {
    // if (Repository.isTableEmpty('accounts') === this.FAILURE)
    //   return new BadRequestException('Database is empty');
    // else if (Repository.isTableEmpty('accounts') === null)
    //   return new BadRequestException('The table does not exist');

    const isAccountInDB = Repository.findById('accounts', accountId);

    return Array.isArray(isAccountInDB) && isAccountInDB.length
      ? isAccountInDB
      : new NotFoundException('Account does not exist');
  }

  /**
   * Find a given transaction by accountId
   * @param accountId
   * @returns All transactions tied to the accountId provided
   */
  findOneTransaction = (accountId: string) => {
    if (Repository.isTableEmpty('transactions') === this.FAILURE)
      return new BadRequestException('Database is empty');
    else if (Repository.isTableEmpty('transactions') === null)
      return new BadRequestException('The table does not exist');

    const [isAccountInDB] = Repository.isExistingAccount(accountId);

    if (isAccountInDB === undefined)
      return new NotFoundException('Account does not exist');

    const transactionsByAccountId = Repository.findByKey('transactions', {
      key: 'account_id',
      id: accountId,
    });

    !transactionsByAccountId && new NotFoundException('Wrong table provided.');

    return (
      Array.isArray(transactionsByAccountId) && {
        count: transactionsByAccountId.length,
        result: transactionsByAccountId,
      }
    );
  };

  /**
   * Add funds to an existing account
   * @param createTransactionDto
   * @returns
   */
  addFundsToAccount = (createTransactionDto: CreateTransactionDto) => {
    if (Repository.isTableEmpty('accounts') === this.FAILURE)
      return new BadRequestException('Database is empty');
    else if (Repository.isTableEmpty('accounts') === null)
      return new BadRequestException('The table does not exist');

    const [isAccountInDB] = Repository.isExistingAccount(
      createTransactionDto.account_id
    );

    switch (isAccountInDB !== undefined) {
      case this.SUCCESS: {
        const isDepositSuccessfull = Repository.update(
          'accounts',
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
          ? Repository.insert(
              'transactions',
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
        return new NotFoundException('Account does not exist');

      default:
        return new InternalServerErrorException(
          'A problem occured while trying to deposit funds'
        );
    }
  };

  /**
   * Withdraw money from account
   * @param accountId
   * @param createTransactionDto
   * @returns
   */
  withdrawFundsFromAccount = (
    accountId: string,
    createTransactionDto: CreateTransactionDto
  ) => {
    if (Repository.isTableEmpty('accounts') === this.FAILURE)
      return new BadRequestException('Database is empty');
    else if (Repository.isTableEmpty('accounts') === null)
      return new BadRequestException('The table does not exist');

    const [isAccountInDB] = Repository.isExistingAccount(accountId);

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

        const isDebitSuccessfull = Repository.update(
          'accounts',
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
          ? Repository.insert(
              'transactions',
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
        return new NotFoundException('Account does not exist');

      default:
        return new InternalServerErrorException(
          'A problem occured while trying to withdraw funds'
        );
    }
  };

  sendFundsToAccount = (
    accountId: string,
    createTransactionDto: CreateTransactionDto
  ) => {
    if (Repository.isTableEmpty('accounts') === this.FAILURE)
      return new BadRequestException('Database is empty');
    else if (Repository.isTableEmpty('accounts') === null)
      return new BadRequestException('The table does not exist');

    const [isSourceAccountInDB] = Repository.isExistingAccount(accountId);
    const [isTargetAccountInDB] = Repository.isExistingAccount(
      createTransactionDto.target_account_id
    );

    if (isSourceAccountInDB === undefined)
      return new NotFoundException('Source account does not exist');

    if (isTargetAccountInDB === undefined)
      return new NotFoundException('Target account does not exist');

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

    const isDebitTargetSuccessfull = Repository.update(
      'accounts',
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

    const isCreditTargetSuccessful = Repository.update(
      'accounts',
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
      ? Repository.insert(
          'transactions',
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
  };
}
