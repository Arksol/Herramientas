import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

test("el restablecimiento TOTP conserva la vinculacion anterior hasta confirmar la nueva", async () => {
  const dataPath = await fs.mkdtemp(path.join(os.tmpdir(), "herramientas-totp-reset-test-"));
  process.env.HERRAMIENTAS_EMBEDDED = "1";
  process.env.HERRAMIENTAS_PORT = "0";
  process.env.HERRAMIENTAS_DATA_DIR = dataPath;
  process.env.HERRAMIENTAS_ACCESS_CODE_HASH = await bcrypt.hash("codigo-local-de-prueba", 4);

  let running;
  let service;
  try {
    service = await import(`./server.mjs?totp-reset-test=${Date.now()}`);
    running = await service.startLocalServer();
    const baseUrl = `http://127.0.0.1:${running.port}`;
    const request = (route, body) => fetch(`${baseUrl}${route}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });

    const registration = await (await request("/api/auth/register", {
      identifier: "cuenta-prueba-totp",
      password: "contraseña-segura-de-prueba"
    })).json();
    const oldSecret = registration.twoFactor.secret;
    const oldCode = service.totpCode(oldSecret);

    const startResponse = await request("/api/auth/totp-reset/start", {
      identifier: "cuenta-prueba-totp",
      password: "contraseña-segura-de-prueba",
      accessCode: "codigo-local-de-prueba"
    });
    assert.equal(startResponse.status, 200);
    const pending = await startResponse.json();
    assert.equal(pending.pending, true);
    assert.notEqual(pending.twoFactor.secret, oldSecret);

    const invalidConfirmation = await request("/api/auth/totp-reset/confirm", { pendingId: pending.pendingId, totpCode: "000000" });
    assert.equal(invalidConfirmation.status, 401);
    const oldLogin = await request("/api/auth/login-registered", { identifier: "cuenta-prueba-totp", password: "contraseña-segura-de-prueba", totpCode: oldCode });
    assert.equal(oldLogin.status, 200);

    const newCode = service.totpCode(pending.twoFactor.secret);
    const confirmation = await request("/api/auth/totp-reset/confirm", { pendingId: pending.pendingId, totpCode: newCode });
    assert.equal(confirmation.status, 200);
    const newLogin = await request("/api/auth/login-registered", { identifier: "cuenta-prueba-totp", password: "contraseña-segura-de-prueba", totpCode: newCode });
    assert.equal(newLogin.status, 200);
    const oldLoginAfterReset = await request("/api/auth/login-registered", { identifier: "cuenta-prueba-totp", password: "contraseña-segura-de-prueba", totpCode: oldCode });
    assert.equal(oldLoginAfterReset.status, 401);

    const reusedConfirmation = await request("/api/auth/totp-reset/confirm", { pendingId: pending.pendingId, totpCode: newCode });
    assert.equal(reusedConfirmation.status, 410);
  } finally {
    if (running) await service.stopLocalServer(running.server);
    delete process.env.HERRAMIENTAS_ACCESS_CODE_HASH;
    await fs.rm(dataPath, { recursive: true, force: true });
  }
});
