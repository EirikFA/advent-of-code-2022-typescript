import readline from "readline/promises";
import { transpose } from "../util.js";
import Solver from "./Solver.js";

type Pattern = string[][];
type Input = Pattern[];

export default class Day13 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 405;
  protected PART_2_TEST_OUTPUT = 400;

  protected async parseInput(lines: readline.Interface): Promise<Input> {
    const data = await this.linesToString(lines);
    const patterns = data.split("\n\n");
    return patterns.map(pattern =>
      pattern.split("\n").map(row => row.split("")),
    );
  }

  protected part1(patterns: Input): number {
    return this.computeSum(patterns);
  }

  protected part2(patterns: Input): number {
    return this.computeSum(patterns, 1);
  }

  private computeSum(patterns: Pattern[], smudges = 0): number {
    const cols = this.countMirrors(patterns, smudges);
    const transposed = patterns.map(transpose);
    const rows = 100 * this.countMirrors(transposed, smudges);
    return cols + rows;
  }

  private countMirrors(patterns: Pattern[], smudges = 0): number {
    return patterns
      .map(p => this.findMirror(p, smudges))
      .reduce((a, b) => a + b, 0);
  }

  private findMirror(pattern: Pattern, smudges = 0): number {
    for (let mirrorPos = 1; mirrorPos < pattern[0].length; mirrorPos++) {
      let mismatchCount = 0;
      for (let i = 0; i < this.minEdgeDist(pattern, mirrorPos); i++) {
        const left = mirrorPos - i - 1;
        const right = mirrorPos + i;
        mismatchCount += this.countMismatches(left, right, pattern);
        if (mismatchCount > smudges) break;
      }

      if (mismatchCount === smudges) return mirrorPos;
    }

    return 0;
  }

  private minEdgeDist(pattern: Pattern, column: number): number {
    const rightEdgeDist = pattern[0].length - column;
    // column index = left edge distance
    return Math.min(column, rightEdgeDist);
  }

  private countMismatches(
    column1: number,
    column2: number,
    pattern: Pattern,
  ): number {
    let mismatches = 0;
    for (const row of pattern) {
      if (row[column1] !== row[column2]) {
        mismatches++;
      }
    }
    return mismatches;
  }
}
