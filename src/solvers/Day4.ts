import readline from "readline/promises";
import Solver from "./Solver.js";

class ScratchCard {
  constructor(
    private readonly numbers: number[],
    private readonly winningNumbers: number[],
  ) {}

  get winningCount(): number {
    return this.numbers.filter(n => this.winningNumbers.includes(n)).length;
  }

  get points(): number {
    // 1 point for first match, doubles afterwards
    if (this.winningCount <= 1) return this.winningCount;
    return 2 ** (this.winningCount - 1);
  }
}

type Input = ScratchCard[];

export default class Day4 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 13;
  protected PART_2_TEST_OUTPUT = 30;

  protected async parseInput(lines: readline.Interface): Promise<Input> {
    const cards: ScratchCard[] = [];
    for await (const line of lines) {
      const [, allNumbers] = line.split(": ");
      const [winningStr, numbersStr] = allNumbers.split(" | ");
      const winningNumbers = winningStr.match(/\d+/g)!.map(Number);
      const numbers = numbersStr.match(/\d+/g)!.map(Number);
      cards.push(new ScratchCard(numbers, winningNumbers));
    }
    return cards;
  }

  protected part1(cards: Input): number {
    return cards.reduce((acc, card) => acc + card.points, 0);
  }

  protected part2(cards: Input): number {
    // Copies won of each card (plus original)
    const copiesWon: number[] = cards.map(() => 1);
    cards.forEach((card, i) => {
      if (card.winningCount >= 1) {
        // For each copy of this card, add a copy of the next {winningCount} cards
        for (let offset = 1; offset <= card.winningCount; offset++) {
          copiesWon[i + offset] += copiesWon[i];
        }
      }
    });

    return copiesWon.reduce((acc, copies) => acc + copies, 0);
  }
}
