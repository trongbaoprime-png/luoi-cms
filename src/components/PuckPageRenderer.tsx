"use client";

import dynamic from "next/dynamic";

const PuckRender = dynamic(
  () => import("@puckeditor/core").then((m) => m.Render),
  { ssr: false }
);

import { getPuckConfig } from "@/lib/puck-config";

export default function PuckPageRenderer({ data }: { data: any }) {
  // Pass empty array for shortcodeOptions since fields are only used in Editor
  const config = getPuckConfig([]);

  return (
    <div className="min-h-screen">
      <PuckRender config={config} data={data} />
    </div>
  );
}
