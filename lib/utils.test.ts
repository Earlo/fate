import { describe, expect, it } from 'vitest';

import { removeKey, upsertById } from './utils';

describe('removeKey', () => {
  it('removes matching keys without mutating the original', () => {
    const input = { a: 1, b: 2, c: 3 };

    const output = removeKey(input, ['b']);

    expect(output).toEqual({ a: 1, c: 3 });
    expect(input).toEqual({ a: 1, b: 2, c: 3 });
  });
});

describe('upsertById', () => {
  it('adds a new item when the id is missing', () => {
    const output = upsertById([{ id: '1', value: 'a' }], {
      id: '2',
      value: 'b',
    });

    expect(output).toEqual([
      { id: '1', value: 'a' },
      { id: '2', value: 'b' },
    ]);
  });

  it('updates an existing item when the id matches', () => {
    const output = upsertById(
      [
        { id: '1', value: 'a' },
        { id: '2', value: 'b' },
      ],
      { id: '2', value: 'updated' },
    );

    expect(output).toEqual([
      { id: '1', value: 'a' },
      { id: '2', value: 'updated' },
    ]);
  });
});
