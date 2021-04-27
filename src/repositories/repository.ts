import { HttpException, NotFoundException } from '@nestjs/common';
import { TransactionAmountAttributes } from 'src/transactions/dto/create-transaction.dto';
import { AccountQuery, AccountStore } from 'src/typings/types';
import { Account } from '../accounts/entities/account.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

export class Repository {
  /**
   * Swype API Datastore/Database
   */
  private static readonly accountsDatabase: Array<AccountStore> = [
    {
      accounts: [],
      transactions: [],
    },
  ];

  /**
   * Database Alias
   */
  public static DATASTORE = Repository.accountsDatabase;

  /**
   * Constant initilizations for boolean thruthy
   */
  private static readonly SUCCESS: boolean = true;

  /**
   * Constant initilizations for boolean falsy
   */
  private static readonly FAILURE: boolean = false;

  /**
   * Delete data from table
   * @param table Target table
   * @param deleteAtIndex The position to delete in table
   * @returns
   */
  public static delete = (
    table: string,
    deleteAtIndex: number
  ): boolean | null | HttpException => {
    const [tables] = Repository.DATASTORE;

    if (!Repository.isExistingTable(table)) return null;

    return tables[table].splice(deleteAtIndex, 1).length
      ? Repository.SUCCESS
      : Repository.FAILURE;
  };

  /**
   * Insert data into table
   * @param table Target table
   * @param dataToInsert The data to insert
   * @returns
   */
  public static insert = (
    table: string,
    dataToInsert: any
  ): boolean | null | HttpException => {
    const [tables] = Repository.DATASTORE;

    if (!Repository.isExistingTable(table)) return null;

    return tables[table].push(dataToInsert)
      ? Repository.SUCCESS
      : Repository.FAILURE;
  };

  /**
   * Update data in table
   * @param table Target table
   * @param updateAtIndex The position to update in table
   * @param dataToInsert The data to insert
   * @returns Boolean
   */
  public static update = (
    table: string,
    updateAtIndex: number,
    dataToInsert: any
  ): boolean | null => {
    const [tables] = Repository.DATASTORE;

    if (!Repository.isExistingTable(table)) return null;

    return tables[table].splice(updateAtIndex, 1, dataToInsert)
      ? Repository.SUCCESS
      : Repository.FAILURE;
  };

  /**
   * Retrieve all data from a given table
   * @param table Target table
   * @returns Array<Account> | Array<empty>
   */
  public static query = (
    table: string
  ): Array<Account> | Array<Transaction> | boolean | null => {
    const [tables] = Repository.DATASTORE;

    if (!Repository.isExistingTable(table)) return null;

    return tables[table].length > 0 ? tables[table] : [];
  };

  public static queryById = (
    table: string,
    searchOptions?: { key: string; id: string }
  ): Array<Transaction | Account> | boolean | null => {
    if (!Repository.isExistingTable(table)) return null;

    const key = searchOptions !== undefined ? searchOptions.key : 'id';

    const allTransactions = Repository.query(table);

    if (Array.isArray(allTransactions)) {
      return allTransactions
        .map(
          (tableObj: Account | Transaction) =>
            tableObj[key] === searchOptions.id && tableObj
        )
        .filter((transaction) => transaction);
    }

    return [];
  };

  /**
   * Chekc if a given table in the database is empty
   * @param table Target table
   * @returns Boolean
   */
  public static isTableEmpty = (table: string): boolean | null => {
    const [tables] = Repository.DATASTORE;
    if (!Repository.isExistingTable(table)) return null;
    return tables[table].length <= 0 ? Repository.FAILURE : Repository.SUCCESS;
  };

  /**
   * Checks if a given table exists in the database
   * @param table The table to check
   * @returns
   */
  public static isExistingTable = (table: string): boolean => {
    const [tables] = Repository.DATASTORE;
    return !Object.keys(tables).includes(table)
      ? Repository.FAILURE
      : Repository.SUCCESS;
  };

  /**
   * Queries the existence of a given account in the database
   * If no search options is provided, the ID is used by
   * @param search Data to check for
   * @param searchOptions The key to match. Id is used by default.
   * @returns Returns the elements of the queried account
   */
  public static isExistingAccount = (
    search: string,
    searchOptions?: {
      key: string;
    }
  ): AccountQuery => {
    const [tables] = Repository.DATASTORE;

    const key = searchOptions !== undefined ? searchOptions.key : 'id';

    return tables.accounts
      .map(
        (account, idx) =>
          account[key] === search && {
            account: { ...account },
            index: idx,
          }
      )
      .filter((account) => account);
  };

  /**
   * Retrieve data from the database with any key specified
   * @param table Target table
   * @param key Key to match in table
   * @param search Search string
   * @returns
   */

  private static findByKey = (
    table: string,
    key: string | number,
    search: string | number
  ): Account | Transaction | null => {
    const [tables] = Repository.DATASTORE;
    if (!Repository.isExistingTable(table)) return null;

    return tables[table].find(
      (tableObj: Account | Transaction) => tableObj[key] === search
    );
  };

  /**
   * Find a given account by Id
   * @param table Target table
   * @param id The id to search for
   * @returns
   */
  public static findById = (table: string, id: string): Account | Transaction =>
    Repository.findByKey(table, 'id', id);
}
