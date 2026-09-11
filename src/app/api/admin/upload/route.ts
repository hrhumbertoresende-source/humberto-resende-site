import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { promises as fs } from "fs";
import path from "path";
import { list } from "@vercel/blob";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-auth";
import { slugify } from "@/lib/slug";
import { hasBlobStore, writeBlobFile } from "@/lib/blob-store";

async function requireSession() {
  const store = await cookies();
  return isValidSessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE = 15 * 1024 * 1024; // 15MB per file

export async function POST(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const form = await request.formData();
  const slugRaw = form.get("slug");
  if (typeof slugRaw !== "string" || !slugRaw) {
    return NextResponse.json({ error: "Slug do projeto é obrigatório" }, { status: 400 });
  }
  const slug = slugify(slugRaw);

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  }

  const localDir = path.join(process.cwd(), "public", "images", "humberto", "trabalhos", slug);
  const blobPrefix = `images/humberto/trabalhos/${slug}/`;

  // Photos already committed to the repo (local, static) and photos uploaded
  // through the admin in production (Blob) share one numbering sequence.
  const localExisting = await fs.readdir(localDir).catch(() => [] as string[]);
  let maxIndex = localExisting
    .map((f) => parseInt(f, 10))
    .filter((n) => Number.isFinite(n))
    .reduce((max, n) => Math.max(max, n), 0);

  if (hasBlobStore()) {
    const { blobs } = await list({ prefix: blobPrefix });
    const blobMax = blobs
      .map((b) => parseInt(path.basename(b.pathname), 10))
      .filter((n) => Number.isFinite(n))
      .reduce((max, n) => Math.max(max, n), 0);
    maxIndex = Math.max(maxIndex, blobMax);
  }

  let nextIndex = maxIndex + 1;
  const savedPaths: string[] = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: `Tipo de arquivo não suportado: ${file.type}` }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `Arquivo muito grande: ${file.name}` }, { status: 400 });
    }
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : file.type === "image/gif" ? "gif" : "jpg";
    const fileName = `${nextIndex}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    if (hasBlobStore()) {
      const { url } = await writeBlobFile(`${blobPrefix}${fileName}`, buffer, file.type);
      savedPaths.push(url);
    } else {
      await fs.mkdir(localDir, { recursive: true });
      await fs.writeFile(path.join(localDir, fileName), buffer);
      savedPaths.push(`/images/humberto/trabalhos/${slug}/${fileName}`);
    }
    nextIndex++;
  }

  return NextResponse.json({ ok: true, paths: savedPaths });
}
