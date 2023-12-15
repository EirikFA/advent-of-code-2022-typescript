import readline from "readline/promises";
import Solver from "./Solver.js";

class Lens {
  constructor(
    readonly label: string,
    readonly focalLength: number,
  ) {}
}

class Box {
  private readonly lenses: Lens[] = [];

  removeLens(label: string): void {
    const index = this.lensIndexByLabel(label);
    if (index !== -1) {
      this.lenses.splice(index, 1);
    }
  }

  addLens(label: string, focalLength: number): void {
    const index = this.lensIndexByLabel(label);
    const lens = new Lens(label, focalLength);
    if (index === -1) {
      this.lenses.push(lens);
    } else {
      this.lenses[index] = lens;
    }
  }

  focusingPower(): number {
    return this.lenses.reduce((a, b, i) => a + (i + 1) * b.focalLength, 0);
  }

  private lensIndexByLabel(label: string): number {
    return this.lenses.findIndex(l => l.label === label);
  }
}

type Input = string[];

const STEP_REGEX = /([a-z]+)(?:-|=(\d+))/;

export default class Day15 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 1320;
  protected PART_2_TEST_OUTPUT = 145;

  protected async parseInput(lines: readline.Interface): Promise<Input> {
    const line = (await lines[Symbol.asyncIterator]().next()).value as string;
    return line.split(",");
  }

  protected part1(steps: Input): number {
    return steps.reduce((a, b) => a + this.hash(b), 0);
  }

  protected part2(steps: Input): number {
    const boxes = Array.from({ length: 256 }, () => new Box());

    for (const step of steps) {
      const [, label, focalLength] = step.match(STEP_REGEX)!;
      const boxNum = this.hash(label);
      if (!focalLength) {
        boxes[boxNum].removeLens(label);
      } else {
        boxes[boxNum].addLens(label, Number(focalLength));
      }
    }

    const focusingPowerSums = boxes.map((b, i) => (i + 1) * b.focusingPower());
    return focusingPowerSums.reduce((a, b) => a + b, 0);
  }

  private hash(str: string): number {
    let currentVal = 0;
    for (let i = 0; i < str.length; i++) {
      // All characters are ASCII (= first 128 of UTF-16)
      const ascii = str.charCodeAt(i);
      currentVal += ascii;
      currentVal *= 17;
      currentVal %= 256;
    }
    return currentVal;
  }
}
