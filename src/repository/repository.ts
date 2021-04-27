import { HttpException, NotFoundException } from '@nestjs/common';
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
  ): boolean | HttpException => {
    const [tables] = Repository.DATASTORE;

    if (!Object.keys(tables).includes(table))
      return new NotFoundException('Wrong table provided.');

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
  ): boolean | HttpException => {
    const [tables] = Repository.DATASTORE;

    if (!Object.keys(tables).includes(table))
      return new NotFoundException('Wrong table provided.');

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
  ): boolean | HttpException => {
    const [tables] = Repository.DATASTORE;

    if (!Object.keys(tables).includes(table))
      return new NotFoundException('Wrong table provided.');

    return tables[table].splice(updateAtIndex, 1, dataToInsert)
      ? Repository.SUCCESS
      : Repository.FAILURE;
  };

  /**
   * Retrieve all data from a given table
   * @param table Target table
   * @returns Array<Account> | Undefined
   */
  public static query = (
    table: string
  ): Array<Account> | Array<Transaction> | HttpException => {
    const [tables] = Repository.DATASTORE;

    if (!Object.keys(tables).includes(table))
      return new NotFoundException('Wrong table provided.');

    return tables[table].length > 0 ? tables[table] : [];
  };

  /**
   * Chekc if a given table in the database is empty
   * @param table Target table
   * @returns Boolean
   */
  public static isTableEmpty = (table: string): any => {
    const [tables] = Repository.DATASTORE;
    return tables[table].length <= 0 ? false : true;
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
  ): Account => {
    const [tables] = Repository.DATASTORE;

    return tables[table].find((account: Account) => account[key] === search);
  };

  /**
   * Find a given account by Id
   * @param table Target table
   * @param accountId The account id to search for
   * @returns
   */
  public static findById = (table: string, accountId: string): Account =>
    Repository.findByKey(table, 'id', accountId);
}
