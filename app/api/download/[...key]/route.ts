import { and, eq } from "drizzle-orm";
import { authServer } from "@/lib/auth/server";
import { db, schema } from "@/db";
import { getR2Object } from "@/lib/r2/client";

type RouteContext = { params: Promise<{ key: string[] }> };

export async function GET(request: Request, ctx: RouteContext) {
  const session = await authServer.getSession();
  const userId = session.data?.user?.id;
  if (!userId) {
    return new Response("Unauthorized.", { status: 401 });
  }

  const { key } = await ctx.params;
  const keyPath = key.join("/");

  const decodedKey = decodeURIComponent(keyPath);

  if (decodedKey.includes("..") || decodedKey.startsWith("/")) {
    return new Response("Invalid key.", { status: 400 });
  }

  const item = await db.query.items.findFirst({
    where: and(
      eq(schema.items.userId, userId),
      eq(schema.items.fileUrl, decodedKey)
    ),
    columns: {
      id: true,
      fileName: true,
    },
  });

  if (!item) {
    return new Response("File not found.", { status: 404 });
  }

  try {
    const r2Response = await getR2Object(decodedKey);

    const fileName = (item.fileName ?? "download").replace(/[\r\n"]/g, "_");
    const contentDisposition = `attachment; filename="${fileName}"`;

    const stream = r2Response.Body;

    if (!stream) {
      return new Response("File is empty.", { status: 500 });
    }

    const headers = new Headers();
    headers.set("Content-Disposition", contentDisposition);
    if (r2Response.ContentType) {
      headers.set("Content-Type", r2Response.ContentType);
    }
    if (r2Response.ContentLength) {
      headers.set("Content-Length", r2Response.ContentLength.toString());
    }

    return new Response(stream as ReadableStream, { headers });
  } catch {
    return new Response("Failed to fetch file.", { status: 500 });
  }
}
