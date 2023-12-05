import assert from "assert";
import { createReadStream } from "fs";
import path from "path";
import readline from "readline/promises";
import { fileURLToPath } from "url";
import { MaybePromise } from "../types";

type ConcreteSolverConstructor<I, O> = new (
  ...args: ConstructorParameters<typeof Solver<I, O>>
) => Solver<I, O>;

export default abstract class Solver<I, O> {
  private readonly DAY: number;

  protected abstract readonly PART_1_TEST_OUTPUT?: O;
  protected abstract readonly PART_2_TEST_OUTPUT?: O;

  constructor(day: number) {
    this.DAY = day;
  }

  // You might call this elegant, or you can call it ugly. I call it both.
  static async create<I, O>(day: number): Promise<Solver<I, O>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const module = await import(`./day${day}.js`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const classRef: ConcreteSolverConstructor<I, O> = module.default;
      return new classRef(day);
    } catch (e) {
      console.error(`Error creating solver for day ${day}`);
      console.error(e);
      process.exit(1);
    }
  }

  async run() {
    await this.test();

    const lines = this.readInput();

    const beforeParse = new Date();
    const input = await this.parseInput(lines);
    const afterParse = new Date();

    const before = new Date();
    console.log("Part 1:", await this.part1(input));
    console.log("Part 2:", await this.part2(input));
    const after = new Date();

    console.log(
      "Parsing (after reading) time:",
      afterParse.getTime() - beforeParse.getTime(),
      "ms",
    );
    console.log("Part 1 & 2 time:", after.getTime() - before.getTime(), "ms");
    console.log("Total time:", after.getTime() - beforeParse.getTime(), "ms");
  }

  protected linesToString(lines: readline.Interface): Promise<string> {
    return new Promise(resolve => {
      let input = "";
      lines.on("line", line => {
        input += line + "\n";
      });
      lines.on("close", () => {
        resolve(input);
      });
    });
  }

  private async test() {
    if (this.PART_1_TEST_OUTPUT) {
      const part1Input = await this.parseInput(this.readInput("part1"));
      const part1 = await this.part1(part1Input);
      assert.strictEqual(part1, this.PART_1_TEST_OUTPUT);
    } else {
      console.warn("Part 1 test not implemented for day", this.DAY);
    }

    if (this.PART_2_TEST_OUTPUT) {
      const part2Input = await this.parseInput(this.readInput("part2"));
      const part2 = await this.part2(part2Input);
      assert.strictEqual(part2, this.PART_2_TEST_OUTPUT);
    } else {
      console.warn("Part 2 test not implemented for day", this.DAY);
    }

    console.log("Tests for day", this.DAY, "passed");
  }

  private readInput(
    type: "input" | "part1" | "part2" = "input",
  ): readline.Interface {
    const fileName = fileURLToPath(import.meta.url);
    return readline.createInterface({
      input: createReadStream(
        path.join(
          path.dirname(fileName),
          `../../resources/input/day${this.DAY}/${type}.txt`,
        ),
      ),
    });
  }

  protected abstract parseInput(lines: readline.Interface): MaybePromise<I>;
  protected abstract part1(input: I): MaybePromise<O>;
  protected abstract part2(input: I): MaybePromise<O>;
}
