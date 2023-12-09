import readline from "readline/promises";
import Solver from "./Solver.js";

type History = number[];
type Input = History[];

export default class Day9 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 114;
  protected PART_2_TEST_OUTPUT = 2;

  protected async parseInput(lines: readline.Interface): Promise<Input> {
    const histories: number[][] = [];
    for await (const line of lines) {
      const numbers = line.match(/-?\d+/g)!.map(Number);
      histories.push(numbers);
    }
    return histories;
  }

  protected part1(histories: Input): number {
    return histories
      .map(history => this.nextValue(history))
      .reduce((a, b) => a + b);
  }

  protected part2(histories: Input): number {
    return histories
      .map(history => this.previousValue(history))
      .reduce((a, b) => a + b);
  }

  private nextValue(history: History): number {
    const len = history.length;
    if (history.every(n => n === 0)) return history[len - 1];

    const diffs = history.slice(0, len - 1).map((v, i) => history[i + 1] - v);
    return this.nextValue(diffs) + history[len - 1];
  }

  private previousValue(history: History): number {
    if (history.every(n => n === 0)) return history[0];

    const diffs = history
      .slice(0, history.length - 1)
      .map((v, i) => history[i + 1] - v);
    return history[0] - this.previousValue(diffs);
  }
}
