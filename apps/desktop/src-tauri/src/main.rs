#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64::{engine::general_purpose, Engine as _};
use bcrypt::{hash, verify, DEFAULT_COST};
use keyring::Entry;
use serde::{Deserialize, Serialize};
use std::{env, fs, path::PathBuf, process::Command, sync::Mutex, time::{SystemTime, UNIX_EPOCH}};
use tauri::{Manager, State};

const SESSION_TTL_MS: u128 = 24 * 60 * 60 * 1000;
const IDLE_TTL_MS: u128 = 10 * 60 * 1000;
const LOCKOUT_MS: u128 = 15 * 60 * 1000;
const MAX_ATTEMPTS: u8 = 3;

#[derive(Default, Deserialize, Serialize)]
struct AuthConfig {
  access_code_hash: Option<String>,
}

#[derive(Clone)]
struct Session {
  last_activity_at: u128,
  expires_at: u128,
  paused: bool,
}

struct AuthState {
  access_code_hash: Option<String>,
  session: Option<Session>,
  failures: u8,
  locked_until: Option<u128>,
  config_path: PathBuf,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AuthStatus {
  authenticated: bool,
  configured: bool,
  state: String,
  expires_at: Option<u128>,
  last_activity_at: Option<u128>,
  tools: Vec<&'static str>,
}

fn now() -> u128 {
  SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_millis()
}

fn session_state(session: &Session) -> String {
  if session.paused { "paused".into() }
  else if now().saturating_sub(session.last_activity_at) >= IDLE_TTL_MS { "inactive".into() }
  else { "active".into() }
}

fn status(state: &mut AuthState) -> AuthStatus {
  if let Some(session) = &state.session {
    if now() >= session.expires_at { state.session = None; }
  }
  match &state.session {
    Some(session) => AuthStatus { authenticated: true, configured: state.access_code_hash.is_some(), state: session_state(session), expires_at: Some(session.expires_at), last_activity_at: Some(session.last_activity_at), tools: vec!["resumidor", "clases"] },
    None => AuthStatus { authenticated: false, configured: state.access_code_hash.is_some(), state: "signed_out".into(), expires_at: None, last_activity_at: None, tools: vec![] },
  }
}

fn save_config(state: &AuthState) -> Result<(), String> {
  let config = AuthConfig { access_code_hash: state.access_code_hash.clone() };
  let serialized = serde_json::to_vec_pretty(&config).map_err(|_| "No se pudo preparar la configuracion local.".to_string())?;
  fs::write(&state.config_path, serialized).map_err(|_| "No se pudo guardar la configuracion local.".to_string())
}

fn require_valid_session(state: &mut AuthState) -> Result<(), String> {
  let current = status(state);
  if current.authenticated { Ok(()) } else { Err("Se requiere acceso autorizado.".into()) }
}

fn require_active_session(state: &mut AuthState) -> Result<(), String> {
  let current = status(state);
  if !current.authenticated { return Err("Se requiere acceso autorizado.".into()); }
  match current.state.as_str() {
    "active" => Ok(()),
    "paused" => Err("La sesion esta pausada. Reanudala antes de procesar contenido.".into()),
    "inactive" => Err("La sesion esta inactiva por falta de uso. Reanudala antes de continuar.".into()),
    _ => Err("La sesion no esta disponible.".into()),
  }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SourceAnalysis {
  kind: String,
  text: String,
  source_label: String,
  used_local_ai: bool,
  notes: Vec<String>,
}

fn compact_text(text: &str, max_chars: usize) -> String {
  text.split_whitespace().collect::<Vec<_>>().join(" ").chars().take(max_chars).collect()
}

fn strip_html(html: &str) -> String {
  let mut output = String::new();
  let mut inside_tag = false;
  for character in html.chars() {
    match character {
      '<' => inside_tag = true,
      '>' => { inside_tag = false; output.push(' '); },
      _ if !inside_tag => output.push(character),
      _ => {}
    }
  }
  output.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
}


fn parse_transcript_text(input: &str) -> String {
  let mut cues: Vec<String> = Vec::new();
  let mut buffer: Vec<String> = Vec::new();
  let mut current_time = String::new();
  let flush = |cues: &mut Vec<String>, buffer: &mut Vec<String>, current_time: &mut String| {
    let text = buffer.join(" ").replace(['<', '>'], " ").split_whitespace().collect::<Vec<_>>().join(" ");
    if !text.trim().is_empty() {
      if current_time.trim().is_empty() { cues.push(text); }
      else { cues.push(format!("[{}] {}", current_time.trim(), text)); }
    }
    buffer.clear();
    current_time.clear();
  };
  for raw_line in input.trim_start_matches('\u{feff}').replace('\r', "").lines() {
    let line = raw_line.trim();
    if line.is_empty() || line.eq_ignore_ascii_case("WEBVTT") || line.to_ascii_uppercase().starts_with("NOTE") {
      flush(&mut cues, &mut buffer, &mut current_time);
      continue;
    }
    if line.chars().all(|character| character.is_ascii_digit()) { continue; }
    if line.contains("-->") && line.contains(':') {
      flush(&mut cues, &mut buffer, &mut current_time);
      current_time = line.split("-->").next().unwrap_or("").trim().replace(',', ".");
      continue;
    }
    if line.to_ascii_uppercase().starts_with("STYLE") || line.to_ascii_uppercase().starts_with("REGION") { continue; }
    buffer.push(line.to_string());
  }
  flush(&mut cues, &mut buffer, &mut current_time);
  compact_text(&cues.join("\n"), 60_000)
}

fn looks_like_transcript(content: &str, path: Option<&std::path::Path>) -> bool {
  let by_extension = path.and_then(|value| value.extension()).and_then(|value| value.to_str()).map(|ext| matches!(ext.to_ascii_lowercase().as_str(), "vtt" | "srt")).unwrap_or(false);
  by_extension || content.trim_start().to_ascii_uppercase().starts_with("WEBVTT") || content.contains("-->")
}
fn is_allowed_text_file(path: &std::path::Path) -> bool {
  matches!(path.extension().and_then(|value| value.to_str()).unwrap_or("").to_ascii_lowercase().as_str(),
    "txt" | "md" | "markdown" | "csv" | "json" | "jsonl" | "log" | "rs" | "ts" | "tsx" | "js" | "jsx" | "py" | "html" | "css" | "toml" | "yaml" | "yml" | "xml" | "srt" | "vtt")
}

fn is_allowed_image(path: &std::path::Path) -> bool {
  matches!(path.extension().and_then(|value| value.to_str()).unwrap_or("").to_ascii_lowercase().as_str(), "png" | "jpg" | "jpeg" | "webp")
}

fn is_allowed_video(path: &std::path::Path) -> bool {
  matches!(path.extension().and_then(|value| value.to_str()).unwrap_or("").to_ascii_lowercase().as_str(), "mp4" | "mov" | "mkv" | "webm" | "avi")
}

async fn ollama_vision(image_path: &std::path::Path, prompt: &str) -> Result<String, String> {
  let metadata = fs::metadata(image_path).map_err(|_| "No se pudo leer la imagen local.")?;
  if metadata.len() > 12 * 1024 * 1024 { return Err("La imagen supera el limite local de 12 MB.".into()); }
  let bytes = fs::read(image_path).map_err(|_| "No se pudo abrir la imagen local.")?;
  let encoded = general_purpose::STANDARD.encode(bytes);
  let model = env::var("HERRAMIENTAS_VISION_MODEL").unwrap_or_else(|_| "llava:7b-v1.6-mistral-q4_K_M".into());
  let payload = serde_json::json!({ "model": model, "prompt": prompt, "images": [encoded], "stream": false });
  let client = reqwest::Client::builder().build().map_err(|_| "No se pudo preparar Ollama local.")?;
  let response = client.post("http://127.0.0.1:11434/api/generate").json(&payload).send().await.map_err(|_| "No se pudo contactar Ollama en 127.0.0.1:11434.")?;
  if !response.status().is_success() { return Err(format!("Ollama rechazo el analisis de imagen (estado {}).", response.status())); }
  let body = response.json::<serde_json::Value>().await.map_err(|_| "Ollama no devolvio JSON valido.")?;
  Ok(body.get("response").and_then(|value| value.as_str()).unwrap_or("").trim().to_string())
}

async fn analyze_link_source(source: &str) -> Result<SourceAnalysis, String> {
  let url = reqwest::Url::parse(source.trim()).map_err(|_| "Escribe una URL http o https valida.")?;
  if !matches!(url.scheme(), "http" | "https") { return Err("Solo se aceptan links http o https.".into()); }
  let client = reqwest::Client::builder().redirect(reqwest::redirect::Policy::limited(5)).build().map_err(|_| "No se pudo preparar el extractor local de links.")?;
  let response = client.get(url.clone()).send().await.map_err(|_| "No se pudo descargar el link desde este equipo.")?;
  if !response.status().is_success() { return Err(format!("El sitio respondio con estado {}.", response.status())); }
  if response.content_length().unwrap_or(0) > 2_000_000 { return Err("La pagina supera el limite local de 2 MB.".into()); }
  let html = response.text().await.map_err(|_| "No se pudo leer el contenido del link.")?;
  let text = compact_text(&strip_html(&html), 60_000);
  if text.chars().count() < 40 { return Err("No se encontro suficiente texto legible en el link.".into()); }
  Ok(SourceAnalysis { kind: "link".into(), text, source_label: url.to_string(), used_local_ai: false, notes: vec!["HTML descargado y limpiado localmente.".into()] })
}

fn analyze_file_source(source: &str) -> Result<SourceAnalysis, String> {
  let path = PathBuf::from(source.trim().trim_matches('"'));
  if !path.is_file() { return Err("Indica la ruta completa de un archivo local existente.".into()); }
  if !is_allowed_text_file(&path) { return Err("Este tipo de archivo aun no esta permitido. Usa txt, md, csv, json, html, codigo, srt o vtt.".into()); }
  let metadata = fs::metadata(&path).map_err(|_| "No se pudo leer el archivo local.")?;
  if metadata.len() > 2 * 1024 * 1024 { return Err("El archivo supera el limite local de 2 MB.".into()); }
  let content = fs::read_to_string(&path).map_err(|_| "El archivo no parece ser texto UTF-8 compatible.")?;
  let transcript = looks_like_transcript(&content, Some(&path));
  let text = if transcript { parse_transcript_text(&content) } else { compact_text(&content, 60_000) };
  if text.chars().count() < 40 { return Err("El archivo no contiene suficiente texto para resumir.".into()); }
  let note = if transcript { "Transcripcion VTT/SRT parseada localmente." } else { "Archivo de texto leido localmente." };
  Ok(SourceAnalysis { kind: "file".into(), text, source_label: path.to_string_lossy().to_string(), used_local_ai: false, notes: vec![note.into()] })
}

async fn analyze_image_source(source: &str) -> Result<SourceAnalysis, String> {
  let path = PathBuf::from(source.trim().trim_matches('"'));
  if !path.is_file() { return Err("Indica la ruta completa de una imagen local existente.".into()); }
  if !is_allowed_image(&path) { return Err("Usa una imagen png, jpg, jpeg o webp.".into()); }
  let prompt = "Describe esta imagen con detalle para crear un resumen academico en Markdown. Identifica texto visible, diagramas, ideas principales y elementos importantes. Responde en espanol claro.";
  let text = ollama_vision(&path, prompt).await?;
  if text.chars().count() < 40 { return Err("El modelo de vision no devolvio suficiente contenido.".into()); }
  Ok(SourceAnalysis { kind: "image".into(), text, source_label: path.to_string_lossy().to_string(), used_local_ai: true, notes: vec!["Imagen analizada localmente con Ollama vision.".into()] })
}

fn whisper_binary() -> String {
  env::var("HERRAMIENTAS_WHISPER_BIN").unwrap_or_else(|_| "whisper-cli".into())
}

fn transcribe_video_audio(path: &std::path::Path, work_dir: &std::path::Path) -> Result<Option<String>, String> {
  let model = match env::var("HERRAMIENTAS_WHISPER_MODEL") {
    Ok(value) if !value.trim().is_empty() => value,
    _ => return Ok(None),
  };
  let audio_path = work_dir.join("audio.wav");
  let extracted = Command::new("ffmpeg")
    .args(["-y", "-i"])
    .arg(path)
    .args(["-vn", "-ac", "1", "-ar", "16000"])
    .arg(&audio_path)
    .output()
    .map_err(|_| "No se encontro ffmpeg. Instala ffmpeg para extraer audio localmente.")?;
  if !extracted.status.success() { return Ok(None); }
  let output_base = work_dir.join("whisper-transcript");
  let output = Command::new(whisper_binary())
    .args(["-m"])
    .arg(model)
    .args(["-f"])
    .arg(&audio_path)
    .args(["-otxt", "-of"])
    .arg(&output_base)
    .output()
    .map_err(|_| "No se pudo ejecutar Whisper local. Configura HERRAMIENTAS_WHISPER_BIN o instala whisper-cli.")?;
  if !output.status.success() { return Ok(None); }
  let txt_path = output_base.with_extension("txt");
  let transcript = fs::read_to_string(&txt_path).unwrap_or_else(|_| String::from_utf8_lossy(&output.stdout).to_string());
  let cleaned = compact_text(&transcript, 60_000);
  if cleaned.chars().count() < 40 { return Ok(None); }
  Ok(Some(cleaned))
}

async fn analyze_video_source(source: &str) -> Result<SourceAnalysis, String> {
  let path = PathBuf::from(source.trim().trim_matches('"'));
  if !path.is_file() { return Err("Indica la ruta completa de un video local existente.".into()); }
  if !is_allowed_video(&path) { return Err("Usa un video mp4, mov, mkv, webm o avi.".into()); }
  let work_dir = env::temp_dir().join(format!("herramientas-video-{}", now()));
  fs::create_dir_all(&work_dir).map_err(|_| "No se pudo crear una carpeta temporal para analizar el video.")?;
  let mut sections = Vec::new();
  let mut notes = Vec::new();
  match transcribe_video_audio(&path, &work_dir) {
    Ok(Some(transcript)) => { sections.push(format!("Transcripcion de audio:\n{}", transcript)); notes.push("Audio transcrito localmente con Whisper.".into()); },
    Ok(None) => notes.push("Whisper no devolvio transcripcion; se usaron fotogramas como respaldo.".into()),
    Err(reason) => notes.push(format!("Whisper no estuvo disponible: {}", reason)),
  }
  let pattern = work_dir.join("frame_%03d.jpg");
  let output = Command::new("ffmpeg")
    .args(["-y", "-i"])
    .arg(&path)
    .args(["-vf", "fps=1/60", "-frames:v", "4"])
    .arg(&pattern)
    .output()
    .map_err(|_| "No se encontro ffmpeg. Instala ffmpeg para analizar videos localmente.")?;
  if output.status.success() {
    let mut descriptions = Vec::new();
    let frames = fs::read_dir(&work_dir).map_err(|_| "No se pudieron leer los fotogramas temporales.")?;
    for frame in frames.flatten().take(4) {
      let frame_path = frame.path();
      if frame_path.is_file() && frame_path.extension().and_then(|value| value.to_str()).is_some_and(|ext| ext.eq_ignore_ascii_case("jpg")) {
        let prompt = "Describe este fotograma para resumir el video. Menciona texto visible, contexto, acciones e ideas relevantes. Responde en espanol claro.";
        if let Ok(description) = ollama_vision(&frame_path, prompt).await {
          descriptions.push(format!("Fotograma {}: {}", descriptions.len() + 1, description));
        }
      }
    }
    if !descriptions.is_empty() {
      sections.push(descriptions.join("\n\n"));
      notes.push("Fotogramas analizados localmente con ffmpeg y Ollama vision.".into());
    }
  }
  let _ = fs::remove_dir_all(&work_dir);
  if sections.is_empty() { return Err("No se pudo extraer audio ni analizar fotogramas. Configura Whisper/Ollama vision o usa una transcripcion VTT/SRT.".into()); }
  Ok(SourceAnalysis { kind: "video".into(), text: sections.join("\n\n"), source_label: path.to_string_lossy().to_string(), used_local_ai: true, notes })
}
#[tauri::command]
async fn analyze_source(kind: String, source: String, state: State<'_, Mutex<AuthState>>) -> Result<SourceAnalysis, String> {
  {
    let mut auth = state.lock().map_err(|_| "No se pudo acceder a la sesion local.")?;
    require_active_session(&mut auth)?;
  }
  match kind.as_str() {
    "text" => { let transcript = looks_like_transcript(&source, None); Ok(SourceAnalysis { kind, text: if transcript { parse_transcript_text(&source) } else { compact_text(&source, 60_000) }, source_label: if transcript { "Transcripcion pegada".into() } else { "Texto pegado".into() }, used_local_ai: false, notes: vec![if transcript { "Transcripcion pegada parseada localmente.".into() } else { "Texto recibido directamente.".into() }] }) },
    "link" => analyze_link_source(&source).await,
    "file" => analyze_file_source(&source),
    "image" => analyze_image_source(&source).await,
    "video" => analyze_video_source(&source).await,
    _ => Err("Tipo de fuente no compatible.".into()),
  }
}
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SummaryResult {
  markdown: String,
  key_points: Vec<String>,
  source_characters: usize,
}

fn split_summary_chunks(text: &str, max_chars: usize) -> Vec<String> {
  let normalized = compact_text(text, 90_000);
  if normalized.chars().count() <= max_chars { return vec![normalized]; }
  let mut chunks = Vec::new();
  let mut current = String::new();
  for sentence in normalized.split_inclusive(['.', '!', '?']) {
    if current.chars().count() + sentence.chars().count() > max_chars && !current.trim().is_empty() {
      chunks.push(current.trim().to_string());
      current.clear();
    }
    current.push_str(sentence.trim());
    current.push(' ');
  }
  if !current.trim().is_empty() { chunks.push(current.trim().to_string()); }
  chunks.into_iter().take(24).collect()
}

async fn ollama_text_generate(prompt: &str) -> Result<String, String> {
  let endpoint = env::var("HERRAMIENTAS_OLLAMA_ENDPOINT").unwrap_or_else(|_| "http://127.0.0.1:11434".into());
  let model = env::var("HERRAMIENTAS_TEXT_MODEL").unwrap_or_else(|_| "qwen2.5:3b-instruct-q4_K_M".into());
  let payload = serde_json::json!({ "model": model, "prompt": prompt, "stream": true, "options": { "num_ctx": 4096, "temperature": 0.2 } });
  let client = reqwest::Client::builder().build().map_err(|_| "No se pudo preparar Ollama local.")?;
  let response = client.post(format!("{}/api/generate", endpoint)).json(&payload).send().await.map_err(|_| "No se pudo contactar Ollama en 127.0.0.1:11434.")?;
  if !response.status().is_success() { return Err(format!("Ollama rechazo el resumen (estado {}).", response.status())); }
  let body = response.text().await.map_err(|_| "Ollama no devolvio texto valido.")?;
  let mut output = String::new();
  for line in body.lines() {
    if line.trim().is_empty() { continue; }
    if let Ok(value) = serde_json::from_str::<serde_json::Value>(line) {
      if let Some(part) = value.get("response").and_then(|item| item.as_str()) { output.push_str(part); }
    }
  }
  let cleaned = output.trim().to_string();
  if cleaned.chars().count() < 40 { return Err("Ollama devolvio un resumen demasiado corto.".into()); }
  Ok(cleaned)
}

fn fallback_summary(text: &str, title: &str, note: Option<String>) -> Result<SummaryResult, String> {
  let normalized = compact_text(text, 90_000);
  if normalized.chars().count() < 40 { return Err("Incluye al menos 40 caracteres para generar un resumen util.".into()); }
  let points = normalized.split(['.', '!', '?', '\n']).map(str::trim).filter(|sentence| sentence.chars().count() >= 20).take(8).map(|sentence| sentence.to_string()).collect::<Vec<_>>();
  if points.is_empty() { return Err("No se encontraron ideas completas para resumir.".into()); }
  let note_title = if title.trim().is_empty() { "Resumen academico" } else { title.trim() };
  let bullets = points.iter().map(|point| format!("- {}", point)).collect::<Vec<_>>().join("\n");
  let note_block = note.map(|value| format!("\n\n## Nota tecnica\n\n{}", value)).unwrap_or_default();
  Ok(SummaryResult { markdown: format!("# {}\n\n## Resumen\n\n{}\n\n## Ideas clave\n\n{}\n\n## Proximos pasos\n\n- Revisar y completar esta nota antes de guardarla en Obsidian.{}", note_title, points.iter().take(3).cloned().collect::<Vec<_>>().join(". "), bullets, note_block), key_points: points, source_characters: normalized.chars().count() })
}

async fn build_summary(text: &str, title: &str) -> Result<SummaryResult, String> {
  let normalized = compact_text(text, 90_000);
  if normalized.chars().count() < 40 { return Err("Incluye al menos 40 caracteres para generar un resumen util.".into()); }
  let note_title = if title.trim().is_empty() { "Resumen academico" } else { title.trim() };
  let result = async {
    let chunks = split_summary_chunks(&normalized, 3600);
    let mut partials = Vec::new();
    for (index, chunk) in chunks.iter().enumerate() {
      let prompt = format!("Resume este bloque de una clase o fuente academica en espanol. Conserva conceptos, pasos, ejemplos y dudas. Devuelve bullets claros.\n\nBloque {}/{}:\n{}", index + 1, chunks.len(), chunk);
      partials.push(ollama_text_generate(&prompt).await?);
    }
    let reduce_prompt = format!("Crea una nota Markdown para Obsidian titulada \"{}\" usando estos resumenes parciales. Usa secciones: Resumen, Ideas clave, Conceptos, Pasos o procedimiento, Dudas para repasar, Acciones sugeridas. No inventes datos.\n\n{}", note_title, partials.join("\n\n---\n\n"));
    let markdown = ollama_text_generate(&reduce_prompt).await?;
    let key_points = markdown.lines().map(|line| line.trim_start_matches(['#', '-', '*', ' ']).trim().to_string()).filter(|line| line.chars().count() >= 20).take(8).collect::<Vec<_>>();
    Ok::<SummaryResult, String>(SummaryResult { markdown, key_points: if key_points.is_empty() { partials.iter().take(6).cloned().collect() } else { key_points }, source_characters: normalized.chars().count() })
  }.await;
  match result {
    Ok(summary) => Ok(summary),
    Err(reason) => fallback_summary(&normalized, note_title, Some(format!("Ollama local no estuvo disponible para map-reduce streaming; se uso resumen extractivo local. Detalle: {}", reason))),
  }
}

#[tauri::command]
async fn summarize_text(text: String, title: String, state: State<'_, Mutex<AuthState>>) -> Result<SummaryResult, String> {
  {
    let mut auth = state.lock().map_err(|_| "No se pudo acceder a la sesion local.")?;
    require_active_session(&mut auth)?;
  }
  build_summary(&text, &title).await
}
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ObsidianStatus {
  configured: bool,
  endpoint: &'static str,
  vault_hint: &'static str,
}

const OBSIDIAN_ENDPOINT: &str = "https://127.0.0.1:27124";
const OBSIDIAN_KEYRING_SERVICE: &str = "Herramientas";
const OBSIDIAN_KEYRING_USER: &str = "obsidian-local-rest-api";

fn obsidian_entry() -> Result<Entry, String> {
  Entry::new(OBSIDIAN_KEYRING_SERVICE, OBSIDIAN_KEYRING_USER).map_err(|_| "No se pudo acceder al Administrador de credenciales de Windows.".into())
}

fn obsidian_status() -> ObsidianStatus {
  let configured = obsidian_entry().and_then(|entry| entry.get_password().map_err(|_| "No hay clave configurada.".into())).map(|key| !key.trim().is_empty()).unwrap_or(false);
  ObsidianStatus { configured, endpoint: OBSIDIAN_ENDPOINT, vault_hint: "La boveda que tenga habilitado Local REST API" }
}

fn validate_note_path(path: &str) -> Result<String, String> {
  let normalized = path.replace('\\', "/").trim_matches('/').to_string();
  if normalized.is_empty() || !normalized.ends_with(".md") || normalized.contains("..") || normalized.starts_with('/') {
    return Err("Indica una ruta Markdown valida dentro de la boveda, por ejemplo Resumenes/Clase 1.md.".into());
  }
  Ok(normalized)
}

#[tauri::command]
fn get_obsidian_status(state: State<'_, Mutex<AuthState>>) -> Result<ObsidianStatus, String> {
  let mut auth = state.lock().map_err(|_| "No se pudo acceder a la sesion local.")?;
  require_active_session(&mut auth)?;
  Ok(obsidian_status())
}

#[tauri::command]
fn configure_obsidian(api_key: String, state: State<'_, Mutex<AuthState>>) -> Result<ObsidianStatus, String> {
  {
    let mut auth = state.lock().map_err(|_| "No se pudo acceder a la sesion local.")?;
    require_active_session(&mut auth)?;
  }
  if api_key.trim().len() < 16 { return Err("La clave de la API de Obsidian no parece valida.".into()); }
  let entry = obsidian_entry()?;
  entry.set_password(api_key.trim()).map_err(|_| "No se pudo guardar la clave en el Administrador de credenciales de Windows.")?;
  Ok(obsidian_status())
}

#[tauri::command]
async fn test_obsidian_connection(state: State<'_, Mutex<AuthState>>) -> Result<ObsidianStatus, String> {
  {
    let mut auth = state.lock().map_err(|_| "No se pudo acceder a la sesion local.")?;
    require_active_session(&mut auth)?;
  }
  let api_key = obsidian_entry()?.get_password().map_err(|_| "Configura primero la API local de Obsidian.")?;
  let client = reqwest::Client::builder().danger_accept_invalid_certs(true).build().map_err(|_| "No se pudo crear la conexion local con Obsidian.")?;
  let response = client.get(format!("{}/vault/", OBSIDIAN_ENDPOINT)).header("Authorization", format!("Bearer {}", api_key)).send().await.map_err(|_| "No se pudo contactar Obsidian. Abre Obsidian y activa Local REST API with MCP.")?;
  if response.status().is_success() { Ok(obsidian_status()) }
  else if response.status().as_u16() == 401 { Err("La clave fue rechazada por Obsidian (401). Copia el valor API Key de esta misma boveda y vuelve a intentarlo.".into()) }
  else { Err(format!("Obsidian no respondio correctamente (estado {}).", response.status())) }
}
#[tauri::command]
async fn save_to_obsidian(note_path: String, markdown: String, state: State<'_, Mutex<AuthState>>) -> Result<(), String> {
  {
    let mut auth = state.lock().map_err(|_| "No se pudo acceder a la sesion local.")?;
    require_active_session(&mut auth)?;
  }
  let path = validate_note_path(&note_path)?;
  let api_key = obsidian_entry()?.get_password().map_err(|_| "Configura primero la API local de Obsidian.")?;
  let client = reqwest::Client::builder().danger_accept_invalid_certs(true).build().map_err(|_| "No se pudo crear la conexion local con Obsidian.")?;
  let response = client.put(format!("{}/vault/{}", OBSIDIAN_ENDPOINT, path)).header("Authorization", format!("Bearer {}", api_key)).header("Content-Type", "text/markdown; charset=utf-8").body(markdown).send().await.map_err(|_| "No se pudo contactar Obsidian. Abrelo, recarga el complemento Local REST API y confirma que la API local este activa.")?;
  if response.status().is_success() { Ok(()) } else { Err(format!("Obsidian rechazo el guardado (estado {}). Revisa que la clave pertenezca a esta boveda.", response.status())) }
}
fn format_summary_for_heading(markdown: &str, base_level: u8) -> Result<String, String> {
  if !(1..=4).contains(&base_level) { return Err("Elige un nivel de titulo entre # y ####.".into()); }
  Ok(markdown.lines().map(|line| {
    let hashes = line.chars().take_while(|character| *character == '#').count();
    if hashes > 0 && line.as_bytes().get(hashes) == Some(&b' ') {
      let level = (hashes as u8 + base_level - 1).min(6) as usize;
      format!("{}{}", "#".repeat(level), &line[hashes..])
    } else { line.to_string() }
  }).collect::<Vec<_>>().join("\n"))
}

#[tauri::command]
async fn append_to_obsidian(note_path: String, markdown: String, heading_level: u8, state: State<'_, Mutex<AuthState>>) -> Result<(), String> {
  {
    let mut auth = state.lock().map_err(|_| "No se pudo acceder a la sesion local.")?;
    require_active_session(&mut auth)?;
  }
  let path = validate_note_path(&note_path)?;
  let formatted = format_summary_for_heading(&markdown, heading_level)?;
  let api_key = obsidian_entry()?.get_password().map_err(|_| "Configura primero la API local de Obsidian.")?;
  let client = reqwest::Client::builder().danger_accept_invalid_certs(true).build().map_err(|_| "No se pudo crear la conexion local con Obsidian.")?;
  let url = format!("{}/vault/{}", OBSIDIAN_ENDPOINT, path);
  let existing = client.get(&url).header("Authorization", format!("Bearer {}", api_key)).send().await.map_err(|_| "No se pudo leer la nota existente. Abre Obsidian y verifica la conexion local.")?;
  if !existing.status().is_success() { return Err(format!("No se pudo abrir la nota existente (estado {}).", existing.status())); }
  let current = existing.text().await.map_err(|_| "No se pudo leer el contenido de la nota existente.")?;
  let content = format!("{}\n\n{}\n", current.trim_end(), formatted.trim());
  let saved = client.put(&url).header("Authorization", format!("Bearer {}", api_key)).header("Content-Type", "text/markdown; charset=utf-8").body(content).send().await.map_err(|_| "No se pudo agregar el resumen a la nota existente.")?;
  if saved.status().is_success() { Ok(()) } else { Err(format!("Obsidian rechazo la actualizacion (estado {}).", saved.status())) }
}
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct LocalAiProfile {
  role: &'static str,
  model: &'static str,
  context: u32,
  device: &'static str,
  note: &'static str,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct LocalAiStatus {
  available: bool,
  endpoint: &'static str,
  hardware: &'static str,
  models: Vec<String>,
  profiles: Vec<LocalAiProfile>,
}

fn local_ai_profiles() -> Vec<LocalAiProfile> {
  vec![
    LocalAiProfile { role: "Resumen y tutoria", model: "qwen2.5:3b-instruct-q4_K_M", context: 4096, device: "GTX 1650 Ti Max-Q", note: "Modelo principal ligero para resumen, ingles, tecnologia y prompts; 7B cuantizado queda como opcion si hay memoria suficiente." },
    LocalAiProfile { role: "Vision local", model: "llava:7b-v1.6-mistral-q4_K_M", context: 4096, device: "GTX 1650 Ti Max-Q / CPU fallback", note: "Para imagenes sueltas; si falta VRAM, usar un modelo de vision 2B/4B cuantizado." },
    LocalAiProfile { role: "Video local", model: "whisper.cpp base/small + fotogramas", context: 0, device: "CPU/GPU local", note: "Transcribe audio y extrae fotogramas antes de resumir con el modelo principal." },
  ]
}

#[tauri::command]
async fn get_local_ai_status() -> Result<LocalAiStatus, String> {
  let endpoint = "http://127.0.0.1:11434";
  let client = reqwest::Client::builder().build().map_err(|_| "No se pudo preparar la conexion local con Ollama.")?;
  let response = client.get(format!("{}/api/tags", endpoint)).send().await;
  let mut models = Vec::new();
  let available = match response {
    Ok(value) if value.status().is_success() => {
      if let Ok(body) = value.json::<serde_json::Value>().await {
        if let Some(items) = body.get("models").and_then(|value| value.as_array()) {
          models = items.iter().filter_map(|item| item.get("name").and_then(|name| name.as_str()).map(str::to_string)).collect();
        }
      }
      true
    },
    _ => false,
  };
  Ok(LocalAiStatus { available, endpoint, hardware: "NVIDIA GTX 1650 Ti Max-Q 4 GB + Intel Iris Xe 1 GB", models, profiles: local_ai_profiles() })
}
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ObsStatus {
  installed: bool,
  path: Option<String>,
}

fn obs_executable() -> Option<PathBuf> {
  let candidates = [
    env::var("PROGRAMFILES").ok().map(|directory| PathBuf::from(directory).join("obs-studio").join("bin").join("64bit").join("obs64.exe")),
    env::var("PROGRAMFILES(X86)").ok().map(|directory| PathBuf::from(directory).join("obs-studio").join("bin").join("64bit").join("obs64.exe")),
    Some(PathBuf::from(r"C:\Program Files\obs-studio\bin\64bit\obs64.exe")),
  ];
  candidates.into_iter().flatten().find(|candidate| candidate.is_file())
}

#[tauri::command]
fn get_obs_status(state: State<'_, Mutex<AuthState>>) -> Result<ObsStatus, String> {
  let mut auth = state.lock().map_err(|_| "No se pudo acceder a la sesion local.")?;
  require_active_session(&mut auth)?;
  let path = obs_executable();
  Ok(ObsStatus { installed: path.is_some(), path: path.map(|value| value.to_string_lossy().to_string()) })
}

#[tauri::command]
fn launch_obs_studio(class_title: String, output_folder: String, state: State<'_, Mutex<AuthState>>) -> Result<(), String> {
  let mut auth = state.lock().map_err(|_| "No se pudo acceder a la sesion local.")?;
  require_active_session(&mut auth)?;
  if class_title.trim().is_empty() { return Err("Indica el nombre de la clase antes de abrir OBS Studio.".into()); }
  let folder = PathBuf::from(output_folder.trim());
  if !folder.is_dir() { return Err("La carpeta de grabacion no existe. Elige una carpeta existente.".into()); }
  let executable = obs_executable().ok_or("No se encontro OBS Studio. Instalalo antes de usar este flujo.")?;
  Command::new(executable).spawn().map_err(|_| "No se pudo iniciar OBS Studio.")?;
  Ok(())
}
#[tauri::command]
fn auth_status(state: State<'_, Mutex<AuthState>>) -> Result<AuthStatus, String> {
  let mut state = state.lock().map_err(|_| "No se pudo acceder a la sesion local.")?;
  Ok(status(&mut state))
}

#[tauri::command]
fn auth_configure(access_code: String, state: State<'_, Mutex<AuthState>>) -> Result<AuthStatus, String> {
  if access_code.chars().count() < 8 { return Err("El codigo debe tener al menos 8 caracteres.".into()); }
  let mut state = state.lock().map_err(|_| "No se pudo acceder a la sesion local.")?;
  if state.access_code_hash.is_some() { return Err("El codigo de acceso ya fue configurado.".into()); }
  state.access_code_hash = Some(hash(access_code, DEFAULT_COST).map_err(|_| "No se pudo proteger el codigo de acceso.")?);
  save_config(&state)?;
  let current = now();
  state.session = Some(Session { last_activity_at: current, expires_at: current + SESSION_TTL_MS, paused: false });
  Ok(status(&mut state))
}

#[tauri::command]
fn auth_login(access_code: String, state: State<'_, Mutex<AuthState>>) -> Result<AuthStatus, String> {
  let mut state = state.lock().map_err(|_| "No se pudo acceder a la sesion local.")?;
  let current = now();
  if state.access_code_hash.is_none() { return Err("ACCESS_NOT_CONFIGURED".into()); }
  if state.locked_until.is_some_and(|until| current < until) { return Err("El acceso esta bloqueado temporalmente. Intentalo mas tarde.".into()); }
  let matches = verify(access_code, state.access_code_hash.as_ref().unwrap()).unwrap_or(false);
  if !matches {
    state.failures += 1;
    if state.failures >= MAX_ATTEMPTS { state.locked_until = Some(current + LOCKOUT_MS); }
    return Err("El codigo de acceso no es valido.".into());
  }
  state.failures = 0;
  state.locked_until = None;
  state.session = Some(Session { last_activity_at: current, expires_at: current + SESSION_TTL_MS, paused: false });
  Ok(status(&mut state))
}

#[tauri::command]
fn auth_pause(state: State<'_, Mutex<AuthState>>) -> Result<AuthStatus, String> {
  let mut state = state.lock().map_err(|_| "No se pudo acceder a la sesion local.")?;
  require_active_session(&mut state)?;
  if let Some(session) = &mut state.session { session.paused = true; }
  Ok(status(&mut state))
}

#[tauri::command]
fn auth_resume(state: State<'_, Mutex<AuthState>>) -> Result<AuthStatus, String> {
  let mut state = state.lock().map_err(|_| "No se pudo acceder a la sesion local.")?;
  require_valid_session(&mut state)?;
  if let Some(session) = &mut state.session { session.paused = false; session.last_activity_at = now(); }
  Ok(status(&mut state))
}

#[tauri::command]
fn auth_activity(state: State<'_, Mutex<AuthState>>) -> Result<AuthStatus, String> {
  let mut state = state.lock().map_err(|_| "No se pudo acceder a la sesion local.")?;
  require_active_session(&mut state)?;
  if let Some(session) = &mut state.session { if !session.paused { session.last_activity_at = now(); } }
  Ok(status(&mut state))
}

#[tauri::command]
fn auth_logout(state: State<'_, Mutex<AuthState>>) -> Result<(), String> {
  let mut state = state.lock().map_err(|_| "No se pudo acceder a la sesion local.")?;
  state.session = None;
  Ok(())
}

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let data_dir = app.path().app_data_dir().map_err(|_| "No se pudo localizar el directorio de datos.")?;
      fs::create_dir_all(&data_dir).map_err(|_| "No se pudo crear el directorio de datos.")?;
      let config_path = data_dir.join("auth.json");
      let config = fs::read(&config_path).ok().and_then(|bytes| serde_json::from_slice::<AuthConfig>(&bytes).ok()).unwrap_or_default();
      app.manage(Mutex::new(AuthState { access_code_hash: config.access_code_hash, session: None, failures: 0, locked_until: None, config_path }));
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![auth_status, auth_configure, auth_login, auth_pause, auth_resume, auth_activity, auth_logout, summarize_text, get_obsidian_status, configure_obsidian, test_obsidian_connection, save_to_obsidian, append_to_obsidian, get_obs_status, launch_obs_studio, get_local_ai_status, analyze_source])
    .run(tauri::generate_context!())
    .expect("error al ejecutar Herramientas");
}









