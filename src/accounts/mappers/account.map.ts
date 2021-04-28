import { CreateAccountDto } from '../dto/create-account.dto';
import { Account } from '../entities/account.entity';
import { v4 as uuidv4 } from 'uuid';

import { UpdateAccountDto } from '../dto/update-account.dto';
import { toUppercaseFirst } from 'src/utilities/swyft-string-methods';

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
   * @param raw
   * @returns
   */
  public static toUpdateDomain(raw: UpdateAccountDto): Account {
    return new Account(
      raw.id,
      toUppercaseFirst(raw.given_name.trim()),
      toUppercaseFirst(raw.family_name.trim()),
      raw.email_address.trim(),
      raw.note.trim(),
      raw.balance
    );
  }
}
