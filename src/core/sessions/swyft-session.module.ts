import { Module } from '@nestjs/common';
import { SwyftSession } from './swyft-session.session';

@Module({
  providers: [SwyftSession],
  exports: [SwyftSession],
})
export class SwyftSesssionModule {}
