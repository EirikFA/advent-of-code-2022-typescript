import readline from "readline/promises";
import Solver from "./Solver.js";

const WORD_NUMBERS: Record<string, string> = {
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
};

// Regex for numbers and their word forms (1-9)
const NUMBER_REGEX = new RegExp(
  `(${Object.keys(WORD_NUMBERS).join("|")}|[1-9])`,
  "g",
);

type Input = string[][];

export default class Day1 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 142;
  protected PART_2_TEST_OUTPUT = 281;

  async parseInput(lines: readline.Interface): Promise<Input> {
    const parsedLines: Input = [];

    for await (const line of lines) {
      const parsed: string[] = [];
      let match: RegExpExecArray | null = null;
      while ((match = NUMBER_REGEX.exec(line))) {
        parsed.push(match[0]);
        // Words may overlap, so we check from the last character of the match
        // Incorrect when using `line.match`: 85ntwonexlm -> 85, two
        // Correct with current implementation: 85ntwonexlm -> 85, two, one
        NUMBER_REGEX.lastIndex = match.index + match.length - 1;
      }
      if (parsed.length === 0) continue;
      parsedLines.push(parsed);
    }

    return parsedLines;
  }

  part1(input: Input): number {
    return this.calibrationSum(input, false);
  }

  part2(input: Input): number {
    return this.calibrationSum(input, true);
  }

  private calibrationSum(input: Input, includeWords: boolean): number {
    let sum = 0;
    for (let digits of input) {
      if (!includeWords) {
        digits = digits.filter(digit => !WORD_NUMBERS[digit]);
      }

      let first = digits[0];
      if (WORD_NUMBERS[first]) first = WORD_NUMBERS[first];

      let last = digits[digits.length - 1];
      if (WORD_NUMBERS[last]) last = WORD_NUMBERS[last];

      sum += Number(`${first}${last}`);
    }

    return sum;
  }
}
