export class Account {
  readonly id: string;
  readonly given_name: string;
  readonly family_name: string;
  readonly email_address: string;
  readonly note: string;
  readonly balance: { amount: number; currency: string };

  constructor(
    id: string,
    given_name: string,
    family_name: string,
    email_address: string,
    note: string,
    balance: { amount: number; currency: string }
  ) {
    this.id = id;
    this.given_name = given_name;
    this.family_name = family_name;
    this.email_address = email_address;
    this.note = note;
    this.balance = balance;
  }

  /**
   * Check if amount is greater than zero
   * @returns
   */
  isAmountPositive?(): boolean {
    return this.balance.amount > 0;
  }

  // private get getId(): string {
  //   return this.id;
  // }
}
