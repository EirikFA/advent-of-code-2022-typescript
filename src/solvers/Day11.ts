import readline from "readline/promises";
import Solver from "./Solver.js";

class Galaxy {
  public rowOffset = 0;
  public colOffset = 0;

  constructor(
    public readonly mapRow: number,
    public readonly mapCol: number,
  ) {}

  public get row(): number {
    return this.mapRow + this.rowOffset;
  }

  public get col(): number {
    return this.mapCol + this.colOffset;
  }
}

type Input = Galaxy[];

export default class Day11 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 374;
  // No test case for expansion factor of one million
  protected PART_2_TEST_OUTPUT = undefined;

  protected async parseInput(
    lineInterface: readline.Interface,
  ): Promise<Input> {
    const galaxies: Galaxy[] = [];
    let rowOffset = 0;
    const lines = await this.linesToStrings(lineInterface);
    for (const [row, line] of lines.entries()) {
      let col = 0;
      let hasGalaxy = false;
      for (const char of line) {
        if (char === "#") {
          const g = new Galaxy(row, col);
          g.rowOffset = rowOffset;
          galaxies.push(g);
          hasGalaxy = true;
        }
        col++;
      }
      if (!hasGalaxy) {
        rowOffset++;
      }
    }

    let colOffset = 0;
    for (let col = 0; col < lines[0].length; col++) {
      const colGalaxies = galaxies.filter(g => g.mapCol === col);
      if (colGalaxies.length === 0) {
        colOffset++;
      } else {
        colGalaxies.forEach(g => (g.colOffset = colOffset));
      }
    }

    return galaxies;
  }

  protected part1(galaxies: Input): number {
    return this.shortestPathsSum(galaxies);
  }

  protected part2(galaxies: Input): number {
    galaxies.forEach(g => {
      g.colOffset = g.colOffset * 999_999;
      g.rowOffset = g.rowOffset * 999_999;
    });

    return this.shortestPathsSum(galaxies);
  }

  private shortestPathsSum(galaxies: Galaxy[]): number {
    let sum = 0;
    for (let i = 0; i < galaxies.length; i++) {
      for (let j = i + 1; j < galaxies.length; j++) {
        sum += this.shortestPath(galaxies[i], galaxies[j]);
      }
    }
    return sum;
  }

  private shortestPath(galaxy1: Galaxy, galaxy2: Galaxy): number {
    const rowDiff = galaxy1.row - galaxy2.row;
    const colDiff = galaxy1.col - galaxy2.col;
    return Math.abs(rowDiff) + Math.abs(colDiff);
  }
}
