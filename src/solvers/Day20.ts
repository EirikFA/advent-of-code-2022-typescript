import readline from "readline/promises";
import { lcm } from "../util.js";
import Solver from "./Solver.js";

enum Pulse {
  Low,
  High,
}

abstract class Module {
  constructor(readonly destinations: string[]) {}

  abstract sendPulse(pulse: Pulse, input: string): Pulse | undefined;
}

class UntypedModule extends Module {
  sendPulse(): Pulse | undefined {
    return;
  }
}

class BroadcasterModule extends Module {
  sendPulse(pulse: Pulse): Pulse | undefined {
    return pulse;
  }
}

class FlipFlopModule extends Module {
  private on = false;

  sendPulse(pulse: Pulse): Pulse | undefined {
    if (pulse === Pulse.High) return;

    const out = this.on ? Pulse.Low : Pulse.High;
    this.on = !this.on;
    return out;
  }
}

class ConjunctionModule extends Module {
  readonly inputPulses: Map<string, Pulse>;

  constructor(
    readonly destinations: string[],
    inputs: string[],
  ) {
    super(destinations);
    this.inputPulses = new Map(inputs.map(input => [input, Pulse.Low]));
  }

  sendPulse(pulse: Pulse, input: string): Pulse | undefined {
    this.inputPulses.set(input, pulse);

    const pulses = Array.from(this.inputPulses.values());
    if (pulses.every(p => p === Pulse.High)) {
      return Pulse.Low;
    }

    return Pulse.High;
  }
}

// Source name, name, pulse
type Queue = [string, string, Pulse][];
type Modules = Map<string, Module>;
type Input = Modules;

export default class Day20 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 11687500;
  protected PART_2_TEST_OUTPUT = undefined;

  protected async parseInput(lines: readline.Interface): Promise<Input> {
    const modules = new Map<string, Module>();
    const conjunctionInputs = new Map<string, string[]>();
    for await (const line of lines) {
      const [source, destinationString] = line.split(" -> ");
      const destinations = destinationString.split(", ");
      if (source === "broadcaster") {
        modules.set(source, new BroadcasterModule(destinations));
      } else if (source.includes("%")) {
        modules.set(source.slice(1), new FlipFlopModule(destinations));
      } else if (source.includes("&")) {
        const name = source.slice(1);
        conjunctionInputs.set(name, []);
        // Placeholder so we can get destinations later
        modules.set(name, new UntypedModule(destinations));
      } else {
        modules.set(source, new UntypedModule(destinations));
      }
    }

    for (const [name, module] of modules) {
      for (const dest of module.destinations) {
        if (conjunctionInputs.has(dest)) {
          conjunctionInputs.get(dest)!.push(name);
        }
      }
    }

    for (const [name, inputs] of conjunctionInputs) {
      modules.set(
        name,
        new ConjunctionModule(modules.get(name)!.destinations, inputs),
      );
    }

    return modules;
  }

  protected part1(modules: Input): number {
    const queue: [string, string, Pulse][] = [
      ["button", "broadcaster", Pulse.Low],
    ];
    let [low, high] = [0, 0];
    for (let i = 0; i < 1000; i++) {
      const [l, h] = this.processQueue(queue.slice(), modules);
      low += l;
      high += h;
    }
    return low * high;
  }

  protected part2(modules: Input): number {
    // Not sure how general this is
    // Looking at the input, rx has one parent module which is a conjunction (which sends a low pulse when all its inputs are high)
    const rxParent = Array.from(modules.entries()).find(([, module]) =>
      module.destinations.includes("rx"),
    );
    if (!rxParent) throw new Error("No rx parent found");
    if (!(rxParent[1] instanceof ConjunctionModule))
      throw new Error("rx parent is not a conjunction");

    const queue: [string, string, Pulse][] = [
      ["button", "broadcaster", Pulse.Low],
    ];
    let presses = 0;
    const rxParentHighPresses: number[] = [];
    while (rxParentHighPresses.length < rxParent[1].inputPulses.size) {
      presses++;
      this.processQueue(queue.slice(), modules, (out, module) => {
        // Assumes cycles don't repeat before all of them completed once
        if (out === Pulse.High && module.destinations.includes(rxParent[0])) {
          rxParentHighPresses.push(presses);
        }
      });
    }

    return lcm(...rxParentHighPresses);
  }

  private processQueue(
    queue: Queue,
    modules: Modules,
    afterHook?: (out: Pulse, module: Module) => void,
  ): [number, number] {
    let [low, high] = [0, 0];
    while (queue.length > 0) {
      const [source, name, pulse] = queue.shift()!;
      if (pulse === Pulse.Low) low++;
      else high++;

      const module = modules.get(name);
      if (!module) continue;

      const out = module.sendPulse(pulse, source);
      // Since Pulse.Low is 0, we need to check strictly for undefined
      if (out === undefined) continue;

      for (const dest of module.destinations) {
        queue.push([name, dest, out]);
      }

      if (afterHook) afterHook(out, module);
    }

    return [low, high];
  }
}
