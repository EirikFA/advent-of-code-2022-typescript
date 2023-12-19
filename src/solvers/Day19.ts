import readline from "readline/promises";
import Solver from "./Solver.js";

interface Part {
  x: number;
  m: number;
  a: number;
  s: number;
}

type Range = [number, number];
type PartRanges = Record<keyof Part, Range>;

class Rule {
  readonly nextStep: string;
  readonly category: keyof Part;
  readonly targetValue: number;
  readonly greaterThan: boolean;

  constructor(rule: string) {
    const [comparison, nextStep] = rule.split(":");
    this.nextStep = nextStep;

    const operator = comparison.includes(">") ? ">" : "<";
    this.greaterThan = operator === ">";

    const [category, targetValue] = comparison.split(operator);
    this.category = category as keyof Part;
    this.targetValue = Number(targetValue);
  }

  checkPart(part: Part): boolean {
    if (this.greaterThan) {
      return part[this.category] > this.targetValue;
    }
    return part[this.category] < this.targetValue;
  }
}

class Workflow {
  readonly rules: Rule[];
  readonly defaultStep: string;

  constructor(rulesString: string) {
    const ruleStrings = rulesString.split(",");
    this.defaultStep = ruleStrings.pop()!;
    this.rules = ruleStrings.map(rule => new Rule(rule));
  }

  checkPart(part: Part): string {
    const passingRule = this.rules.find(rule => rule.checkPart(part));
    return passingRule ? passingRule.nextStep : this.defaultStep;
  }
}

interface Input {
  workflows: Map<string, Workflow>;
  parts: Part[];
}

export default class Day19 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 19114;
  protected PART_2_TEST_OUTPUT = 167409079868000;

  protected async parseInput(lines: readline.Interface): Promise<Input> {
    const data = await this.linesToString(lines);
    const [workflowString, partsString] = data.split("\n\n");
    const workflowLines = workflowString.split("\n");
    const partLines = partsString.split("\n");

    const workflows = new Map<string, Workflow>(
      workflowLines.map(workflow => this.makeWorkflow(workflow)),
    );
    const parts = partLines.map(part => this.makePart(part));
    return {
      parts,
      workflows,
    };
  }

  protected part1({ workflows, parts }: Input): number {
    let partWorkflows: [Part, Workflow][] = parts.map(part => [
      part,
      workflows.get("in")!,
    ]);
    const accepted: Part[] = [];

    while (partWorkflows.length > 0) {
      const newList: [Part, Workflow][] = [];
      for (const [part, workflow] of partWorkflows) {
        const nextStep = workflow.checkPart(part);
        if (nextStep === "A") {
          accepted.push(part);
        } else if (nextStep !== "R") {
          newList.push([part, workflows.get(nextStep)!]);
        }
      }
      partWorkflows = newList;
    }

    return accepted.reduce(
      (sum, part) => sum + part.x + part.m + part.a + part.s,
      0,
    );
  }

  protected part2({ workflows }: Input): number {
    return this.combinations(workflows, "in", {
      x: [1, 4001],
      m: [1, 4001],
      a: [1, 4001],
      s: [1, 4001],
    });
  }

  private makeWorkflow(raw: string): [string, Workflow] {
    const [name, rest] = raw.split("{");
    return [name, new Workflow(rest.replace("}", ""))];
  }

  private makePart(raw: string): Part {
    raw = raw.replace("{", "").replace("}", "");
    const [xStr, mStr, aStr, sStr] = raw.split(",");
    return {
      x: Number(xStr.split("=")[1]),
      m: Number(mStr.split("=")[1]),
      a: Number(aStr.split("=")[1]),
      s: Number(sStr.split("=")[1]),
    };
  }

  // The following two methods are what I like to call a monstrosity
  private combinations(
    workflows: Map<string, Workflow>,
    step: string,
    ranges: PartRanges,
  ): number {
    if (step === "R") return 0;
    if (step === "A")
      return Object.values(ranges).reduce((a, b) => a * (b[1] - b[0]), 1);

    let result = 0;
    const workflow = workflows.get(step)!;
    for (const rule of workflow.rules) {
      result += this.ruleCombinations(workflows, rule, ranges);
    }
    result += this.combinations(workflows, workflow.defaultStep, ranges);
    return result;
  }

  private ruleCombinations(
    workflows: Map<string, Workflow>,
    rule: Rule,
    ranges: PartRanges,
  ): number {
    let result = 0;
    const [lower, upper] = ranges[rule.category];
    if (rule.greaterThan) {
      if (lower > rule.targetValue) {
        result += this.combinations(workflows, rule.nextStep, ranges);
        return result;
      }

      if (upper > rule.targetValue) {
        const newRanges = { ...ranges };
        newRanges[rule.category] = [rule.targetValue + 1, upper];
        result += this.combinations(workflows, rule.nextStep, newRanges);
        ranges[rule.category] = [lower, rule.targetValue + 1];
      }
    } else {
      if (upper < rule.targetValue) {
        result += this.combinations(workflows, rule.nextStep, ranges);
        return result;
      }

      if (lower < rule.targetValue) {
        const newRanges = { ...ranges };
        newRanges[rule.category] = [lower, rule.targetValue];
        result += this.combinations(workflows, rule.nextStep, newRanges);
        ranges[rule.category] = [rule.targetValue, upper];
      }
    }
    return result;
  }
}
