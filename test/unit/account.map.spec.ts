import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { AccountMapper } from '../../src/accounts/mappers/account.map';

describe('Account Mapper', () => {
  it('should map toDomain', () => {
    const balance = {
      amount: 1000,
      currency: 'USD',
    };
    const raw = new CreateAccountDto();
    raw.given_name = 'test';
    raw.family_name = 'Tester';
    raw.email_address = 'test@test.com';
    raw.balance = balance;
    raw.note = 'This is a note';

    const map = AccountMapper.toDomain(raw);
    expect(map).toEqual({
      id: map.getId,
      given_name: 'Test',
      family_name: 'Tester',
      email_address: 'test@test.com',
      note: 'This is a note',
      balance: {
        amount: 1000,
        currency: 'USD',
      },
    });
  });
});
