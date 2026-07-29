import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const port = 33100 + Math.floor(Math.random() * 700);
const baseUrl = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ["service/server.mjs"], {
  cwd: process.cwd(),
  env: { ...process.env, HERRAMIENTAS_PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"]
});

let output = "";
child.stdout.on("data", (chunk) => { output += chunk; });
child.stderr.on("data", (chunk) => { output += chunk; });

async function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, options);
}

async function waitForHealth() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await request("/api/health");
      if (response.ok) return;
    } catch {}
    await delay(100);
  }
  throw new Error(`El servicio efímero no inició. ${output}`);
}

try {
  await waitForHealth();
  const health = await request("/api/health");
  assert.equal(health.status, 200);

  const capabilities = await request("/api/context/capabilities", { headers: { Origin: "chrome-extension://smoke-test" } });
  assert.equal(capabilities.status, 200);
  assert.equal(capabilities.headers.get("access-control-allow-origin"), "chrome-extension://smoke-test");

  const agentPlan = await request("/api/agents/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toolId: "ingles", agentId: "english-c1-tutor-agent", task: "Practicar una entrevista técnica en inglés", priority: "hoy", useLocalAi: false })
  });
  assert.equal(agentPlan.status, 200);
  const plan = await agentPlan.json();
  assert.equal(plan.agentId, "english-c1-tutor-agent");
  assert.equal(plan.mode, "local-rules");
  assert.equal(plan.nextActions.length, 4);

  const legalPlan = await request("/api/agents/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toolId: "legal", agentId: "legal-analysis-agent", task: "Revisar una política de privacidad antes de aceptar", priority: "hoy", useLocalAi: false })
  });
  assert.equal(legalPlan.status, 200);
  const legal = await request("/api/legal/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "La empresa recopila datos personales, puede compartirlos con proveedores y conservarlos para publicidad.", sourceLabel: "Política de prueba", jurisdiction: "México" })
  });
  assert.equal(legal.status, 200);
  const legalResult = await legal.json();
  assert.equal(typeof legalResult.markdown, "string");
  assert.ok(legalResult.signals.length >= 2);
  const mismatch = await request("/api/agents/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toolId: "musica", agentId: "english-c1-tutor-agent", task: "Practicar ritmo", priority: "hoy", useLocalAi: false })
  });
  assert.equal(mismatch.status, 403);

  const protectedPlan = await request("/api/agents/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toolId: "resumidor", agentId: "academic-synthesis-agent", task: "Crear un plan para una clase autorizada", priority: "hoy", useLocalAi: false })
  });
  assert.equal(protectedPlan.status, 401);

  const context = await request("/api/context/inspect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ origin: "https://example.test", url: "https://example.test/curso", title: "Curso de prueba", selectedText: "Este texto fue seleccionado expresamente para la prueba de contexto local.", sourceKind: "selection", requestedTool: "ingles", consent: true })
  });
  assert.equal(context.status, 200);
  const captured = await context.json();
  assert.equal(typeof captured.contextSessionId, "string");

  const protectedContracts = await request("/api/tools/contracts");
  assert.equal(protectedContracts.status, 401);
  console.log("Smoke test local: correcto");
} finally {
  child.kill();
  await Promise.race([new Promise((resolve) => child.once("exit", resolve)), delay(1000)]);
}