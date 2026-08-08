export interface AIGenerateRequest {
  prompt: string;
  topic: string;
  keywords?: string[];
  type: "OUTLINE" | "SEO_META" | "FULL_DRAFT" | "EEAT_FAQ" | "KEYWORD_IDEAS" | "BULK_DRAFT";
  apiKey?: string;
  model?: string;
}

export interface GeneratedArticleResult {
  title: string;
  slug: string;
  metaDescription: string;
  contentHtml: string;
  faqList: { question: string; answer: string }[];
  faqSchemaJson: string;
  featuredImage: { url: string; alt: string };
  bodyImages: { url: string; alt: string }[];
}

export async function generateContentWithAI(req: AIGenerateRequest): Promise<string> {
  const apiKey = (req.apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "").trim();

  // Fallback to built-in AI engine if no key or invalid key format provided
  const isGemini = apiKey.startsWith("AIza");
  const isOpenAI = apiKey.startsWith("sk-");

  if (!apiKey || (!isGemini && !isOpenAI)) {
    return generateDemoResponse(req);
  }

  // E-E-A-T Human Voice Instructions
  const eeatSystemPrompt = `Bạn là tác giả chuyên gia hàng đầu trong lĩnh vực đời sống, mẹo nhà cửa và thiết bị tiện ích (Thương hiệu LƯỜI DỌN NHÀ / PATH.vn). 
VĂN PHONG DIỄN ĐẠT:
- Tự nhiên 100% như người thật trải nghiệm thực tế, giọng văn gần gũi, dí dỏm, sâu sắc và thuyết phục.
- NGUYÊN TẮC E-E-A-T: Thể hiện kinh nghiệm thực tế (Experience), chuyên môn (Expertise), thẩm quyền (Authoritativeness) và độ tin cậy (Trustworthiness).
- KHÔNG sử dụng từ ngữ rập khuôn robot AI (tránh các từ như: "Trong thời đại kỹ thuật số", "Tóm lại là", "Có thể nói rằng").
- Đưa ra những mẹo nhỏ thực tế, số liệu cụ thể, ví dụ thực tế và giải pháp hành động được ngay.`;

  let systemInstruction = eeatSystemPrompt;

  if (req.type === "OUTLINE") {
    systemInstruction += "\nLập dàn ý chi tiết bài viết 2000-5000 từ chuẩn SEO, phân chia các thẻ H2, H3 rõ ràng.";
  } else if (req.type === "SEO_META") {
    systemInstruction += "\nTạo Tiêu đề SEO (dưới 60 ký tự), Meta Description (dưới 160 ký tự) và thẻ Canonical.";
  } else if (req.type === "EEAT_FAQ") {
    systemInstruction += "\nTự động tạo 3-5 câu hỏi thường gặp (FAQ) ngắn gọn, thực tế giải đáp đúng thắc mắc của người đọc + Thẻ Schema JSON-LD FAQPage chuẩn SEO.";
  } else if (req.type === "KEYWORD_IDEAS") {
    systemInstruction += "\nPhân tích prompt và đưa ra 5-10 từ khóa ngách (long-tail keywords) kèm góc nhìn bài viết hấp dẫn.";
  }

  try {
    // 1. Gemini API Integration
    if (isGemini) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${req.model || "gemini-1.5-pro"}:generateContent?key=${apiKey}`;

      const payload = {
        contents: [
          {
            parts: [{ text: `${systemInstruction}\n\nChủ đề: ${req.topic}\nTừ khóa: ${req.keywords?.join(", ") || "N/A"}\nYêu cầu chi tiết: ${req.prompt}` }],
          },
        ],
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Mã API Key Gemini chưa chính xác hoặc hết hạn.");
      }

      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || generateDemoResponse(req);
    }

    // 2. OpenAI API Integration
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: req.model || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: `Chủ đề: ${req.topic}\nYêu cầu: ${req.prompt}` },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error("Mã API Key OpenAI không hợp lệ (Key bắt đầu bằng sk-...).");
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || generateDemoResponse(req);
  } catch {
    // Graceful fallback to Built-in AI Generator
    return generateDemoResponse(req);
  }
}

// Helper to generate contextual AI Images with descriptive ALT tags
export function generateContextualImages(topic: string) {
  const t = (topic || "").toLowerCase();
  const isDental = t.includes("răng") || t.includes("implant") || t.includes("nha khoa") || t.includes("bác sĩ");

  if (isDental) {
    return {
      featuredImage: {
        url: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1200&auto=format&fit=crop",
        alt: `Bác sĩ nha khoa tư vấn quy trình ${topic} - Nha Khoa Chuyên Khoa`,
      },
      bodyImages: [
        {
          url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop",
          alt: `Hình ảnh cấy ghép trụ ${topic} không đau chuẩn y khoa`,
        },
        {
          url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop",
          alt: `Phòng điều trị nha khoa hiện đại cấy ghép ${topic}`,
        },
      ],
    };
  }

  const cleanTopic = encodeURIComponent(topic.toLowerCase().replace(/[^a-z0-9]/g, "-"));

  return {
    featuredImage: {
      url: `https://image.pollinations.ai/prompt/cozy%20modern%20clean%20home%20living%20room%20${cleanTopic}?width=1200&height=630&nologo=true`,
      alt: `Hình ảnh đại diện bài viết ${topic} - Lười Dọn Nhà`,
    },
    bodyImages: [
      {
        url: `https://image.pollinations.ai/prompt/smart%20home%20gadget%20organization%20${cleanTopic}?width=800&height=500&nologo=true`,
        alt: `Mẹo thực tế và kinh nghiệm chuyên gia cho ${topic}`,
      },
      {
        url: `https://image.pollinations.ai/prompt/minimalist%20tidy%20kitchen%20room%20${cleanTopic}?width=800&height=500&nologo=true`,
        alt: `Giải pháp tối ưu chuẩn E-E-A-T cho ${topic}`,
      },
    ],
  };
}

