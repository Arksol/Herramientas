import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const desktop = path.join(project, "apps", "desktop");
const npmCli = process.env.npm_execpath;
const branch = "codex/desktop-live-sync";
const paths = ["apps/desktop", ".github/workflows/desktop-release.yml", ".gitignore"];
const forbiddenPath = /(^|\/)(\.env(?:\.|$)|\.auth\.local|\.users\.local|\.obsidian\.local|data\/|node_modules\/|release\/)|\.(?:sqlite|db|pem|p12|pfx|key)$/i;
const forbiddenContent = /(?:github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/;
let lastStatus = "";
let changedAt = Date.now();
let lastPushed = "";
let busy = false;

function run(command, args, cwd = project) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    windowsHide: true,
    timeout: 120000,
    maxBuffer: 10 * 1024 * 1024
  });
  if (result.error || result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} falló: ${result.stderr?.trim() || result.error?.message || result.status}`);
  }
  return result.stdout.trim();
}

function checkRepository() {
  if (!npmCli) throw new Error("Inicia este modo con npm run live:sync o npm run sync:github.");
  if (run("git", ["branch", "--show-current"]) !== branch) {
    throw new Error(`La sincronización requiere la rama ${branch}.`);
  }
  const remote = run("git", ["remote", "get-url", "origin"]);
  if (!/^https:\/\/github\.com\/Arksol\/Herramientas(?:\.git)?$/i.test(remote)) {
    throw new Error("El destino de GitHub no es Arksol/Herramientas.");
  }
}

function inspectStaged() {
  const result = run("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMRT", "--", ...paths]);
  for (const name of result.split(/\r?\n/).filter(Boolean)) {
    const normalized = name.replaceAll("\\", "/");
    if (forbiddenPath.test(normalized)) throw new Error(`Archivo privado excluido: ${name}`);
    const content = run("git", ["show", `:${name}`]);
    if (forbiddenContent.test(content)) throw new Error(`Posible credencial en ${name}; revisa antes de publicar.`);
  }
}

function sync() {
  checkRepository();
  const status = run("git", ["status", "--porcelain", "--untracked-files=all", "--", ...paths]);
  if (status !== lastStatus) {
    lastStatus = status;
    changedAt = Date.now();
    return;
  }
  if (status && Date.now() - changedAt >= 15000) {
    console.log("Comprobando cambios antes de subirlos a GitHub...");
    run(process.execPath, [npmCli, "test"], desktop);
    run(process.execPath, [npmCli, "run", "build"], desktop);
    run("git", ["add", "-A", "--", ...paths]);
    inspectStaged();
    const staged = run("git", ["diff", "--cached", "--name-only", "--", ...paths]);
    if (staged) {
      const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
      run("git", ["commit", "-m", `Sincroniza Herramientas ${stamp}`, "--", ...paths]);
      console.log(`Cambios guardados: ${stamp}.`);
    }
    lastStatus = "";
  }
  const head = run("git", ["rev-parse", "HEAD"]);
  if (head !== lastPushed) {
    run("git", ["push", "-u", "origin", `HEAD:refs/heads/${branch}`]);
    lastPushed = head;
    console.log(`GitHub actualizado: ${head.slice(0, 7)}.`);
  }
}

try {
  checkRepository();
  console.log(`Sincronización activa en ${branch}. Se esperan 15 segundos sin cambios antes de guardar.`);
  setInterval(() => {
    if (busy) return;
    busy = true;
    try { sync(); }
    catch (reason) { console.error("Sincronización pendiente:", reason.message); }
    finally { busy = false; }
  }, 5000);
} catch (reason) {
  console.error(reason.message);
  process.exitCode = 1;
}
