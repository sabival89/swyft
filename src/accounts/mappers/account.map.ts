import { CreateAccountDto } from '../dto/create-account.dto';
import { Account } from '../entities/account.entity';
import { v4 as uuidv4 } from 'uuid';
import toUppercaseFirst from 'src/utilities/SwyftStringMethods';
import { UpdateAccountDto } from '../dto/update-account.dto';

export class AccountMapper {
  public static toDomain(raw: CreateAccountDto): Account {
    const formattedBalance = {
      amount: raw.balance.amount.toFixed(2),
      ...raw.balance,
    };

    return new Account(
      uuidv4().toString(),
      toUppercaseFirst(raw.given_name.trim()),
      toUppercaseFirst(raw.family_name.trim()),
      raw.email_address.trim(),
      raw.note.trim(),
      formattedBalance
    );
  }

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
