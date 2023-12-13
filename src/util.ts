export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function lcm(...numbers: number[]): number {
  return numbers.reduce((a, b) => (a * b) / gcd(a, b));
}

export function transpose(matrix: string[][]): string[][] {
  return matrix[0].map((_, col) => matrix.map(row => row[col]));
}
