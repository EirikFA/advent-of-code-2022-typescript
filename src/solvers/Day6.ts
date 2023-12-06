import readline from "readline/promises";
import Solver from "./Solver.js";

interface Input {
  times: number[];
  distances: number[];
}

export default class Day5 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 288;
  protected PART_2_TEST_OUTPUT = 71503;

  protected async parseInput(
    lineInterface: readline.Interface,
  ): Promise<Input> {
    const lines = await this.linesToStrings(lineInterface);
    const times = lines[0].match(/\d+/g)!.map(Number);
    const distances = lines[1].match(/\d+/g)!.map(Number);
    return { times, distances };
  }

  protected part1({ times, distances }: Input): number {
    return times
      .map((time, i) => {
        const [x_0, x_1] = this.solveRaceEquation(time, distances[i]);
        // If limits are integers, then we need to add 1 to lower and subtract 1 from upper (need to beat the record, not get the same time)
        // This makes sure that happens, and that decimals are rounded up/down for lower/upper limit respectively
        const min = Math.floor(x_0 + 1);
        const max = Math.ceil(x_1 - 1);
        return max - min + 1;
      })
      .reduce((a, b) => a * b);
  }

  protected part2({ times, distances }: Input): number {
    const time = Number(times.join(""));
    const distance = Number(distances.join(""));
    const [x_0, x_1] = this.solveRaceEquation(time, distance);
    const min = Math.floor(x_0 + 1);
    const max = Math.ceil(x_1 - 1);
    return max - min + 1;
  }

  // Quadratic equation where a is 1 and b is negative
  // Always two solutions with valid puzzle input
  private solveRaceEquation(b: number, c: number): number[] {
    const sqrt = Math.sqrt(b ** 2 - 4 * c);
    const x_0 = (b - sqrt) / 2;
    const x_1 = (b + sqrt) / 2;
    return [x_0, x_1];
  }
}
