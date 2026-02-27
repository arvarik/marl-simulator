import { describe, it, expect } from 'vitest';
import { calculateStats } from '../mathUtils';

describe('calculateStats', () => {
  it('calculates mean, variance, and stdDev correctly for a simple array', () => {
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    const stats = calculateStats(values);

    // Mean = (2+4+4+4+5+5+7+9) / 8 = 40 / 8 = 5
    expect(stats.mean).toBe(5);

    // Variance = ((2-5)^2 + (4-5)^2*3 + (5-5)^2*2 + (7-5)^2 + (9-5)^2) / 8
    //          = (9 + 1*3 + 0*2 + 4 + 16) / 8
    //          = (9 + 3 + 4 + 16) / 8 = 32 / 8 = 4
    expect(stats.variance).toBe(4);

    // StdDev = sqrt(4) = 2
    expect(stats.stdDev).toBe(2);
  });

  it('handles empty arrays gracefully', () => {
    const stats = calculateStats([]);
    expect(stats.mean).toBe(0);
    expect(stats.variance).toBe(0);
    expect(stats.stdDev).toBe(1); // Default fallback
  });

  it('handles arrays with single value', () => {
    const stats = calculateStats([10]);
    expect(stats.mean).toBe(10);
    expect(stats.variance).toBe(0);
    expect(stats.stdDev).toBe(1); // sqrt(0) || 1
  });

  it('handles arrays with identical values', () => {
    const stats = calculateStats([5, 5, 5, 5]);
    expect(stats.mean).toBe(5);
    expect(stats.variance).toBe(0);
    expect(stats.stdDev).toBe(1); // sqrt(0) || 1
  });
});
