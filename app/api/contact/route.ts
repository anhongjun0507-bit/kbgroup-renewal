import { NextResponse } from "next/server";
import { getSetting } from "@/lib/content";

/* Phase 9 P0-06 — 상담 폼 API Route
   백엔드 우선순위:
   1) RESEND_API_KEY 환경변수 있으면 Resend로 전송
   2) SLACK_WEBHOOK_URL 환경변수 있으면 Slack으로 미러
   3) 둘 다 없으면 서버 로그 + 성공 응답 (운영자가 로그 수동 확인) */

export const runtime = "nodejs";

type Payload = {
  company: string;
  name: string;
  phone: string;
  email: string;
  households?: string;
  inquiryType: string;
  preferredDate?: string;
  message: string;
  context?: string;
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildEmailBody(p: Payload) {
  const lines = [
    `[케이비개발 상담 문의 접수]`,
    p.context ? `컨텍스트: ${p.context}` : null,
    ``,
    `회사명: ${p.company}`,
    `담당자: ${p.name}`,
    `연락처: ${p.phone}`,
    `이메일: ${p.email}`,
    p.households ? `단지 규모(세대수): ${p.households}` : null,
    `문의 유형: ${p.inquiryType}`,
    p.preferredDate ? `상담 희망일: ${p.preferredDate}` : null,
    ``,
    `[문의 내용]`,
    p.message,
  ].filter(Boolean);
  return lines.join("\n");
}

async function sendViaResend(p: Payload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  const html = `<pre style="font-family:monospace;line-height:1.6">${escapeHtml(buildEmailBody(p))}</pre>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [(await getSetting("contact")).email],
      reply_to: p.email,
      subject: `[케이비개발] ${p.context ?? "상담 문의"} — ${p.company}`,
      html,
      text: buildEmailBody(p),
    }),
  });
  return res.ok;
}

async function sendViaSlack(p: Payload): Promise<boolean> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return false;
  const text = "```\n" + buildEmailBody(p) + "\n```";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return res.ok;
}

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as Payload;

    // 최소 유효성
    if (
      !data.company ||
      !data.name ||
      !data.phone ||
      !data.email ||
      !data.inquiryType ||
      !data.message
    ) {
      return NextResponse.json(
        { ok: false, error: "필수 항목이 누락되었습니다." },
        { status: 400 },
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return NextResponse.json(
        { ok: false, error: "올바른 이메일 형식이 아닙니다." },
        { status: 400 },
      );
    }

    let delivered = false;
    delivered = (await sendViaResend(data)) || delivered;
    delivered = (await sendViaSlack(data)) || delivered;

    if (!delivered) {
      /* eslint-disable no-console */
      console.log("[contact-form][no-backend]", buildEmailBody(data));
      /* eslint-enable no-console */
    }

    return NextResponse.json({ ok: true, delivered });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
