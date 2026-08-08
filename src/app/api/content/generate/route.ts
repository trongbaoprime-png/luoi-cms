import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { AIGenerateSchema } from "@/lib/validation";
import { generateArticleSchema } from "@/lib/seo";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = AIGenerateSchema.parse(body);

    const apiKey = process.env.GEMINI_API_KEY;
    const topic = validated.topic;

    let content = "";
    let title = `Hướng Dẫn Mẹo Dọn Nhà: ${topic}`;
    let summary = `Tổng hợp các giải pháp & mẹo hay nhất giúp bạn ${topic} nhanh chóng, tối ưu thời gian cho người lười.`;

    if (apiKey) {
      // Call Gemini API
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Bạn là chuyên gia viết bài blog chuẩn SEO cho thương hiệu 'Lười Dọn Nhà' (slogan: Nhà vẫn gọn, dù bạn rất lười). Hãy viết bài viết chi tiết theo chuẩn HTML khoảng 800-1200 từ về chủ đề: '${topic}'. Bắt đầu với tiêu đề hấp dẫn H1, các mục H2, H3, danh sách đầu dòng, các lời khuyên thiết thực và gợi ý sản phẩm tiện ích.`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        const geminiData = await geminiRes.json();
        const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          content = rawText;
        }
      } catch (err) {
        console.warn("[AI Generate Fallback]: Gemini API call failed, using template fallback.", err);
      }
    }

    // Fallback template if Gemini API key not present or failed
    if (!content) {
      content = `
        <h1>${title}</h1>
        <p class="lead">${summary}</p>
        <h2>1. Nguyên tắc tối ưu thời gian dọn dẹp</h2>
        <p>Đối với người bận rộn hoặc ít thời gian, việc chia nhỏ khu vực dọn dẹp theo ngày là giải pháp tối ưu nhất. Không nên dọn dẹp dồn dập vào cuối tuần.</p>
        <h2>2. Sử dụng các thiết bị thông minh hỗ trợ</h2>
        <ul>
          <li>Cây lau nhà tự vắt 360 độ</li>
          <li>Robot hút bụi lau nhà tự động</li>
          <li>Chai xịt tẩy rửa đa năng chuyên dụng</li>
        </ul>
        <h2>3. Lời khuyên từ Lười Dọn Nhà</h2>
        <p>Giữ thói quen đặt đồ vật về đúng vị trí ngay sau khi sử dụng sẽ giúp bạn tiết kiệm đến 80% thời gian dọn dẹp hàng tuần.</p>
      `;
    }

    const slug = topic
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-") + `-${Date.now().toString().slice(-4)}`;

    const schemaJson = JSON.stringify(
      generateArticleSchema({
        title,
        description: summary,
        url: `https://luoidonnha.com/${slug}`,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );

    const newPost = await db.post.create({
      data: {
        title,
        slug,
        summary,
        content,
        seoTitle: `${title} - Lười Dọn Nhà`,
        seoDescription: summary,
        schemaJson,
        status: "PUBLISHED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tự động tạo và xuất bản bài viết AI thành công!",
      data: newPost,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Tạo bài viết AI thất bại";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
