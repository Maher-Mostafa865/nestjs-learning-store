import { Test, TestingModule } from '@nestjs/testing';
import { TestResolver } from './test.resolver.js';
import { TestService } from './test.service.js';

describe('TestResolver', () => {
  let resolver: TestResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestResolver, TestService],
    }).compile();

    resolver = module.get<TestResolver>(TestResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
