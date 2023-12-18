import readline from "readline/promises";
import { polygonPerimeter, shoelaceArea } from "../util.js";
import Solver from "./Solver.js";

interface DigStep {
  direction: string;
  distance: number;
  color: string;
}

type Point = [number, number];

type Input = DigStep[];

export default class Day18 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 62;
  protected PART_2_TEST_OUTPUT = 952408144115;

  protected async parseInput(lines: readline.Interface): Promise<Input> {
    const steps: DigStep[] = [];
    for await (const line of lines) {
      const [direction, distance, color] = line.split(" ");
      steps.push({
        direction,
        distance: Number(distance),
        color: color.slice(1, -1),
      });
    }
    return steps;
  }

  protected part1(steps: Input): number {
    return this.dugVolume(steps);
  }

  protected part2(steps: Input): number {
    steps = steps.map(step => this.fixStep(step));
    return this.dugVolume(steps);
  }

  private dugVolume(steps: DigStep[]): number {
    const points = this.getDugPoints(steps);
    // We want perimeter + interior points, but interiorPoints (using Pick's theorem) does area - perimeter / 2 + 1, so we can simplify
    // perimeter + interiorPoints(points) + 1 to this
    return shoelaceArea(points) + polygonPerimeter(points) / 2 + 1;
  }

  private getDugPoints(steps: DigStep[]): Point[] {
    const points: Point[] = [[0, 0]];
    const currentLocation: Point = [0, 0];
    for (const { direction, distance } of steps) {
      switch (direction) {
        case "U":
          currentLocation[1] -= distance;
          break;
        case "D":
          currentLocation[1] += distance;
          break;
        case "L":
          currentLocation[0] -= distance;
          break;
        case "R":
          currentLocation[0] += distance;
          break;
      }
      points.push(currentLocation.slice() as Point);
    }
    return points;
  }

  private fixStep({ color }: DigStep): DigStep {
    // Color is a hex RGB value (or was supposed to be ¯\_(ツ)_/¯)
    const direction = this.directionFromNumString(color.slice(-1));
    const distance = parseInt(color.slice(1, -1), 16);
    return {
      direction,
      distance,
      // We don't care about color
      color,
    };
  }

  private directionFromNumString(direction: string): string {
    switch (direction) {
      case "0":
        return "R";
      case "1":
        return "D";
      case "2":
        return "L";
      case "3":
        return "U";
      default:
        throw new Error(`Invalid direction number: ${direction}`);
    }
  }
}
