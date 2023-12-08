import readline from "readline/promises";
import Solver from "./Solver.js";

const SORTED_CARDS = "23456789TJQKA";
const SORTED_CARDS_WITH_JOKER = "J23456789TQKA";

enum HandType {
  HighCard,
  OnePair,
  TwoPairs,
  ThreeOfAKind,
  FullHouse,
  FourOfAKind,
  FiveOfAKind,
}

class Hand {
  constructor(
    private readonly cards: string[],
    readonly bid: number,
  ) {}

  compare(other: Hand, jokers = false): number {
    const thisType = this.getType(jokers);
    const otherType = other.getType(jokers);
    if (thisType !== otherType) return otherType - thisType;

    const sortedCards = jokers ? SORTED_CARDS_WITH_JOKER : SORTED_CARDS;
    for (let i = 0; i < this.cards.length; i++) {
      const thisCard = sortedCards.indexOf(this.cards[i]);
      const otherCard = sortedCards.indexOf(other.cards[i]);
      if (thisCard !== otherCard) return otherCard - thisCard;
    }

    return 0;
  }

  private getType(jokers = false): HandType {
    let type = HandType.HighCard;
    for (const card of SORTED_CARDS) {
      if (jokers && card === "J") continue;

      const count = this.cards.filter(c => c === card).length;
      if (count === 5) return HandType.FiveOfAKind;
      if (count === 4) type = HandType.FourOfAKind;
      if (count === 3) {
        if (type === HandType.OnePair) type = HandType.FullHouse;
        else type = HandType.ThreeOfAKind;
      }
      if (count === 2) {
        if (type === HandType.ThreeOfAKind) type = HandType.FullHouse;
        else if (type === HandType.OnePair) type = HandType.TwoPairs;
        else type = HandType.OnePair;
      }
    }

    if (jokers) {
      const jokerCount = this.cards.filter(c => c === "J").length;
      return this.getTypeWithJokers(type, jokerCount);
    }

    return type;
  }

  private getTypeWithJokers(type: HandType, jokers: number): HandType {
    if (jokers === 0) return type;
    if (type === HandType.HighCard) {
      if (jokers === 1) return HandType.OnePair;
      if (jokers === 2) return HandType.ThreeOfAKind;
      if (jokers === 3) return HandType.FourOfAKind;
    }
    if (type === HandType.OnePair) {
      if (jokers === 1) return HandType.ThreeOfAKind;
      if (jokers === 2) return HandType.FourOfAKind;
      if (jokers === 3) return HandType.FiveOfAKind;
    }
    if (type === HandType.TwoPairs && jokers === 1) return HandType.FullHouse;
    if (type === HandType.ThreeOfAKind) {
      if (jokers === 1) return HandType.FourOfAKind;
      if (jokers === 2) return HandType.FiveOfAKind;
    }
    if (type === HandType.FourOfAKind && jokers === 1)
      return HandType.FiveOfAKind;

    return HandType.FiveOfAKind;
  }
}

type Input = Hand[];

export default class Day7 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 6440;
  protected PART_2_TEST_OUTPUT = 5905;

  protected async parseInput(lines: readline.Interface): Promise<Input> {
    const hands: Hand[] = [];
    for await (const line of lines) {
      const [cards, bid] = line.split(" ");
      hands.push(new Hand(cards.split(""), Number(bid)));
    }
    return hands;
  }

  protected part1(hands: Input): number {
    hands.sort((a, b) => b.compare(a));
    return hands.reduce((sum, hand, i) => (sum += hand.bid * (i + 1)), 0);
  }

  protected part2(hands: Input): number {
    hands.sort((a, b) => b.compare(a, true));
    return hands.reduce((sum, hand, i) => (sum += hand.bid * (i + 1)), 0);
  }
}