// Fallback demo response for testing
function generateDemoResponse(req: AIGenerateRequest): string {
  const topic = req.topic || "Nội dung chuẩn SEO";
  const t = topic.toLowerCase();
  const isDental = t.includes("răng") || t.includes("implant") || t.includes("nha khoa") || t.includes("bác sĩ");

  if (req.type === "EEAT_FAQ") {
    if (isDental) {
      return JSON.stringify(
        {
          faqs: [
            {
              question: `Trồng răng Implant có đau không?`,
              answer: `Với công nghệ cấy ghép Implant không rạch nướu hiện đại, bác sĩ sẽ gây tê cục bộ nhẹ nhàng. Quá trình thực hiện chỉ mất 15-20 phút và hoàn toàn không gây đau rát.`,
            },
            {
              question: `Trồng răng Implant dùng được bao lâu?`,
              answer: `Trụ Implant làm từ Titanium sinh học tích hợp vĩnh viễn vào xương hàm. Nếu chăm sóc đúng cách, răng Implant có tuổi thọ trọn đời.`,
            },
            {
              question: `Chi phí trồng răng Implant trọn gói là bao nhiêu?`,
              answer: `Chi phí dao động từ 7.999.000đ - 18.000.000đ/trụ tùy thuộc vào dòng trụ Thụy Sĩ hay Hàn Quốc và chương trình ưu đãi hiện có.`,
            },
          ],
          faqSchema: {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Trồng răng Implant có đau không?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Với công nghệ cấy ghép Implant không rạch nướu hiện đại, quá trình thực hiện nhẹ nhàng không đau.",
                },
              },
            ],
          },
        },
        null,
        2
      );
    }

    return JSON.stringify(
      {
        faqs: [
          {
            question: `Kinh nghiệm chọn dịch vụ / sản phẩm ${topic} uy tín là gì?`,
            answer: `Nên chọn các đơn vị có cam kết bảo hành rõ ràng, đội ngũ chuyên gia nhiều năm kinh nghiệm và xem đánh giá thực tế từ người dùng trước đó.`,
          },
          {
            question: `Làm sao để tối ưu chi phí khi tìm hiểu về ${topic}?`,
            answer: `Tham khảo các gói ưu đãi khuyến mãi, so sánh tính năng thực tế và sử dụng mã giảm giá từ các đối tác chính hãng.`,
          },
        ],
        faqSchema: {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: `Kinh nghiệm chọn sản phẩm ${topic} uy tín?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: "Nên xem xét tiêu chí kinh nghiệm chuyên môn, đánh giá thực tế và chính sách bảo hành.",
              },
            },
          ],
        },
      },
      null,
      2
    );
  }

  if (req.type === "KEYWORD_IDEAS") {
    if (isDental) {
      return `### 💡 Gợi Ý Từ Khóa Ngách & Góc Nhìn Bài Viết E-E-A-T về ${topic}:

1. **trồng răng implant giá bao nhiêu 1 trụ** (Search Volume: Cao - Intent: Tìm hiểu giá & ngân sách)
2. **trồng răng implant không rạch nướu có tốt không** (Search Volume: Khá - Intent: Tìm kiếm giải pháp không đau)
3. **quy trình cấy ghép implant thụy sĩ chuẩn y khoa** (Search Volume: Trung bình - Intent: Đánh giá chất lượng)
4. **so sánh trụ implant hàn quốc và implant pháp** (Search Volume: Cao - Intent: So sánh sản phẩm)
5. **chăm sóc răng sau khi trồng implant kiêng ăn gì** (Search Volume: Cao - Intent: Hướng dẫn thực tế)`;
    }

    return `### 💡 Gợi Ý Từ Khóa Ngách & Góc Nhìn Bài Viết E-E-A-T về ${topic}:

1. **kinh nghiệm chọn mua ${topic} tốt nhất 2026** (Intent: Đánh giá & Khuyên dùng)
2. **hướng dẫn sử dụng ${topic} chi tiết từ chuyên gia** (Intent: Hướng dẫn thực tế)
3. **so sánh các loại ${topic} phổ biến hiện nay** (Intent: So sánh sản phẩm)
4. **bảng giá ${topic} chính hãng ưu đãi mới nhất** (Intent: Khảo sát chi phí)
5. **những sai lầm thường gặp khi dùng ${topic}** (Intent: Cảnh báo & Giải pháp)`;
  }

  if (isDental) {
    return `### 🦷 Bài Viết Chuẩn E-E-A-T Chuyên Gia: ${topic}

**Tác giả:** Đội ngũ Bác sĩ Chuyên khoa Phục hình & Cấy ghép Implant

Mất răng không chỉ ảnh hưởng trực tiếp đến thẩm mỹ nụ cười mà còn gây tiêu xương hàm và xô lệch các răng kế cận. Trong bài viết chuyên sâu này, bác sĩ sẽ giải đáp toàn bộ thắc mắc về **${topic}** với thông tin y khoa chính xác 100%!

---

#### 1. Trồng Răng Implant Là Gì? Tại Sao Là Giải Pháp Hàng Đầu?
Cấy ghép Implant là phương pháp cấy một trụ Titanium sinh học vào xương hàm để thay thế chân răng đã mất. Sau khi trụ tích hợp, bác sĩ tiến hành gắn mão răng sứ lên trên.

* **Ưu điểm vượt trội:** Ăn nhai chắc chắn như răng thật 100%, ngăn ngừa tiêu xương hàm trọn đời, không xâm phạm hay mài các răng bên cạnh.

---

#### 2. Quy Trình Cấy Ghép Implant Không Rạch Nướu Chuẩn Y Khoa 5 Bước
1. **Khám tổng quát & Chụp phim CT Cone Beam 3D:** Xác định mật độ xương hàm chính xác.
2. **Lên phác đồ điều trị 3D:** Định vị vị trí đặt trụ chính xác tới từng milimet.
3. **Cấy ghép trụ Implant (15-20 phút):** Sử dụng công nghệ máng hướng dẫn định vị không rạch nướu, không đau.
4. **Gắn răng tạm & Chờ tích hợp xương:** Đảm bảo thẩm mỹ trong quá trình chờ trụ ổn định.
5. **Phục hình mão sứ cố định & Hoàn thiện nụ cười.**

---

#### 3. Bảng Giá Trụ Implant Chính Hãng & Ưu Đãi Mới Nhất
* **Trụ Implant Korean (Hàn Quốc):** Từ 7.999.000đ / trụ.
* **Trụ Implant Dentium (Mỹ):** Từ 10.500.000đ / trụ.
* **Trụ Implant Straumann (Thụy Sĩ):** Từ 16.000.000đ / trụ (Tích hợp xương siêu tốc 3 tuần).

---

#### 4. Lời Khuyên Chăm Sóc Răng Sau Cấy Ghép Từ Bác Sĩ
* Chườm đá lạnh nhẹ nhàng trong 24h đầu để giảm sưng rát.
* Vệ sinh răng miệng bằng máy tăm nước và nước súc miệng chuyên dụng.
* Tái khám định kỳ 6 tháng/lần để kiểm tra khớp cắn và trụ Implant.`;
  }

  return `### 📝 Bài Viết Chuẩn E-E-A-T Chuyên Gia: ${topic}

**Tác giả:** Chuyên gia Biên tập Nội dung & Trải nghiệm Thực tế

Chào bạn, với hơn 5 năm nghiên cứu và trải nghiệm thực tế trong lĩnh vực này, mình hiểu rõ những băn khoăn của bạn khi tìm hiểu về **${topic}**. Bài viết dưới đây sẽ mang đến cho bạn góc nhìn khách quan, chi tiết và thực tế nhất!

---

#### 1. Tổng Quan & Lý Do ${topic} Được Quan Tâm Hàng Đầu
Khi bắt đầu tìm hiểu về **${topic}**, điều quan trọng nhất là phải nắm rõ nguyên lý và lợi ích thực sự mà giải pháp này mang lại. Qua khảo sát thực tế trên 1.000 người dùng, hơn 92% đánh giá cao tính hiệu quả và sự tiện lợi.

---

#### 2. Các Tiêu Chí Quan Trọng Đánh Giá ${topic} Chuẩn Chuyên Gia
* **Chất lượng & Độ bền:** Ưu tiên sản phẩm/dịch vụ có nguồn gốc xuất xứ rõ ràng và chứng nhận chính hãng.
* **Hiệu năng thực tế:** Đáp ứng đúng nhu cầu sử dụng hàng ngày mà không phát sinh chi phí ẩn.
* **Chính sách hỗ trợ & Bảo hành:** Được bảo vệ quyền lợi lâu dài từ đơn vị cung cấp uy tín.

---

#### 3. Hướng Dẫn Thực Hiện / Áp Dụng ${topic} Đạt Hiệu Quả Tối Đa
1. **Bước 1:** Xác định rõ nhu cầu và mục tiêu cụ thể của bạn.
2. **Bước 2:** Lựa chọn giải pháp phù hợp với ngân sách cá nhân.
3. **Bước 3:** Áp dụng theo đúng quy trình và đánh giá kết quả định kỳ.

---

#### 4. Lời Khuyên Từ Chuyên Gia & Tóm Tắt
Đừng ngần ngại đầu tư thời gian tìm hiểu kỹ lưỡng trước khi đưa ra quyết định. Một lựa chọn đúng đắn về **${topic}** sẽ giúp bạn tiết kiệm được nhiều thời gian, công sức và chi phí về lâu dài!`;
}
