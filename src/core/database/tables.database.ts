export class Table {
  public ACCOUNTS: string;
  public TRANSACTIONS: string;

  /**
   * Swyft Database tables initialization
   */
  constructor() {
    this.ACCOUNTS = 'accounts';
    this.TRANSACTIONS = 'transactions';
  }
}
