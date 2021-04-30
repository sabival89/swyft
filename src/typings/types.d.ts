import { Account } from '../accounts/entities/account.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

/**
 * Type for the swyft database tables
 */
type SwyftDatabaseTables = {
  accounts: Array<Account>;
  transactions: Array<Transaction>;
};

/**
 * Type for individual query result from the account table
 */
type SwyftAccountQuery = { account: Account; index: number };

/**
 * Type for query results from Swyft database tables
 */
type SwyftTablesInfo = { count: number; result: Array<Account | Transaction> };
