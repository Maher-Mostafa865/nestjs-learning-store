import { Module } from '@nestjs/common';
import { TestsService } from './tests.service.js';
import { TestsResolver } from './tests.resolver.js';

@Module({
  providers: [TestsResolver, TestsService],
})
export class TestsModule {}
