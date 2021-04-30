import { BalanceAttributes, CreateAccountDto } from '../dto/create-account.dto';
import { Account } from '../entities/account.entity';
import { v4 as uuidv4 } from 'uuid';

import { UpdateAccountDto } from '../dto/update-account.dto';
import { toUppercaseFirst } from '../../utilities/swyft-string-methods';

export class AccountMapper {
  /**
   * Accounts table create mapper
   * @param raw
   * @returns
   */
  public static toDomain(raw: CreateAccountDto): Account {
    return new Account(
      uuidv4().toString(),
      toUppercaseFirst(raw.given_name.trim()),
      toUppercaseFirst(raw.family_name.trim()),
      raw.email_address.trim(),
      raw.note.trim(),
      {
        amount: raw.balance.amount.toFixed(2),
        ...raw.balance,
      }
    );
  }

  /**
   * Accounts table update mapper
   * @param accountId The account to update
   * @param raw Payload
   * @param balance The balance to update
   * @returns
   */
  public static toUpdateDomain(
    accountId: string,
    raw: UpdateAccountDto,
    balance: BalanceAttributes
  ): Account {
    return new Account(
      accountId,
      toUppercaseFirst(raw.given_name.trim()),
      toUppercaseFirst(raw.family_name.trim()),
      raw.email_address.trim(),
      raw.note.trim(),
      balance
    );
  }
}
