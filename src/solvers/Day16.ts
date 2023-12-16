import readline from "readline/promises";
import Solver from "./Solver.js";

enum Direction {
  Up,
  Down,
  Left,
  Right,
}

class Beam {
  constructor(
    public x: number,
    public y: number,
    public direction: Direction,
  ) {}

  move(): void {
    switch (this.direction) {
      case Direction.Up:
        this.y--;
        break;
      case Direction.Down:
        this.y++;
        break;
      case Direction.Left:
        this.x--;
        break;
      case Direction.Right:
        this.x++;
        break;
    }
  }

  hash(): string {
    return `${this.x},${this.y},${this.direction}`;
  }
}

class Tile {
  constructor(
    public char: string,
    public x: number,
    public y: number,
    public energized = false,
  ) {}
}

class Grid {
  constructor(private grid: Tile[][]) {}

  get width(): number {
    return this.grid[0].length;
  }

  get height(): number {
    return this.grid.length;
  }

  getTile(x: number, y: number): Tile | undefined {
    return this.grid[y]?.[x];
  }

  inGrid(beam: Beam): boolean {
    return (
      beam.x >= 0 && beam.x < this.width && beam.y >= 0 && beam.y < this.height
    );
  }

  energized(): number {
    return this.grid.flat().filter(tile => tile.energized).length;
  }

  reset(): void {
    this.grid.flat().forEach(tile => (tile.energized = false));
  }
}

type Input = Grid;

export default class Day16 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 46;
  protected PART_2_TEST_OUTPUT = 51;

  protected async parseInput(lines: readline.Interface): Promise<Input> {
    const tiles: Tile[][] = [];
    let y = 0;
    for await (const line of lines) {
      const rowTiles = line.split("").map((char, x) => new Tile(char, x, y));
      tiles.push(rowTiles);
      y++;
    }
    return new Grid(tiles);
  }

  protected part1(grid: Input): number {
    return this.runBeam(grid, new Beam(0, 0, Direction.Right));
  }

  protected part2(grid: Input): number {
    const beams: Beam[] = [];
    for (let x = 0; x < grid.width * 2; x++) {
      const direction = x < grid.width ? Direction.Down : Direction.Up;
      const y = x < grid.width ? 0 : grid.height - 1;
      beams.push(new Beam(x % grid.width, y, direction));
    }
    for (let y = 0; y < grid.height * 2; y++) {
      const direction = y < grid.height ? Direction.Right : Direction.Left;
      const x = y < grid.height ? 0 : grid.width - 1;
      beams.push(new Beam(x, y % grid.height, direction));
    }

    let highest = 0;
    for (const beam of beams) {
      const result = this.runBeam(grid, beam);
      if (result > highest) highest = result;
      grid.reset();
    }
    return highest;
  }

  private runBeam(grid: Grid, beam: Beam): number {
    const previous = new Set<string>();
    const beams: Beam[] = [beam];
    while (beams.length > 0) {
      this.moveBeams(grid, beams, previous);
    }
    return grid.energized();
  }

  private moveBeams(grid: Grid, beams: Beam[], previous: Set<string>): void {
    const newBeams: Beam[] = [];
    for (let i = 0; i < beams.length; i++) {
      const [beam1, beam2] = this.moveBeam(grid, beams[i]);
      const hasBeam1 = beam1 && previous.has(beam1.hash());
      if (!beam1 || hasBeam1) {
        beams.splice(i, 1);
        i--;
      } else {
        beams[i] = beam1;
        previous.add(beam1.hash());
      }

      // Pushing to beams would cause the loop to continue longer than intended
      // We would get the same result, strictly speaking, but this is (probably) easier to debug
      if (beam2 && !previous.has(beam2.hash())) newBeams.push(beam2);
    }
    beams.push(...newBeams);
  }

  private moveBeam(
    grid: Grid,
    beam: Beam,
  ): [Beam | undefined, Beam | undefined] {
    const tile = grid.getTile(beam.x, beam.y);
    if (!tile) return [undefined, undefined];

    tile.energized = true;
    const { char } = tile;

    if (beam.direction === Direction.Up) {
      if (char === "/") beam.direction = Direction.Right;
      else if (char === "\\") beam.direction = Direction.Left;
    } else if (beam.direction === Direction.Right) {
      if (char === "/") beam.direction = Direction.Up;
      else if (char === "\\") beam.direction = Direction.Down;
    } else if (beam.direction === Direction.Down) {
      if (char === "/") beam.direction = Direction.Left;
      else if (char === "\\") beam.direction = Direction.Right;
    } else {
      if (char === "/") beam.direction = Direction.Down;
      else if (char === "\\") beam.direction = Direction.Up;
    }

    if (char !== ".") {
      const [split1, split2] = this.splitBeam(beam, char);
      if (split2) return [split1, split2];
      // Othwerwise, passing through so just continue
    }

    beam.move();
    return [beam, undefined];
  }

  private splitBeam(beam: Beam, split: string): [Beam, Beam | undefined] {
    if (
      split === "|" &&
      (beam.direction === Direction.Left || beam.direction === Direction.Right)
    ) {
      const up = new Beam(beam.x, beam.y, Direction.Up);
      const down = new Beam(beam.x, beam.y, Direction.Down);
      return [up, down];
    }

    if (
      split === "-" &&
      (beam.direction === Direction.Up || beam.direction === Direction.Down)
    ) {
      const left = new Beam(beam.x, beam.y, Direction.Left);
      const right = new Beam(beam.x, beam.y, Direction.Right);
      return [left, right];
    }

    return [beam, undefined];
  }
}
