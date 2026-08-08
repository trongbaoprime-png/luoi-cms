import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import PuckPageRenderer from "@/components/PuckPageRenderer";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await db.page.findUnique({ where: { slug } });
  if (!page) return {};
  return { title: page.seoTitle || page.title, description: page.seoDescription };
}

export default async function PuckPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Try to load Puck layout first
  const key = `puck_layout_${slug}`;
  const setting = await db.setting.findUnique({ where: { key } });

  if (setting?.value) {
    try {
      const data = JSON.parse(setting.value);
      return <PuckPageRenderer data={data} />;
    } catch {}
  }

  // Fallback: page not found
  return notFound();
}
