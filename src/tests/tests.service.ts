import { Injectable } from '@nestjs/common';
import { CreateTestInput } from './dto/create-test.input.js';
import { UpdateTestInput } from './dto/update-test.input.js';

@Injectable()
export class TestsService {
  create(createTestInput: CreateTestInput) {
    return 'This action adds a new test';
  }

  findAll() {
    return `This action returns all tests`;
  }

  findOne(id: number) {
    return `This action returns a #${id} test`;
  }

  update(id: number, updateTestInput: UpdateTestInput) {
    return `This action updates a #${id} test`;
  }

  remove(id: number) {
    return `This action removes a #${id} test`;
  }
}
