import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TestsService } from './tests.service.js';
import { CreateTestInput } from './dto/create-test.input.js';
import { UpdateTestInput } from './dto/update-test.input.js';

@Resolver('Test')
export class TestsResolver {
  constructor(private readonly testsService: TestsService) {}

  @Mutation('createTest')
  create(@Args('createTestInput') createTestInput: CreateTestInput) {
    return this.testsService.create(createTestInput);
  }

  @Query('tests')
  findAll() {
    return this.testsService.findAll();
  }

  @Query('test')
  findOne(@Args('id') id: number) {
    return this.testsService.findOne(id);
  }

  @Mutation('updateTest')
  update(@Args('updateTestInput') updateTestInput: UpdateTestInput) {
    return this.testsService.update(updateTestInput.id, updateTestInput);
  }

  @Mutation('removeTest')
  remove(@Args('id') id: number) {
    return this.testsService.remove(id);
  }
}
