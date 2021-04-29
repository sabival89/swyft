import { Module } from '@nestjs/common';
import { Table } from 'src/core/database/tables.database';
import { Repository } from './repository';

@Module({
  providers: [Repository, Table],
  exports: [Repository],
})
export class RepositoryModule {}
