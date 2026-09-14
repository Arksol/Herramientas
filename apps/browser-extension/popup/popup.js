import { runtimeApi } from "./shared.js";

const api = runtimeApi();
const status = document.getElementById("status");
const check = document.getElementById("check");

function verify() {
  status.textContent = "Comprobando app local...";
  api.runtime.sendMessage({ type: "herramientas:health" }, (response) => {
    status.textContent = response?.ok === false ? response.error : "Herramientas local esta disponible.";
  });
}

check.addEventListener("click", verify);
verify();

