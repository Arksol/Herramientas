import { spawn } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const children = [
  spawn(npm, ["--prefix", "apps/desktop", "run", "service"], { stdio: "inherit", shell: process.platform === "win32" }),
  spawn(npm, ["--prefix", "apps/desktop", "run", "dev"], { stdio: "inherit", shell: process.platform === "win32" })
];

function stop() {
  for (const child of children) child.kill();
}

process.on("SIGINT", () => { stop(); process.exit(0); });
process.on("SIGTERM", () => { stop(); process.exit(0); });
process.on("exit", stop);

for (const child of children) child.on("exit", (code) => {
  if (code && code !== 0) process.exitCode = code;
});
