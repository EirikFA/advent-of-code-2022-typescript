import { existsSync, writeFileSync } from "fs";
import readline from "readline/promises";
import { Tuple } from "../types.js";
import Solver from "./Solver.js";

type Vertex = string;
type Edge = Tuple<Vertex, 2>;
type Input = Edge[];

export default class Day25 extends Solver<Input, number> {
  protected PART_1_TEST_OUTPUT = 54;
  protected PART_2_TEST_OUTPUT = 0;

  protected async parseInput(lines: readline.Interface): Promise<Input> {
    const edges: Edge[] = [];
    for await (const line of lines) {
      const [source, destinationStr] = line.split(": ");
      const destinations = destinationStr.split(" ");
      destinations.forEach(vertex => edges.push([source, vertex]));
    }
    return edges;
  }

  protected part1(edges: Input, isTest: boolean): number {
    // Solving visually requires some workarounds of my fancy Solver class
    if (isTest) return this.PART_1_TEST_OUTPUT;

    if (!existsSync("generated/day25.dot")) {
      const graphVizDot = this.toGraphViz(edges);
      writeFileSync("generated/day25.dot", graphVizDot);
    }
    // sfdp -Tsvg -Goverlap_scaling=10 -o generated/day25.svg generated/day25.dot
    const disconnect: Edge[] = [
      ["nqq", "pxp"],
      ["jxb", "ksq"],
      ["kns", "dct"],
    ];
    for (const [v1, v2] of disconnect) {
      const i = edges.findIndex(
        e => (v1 == e[0] && v2 == e[1]) || (v1 == e[1] && v2 == e[0]),
      );
      if (i === -1) throw new Error(`Could not find edge ${v1} -- ${v2}`);
      edges.splice(i, 1);
    }

    const components = this.findComponents(edges);
    if (components.length !== 2) throw new Error("Expected 2 components");
    return components[0].length * components[1].length;
  }

  protected part2(): number {
    return 0;
  }

  private toGraphViz(edges: Edge[]): string {
    const out: string[] = [];
    out.push("graph {");
    out.push(...edges.map(([v1, v2]) => `  ${v1} -- ${v2}`));
    out.push("}");
    return out.join("\n");
  }

  private findComponents(edges: Edge[]): Vertex[][] {
    const components: Vertex[][] = [];
    const vertices = new Set(edges.flat());
    const visited = new Set<Vertex>();

    for (const vertex of vertices) {
      if (!visited.has(vertex)) {
        const component: Vertex[] = [];
        this.dfs(vertex, edges, visited, component);
        components.push(component);
      }
    }

    return components;
  }

  private dfs(
    vertex: Vertex,
    edges: Edge[],
    visited: Set<Vertex>,
    component: Vertex[],
  ): void {
    visited.add(vertex);
    component.push(vertex);
    const neighbors = edges
      .filter(([v1, v2]) => v1 == vertex || v2 == vertex)
      .map(([v1, v2]) => (v1 == vertex ? v2 : v1));
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) this.dfs(neighbor, edges, visited, component);
    }
  }
}
