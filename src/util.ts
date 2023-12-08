export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function lcm(...numbers: number[]): number {
  return numbers.reduce((a, b) => (a * b) / gcd(a, b));
}
