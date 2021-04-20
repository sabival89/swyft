export class CreateAccountDto {
  readonly given_name: string;
  readonly family_name: string;
  readonly email_address: string;
  readonly note: string;
  readonly balance: { amount: number; currency: string };
}
