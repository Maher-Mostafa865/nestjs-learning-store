import { Test, TestingModule } from '@nestjs/testing';
import { TestsResolver } from './tests.resolver.js';
import { TestsService } from './tests.service.js';

describe('TestsResolver', () => {
  let resolver: TestsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestsResolver, TestsService],
    }).compile();

    resolver = module.get<TestsResolver>(TestsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
