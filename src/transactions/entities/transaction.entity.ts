export class Transaction {
  readonly id: string;
  readonly target_account_id: string;
  readonly note: string;
  readonly account_money: { amount: number; currency: string };
  readonly account_id: string;

  constructor(
    id: string,
    target_account_id: string,
    account_money: { amount: number; currency: string },
    note: string,
    account_id: string
  ) {
    this.id = id;
    this.target_account_id = target_account_id;
    this.account_money = account_money;
    this.note = note;
    this.account_id = account_id;
  }
}
