import { NextRequest, NextResponse } from "next/server";
import { getAllExperiments, getExperiment, recordAbView, recordAbConversion } from "@/lib/ab-testing";

/**
 * LƯỜI BUSINESS OS — A/B Testing API
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const exp = getExperiment(slug);
      return NextResponse.json({ success: true, experiment: exp });
    }

    const all = getAllExperiments();
    return NextResponse.json({
      success: true,
      totalExperiments: all.length,
      experiments: all,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "A/B test fetch failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, event, variant } = body; // event: "view" | "conversion", variant: "A" | "B"

    if (!slug || !event || !variant) {
      return NextResponse.json({ error: "Thiếu thông tin slug, event hoặc variant" }, { status: 400 });
    }

    if (event === "view") {
      recordAbView(slug, variant);
    } else if (event === "conversion") {
      recordAbConversion(slug, variant);
    }

    return NextResponse.json({ success: true, message: `Đã ghi nhận ${event} cho Variant ${variant}` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "A/B test record failed" }, { status: 500 });
  }
}
