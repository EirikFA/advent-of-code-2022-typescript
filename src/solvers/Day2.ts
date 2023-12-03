import readline from "readline/promises";
import Solver from "./Solver.js";

interface CubeSet {
  red: number;
  green: number;
  blue: number;
}

interface CubeGame {
  id: number;
  sets: CubeSet[];
}

type CubeSetEntries = [keyof CubeSet, number][];
type Input = CubeGame[];

const GAME_ID_REGEX = /Game (\d+)/;
const CUBE_REGEX = /(\d+) (red|green|blue)/g;

export default class Day2 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 8;
  protected PART_2_TEST_OUTPUT = 2286;

  protected async parseInput(lines: readline.Interface): Promise<Input> {
    const games: Input = [];

    for await (const line of lines) {
      // Sample line: "Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green"
      const gameParts = line.split(":");
      const id = this.parseGameId(gameParts[0]);
      if (!id) continue;

      const game: CubeGame = { id, sets: [] };
      const cubeSets = gameParts[1].split(";").map(s => s.trim());
      game.sets = cubeSets.map(set => this.parseCubeSet(set));
      games.push(game);
    }

    return games;
  }

  protected part1(games: Input): number {
    const BAG: CubeSet = { red: 12, green: 13, blue: 14 };
    const sumValidIds = games.reduce((sum, game) => {
      const validSets = game.sets.filter(set => this.isValidSet(set, BAG));
      if (validSets.length !== game.sets.length) return sum;
      return sum + game.id;
    }, 0);
    return sumValidIds;
  }

  protected part2(games: Input): number {
    const minSets = games.map(game => this.minimumSet(game));
    return minSets.reduce((sum, set) => {
      return sum + set.red * set.green * set.blue;
    }, 0);
  }

  private parseGameId(gameStr: string): number | undefined {
    const match = gameStr.match(GAME_ID_REGEX);
    if (!match) return undefined;
    return Number(match[1]);
  }

  private parseCubeSet(setStr: string): CubeSet {
    const cubeCounts = Array.from(setStr.matchAll(CUBE_REGEX));
    const set: CubeSet = { red: 0, green: 0, blue: 0 };
    for (const cubeCount of cubeCounts) {
      const [, count, color] = cubeCount;
      set[color as keyof CubeSet] = Number(count);
    }
    return set;
  }

  private isValidSet(set: CubeSet, bag: CubeSet): boolean {
    for (const color of Object.keys(set) as (keyof CubeSet)[]) {
      if (set[color] > bag[color]) return false;
    }
    return true;
  }

  // Minimum set required for the game to be possible
  private minimumSet(game: CubeGame): CubeSet {
    const minSet: CubeSet = { red: 0, green: 0, blue: 0 };
    for (const set of game.sets) {
      for (const [color, count] of Object.entries(set) as CubeSetEntries) {
        if (count > minSet[color]) {
          minSet[color] = count;
        }
      }
    }
    return minSet;
  }
}
