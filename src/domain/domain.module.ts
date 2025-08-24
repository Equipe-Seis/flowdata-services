import { Module } from '@nestjs/common';
import { JwtStrategy } from './shared/strategy';

@Module({
  providers: [JwtStrategy],
  exports: [JwtStrategy],
})
export class DomainModule {}
