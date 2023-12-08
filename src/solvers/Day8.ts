/* eslint-disable no-constant-condition */

/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import readline from "readline/promises";
import { lcm } from "../util.js";
import Solver from "./Solver.js";

// Key: AAA, value: [BBB (left), CCC (right)]
type Nodes = Map<string, [string, string]>;

interface Input {
  directions: string;
  nodes: Nodes;
}

const NODE_REGEX = /([A-Z0-9]{3})/g;

export default class Day8 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 6;
  protected PART_2_TEST_OUTPUT = 6;

  protected async parseInput(lines: readline.Interface): Promise<Input> {
    const iterator = lines[Symbol.asyncIterator]();
    const directions = (await iterator.next()).value as string;
    await iterator.next(); // Skip empty line

    const nodes = new Map<string, [string, string]>();
    for await (const line of iterator) {
      const [key, left, right] = line.match(NODE_REGEX)!;
      nodes.set(key, [left, right]);
    }

    return { directions, nodes };
  }

  protected part1({ directions, nodes }: Input): number {
    return this.countSteps(directions, nodes, "AAA", node => node === "ZZZ");
  }

  protected part2({ directions, nodes }: Input): number {
    const startingNodes = Array.from(nodes.keys()).filter(key =>
      key.endsWith("A"),
    );
    const distances = startingNodes.map(start =>
      this.countSteps(directions, nodes, start, node => node.endsWith("Z")),
    );

    return lcm(...distances);
  }

  private countSteps(
    directions: string,
    nodes: Nodes,
    startingNode: string,
    compare: (node: string) => boolean,
  ): number {
    let steps = 0;
    let node = nodes.get(startingNode)!;

    // Repeat set of directions until we arrive
    while (true) {
      for (const dir of directions) {
        steps++;
        if (dir === "L") {
          if (compare(node[0])) return steps;
          node = nodes.get(node[0])!;
        } else {
          if (compare(node[1])) return steps;
          node = nodes.get(node[1])!;
        }
      }
    }
  }
}
