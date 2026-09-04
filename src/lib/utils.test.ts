import { shuffle } from './utils';

describe('shuffle', () => {
  it('returns a deterministic permutation when seeded', () => {
    const input = [1, 2, 3, 4, 5];

    expect(shuffle(input, 42)).toEqual(shuffle(input, 42));
    expect(shuffle(input, 42).sort()).toEqual(input);
  });

  it('does not mutate the input', () => {
    const input = [1, 2, 3];

    shuffle(input, 42);

    expect(input).toEqual([1, 2, 3]);
  });

  it('supports an empty list and an automatically generated seed', () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle([1])).toEqual([1]);
  });
});
