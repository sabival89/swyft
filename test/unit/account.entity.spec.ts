import { Account } from '../../src/accounts/entities/account.entity';

describe('Account', () => {
  const account = new Account(
    'db8c6772-6e10-4e89-ae8a-7143788b7284',
    'Test',
    'Last',
    'test@test.com',
    'note',
    {
      amount: 1000,
      currency: 'USD',
    }
  );

  it('should successfully get isAmountPositive', () => {
    const isPositive = account.isAmountPositive();
    expect(isPositive).toBe(true);
  });
});
