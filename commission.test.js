import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSplit } from '../src/commission.js';

test('10% split on GHS 1,000 leaves GHS 900 for organiser', () => {
  assert.deepEqual(calculateSplit(100000, 1000), {
    gross: 100000, platformFee: 10000, organiserNet: 90000,
  });
});

test('zero commission leaves all gross amount to organiser', () => {
  assert.deepEqual(calculateSplit(12345, 0), {
    gross: 12345, platformFee: 0, organiserNet: 12345,
  });
});

test('fractional pesewa commission rounds down and preserves total', () => {
  const split = calculateSplit(101, 333);
  assert.equal(split.platformFee + split.organiserNet, 101);
  assert.equal(split.platformFee, 3);
});

test('rejects invalid amounts and commission rates', () => {
  assert.throws(() => calculateSplit(-1, 1000), TypeError);
  assert.throws(() => calculateSplit(100, 3001), RangeError);
});
