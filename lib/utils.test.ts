import { describe, expect, it } from 'vitest';

import { removeKey, upsertById } from './utils';

describe('removeKey', () => {
  it('removes matching keys without mutating the original', () => {
    const input = { a: 1, b: 2, c: 3 };

    const output = removeKey(input, ['b']);

    expect(output).toEqual({ a: 1, c: 3 });
    expect(input).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('removes matching keys deeply from objects and arrays', () => {
    const input = {
      id: 'root',
      name: 'Campaign',
      groups: [
        {
          id: 'group-1',
          characters: [{ id: 'character-1', name: 'Mara' }],
        },
      ],
    };

    const output = removeKey(input, ['id']);

    expect(output).toEqual({
      name: 'Campaign',
      groups: [
        {
          characters: [{ name: 'Mara' }],
        },
      ],
    });
  });

  it('preserves empty, null, false, and single-key object values', () => {
    const input = {
      emptyString: '',
      nullValue: null,
      falseValue: false,
      nested: { text: ' keep\nall\nlines ' },
      list: [null, false, '', { text: 'value' }],
    };

    const output = removeKey(input, ['missing']);

    expect(output).toEqual(input);
    expect(output).not.toBe(input);
    expect(output.nested).not.toBe(input.nested);
    expect(output.list).not.toBe(input.list);
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
