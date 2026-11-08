import { Module } from '@nestjs/common';
import { TestService } from './test.service.js';
import { TestResolver } from './test.resolver.js';

@Module({
  providers: [TestResolver, TestService],
})
export class TestModule {}
