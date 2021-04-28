import { SwyftAccountQuery, SwyftDatabaseTables } from 'src/typings/types';
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
  public insert = (table: string, data: any): boolean | null => {
    if (!this.repo.isTableInDB(table)) return null;

    return this.repo.tables()[table].push(data)
      ? this.repo.SUCCESS
      : this.repo.FAILURE;
  };

  /**
   * Update data in table
   * @param table Target table
   * @param index The position to update in table
   * @param data The data to insert
   * @returns Boolean | null
   */
  public update = (table: string, index: number, data: any): boolean | null => {
    if (!this.repo.isTableInDB(table)) return null;

    return this.repo.tables()[table].splice(index, 1, data)
      ? this.repo.SUCCESS
      : this.repo.FAILURE;
  };

  /**
   * Delete data from table
   * @param table Target table
   * @param index The position to delete in table
   * @returns Boolean | null
   */
  public delete = (table: string, index: number): boolean | null => {
    if (!this.repo.isTableInDB(table)) return null;

    return this.repo.tables()[table].splice(index, 1).length
      ? this.repo.SUCCESS
      : this.repo.FAILURE;
  };

  /**
   * Retrieve all data from a given table
   * @param table Target table
   * @returns Array<Account> | null
   */
  public findAll = (
    table: string
  ): Array<Account> | Array<Transaction> | null => {
    const tables = this.repo.tables();

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
  public findByKey = (
    table: string,
    searchOptions?: { key: string; id: string }
  ): Array<Transaction | Account> | null => {
    if (!this.repo.isTableInDB(table)) return null;

    const tableData = this.findAll(table);

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
  public findById = (id: string, table: string): Array<Account | Transaction> =>
    this.findByKey(table, { key: this.useKey(), id: id });

  /**
   * Chekc if a given table in the database is empty
   * @param table Target table
   * @returns Boolean | null
   */
  public static isTableEmpty = (table: string): boolean | null => {
    const $_this = Repository;
    if (!$_this.isTableInDB(table)) return null;
    return $_this.tables()[table].length <= 0 && $_this.SUCCESS;
  };

  /**
   * Checks if a given table exists in the database
   * @param table The table to check
   * @returns Boolean
   */
  public static isTableInDB = (table: string): boolean => {
    const $_this = Repository;
    return Object.keys($_this.tables()).includes(table) && $_this.SUCCESS;
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
    return this.repo
      .tables()
      .accounts.map(
        (account: Account, idx: number) =>
          account[this.useKey(searchOptions)] === search && {
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

  /**
   * Defaults to ID key if no searchoptions is provided
   * @param searchOptions
   * @returns
   */
  public useKey = (searchOptions?: Record<string, string>) =>
    searchOptions !== undefined ? searchOptions.key : 'id';
}
