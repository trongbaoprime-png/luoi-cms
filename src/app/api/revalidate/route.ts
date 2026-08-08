import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET || "revalidate-secret-123";
  const { searchParams } = new URL(req.url);

  if (searchParams.get("secret") !== secret) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const path = searchParams.get("path") || "/";

  try {
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, path, now: Date.now() });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Revalidation failed";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
