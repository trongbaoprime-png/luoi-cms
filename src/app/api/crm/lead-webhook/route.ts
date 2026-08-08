import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPhone, hashEmail, sendMetaCapiLeadEvent } from "@/lib/meta-capi";
import { pushLeadToGoogleSheet } from "@/lib/google-sheets";
import { sendTelegramNotification, getVietnamFormattedTime } from "@/lib/notification-service";
import { normalizeSource, getSourceGroup, normalizeBranch, getBranchGroup, normalizeService, getServiceGroup, normalizeTelesale } from "@/lib/tds-parser";

/**
 * GET Handler for Meta Webhook Verification (hub.verify_token & hub.challenge)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyTokenSetting = await db.setting.findUnique({
    where: { key: "meta_webhook_verify_token" },
  });

  const expectedToken = verifyTokenSetting?.value || "luoidonnha2026metawebhook";

  if (mode === "subscribe" && token === expectedToken) {
    return new Response(challenge || "OK", { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

/**
 * POST Handler for Meta LeadGen Webhooks & Website Lead Submissions
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Check if incoming payload is Meta Webhook structure or Standard Form
    let fullName = body.fullName || body.full_name || body.name || "Khách Hàng Mới";
    let phone = body.phone || body.phone_number || "";
    let email = body.email || "";
    let rawSource = body.source || "META_INSTANT_FORM";
    let leadId = body.leadId || body.lead_id || body.leadgen_id || undefined;
    let fbclid = body.fbclid || undefined;
    let fbp = body.fbp || undefined;
    let fbc = body.fbc || undefined;
    let note = body.note || undefined;

    let branch = body.branch ? normalizeBranch(body.branch) : undefined;
    let branchGroup = branch ? getBranchGroup(branch) : undefined;
    let service = body.service ? normalizeService(body.service) : undefined;
    let serviceGroup = service ? getServiceGroup(service) : undefined;
    let telesale = body.telesale ? normalizeTelesale(body.telesale) : undefined;

    // Meta Webhook Entry Parsing
    if (body.entry && Array.isArray(body.entry)) {
      for (const entryItem of body.entry) {
        if (entryItem.changes && Array.isArray(entryItem.changes)) {
          for (const change of entryItem.changes) {
            if (change.value && change.value.leadgen_id) {
              leadId = change.value.leadgen_id;
              rawSource = "META_INSTANT_FORM";
            }
          }
        }
      }
    }

    if (!phone && !leadId) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin SĐT hoặc Lead ID" },
        { status: 400 }
      );
    }

    const source = normalizeSource(rawSource);
    const sourceGroup = getSourceGroup(source);

    const phoneHash = hashPhone(phone);
    const emailHash = email ? hashEmail(email) : undefined;

    // 2. Save Lead into miniCRM Database
    const newLead = await db.cRMLead.create({
      data: {
        leadId,
        fullName,
        phone,
        email,
        phoneHash,
        emailHash,
        source,
        sourceGroup,
        telesale,
        branch,
        branchGroup,
        service,
        serviceGroup,
        status: "NEW",
        fbclid,
        fbp,
        fbc,
        note,
      },
    });

    // Create Initial Audit Log in CRMStatusHistory
    await db.cRMStatusHistory.create({
      data: {
        leadId: newLead.id,
        previousStatus: "NONE",
        newStatus: "NEW",
        updatedBy: source,
      },
    });

    // 3. Sync to Google Sheets Realtime
    pushLeadToGoogleSheet({
      leadId: newLead.id,
      fullName: newLead.fullName,
      phone: newLead.phone,
      email: newLead.email || "",
      source: newLead.source,
      status: newLead.status,
      createdAt: newLead.createdAt.toISOString(),
      note: newLead.note || "",
    }).catch(() => {});

    // 4. Trigger Telegram Bot Alert if configured
    try {
      const telegramTokenSetting = await db.setting.findUnique({ where: { key: "telegram_bot_token" } });
      const telegramChatIdSetting = await db.setting.findUnique({ where: { key: "telegram_chat_id" } });

      if (telegramTokenSetting?.value && telegramChatIdSetting?.value) {
        sendTelegramNotification(telegramTokenSetting.value, telegramChatIdSetting.value, {
          time: getVietnamFormattedTime(),
          name: newLead.fullName,
          phone: newLead.phone,
          email: newLead.email || undefined,
          source: newLead.source,
          fbclid: newLead.fbclid || undefined,
        }).catch(() => {});
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Tiếp nhận Lead thành công vào miniCRM!",
      data: newLead,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Lead ingestion error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
