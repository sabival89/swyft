import { Module } from '@nestjs/common';
import { Repository } from './repository';

@Module({
  controllers: [],
  providers: [Repository],
  exports: [Repository],
})
export class RepositoryModule {}
