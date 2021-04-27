export class Transaction {
  readonly id: string;
  readonly target_account_id: string;
  readonly note: string;
  readonly amount_money: { amount: number; currency: string };
  readonly account_id: string;

  constructor(
    id: string,
    target_account_id: string,
    note: string,
    amount_money: { amount: number; currency: string },
    account_id: string
  ) {
    this.id = id;
    this.target_account_id = target_account_id;
    this.note = note;
    this.amount_money = amount_money;
    this.account_id = account_id;
  }
}
