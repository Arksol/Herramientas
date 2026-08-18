import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const port = 33100 + Math.floor(Math.random() * 700);
const baseUrl = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ["service/server.mjs"], { cwd: process.cwd(), env: { ...process.env, HERRAMIENTAS_PORT: String(port) }, stdio: ["ignore", "pipe", "pipe"] });
let output = "";
child.stdout.on("data", (chunk) => { output += chunk; });
child.stderr.on("data", (chunk) => { output += chunk; });
const request = (path, options = {}) => fetch(`${baseUrl}${path}`, options);
async function waitForHealth() { for (let attempt = 0; attempt < 40; attempt += 1) { try { if ((await request("/api/health")).ok) return; } catch {} await delay(100); } throw new Error(`El servicio efímero no inició. ${output}`); }

try {
  await waitForHealth();
  const capabilities = await request("/api/context/capabilities", { headers: { Origin: "chrome-extension://smoke-test" } });
  assert.equal(capabilities.status, 200);
  assert.equal(capabilities.headers.get("access-control-allow-origin"), "chrome-extension://smoke-test");

  const professorContext = await request("/api/context/inspect", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "chrome-extension://smoke-test" },
    body: JSON.stringify({ origin: "https://example.test", url: "https://example.test/course", title: "Clase de prueba", selectedText: "Un texto seleccionado suficientemente largo para iniciar una práctica con el profesor especializado.", sourceKind: "selection", adapter: "Sitio compatible: Matemáticas", requestedTool: "multi-profesor", consent: true })
  });
  assert.equal(professorContext.status, 200);
  assert.equal((await professorContext.json()).received.requestedTool, "multi-profesor");

  const guestResponse = await request("/api/auth/guest", { method: "POST" });
  assert.equal(guestResponse.status, 200);
  const guest = await guestResponse.json();
  assert.deepEqual({ access: guest.access, authenticated: guest.authenticated, canPersist: guest.canPersist, canCreateTools: guest.canCreateTools }, { access: "guest", authenticated: false, canPersist: false, canCreateTools: false });
  const guestCookie = guestResponse.headers.get("set-cookie")?.split(";")[0] ?? "";
  const headers = { "Content-Type": "application/json", Cookie: guestCookie };

  const tutorPlan = await request("/api/agents/plan", { method: "POST", headers, body: JSON.stringify({ toolId: "multi-profesor", agentId: "english-c1-tutor-agent", task: "Practicar una entrevista técnica en inglés", priority: "hoy", useLocalAi: false }) });
  assert.equal(tutorPlan.status, 200);
  const plan = await tutorPlan.json();
  assert.equal(plan.toolId, "multi-profesor");
  assert.equal(plan.agentId, "english-c1-tutor-agent");
  assert.equal(plan.mode, "local-rules");

  const legalPlan = await request("/api/agents/plan", { method: "POST", headers, body: JSON.stringify({ toolId: "legal", agentId: "legal-analysis-agent", task: "Revisar una política de privacidad antes de aceptar", priority: "hoy", useLocalAi: false }) });
  assert.equal(legalPlan.status, 200);
  const legal = await request("/api/legal/analyze", { method: "POST", headers, body: JSON.stringify({ text: "La empresa recopila datos personales, puede compartirlos con proveedores y conservarlos para publicidad.", sourceLabel: "Política de prueba", jurisdiction: "México" }) });
  assert.equal(legal.status, 200);
  assert.ok((await legal.json()).signals.length >= 2);

  const mismatch = await request("/api/agents/plan", { method: "POST", headers, body: JSON.stringify({ toolId: "legal", agentId: "english-c1-tutor-agent", task: "Practicar ritmo", priority: "hoy", useLocalAi: false }) });
  assert.equal(mismatch.status, 403);
  const summaryPlan = await request("/api/agents/plan", { method: "POST", headers, body: JSON.stringify({ toolId: "resumidor", agentId: "academic-synthesis-agent", task: "Crear un plan para una clase autorizada", priority: "hoy", useLocalAi: false }) });
  assert.equal(summaryPlan.status, 200);
  assert.equal((await request("/api/tools/contracts", { headers: { Cookie: guestCookie } })).status, 200);
  assert.equal((await request("/api/obsidian/status", { headers: { Cookie: guestCookie } })).status, 403);
  console.log("Smoke test local: correcto");
} finally { child.kill(); await Promise.race([new Promise((resolve) => child.once("exit", resolve)), delay(1000)]); }
