import { byId } from "../utils/dom.js";

export function initHome() {
  const button = byId("btnAccion");
  if (!button) return;

  button.addEventListener("click", () => {
    alert("JavaScript modular funcionando correctamente.");
  });
}
