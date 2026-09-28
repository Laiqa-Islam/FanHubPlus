// Runs the API and the web app together: `npm run dev` from the repo root.
// Each child's output is prefixed so the two logs stay readable; Ctrl+C stops both.
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const apps = [
  { name: "api", cwd: path.join(root, "backend"), color: "\x1b[35m" },
  { name: "web", cwd: path.join(root, "frontend"), color: "\x1b[36m" },
];

const children = apps.map(({ name, cwd, color }) => {
  const child = spawn("npm", ["run", "dev"], { cwd, shell: true, env: process.env });
  const prefix = `${color}[${name}]\x1b[0m `;
  const pipe = (stream, out) =>
    stream.on("data", (chunk) => {
      for (const line of String(chunk).split(/\r?\n/)) {
        if (line.trim()) out.write(`${prefix}${line}\n`);
      }
    });
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);
  child.on("exit", (code) => {
    console.log(`${prefix}exited with code ${code}`);
    shutdown(code ?? 0);
  });
  return child;
});

let stopping = false;
function shutdown(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill();
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
