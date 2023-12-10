import readline from "readline/promises";
import Solver from "./Solver.js";

type Position = [number, number];
type Direction = "N" | "E" | "S" | "W";
type Step = [Position, Direction];

interface Neighbours {
  above: Position;
  below: Position;
  left: Position;
  right: Position;
}

class Grid {
  constructor(private readonly tiles: string[][]) {}

  static getNeighbours(pos: Position): Neighbours {
    return {
      above: [pos[0] - 1, pos[1]],
      below: [pos[0] + 1, pos[1]],
      left: [pos[0], pos[1] - 1],
      right: [pos[0], pos[1] + 1],
    };
  }

  static isSame(pos1: Position, pos2: Position): boolean {
    return pos1[0] === pos2[0] && pos1[1] === pos2[1];
  }

  getTile(pos: Position): string {
    const row = this.tiles[pos[0]];
    // No it isn't unnecessary, ever heard of index out of bounds?
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!row) return ".";
    return row[pos[1]];
  }

  getTiles(...positions: Position[]): string[] {
    return positions.map(pos => this.getTile(pos));
  }
}

interface Input {
  grid: Grid;
  start: Position;
}

export default class Day10 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 8;
  protected PART_2_TEST_OUTPUT = 10;

  protected async parseInput(lines: readline.Interface): Promise<Input> {
    const tiles: string[][] = [];
    let start: [number, number];
    for await (const line of lines) {
      const startIndex = line.indexOf("S");
      if (startIndex !== -1) start = [tiles.length, startIndex];
      tiles.push([...line]);
    }
    return { grid: new Grid(tiles), start: start! };
  }

  protected part1({ grid, start }: Input): number {
    let [step1, step2] = this.findBeginnings(grid, start);
    let steps = 1;
    while (!Grid.isSame(step1[0], step2[0])) {
      step1 = this.nextPosition(grid, step1);
      step2 = this.nextPosition(grid, step2);
      steps++;
    }

    return steps;
  }

  protected part2({ grid, start }: Input): number {
    let [step1] = this.findBeginnings(grid, start);
    const path = [start, step1[0]];
    while (!Grid.isSame(step1[0], start)) {
      step1 = this.nextPosition(grid, step1);
      path.push(step1[0]);
    }

    return this.interiorPoints(path);
  }

  private findBeginnings(grid: Grid, start: Position): [Step, Step] {
    const { above, below, left, right } = Grid.getNeighbours(start);
    const [aboveT, belowT, leftT, rightT] = grid.getTiles(
      above,
      below,
      left,
      right,
    );
    const beginnings: Step[] = [];

    if (belowT === "|" || belowT === "L" || belowT === "J")
      beginnings.push([below, "N"]);

    if (aboveT === "|" || aboveT === "7" || aboveT === "F")
      beginnings.push([above, "S"]);

    if (rightT === "-" || rightT === "J" || rightT === "7")
      beginnings.push([right, "W"]);

    if (leftT === "-" || leftT === "L" || leftT === "F")
      beginnings.push([left, "E"]);

    if (beginnings.length !== 2) {
      throw new Error(
        `Expected 2 beginnings, got ${beginnings.length} from (${start[0]}, ${start[1]})`,
      );
    }

    return beginnings as [Step, Step];
  }

  private nextPosition(grid: Grid, [pos, from]: Step): Step {
    const { above, below, left, right } = Grid.getNeighbours(pos);
    const char = grid.getTile(pos);

    if (from === "S") {
      if (char === "|") return [above, "S"];
      if (char === "7") return [left, "E"];
      if (char === "F") return [right, "W"];
    }

    if (from === "N") {
      if (char === "|") return [below, "N"];
      if (char === "L") return [right, "W"];
      if (char === "J") return [left, "E"];
    }

    if (from === "W") {
      if (char === "-") return [right, "W"];
      if (char === "J") return [above, "S"];
      if (char === "7") return [below, "N"];
    }

    if (from === "E") {
      if (char === "-") return [left, "E"];
      if (char === "L") return [above, "S"];
      if (char === "F") return [below, "N"];
    }

    throw new Error(
      `Unexpected character ${char} at (${pos[0]}, ${pos[1]}) from ${from}`,
    );
  }

  // Credits to https://www.reddit.com/r/adventofcode/comments/18evyu9/comment/kcqmhwk/?context=3 for putting me on this path (pun not intended) for part 2
  // Pick's theorem (https://en.wikipedia.org/wiki/Pick%27s_theorem)
  private interiorPoints(points: Position[]): number {
    const area = this.shoelaceArea(points);
    // Assume points is a "loop" (start = end), required for correct shoelace area
    const boundary = points.length - 1;
    return area - boundary / 2 + 1;
  }

  // Shoelace formula (https://en.wikipedia.org/wiki/Shoelace_formula)
  private shoelaceArea(points: Position[]): number {
    let area = 0;
    for (let i = 0; i < points.length - 1; i++) {
      area += points[i][0] * points[i + 1][1] - points[i + 1][0] * points[i][1];
    }
    return Math.abs(area / 2);
  }
}
