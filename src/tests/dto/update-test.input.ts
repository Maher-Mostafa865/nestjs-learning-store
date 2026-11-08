import { CreateTestInput } from './create-test.input.js';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateTestInput extends PartialType(CreateTestInput) {
  id: number;
}
