import readline from "readline/promises";
import Solver from "./Solver.js";

class CategoryMapRange {
  constructor(
    private readonly destinationStart: number,
    private readonly sourceStart: number,
    private readonly length: number,
  ) {}

  get sourceEnd(): number {
    return this.sourceStart + this.length - 1;
  }

  getDestination(source: number): number {
    if (!this.inRange(source)) return -1;
    return this.destinationStart + (source - this.sourceStart);
  }

  private inRange(source: number): boolean {
    return source >= this.sourceStart && source <= this.sourceEnd;
  }
}

interface Input {
  seeds: number[];
  categoryMapRanges: CategoryMapRange[][];
}

const SEEDS_REGEX = /seeds: ((?:\d+ ?)*)/;
const CATEGORY_MAP_REGEX = /map:\n((?:\d+\s)*)/g;

export default class Day5 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 35;
  protected PART_2_TEST_OUTPUT = 46;

  protected async parseInput(lines: readline.Interface): Promise<Input> {
    const data = await this.linesToString(lines);
    const [, seedsString] = data.match(SEEDS_REGEX)!;
    const seeds = seedsString.split(" ").map(Number);

    const categoryMaps = Array.from(data.matchAll(CATEGORY_MAP_REGEX));
    const categoryMapRanges = categoryMaps.map(category =>
      // Remove last element because it's an empty string from trailing \n
      this.parseMapRanges(category[1].split("\n").slice(0, -1)),
    );

    return {
      seeds,
      categoryMapRanges,
    };
  }

  protected part1({ seeds, categoryMapRanges }: Input): number {
    // Every seed number is its own seed
    const locations = seeds.map(s =>
      this.getSeedLocation(s, categoryMapRanges),
    );
    return Math.min(...locations);
  }

  protected async part2({ seeds, categoryMapRanges }: Input): Promise<number> {
    const locationPromises = [];
    // Every two seed numbers is a range of seeds
    for (let i = 0; i < seeds.length; i += 2) {
      const start = seeds[i];
      const length = seeds[i + 1];
      locationPromises.push(
        this.lowestLocInRange(start, length, categoryMapRanges),
      );
    }

    const locations = await Promise.all(locationPromises);
    return Math.min(...locations);
  }

  private lowestLocInRange(
    start: number,
    length: number,
    categoryMapRanges: CategoryMapRange[][],
  ): Promise<number> {
    return new Promise(resolve => {
      let lowest = Infinity;
      for (let seed = start; seed < start + length; seed++) {
        const loc = this.getSeedLocation(seed, categoryMapRanges);
        if (loc < lowest) {
          lowest = loc;
        }
      }

      resolve(lowest);
    });
  }

  private getSeedLocation(
    seed: number,
    categoryMapRanges: CategoryMapRange[][],
  ): number {
    let lastVal = seed;
    for (const categoryMap of categoryMapRanges) {
      for (const range of categoryMap) {
        const val = range.getDestination(lastVal);
        if (val === -1) continue;
        lastVal = val;
        break;
      }
    }
    return lastVal;
  }

  private parseMapRanges(rangeLines: string[]): CategoryMapRange[] {
    return rangeLines.map(l => this.parseMapRange(l));
  }

  private parseMapRange(str: string): CategoryMapRange {
    const [destinationStart, sourceStart, length] = str
      .match(/\d+/g)!
      .map(Number);
    return new CategoryMapRange(destinationStart, sourceStart, length);
  }
}
