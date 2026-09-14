import assert from "node:assert/strict";
import test from "node:test";
import { compactText, looksLikeTranscript, parseTranscriptText } from "./transcript.mjs";

test("parsea VTT, conserva el inicio de cada cue y limpia etiquetas", () => {
  const input = `\uFEFFWEBVTT\n\n00:00:01.200 --> 00:00:03.500\nHola <b>mundo</b>.\n\n00:00:04.000 --> 00:00:06.000\nSegundo bloque {\u00a7voz}.`;

  assert.equal(
    parseTranscriptText(input),
    "[00:00:01.200] Hola mundo. [00:00:04.000] Segundo bloque."
  );
});

test("parsea SRT con indices, comas decimales y varias lineas", () => {
  const input = `1\n00:00:00,000 --> 00:00:02,000\nPrimera linea\nsegunda linea\n\n2\n00:00:02,500 --> 00:00:05,000\nOtra idea`;

  assert.equal(
    parseTranscriptText(input),
    "[00:00:00.000] Primera linea segunda linea [00:00:02.500] Otra idea"
  );
});

test("ignora bloques NOTE, STYLE y REGION", () => {
  const input = `WEBVTT\n\nNOTE\nmetadatos internos\n\nSTYLE\n::cue { color: red; }\n\nREGION\nid:main\n\n00:00:01.000 --> 00:00:02.000\nContenido valido`;

  assert.equal(parseTranscriptText(input), "[00:00:01.000] Contenido valido");
});

test("detecta transcripciones por extension, encabezado o timestamp", () => {
  assert.equal(looksLikeTranscript("texto", "clase.srt"), true);
  assert.equal(looksLikeTranscript("WEBVTT\n", "clase.txt"), true);
  assert.equal(looksLikeTranscript("00:01:02.000 --> 00:01:04.000\ntexto", ""), true);
  assert.equal(looksLikeTranscript("texto normal", "notas.txt"), false);
});

test("compactText normaliza espacios y aplica limite", () => {
  assert.equal(compactText("  una\n\n dos   tres "), "una dos tres");
  assert.equal(compactText("abcdefgh", 5), "abcde");
});
