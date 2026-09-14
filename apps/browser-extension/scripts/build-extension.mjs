import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const targets = ["chrome-dev", "firefox", "helium"];
const commonFiles = [
  ["src/background.js", "background.js"],
  ["src/content-script.js", "content-script.js"],
  ["src/shared.js", "shared.js"],
  ["popup/popup.html", "popup.html"],
  ["popup/popup.js", "popup.js"],
  ["popup/popup.css", "popup.css"]
];

for (const target of targets) {
  const outDir = path.join(root, "dist", target);
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });
  for (const [from, to] of commonFiles) {
    await fs.copyFile(path.join(root, from), path.join(outDir, to));
  }
  await fs.copyFile(path.join(root, "manifests", `${target}.json`), path.join(outDir, "manifest.json"));
}

console.log(`Built browser extension targets: ${targets.join(", ")}`);
