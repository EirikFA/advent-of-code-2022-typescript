import readline from "readline/promises";
import { NumberTuple, Tuple } from "../types.js";
import { solveTwoLinearEqs } from "../util.js";
import Solver from "./Solver.js";

class Hailstone {
  constructor(
    readonly x_0: number,
    readonly y_0: number,
    readonly z_0: number,
    readonly v_x: number,
    readonly v_y: number,
    readonly v_z: number,
  ) {}

  yCoeffs(): [number, number] {
    // x(t) = v_x * t + x_0, y(t) = v_y * t + y_0
    // Thus t = (x - x_0) / v_x and
    // y = (v_y / v_x) * x + y_0 - (v_y / v_x) * x_0
    return [this.v_y / this.v_x, this.y_0 - (this.v_y / this.v_x) * this.x_0];
  }

  inFuture(x: number, y: number): boolean {
    if (x > this.x_0 && this.v_x < 0) return false;
    if (x < this.x_0 && this.v_x > 0) return false;
    if (y > this.y_0 && this.v_y < 0) return false;
    if (y < this.y_0 && this.v_y > 0) return false;
    return true;
  }
}

type Input = Hailstone[];

export default class Day24 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 2;
  protected PART_2_TEST_OUTPUT = undefined;

  protected async parseInput(lines: readline.Interface): Promise<Input> {
    const hailstones: Hailstone[] = [];
    for await (const line of lines) {
      const [pos, vel] = line.split(" @ ");
      const [x, y, z] = this.parseValues(pos);
      const [v_x, v_y, v_z] = this.parseValues(vel);
      hailstones.push(new Hailstone(x, y, z, v_x, v_y, v_z));
    }
    return hailstones;
  }

  protected part1(stones: Input, isTest: boolean): number {
    const [min, max] = isTest ? [7, 27] : [200000000000000, 400000000000000];
    let count = 0;

    for (let i = 0; i < stones.length; i++) {
      const stoneA = stones[i];
      for (let j = i + 1; j < stones.length; j++) {
        const stoneB = stones[j];
        const [slopeA, cA] = stoneA.yCoeffs();
        const [slopeB, cB] = stoneB.yCoeffs();
        const eqs: Tuple<NumberTuple<3>, 2> = [
          [-slopeA, 1, cA],
          [-slopeB, 1, cB],
        ];
        const solution = solveTwoLinearEqs(eqs);
        if (!solution) continue;

        const [x, y] = solution;
        if (!stoneA.inFuture(x, y) || !stoneB.inFuture(x, y)) continue;
        if (x >= min && x <= max && y >= min && y <= max) count++;
      }
    }

    return count;
  }

  protected part2(): number {
    return 0;
  }

  private parseValues(values: string): number[] {
    return values.split(", ").map(value => Number(value.trim()));
  }
}
