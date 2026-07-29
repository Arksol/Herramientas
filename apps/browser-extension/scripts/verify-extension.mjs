import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const targets = ["chrome-dev", "firefox", "helium"];
const content = await fs.readFile(path.join(root, "src", "content-script.js"), "utf8");
const background = await fs.readFile(path.join(root, "src", "background.js"), "utf8");

assert.match(content, /herramientas:reset-position/);
assert.match(content, /requestedTool: event\.currentTarget\.dataset\.transcript/);
assert.match(content, /data-send="legal"/);
assert.match(content, /globalThis\.browser\?\.runtime\?\.sendMessage/);
assert.match(background, /herramientas:open-app/);
assert.match(background, /herramientasPendingContext/);
assert.match(background, /contextSessionId/);

for (const target of targets) {
  const manifest = JSON.parse(await fs.readFile(path.join(root, "manifests", `${target}.json`), "utf8"));
  assert.equal(manifest.manifest_version, 3, `${target} debe usar Manifest V3`);
  for (const permission of ["storage", "activeTab", "tabs"]) assert.ok(manifest.permissions.includes(permission), `${target} requiere ${permission}`);
  assert.ok(manifest.content_scripts?.[0]?.js?.includes("content-script.js"), `${target} debe inyectar la burbuja`);
  if (target === "firefox") assert.ok(manifest.background?.scripts?.includes("background.js"), "Firefox debe declarar background.scripts");
  else assert.equal(manifest.background?.service_worker, "background.js", `${target} debe declarar service_worker`);
}

console.log("Verificación de extensión: correcta");