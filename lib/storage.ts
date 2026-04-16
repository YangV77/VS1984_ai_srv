import { mkdir } from "node:fs/promises";
import path from "node:path";

export const dataRoot = path.join(process.cwd(), "vs1984-data");
export const uploadRoot = path.join(dataRoot, "uploads");
export const packRoot = path.join(dataRoot, "packs");
export const embedRoot = path.join(dataRoot, "embeds");

export async function ensureStorageRoots() {
  await Promise.all([
    mkdir(dataRoot, { recursive: true }),
    mkdir(uploadRoot, { recursive: true }),
    mkdir(packRoot, { recursive: true }),
    mkdir(embedRoot, { recursive: true }),
  ]);
}

export function safeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function stamp(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
