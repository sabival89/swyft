import { SwyftAccountQuery, SwyftDatabaseTables } from '../typings/types';
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
   * @param data The data to insert
   * @returns Promise <Boolean | null>
   */
  public insert = async (table: string, data: any): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      return await this.repo
        .isTableInDB(table)
        .then(async (tables) => {
          return tables[table].push(data)
            ? resolve(this.repo.SUCCESS)
            : reject(this.repo.FAILURE);
        })
        .catch((error) => reject(error));
    });
  };

  /**
   * Update data in table
   * @param table Target table
   * @param index The position to update in table
   * @param data The data to insert
   * @returns Promise<Boolean | null>
   */
  public update = async (
    table: string,
    index: number,
    data: any
  ): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      return await this.repo
        .isTableInDB(table)
        .then((tables) => {
          return tables[table].splice(index, 1, data)
            ? resolve(this.repo.SUCCESS)
            : reject(this.repo.FAILURE);
        })
        .catch((error) => reject(error));
    });
  };

  /**
   * Delete data from table
   * @param table Target table
   * @param index The position to delete in table
   * @returns Promise<Boolean | null>
   */
  public delete = async (table: string, index: number): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      return await this.repo
        .isTableInDB(table)
        .then((tables) => {
          return tables[table].splice(index, 1).length
            ? resolve(this.repo.SUCCESS)
            : reject(this.repo.FAILURE);
        })
        .catch((error) => reject(error));
    });
  };

  /**
   * Retrieve all data from a given table
   * @param table Target table
   * @returns Promise<Array<Account> | null>
   */
  public findAll = async (
    table: string
  ): Promise<Array<Account> | Array<Transaction>> => {
    return new Promise(async (resolve, reject) => {
      return await this.repo
        .isTableInDB(table)
        .then(async (tables) => {
          return tables[table].length > 0
            ? resolve(tables[table])
            : resolve([]);
        })
        .catch((error) => reject(error));
    });
  };

  /**
   * Retrieve all data that matches the provided search options
   * @param table Target table
   * @param searchOptions.key The key/field to match
   * @param searchOptions.id The search value. Id is used by default
   * @returns Promise<Array<Account | Transaction> | null>
   */
  public findByKey = async (
    table: string,
    searchOptions?: { key: string; id: string }
  ): Promise<Array<Transaction | Account> | boolean> => {
    return new Promise(async (resolve, reject) => {
      return await this.repo
        .isTableInDB(table)
        .then(async () => {
          return await this.findAll(table)
            .then((tableData) => {
              const result = tableData
                .map(
                  (tableObj: Account | Transaction) =>
                    tableObj[this.useKey(searchOptions)] === searchOptions.id &&
                    tableObj
                )
                .filter((transaction) => transaction);

              return resolve(result);
            })
            .catch(() => reject([]));
        })
        .catch((error) => reject(error));
    });
  };

  /**
   * Find a given account by Id
   * @param id The id to search for
   * @param table Target table
   * @returns Promise<Array<Account | Transaction>>
   */
  public findById = async (
    id: string,
    table: string
  ): Promise<Array<Account | Transaction> | boolean> =>
    new Promise(async (resolve) =>
      resolve(await this.findByKey(table, { key: this.useKey(), id: id }))
    );

  /**
   * Chekc if a given table in the database is empty
   * @param table Target table
   * @returns Promise<Boolean | null>
   */
  public static isTableEmpty = async (table: string): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      const $_this = Repository;
      return await $_this
        .isTableInDB(table)
        .then(async (tables) => {
          return tables[table].length <= 0
            ? reject($_this.SUCCESS)
            : resolve($_this.FAILURE);
        })
        .catch((error) => reject(error));
    });
  };

  /**
   * Checks if a given table exists in the database
   * @param table The table to check
   * @returns Promise<Boolean>
   */
  public static isTableInDB = async (
    table: string
  ): Promise<boolean | SwyftDatabaseTables> => {
    return new Promise(async (resolve, reject) => {
      const $_this = Repository;
      return await $_this
        .tables()
        .then((tables) =>
          Object.keys(tables).includes(table)
            ? resolve(tables)
            : reject($_this.FAILURE)
        )
        .catch((error) => reject(error));
    });
  };

  /**
   * Queries the existence of a given account in the database.
   * If no search options is provided, the ID will be used by default
   * @param search Data to check for
   * @param searchOptions.key The key/field to match
   * @param searchOptions.id The search value. Id is used by default
   * @returns Promise<SwyftAccountQuery>
   */
  public isExistingAccount = async (
    search: string,
    searchOptions?: {
      key: string;
    }
  ): Promise<SwyftAccountQuery> => {
    return new Promise(async (resolve, reject) => {
      await this.repo.tables().then((tables) => {
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

        return isAccountInDB === undefined
          ? reject([])
          : resolve(isAccountInDB);
      });
    });
  };

  /**
   * Retrive all tables in the database
   * @returns Promise<SwyftDatabaseTables>
   */
  public static tables = (): Promise<SwyftDatabaseTables> => {
    const [tables]: Array<SwyftDatabaseTables> = Repository.DATASTORE;
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
