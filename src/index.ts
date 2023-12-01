import Solver from "./solvers/Solver.js";

if (process.argv.length === 2) {
  console.error("A day number is required");
  process.exit(1);
}

const day = Number(process.argv[2]);
if (Number.isNaN(day)) {
  console.error("Day must be a number");
  process.exit(1);
}

const solver = await Solver.create(day);
await solver.run();
