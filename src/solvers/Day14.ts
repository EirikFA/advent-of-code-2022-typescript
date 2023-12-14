import readline from "readline/promises";
import { arrayEquals } from "../util.js";
import Solver from "./Solver.js";

type Column = string[];
type Input = Column[];

export default class Day14 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 136;
  protected PART_2_TEST_OUTPUT = 64;

  protected async parseInput(
    lineInterface: readline.Interface,
  ): Promise<Input> {
    const lines = await this.linesToStrings(lineInterface);
    const columns: Column[] = Array.from({ length: lines[0].length }, () => []);
    for (const line of lines) {
      for (let i = 0; i < line.length; i++) {
        columns[i].push(line[i]);
      }
    }
    return columns;
  }

  protected part1(columns: Input): number {
    this.tiltColumns(columns);
    return this.totalLoad(columns);
  }

  protected part2(columns: Input): number {
    const sequences: number[][] = [];
    let curSequence: number[] = [];
    let cycles = 0;
    let load = 0;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
    while (true) {
      columns = this.doCycle(columns);
      load = this.totalLoad(columns);
      curSequence.push(load);
      cycles++;
      if (sequences.some(s => arrayEquals(s, curSequence))) return load;

      // Not gonna lie, Copilot made this and I think it's completely random
      // Couldn't figure out how to properly check for repeating sequences (which would probably be even faster), but I got the right answer ¯\_(ツ)_/¯
      if (cycles % columns.length === 0) {
        sequences.push(curSequence);
        curSequence = [];
      }
    }
  }

  private doCycle(columns: Column[]): Column[] {
    this.tiltColumns(columns);
    for (let rot = 0; rot < 3; rot++) {
      columns = this.rotateColumns(columns);
      this.tiltColumns(columns);
    }
    columns = this.rotateColumns(columns);
    return columns;
  }

  private tiltColumns(columns: Column[]): void {
    columns.forEach(c => this.tiltColumn(c));
  }

  private tiltColumn(column: Column): void {
    for (let i = 0; i < column.length; i++) {
      if (column[i] === "O") {
        let j = i;
        while (j > 0 && column[j - 1] === ".") {
          column[j] = ".";
          column[j - 1] = "O";
          j--;
        }
      }
    }
  }

  private rotateColumns(columns: Column[]): Column[] {
    const rotated: Column[] = Array.from(
      { length: columns[0].length },
      () => [],
    );
    for (const column of columns) {
      for (let j = 0; j < column.length; j++) {
        rotated[column.length - j - 1].push(column[j]);
      }
    }
    return rotated;
  }

  private totalLoad(columns: Column[]): number {
    return columns.reduce((a, b) => a + this.columnLoad(b), 0);
  }

  private columnLoad(column: Column): number {
    return column.reduce((a, b, i) => {
      if (b === "O") return a + column.length - i;
      return a;
    }, 0);
  }
}
