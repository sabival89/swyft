import { BadRequestException, Injectable } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { Repository } from '../repository/repository';

@Injectable()
export class TransactionsService extends AccountsService {
  findAll() {
    if (!Repository.isTableEmpty('accounts'))
      return new BadRequestException('Database is empty');
    const [tables] = Repository.DATASTORE;
    return tables.transactions;
  }
}
