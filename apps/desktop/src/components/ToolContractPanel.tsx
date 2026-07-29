import type { Tool } from "../data/tools";

type Props = { tool: Tool };

export default function ToolContractPanel({ tool }: Props) {
  const { contract } = tool;
  return <section className="contract-panel" aria-label={`Contrato de ${tool.name}`}>
    <div className="contract-heading"><span>Contrato operativo</span><b>{contract.requiresActiveSession ? "Sesión activa requerida" : "Uso local configurable"}</b></div>
    <div className="contract-grid">
      <div><h3>Entradas</h3><ul>{contract.inputs.map((item) => <li key={item}>{item}</li>)}</ul></div>
      <div><h3>Salidas</h3><ul>{contract.outputs.map((item) => <li key={item}>{item}</li>)}</ul></div>
      <div><h3>Permisos</h3><ul>{contract.allowedCapabilities.map((item) => <li key={item}>{item}</li>)}</ul></div>
      <div><h3>Confirmación</h3><ul>{contract.confirmations.map((item) => <li key={item}>{item}</li>)}</ul></div>
    </div>
    <p className="contract-forbidden"><b>Bloqueado:</b> {contract.forbiddenActions.join(" · ")}</p>
  </section>;
}
