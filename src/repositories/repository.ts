import { HttpException } from '@nestjs/common';
import { AccountQuery, AccountStore } from 'src/typings/types';
import { Account } from '../accounts/entities/account.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

export class Repository {
  /**
   * Swyft API Datastore/Database
   */
  private static readonly accountsDatabase: Array<AccountStore> = [
    {
      accounts: [],
      transactions: [],
    },
  ];

  /**
   * Swyft API Database Alias
   */
  public static DATASTORE = Repository.accountsDatabase;

  /**
   * Constant initilization for thruthy boolean
   */
  private static readonly SUCCESS: boolean = true;

  /**
   * Constant initilization for falsy boolean
   */
  private static readonly FAILURE: boolean = false;

  /**
   * Insert data into table
   * @param table Target table
   * @param dataToInsert The data to insert
   * @returns Boolean | null
   */
  public static insert = (
    table: string,
    dataToInsert: any
  ): boolean | null | HttpException => {
    if (!Repository.isTableInDB(table)) return null;

    return Repository.tables()[table].push(dataToInsert)
      ? Repository.SUCCESS
      : Repository.FAILURE;
  };

  /**
   * Update data in table
   * @param table Target table
   * @param updateAtIndex The position to update in table
   * @param dataToInsert The data to insert
   * @returns Boolean | null
   */
  public static update = (
    table: string,
    updateAtIndex: number,
    dataToInsert: any
  ): boolean | null => {
    if (!Repository.isTableInDB(table)) return null;

    return Repository.tables()[table].splice(updateAtIndex, 1, dataToInsert)
      ? Repository.SUCCESS
      : Repository.FAILURE;
  };

  /**
   * Delete data from table
   * @param table Target table
   * @param deleteAtIndex The position to delete in table
   * @returns Boolean | null
   */
  public static delete = (
    table: string,
    deleteAtIndex: number
  ): boolean | null | HttpException => {
    if (!Repository.isTableInDB(table)) return null;

    return Repository.tables()[table].splice(deleteAtIndex, 1).length
      ? Repository.SUCCESS
      : Repository.FAILURE;
  };

  /**
   * Retrieve all data from a given table
   * @param table Target table
   * @returns Array<Account> | null
   */
  public static findAll = (
    table: string
  ): Array<Account> | Array<Transaction> | null => {
    const tables = Repository.tables();

    if (!Repository.isTableInDB(table)) return null;

    return tables[table].length > 0 ? tables[table] : [];
  };

  /**
   * Retrieve all data that matches the provided search options
   * @param table Target table
   * @param searchOptions.key The key/field to match
   * @param searchOptions.id The search value. Id is used by default
   * @returns Array<Account | Transaction> | null
   */
  public static findByKey = (
    table: string,
    searchOptions?: { key: string; id: string }
  ): Array<Transaction | Account> | null => {
    if (!Repository.isTableInDB(table)) return null;

    const key = searchOptions !== undefined ? searchOptions.key : 'id';

    const resultData = Repository.findAll(table);

    if (Array.isArray(resultData)) {
      return resultData
        .map(
          (tableObj: Account | Transaction) =>
            tableObj[key] === searchOptions.id && tableObj
        )
        .filter((transaction) => transaction);
    }

    return [];
  };

  /**
   * Find a given account by Id
   * @param table Target table
   * @param id The id to search for
   * @returns Array<Account | Transaction>
   */
  public static findById = (
    table: string,
    id: string
  ): Array<Account | Transaction> =>
    Repository.findByKey(table, { key: 'id', id: id });

  /**
   * Chekc if a given table in the database is empty
   * @param table Target table
   * @returns Boolean | null
   */
  public static isTableEmpty = (table: string): boolean | null => {
    if (!Repository.isTableInDB(table)) return null;
    return Repository.tables()[table].length
      ? Repository.SUCCESS
      : Repository.FAILURE;
  };

  /**
   * Checks if a given table exists in the database
   * @param table The table to check
   * @returns Boolean
   */
  public static isTableInDB = (table: string): boolean => {
    return !Object.keys(Repository.tables()).includes(table)
      ? Repository.FAILURE
      : Repository.SUCCESS;
  };

  /**
   * Queries the existence of a given account in the database.
   * If no search options is provided, the ID is used by default
   * @param search Data to check for
   * @param searchOptions.key The key/field to match
   * @param searchOptions.id The search value. Id is used by default
   * @returns AccountQuery
   */
  public static isExistingAccount = (
    search: string,
    searchOptions?: {
      key: string;
    }
  ): AccountQuery => {
    const key = searchOptions !== undefined ? searchOptions.key : 'id';

    return Repository.tables()
      .accounts.map(
        (account, idx) =>
          account[key] === search && {
            account: { ...account },
            index: idx,
          }
      )
      .filter((account) => account);
  };

  /**
   * Retrive all tables in the database
   * @returns Array
   */
  public static tables = () => {
    const [tables] = Repository.DATASTORE;
    return tables;
  };
}
