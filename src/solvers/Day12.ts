import readline from "readline/promises";
import Solver from "./Solver.js";

interface Row {
  pattern: string;
  groups: number[];
}

type Input = Row[];

export default class Day12 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 21;
  protected PART_2_TEST_OUTPUT = undefined;

  protected async parseInput(lines: readline.Interface): Promise<Input> {
    const rows: Row[] = [];
    for await (const line of lines) {
      const [pattern, groups] = line.split(" ");
      rows.push({
        pattern,
        groups: groups.split(",").map(Number),
      });
    }
    return rows;
  }

  protected part1(rows: Input): number {
    return rows.reduce((sum, row) => sum + this.countValidCombinations(row), 0);
  }

  protected part2(rows: Input): number {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const pattern = (row.pattern + "?").repeat(5).slice(0, -1);
      rows[i] = {
        pattern,
        groups: Array<number[]>(5).fill(row.groups).flat(),
      };
    }

    // Yeah this will never finish
    // return rows.reduce((sum, row) => sum + this.countValidCombinations(row), 0);

    return 0;
  }

  private countValidCombinations({ pattern, groups }: Row): number {
    const combinations = this.generateCombinations(pattern);
    const validCombinations = combinations.filter(comb =>
      this.isValidCombination(comb, groups),
    );
    return validCombinations.length;
  }

  private generateCombinations(pattern: string) {
    const combinations: string[] = [];
    const patternChars = pattern.split("");
    const unknowns = patternChars.filter(c => c === "?").length;

    for (let i = 0; i < 2 ** unknowns; i++) {
      const binary = i.toString(2).padStart(unknowns, "0");
      const combination = [...patternChars];
      let binaryIndex = 0;
      for (let j = 0; j < pattern.length; j++) {
        if (pattern[j] === "?") {
          combination[j] = binary[binaryIndex] === "0" ? "." : "#";
          binaryIndex++;
        }
      }

      combinations.push(combination.join(""));
    }

    return combinations;
  }

  private isValidCombination(combination: string, groups: number[]): boolean {
    const combGroups = combination.split(".").filter(g => g.length > 0);
    if (combGroups.length !== groups.length) {
      return false;
    }

    for (let i = 0; i < groups.length; i++) {
      if (combGroups[i].length !== groups[i]) {
        return false;
      }
    }
    return true;
  }
}
