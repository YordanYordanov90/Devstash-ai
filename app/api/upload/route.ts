import { randomUUID } from "crypto";
import { authServer } from "@/lib/auth/server";
import { putR2Object } from "@/lib/r2/client";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, generateR2Key } from "@/lib/r2/config";

export const runtime = "nodejs";

/** Same-origin upload: avoids browser CORS to R2 (PUT to r2.cloudflarestorage.com). */
export async function POST(request: Request) {
  const session = await authServer.getSession();
  const userId = session.data?.user?.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file." }, { status: 400 });
  }

  let mimeType = file.type.trim();
  if (!mimeType) {
    return Response.json(
      { error: "File has no type; try another browser or rename the file." },
      { status: 400 }
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MIME_TYPES)[number])) {
    return Response.json({ error: `File type ${mimeType} is not allowed.` }, { status: 400 });
  }

  if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
    return Response.json({ error: "File size is not allowed." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = generateR2Key(userId, randomUUID(), file.name);

  try {
    await putR2Object(key, buffer, mimeType);
  } catch {
    return Response.json({ error: "Storage upload failed." }, { status: 502 });
  }

  return Response.json({ key, fileName: file.name, fileSize: file.size });
}
