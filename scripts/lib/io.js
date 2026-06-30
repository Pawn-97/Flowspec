import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export async function writeText(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, value.endsWith("\n") ? value : `${value}\n`);
}

export async function appendText(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, value.endsWith("\n") ? value : `${value}\n`);
}

export function resolveFromRoot(...parts) {
  return path.resolve(fileURLToPath(new URL("../..", import.meta.url)), ...parts);
}

export function parseOutArg(argv) {
  const index = argv.indexOf("--out");
  return index >= 0 ? argv[index + 1] : null;
}

export function parseNamedArg(argv, name) {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : null;
}

export function hasFlag(argv, name) {
  return argv.includes(name);
}

export function internalDir(flowSpecDir) {
  return path.join(flowSpecDir, "_internal");
}

export function handoffDir(flowSpecDir) {
  return path.join(flowSpecDir, "handoff");
}
