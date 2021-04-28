import { rejects } from 'node:assert';
import {
  SwyftAccountQuery,
  SwyftDatabaseTables,
  SwyftTablesInfo,
} from 'src/typings/types';
import { Account } from '../accounts/entities/account.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

export class Repository {
  /**
   * Access to class name alias for non-static methods
   */
  private readonly repo = Repository;

  /**
   * Swyft API Datastore/Database
   */
  private static readonly swyftDatabase: Array<SwyftDatabaseTables> = [
    {
      accounts: [],
      transactions: [],
    },
  ];

  /**
   * Swyft API Database Alias
   */
  public static DATASTORE: Array<SwyftDatabaseTables> =
    Repository.swyftDatabase;

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
  public insert = async (table: string, data: any): Promise<boolean | null> => {
    if (!this.repo.isTableInDB(table)) return null;
    const tables = await this.repo.tables();
    return tables[table].push(data) ? this.repo.SUCCESS : this.repo.FAILURE;
  };

  /**
   * Update data in table
   * @param table Target table
   * @param index The position to update in table
   * @param data The data to insert
   * @returns Boolean | null
   */
  public update = async (
    table: string,
    index: number,
    data: any
  ): Promise<boolean | null> => {
    if (!this.repo.isTableInDB(table)) return null;
    const tables = await this.repo.tables();
    return tables[table].splice(index, 1, data)
      ? this.repo.SUCCESS
      : this.repo.FAILURE;
  };

  /**
   * Delete data from table
   * @param table Target table
   * @param index The position to delete in table
   * @returns Boolean | null
   */
  public delete = async (
    table: string,
    index: number
  ): Promise<boolean | null> => {
    if (!this.repo.isTableInDB(table)) return null;
    const tables = await this.repo.tables();
    return tables[table].splice(index, 1).length
      ? this.repo.SUCCESS
      : this.repo.FAILURE;
  };

  /**
   * Retrieve all data from a given table
   * @param table Target table
   * @returns Array<Account> | null
   */
  public findAll = async (
    table: string
  ): Promise<Array<Account> | Array<Transaction> | null> => {
    const tables = await this.repo.tables();

    if (!this.repo.isTableInDB(table)) return null;

    return tables[table].length > 0 ? tables[table] : [];
  };

  /**
   * Retrieve all data that matches the provided search options
   * @param table Target table
   * @param searchOptions.key The key/field to match
   * @param searchOptions.id The search value. Id is used by default
   * @returns Array<Account | Transaction> | null
   */
  public findByKey = async (
    table: string,
    searchOptions?: { key: string; id: string }
  ): Promise<Array<Transaction | Account> | null> => {
    if (!this.repo.isTableInDB(table)) return null;

    const tableData = await this.findAll(table);

    if (Array.isArray(tableData)) {
      return tableData
        .map(
          (tableObj: Account | Transaction) =>
            tableObj[this.useKey(searchOptions)] === searchOptions.id &&
            tableObj
        )
        .filter((transaction) => transaction);
    }

    return [];
  };

  /**
   * Find a given account by Id
   * @param id The id to search for
   * @param table Target table
   * @returns Array<Account | Transaction>
   */
  public findById = async (
    id: string,
    table: string
  ): Promise<Array<Account | Transaction>> =>
    await this.findByKey(table, { key: this.useKey(), id: id });

  /**
   * Chekc if a given table in the database is empty
   * @param table Target table
   * @returns Boolean | null
   */
  public static isTableEmpty = async (
    table: string
  ): Promise<boolean | null> => {
    const $_this = Repository;

    return new Promise(async (resolve, reject) => {
      const tables = await $_this.tables();

      if (!tables) return null;

      return tables[table].length <= 0
        ? reject($_this.SUCCESS)
        : resolve($_this.FAILURE);
    });
  };

  /**
   * Checks if a given table exists in the database
   * @param table The table to check
   * @returns Boolean
   */
  public static isTableInDB = async (
    table: string
  ): Promise<boolean | null> => {
    const $_this = Repository;

    return new Promise(async (resolve, reject) => {
      const tables = await $_this.tables();

      if (!tables) return null;

      return Object.keys(tables).includes(table)
        ? resolve($_this.SUCCESS)
        : reject($_this.FAILURE);
    });
  };

  /**
   * Queries the existence of a given account in the database.
   * If no search options is provided, the ID will be used by default
   * @param search Data to check for
   * @param searchOptions.key The key/field to match
   * @param searchOptions.id The search value. Id is used by default
   * @returns AccountQuery
   */
  public isExistingAccount = async (
    search: string,
    searchOptions?: {
      key: string;
    }
  ): Promise<SwyftAccountQuery> => {
    return new Promise(async (resolve, reject) => {
      const tables = await this.repo.tables();
      const [isAccountInDB]:
        | undefined
        | Array<SwyftAccountQuery> = tables.accounts
        .map(
          (account: Account, idx: number) =>
            account[this.useKey(searchOptions)] === search && {
              account: { ...account },
              index: idx,
            }
        )
        .filter((account) => account);

      return isAccountInDB === undefined ? reject([]) : resolve(isAccountInDB);
    });
  };

  /**
   * Retrive all tables in the database
   * @returns Array
   */
  public static tables = (): Promise<SwyftDatabaseTables> => {
    const [tables] = Repository.DATASTORE;

    return new Promise((resolve) => resolve(tables));
  };

  /**
   * Defaults to ID key if no searchoptions is provided
   * @param searchOptions
   * @returns
   */
  public useKey = (searchOptions?: Record<string, string>) =>
    searchOptions !== undefined ? searchOptions.key : 'id';
}
