import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { PaginationQueryDto } from './pagination-query.dto.js';

describe('PaginationQueryDto', () => {
  async function validateQuery(input: Record<string, unknown>) {
    const dto = plainToInstance(PaginationQueryDto, input);
    return { dto, errors: await validate(dto) };
  }

  it('accepts defaults when query params are omitted', async () => {
    const { dto, errors } = await validateQuery({});

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });

  it('accepts custom page and limit', async () => {
    const { dto, errors } = await validateQuery({ page: '2', limit: '5' });

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(5);
  });

  it('rejects page below 1', async () => {
    const { errors } = await validateQuery({ page: '0', limit: '10' });

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'page')).toBe(true);
  });

  it('rejects limit above 100', async () => {
    const { errors } = await validateQuery({ page: '1', limit: '101' });

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'limit')).toBe(true);
  });

  it('rejects non-integer values', async () => {
    const { errors } = await validateQuery({ page: '1.5', limit: 'abc' });

    expect(errors.length).toBeGreaterThan(0);
  });
});
