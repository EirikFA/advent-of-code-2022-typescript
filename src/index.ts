import Solver from "./solvers/Solver.js";

let day: number;

if (process.argv.length === 2) {
  const now = new Date();
  if (now.getMonth() !== 11) {
    console.error("It's not December");
    process.exit(1);
  }

  day = new Date().getDate();
  if (day > 25) {
    console.error("It's past Christmas");
    process.exit(1);
  }
} else {
  day = Number(process.argv[2]);
  if (Number.isNaN(day)) {
    console.error("Day must be a number");
    process.exit(1);
  }
}

console.log("--- Day", day, "---");
const solver = await Solver.create(day);
await solver.run();
