import { writeFile } from "node:fs/promises";
import path from "node:path";

import { ensureStorageRoots, safeSegment, stamp, uploadRoot } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    await ensureStorageRoots();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".txt")) {
      return Response.json({ error: "Only txt files are accepted" }, { status: 400 });
    }

    const targetPath = path.join(uploadRoot, `${stamp("ingest")}-${safeSegment(file.name)}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(targetPath, buffer);

    return Response.json({ tempPath: targetPath });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unexpected ingest error" },
      { status: 500 },
    );
  }
}

