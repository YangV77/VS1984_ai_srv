import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import JSZip from "jszip";

import { ensureStorageRoots, packRoot, stamp } from "@/lib/storage";

const packKeys = ["provider", "summary", "price", "termination"] as const;

type PackPayload = Record<(typeof packKeys)[number], string>;

export async function POST(request: Request) {
  try {
    await ensureStorageRoots();

    const body = (await request.json()) as Partial<PackPayload>;
    const descData = Object.fromEntries(packKeys.map((key) => [key, body[key] ?? ""]));

    const packageName = stamp("idx");
    const folderPath = path.join(packRoot, packageName);
    const descPath = path.join(folderPath, packageName);
    const zipPath = path.join(packRoot, `${packageName}.zip`);

    await mkdir(folderPath, { recursive: true });
    const descContent = JSON.stringify(descData, null, 2);
    await writeFile(descPath, descContent, "utf8");

    const zip = new JSZip();
    zip.folder(packageName)?.file("desc", descContent);
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    await writeFile(zipPath, zipBuffer);

    return Response.json({
      packageName,
      descPath,
      folderPath,
      zipPath,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unexpected pack error" },
      { status: 500 },
    );
  }
}

