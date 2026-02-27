/**
 * Calculates basic statistical metrics for a numeric dataset.
 * @param values Array of numbers to analyze.
 * @returns An object containing the mean, variance, and standard deviation.
 */
export function calculateStats(values: number[]) {
  const n = values.length;
  if (n === 0) {
    return { mean: 0, variance: 0, stdDev: 1 };
  }

  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance) || 1; // avoid div by 0

  return { mean, variance, stdDev };
}
