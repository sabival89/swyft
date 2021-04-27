import { Account } from 'src/accounts/entities/account.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';

type AccountStore = {
  accounts: Array<Account>;
  transactions: Array<Transaction>;
};

type AccountQuery = Array<{ account: Account; index: number }>;

/**
 * Type declarations
 */
type TableFetchInfo = { count: number; result: Array<Account | Transaction> };
