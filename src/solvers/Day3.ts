import readline from "readline/promises";
import Solver from "./Solver.js";

class Part {
  constructor(
    readonly text: string,
    readonly row: number,
    readonly col: number,
  ) {}

  get num(): number {
    return Number(this.text);
  }
}

type Input = string[];

const NUM_REGEX = /\d+/g;
const SYMBOL_REGEX = /[^.0-9]/g;
const GEAR_REGEX = /\*/g;

export default class Day3 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 4361;
  protected PART_2_TEST_OUTPUT = 467835;

  protected async parseInput(rl: readline.Interface): Promise<Input> {
    return new Promise(resolve => {
      const lines: string[] = [];
      rl.on("line", line => lines.push(line));
      rl.on("close", () => {
        resolve(lines);
      });
    });
  }

  protected part1(lines: Input): number {
    const numbers = this.parseLines(lines, NUM_REGEX);
    const symbols = this.parseLines(lines, SYMBOL_REGEX);
    return numbers
      .filter(num => symbols.some(sym => this.adjacent(num, sym)))
      .map(num => num.num)
      .reduce((a, b) => a + b, 0);
  }

  protected part2(lines: Input): number {
    const numbers = this.parseLines(lines, NUM_REGEX);
    const gears = this.parseLines(lines, GEAR_REGEX);
    return gears
      .map(gear => this.gearRatio(gear, numbers))
      .reduce((a, b) => a + b, 0);
  }

  private parseLines(lines: string[], regex: RegExp): Part[] {
    return lines.flatMap((line, row) => {
      return Array.from(line.matchAll(regex)).map(match => {
        return new Part(match[0], row, match.index!);
      });
    });
  }

  private adjacent(p1: Part, p2: Part): boolean {
    return (
      Math.abs(p1.row - p2.row) <= 1 &&
      p1.col <= p2.col + p2.text.length &&
      p2.col <= p1.col + p1.text.length
    );
  }

  private gearRatio(gear: Part, numbers: Part[]): number {
    const neighbours = numbers.filter(num => this.adjacent(num, gear));
    if (neighbours.length !== 2) {
      return 0;
    }
    return neighbours[0].num * neighbours[1].num;
  }
}
