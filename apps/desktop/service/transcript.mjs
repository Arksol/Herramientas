export function compactText(text, max = 60000) {
  return String(text ?? "").split(/\s+/).filter(Boolean).join(" ").slice(0, max);
}

export function parseTranscriptText(input) {
  const raw = String(input ?? "").replace(/^\uFEFF/, "").replace(/\r/g, "");
  const lines = raw.split("\n");
  const cues = [];
  let buffer = [];
  let currentTime = "";
  let skipBlock = false;
  const flush = () => {
    const text = buffer.join(" ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\{[^}]+\}/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\s+([,.;!?])/g, "$1")
      .trim();
    if (text) cues.push(currentTime ? `[${currentTime}] ${text}` : text);
    buffer = [];
    currentTime = "";
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flush();
      skipBlock = false;
      continue;
    }
    if (/^WEBVTT/i.test(line)) { flush(); continue; }
    if (/^(NOTE|STYLE|REGION)\b/i.test(line)) { flush(); skipBlock = true; continue; }
    if (skipBlock) continue;
    if (/^\d+$/.test(line)) continue;
    const timing = line.match(/(\d{1,2}:)?\d{1,2}:\d{2}[,.]\d{1,3}\s*-->\s*(\d{1,2}:)?\d{1,2}:\d{2}[,.]\d{1,3}/);
    if (timing) {
      flush();
      currentTime = timing[0].split("-->")[0].trim().replace(",", ".");
      continue;
    }
    buffer.push(line);
  }
  flush();
  return compactText(cues.join("\n"));
}

export function looksLikeTranscript(text, filePath = "") {
  return /\.(vtt|srt)$/i.test(filePath)
    || /^\s*WEBVTT/i.test(text)
    || /\d{2}:\d{2}[,.]\d{1,3}\s*-->/.test(text);
}
