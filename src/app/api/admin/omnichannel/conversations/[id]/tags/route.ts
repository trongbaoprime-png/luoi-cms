import { NextRequest, NextResponse } from "next/server";
import { omniDb } from "@/lib/omni-db";
import { MASTER_PANCAKE_TAGS, parsePancakeTags } from "@/lib/pancake-tag-parser";

/**
 * POST /api/admin/omnichannel/conversations/[id]/tags
 * Thêm / Xóa thủ công hoặc Đồng bộ Thẻ Pancake theo ID khách hàng
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { tagName, action, customColor, syncAllByCustomer } = body; // action: 'add' | 'remove' | 'toggle' | 'set'

    if (!tagName && action !== "set") {
      return NextResponse.json({ error: "Tên thẻ không được để trống" }, { status: 400 });
    }

    const conversation = await omniDb.omniConversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Không tìm thấy hội thoại" }, { status: 404 });
    }

    let currentTags: string[] = [];
    try {
      if (conversation.tags) currentTags = JSON.parse(conversation.tags);
    } catch {
      if (conversation.tags) currentTags = [conversation.tags];
    }

    const cleanTagName = tagName?.trim();

    if (action === "remove") {
      currentTags = currentTags.filter((t) => t.toLowerCase() !== cleanTagName?.toLowerCase());
    } else if (action === "add") {
      if (cleanTagName && !currentTags.some((t) => t.toLowerCase() === cleanTagName.toLowerCase())) {
        currentTags.push(cleanTagName);
      }
    } else if (action === "set") {
      if (Array.isArray(body.tags)) {
        currentTags = body.tags;
      }
    } else {
      // Toggle
      if (cleanTagName && currentTags.some((t) => t.toLowerCase() === cleanTagName.toLowerCase())) {
        currentTags = currentTags.filter((t) => t.toLowerCase() !== cleanTagName.toLowerCase());
      } else if (cleanTagName) {
        currentTags.push(cleanTagName);
      }
    }

    // 1. Cập nhật hội thoại hiện tại
    const updated = await omniDb.omniConversation.update({
      where: { id },
      data: { tags: JSON.stringify(currentTags) },
    });

    // 2. Đồng bộ tất cả hội thoại của cùng Khách hàng (theo psid / phone / pancakeCustomerId)
    if (syncAllByCustomer !== false) {
      const customerConditions: any[] = [{ psid: conversation.psid }];
      if (conversation.phone) customerConditions.push({ phone: conversation.phone });
      if (conversation.pancakeCustomerId) customerConditions.push({ pancakeCustomerId: conversation.pancakeCustomerId });

      await omniDb.omniConversation.updateMany({
        where: {
          OR: customerConditions,
          id: { not: id },
        },
        data: {
          tags: JSON.stringify(currentTags),
        },
      });
    }

    // 3. Phân tích kết quả thẻ & kích hoạt CAPI
    const parsedRules = parsePancakeTags(currentTags);

    let capiTriggered = null;
    if (currentTags.includes("DDH") || parsedRules.status === "QUALIFIED") {
      capiTriggered = "LEAD_QUALIFIED_CAPI";
    } else if (currentTags.includes("#ĐẬU") || parsedRules.status === "PURCHASE") {
      capiTriggered = "PURCHASE_CAPI";
    }

    const masterTagInfo = cleanTagName ? MASTER_PANCAKE_TAGS[cleanTagName] : null;

    return NextResponse.json({
      success: true,
      tags: currentTags,
      masterTagInfo,
      parsedRules,
      capiTriggered,
      message: `Đã ${action === "remove" ? "gỡ" : "thêm"} thẻ ${cleanTagName || ""} thành công (Đồng bộ theo ID khách hàng)`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
