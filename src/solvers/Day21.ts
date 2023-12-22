import readline from "readline/promises";
import Solver from "./Solver.js";

type Plot = [number, number];
type Column = string[];
type Input = Column[];

export default class Day20 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 16;
  protected PART_2_TEST_OUTPUT = undefined;

  protected async parseInput(lines: readline.Interface): Promise<Input> {
    return this.linesToGrid(lines);
  }

  protected part1(grid: Input, isTest: boolean): number {
    const steps = isTest ? 6 : 64;

    const startCol = grid.findIndex(col => col.includes("S"));
    const start: Plot = [startCol, grid[startCol].indexOf("S")];
    let plots: Plot[] = [start];

    for (let step = 1; step <= steps; step++) {
      const newPlots: Plot[] = [];
      for (const [x, y] of plots) {
        const neighbors: Plot[] = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
        ];
        for (const neighbor of neighbors) {
          if (
            this.isValidPlot(grid, neighbor) &&
            // Would prefer a set to check this, but won't work since these are different references
            !newPlots.some(p => p[0] === neighbor[0] && p[1] === neighbor[1])
          ) {
            newPlots.push(neighbor);
          }
        }
      }
      plots = newPlots;
    }
    return plots.length;
  }

  protected part2(): number {
    return 0;
  }

  private isValidPlot(grid: Column[], plot: Plot): boolean {
    const [x, y] = plot;
    return (
      x >= 0 &&
      x < grid.length &&
      y >= 0 &&
      y < grid[x].length &&
      grid[x][y] !== "#"
    );
  }
}
