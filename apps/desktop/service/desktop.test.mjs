import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

test("el servicio de escritorio usa datos privados y un puerto local libre", async () => {
  const dataPath = await fs.mkdtemp(path.join(os.tmpdir(), "herramientas-desktop-test-"));
  process.env.HERRAMIENTAS_EMBEDDED = "1";
  process.env.HERRAMIENTAS_PORT = "0";
  process.env.HERRAMIENTAS_DATA_DIR = dataPath;
  let server;
  let startLocalServerFn;
  let stopLocalServer;

  try {
    ({ startLocalServer: startLocalServerFn, stopLocalServer } = await import("./server.mjs"));
    const running = await startLocalServerFn();
    server = running.server;
    assert.ok(running.port > 0);
    assert.equal(server.address().address, "127.0.0.1");

    const response = await fetch(`http://127.0.0.1:${running.port}/api/health`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).status, "ok");
    assert.equal((await fs.stat(path.join(dataPath, "data", "herramientas.sqlite"))).isFile(), true);
  } finally {
    if (server) await stopLocalServer(server);
    await fs.rm(dataPath, { recursive: true, force: true });
  }
});
