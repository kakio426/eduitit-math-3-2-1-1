import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const LESSONS = [
  "3-2-1-1-mathmon-box-run",
  "3-2-1-2-mathmon-rocket-charge",
  "3-2-1-3-mathmon-jump-islands",
];
const MAX_DURATION_MS = 1500;
const MAX_BYTES = 250 * 1024;

function readWavDurationMs(buffer) {
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error("not a RIFF/WAVE file");
  }
  let offset = 12;
  let byteRate = 0;
  let dataBytes = 0;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const body = offset + 8;
    if (id === "fmt ") {
      byteRate = buffer.readUInt32LE(body + 8);
    }
    if (id === "data") {
      dataBytes = size;
    }
    offset = body + size + (size % 2);
  }
  if (!byteRate || !dataBytes) {
    throw new Error("missing fmt or data chunk");
  }
  return Math.round((dataBytes / byteRate) * 1000);
}

async function listWavFiles(directory) {
  try {
    const names = await readdir(directory);
    return names.filter((name) => name.endsWith(".wav")).sort();
  } catch (error) {
    throw new Error(`missing audio directory: ${directory}`);
  }
}

function extractAudioRefs(html) {
  return [...new Set([...html.matchAll(/assets\/audio\/[A-Za-z0-9._-]+\.wav/g)].map((match) => path.basename(match[0])))].sort();
}

async function checkWav(filePath) {
  const buffer = await readFile(filePath);
  const info = await stat(filePath);
  const durationMs = readWavDurationMs(buffer);
  if (durationMs > MAX_DURATION_MS) {
    throw new Error(`${filePath} is too long: ${durationMs}ms`);
  }
  if (info.size > MAX_BYTES) {
    throw new Error(`${filePath} is too large: ${info.size} bytes`);
  }
  return { durationMs, bytes: info.size };
}

async function checkLesson(lesson) {
  const indexPath = path.join(ROOT, lesson, "index.html");
  const audioDir = path.join(ROOT, lesson, "assets/audio");
  const html = await readFile(indexPath, "utf8");
  const refs = extractAudioRefs(html);
  if (!refs.length) {
    throw new Error(`${lesson} does not reference any audio assets`);
  }
  const files = await listWavFiles(audioDir);
  const missing = refs.filter((name) => !files.includes(name));
  const extra = files.filter((name) => !refs.includes(name));
  if (missing.length || extra.length) {
    throw new Error(`${lesson} audio mismatch: missing=${missing.join(",") || "-"} extra=${extra.join(",") || "-"}`);
  }
  const checked = [];
  for (const name of refs) {
    checked.push({ name, ...(await checkWav(path.join(audioDir, name))) });
  }
  return { lesson, count: checked.length, checked };
}

async function checkSharedCatalog() {
  const catalogPath = path.join(ROOT, "_shared/audio/kenney/catalog.json");
  const usedDir = path.join(ROOT, "_shared/audio/kenney/used");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const files = await listWavFiles(usedDir);
  const referenced = [...new Set(catalog.map((item) => item.file))].sort();
  const missing = referenced.filter((name) => !files.includes(name));
  const extra = files.filter((name) => !referenced.includes(name));
  if (missing.length || extra.length) {
    throw new Error(`shared catalog mismatch: missing=${missing.join(",") || "-"} extra=${extra.join(",") || "-"}`);
  }
  for (const item of catalog) {
    await checkWav(path.join(usedDir, item.file));
    if (item.durationMs > MAX_DURATION_MS) {
      throw new Error(`catalog duration too long for ${item.cue}: ${item.durationMs}ms`);
    }
  }
  return { catalogEntries: catalog.length, files: files.length };
}

const shared = await checkSharedCatalog();
const lessons = [];
for (const lesson of LESSONS) {
  lessons.push(await checkLesson(lesson));
}
console.log(JSON.stringify({ ok: true, shared, lessons }, null, 2));
