import { Module } from '@nestjs/common';
import { Table } from './tables.database';

@Module({
  providers: [Table],
  exports: [Table],
})
export class DatabaseModule {}
