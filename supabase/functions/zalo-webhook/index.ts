// ═══════════════════════════════════════════════════════════
//  Zalo Bot Creator — Webhook Handler
//  Nhận tin nhắn từ bệnh nhân → lưu zalo_id vào DB
//  URL: https://tnehhratorbrxjwzqnds.supabase.co/functions/v1/zalo-webhook
// ═══════════════════════════════════════════════════════════
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY = Deno.env.get('SB_SERVICE_KEY')!;
const ZALO_TOKEN   = Deno.env.get('ZALO_BOT_TOKEN')!;

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

Deno.serve(async (req) => {
  // Zalo gửi GET để verify webhook khi mới setup
  if (req.method === 'GET') {
    const url    = new URL(req.url);
    const challenge = url.searchParams.get('challenge') || 'ok';
    return new Response(challenge, { status: 200 });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    console.log('[ZALO WEBHOOK]', JSON.stringify(body));

    const event    = body?.event_name;
    const zaloId   = body?.sender?.id   || body?.user_id_by_app;
    const msgText  = body?.message?.text || '';

    if (!zaloId) {
      return new Response('ok', { status: 200 });
    }

    // ── Lưu zalo_id vào profiles nếu bệnh nhân nhắn tin lần đầu ──
    // Tìm profile theo phone (nếu bệnh nhân đã đăng ký)
    // Hoặc lưu vào bảng zalo_subscribers để theo dõi
    await sb.from('zalo_subscribers').upsert({
      zalo_id:    zaloId,
      last_event: event,
      last_msg:   msgText.slice(0, 200),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'zalo_id' });

    // ── Trả lời tự động khi bệnh nhân nhắn tin ──
    if (event === 'user_send_text' && msgText) {
      await sendZaloMessage(zaloId, buildAutoReply(msgText));
    }

    // ── Chào mừng khi follow bot ──
    if (event === 'follow') {
      await sendZaloMessage(zaloId,
        '🌸 Chào mừng bạn đến với Bot của BS. Hoàng Thanh Tuấn!\n\n' +
        'Tôi sẽ nhắc nhở bạn ghi nhận sức khỏe mỗi tối lúc 20:00.\n\n' +
        'Để liên kết tài khoản, hãy nhắn: *Mã BN của bạn* (ví dụ: OB001)\n\n' +
        '💬 Bạn cũng có thể hỏi tôi bất cứ lúc nào!'
      );
    }

    // ── Liên kết bn_code khi bệnh nhân nhắn mã BN ──
    if (event === 'user_send_text') {
      const code = msgText.trim().toUpperCase();
      if (/^(OB|GY)\d{3,}$/.test(code)) {
        // Tìm bệnh nhân theo bn_code
        const { data: patient } = await sb
          .from('patients')
          .select('bn_code, name, profile_id')
          .eq('bn_code', code)
          .maybeSingle();

        if (patient) {
          // Lưu zalo_id vào profiles
          await sb.from('profiles')
            .update({ zalo_id: zaloId })
            .eq('id', patient.profile_id);

          // Cập nhật zalo_subscribers với bn_code
          await sb.from('zalo_subscribers')
            .update({ bn_code: code, name: patient.name })
            .eq('zalo_id', zaloId);

          await sendZaloMessage(zaloId,
            `✅ Đã liên kết thành công!\n\n` +
            `Xin chào ${patient.name} 🌸\n` +
            `Từ nay tôi sẽ nhắc bạn ghi nhận sức khỏe mỗi tối lúc 20:00 nhé!`
          );
        } else {
          await sendZaloMessage(zaloId,
            `❌ Không tìm thấy mã ${code}.\n` +
            `Vui lòng kiểm tra lại mã bệnh nhân trong app hoặc liên hệ phòng khám.`
          );
        }
      }
    }

    return new Response('ok', { status: 200 });
  } catch (e) {
    console.error('[ZALO WEBHOOK ERROR]', e);
    return new Response('ok', { status: 200 }); // Luôn trả 200 để Zalo không retry
  }
});

// ── Gửi tin nhắn qua Zalo Bot Creator API ──
async function sendZaloMessage(toId: string, content: string) {
  const res = await fetch('https://bot.zalo.me/v2/message/sendmessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: ZALO_TOKEN,
      type: 'text',
      to: toId,
      data: { content },
    }),
  });
  const result = await res.json();
  console.log('[ZALO SEND]', result);
  return result;
}

// ── Trả lời tự động đơn giản ──
function buildAutoReply(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('xin chào') || m.includes('hello') || m.includes('hi')) {
    return '🌸 Xin chào! Tôi là Bot của BS. Tuấn. Có điều gì tôi có thể giúp bạn không?';
  }
  if (m.includes('lịch') || m.includes('hẹn')) {
    return '📅 Để xem lịch hẹn, vui lòng mở app tại bstuan247.com và vào mục Lịch hẹn.';
  }
  if (m.includes('khẩn cấp') || m.includes('cấp cứu')) {
    return '🚨 KHẨN CẤP: Gọi ngay 115 hoặc đến cơ sở y tế gần nhất!\nHotline phòng khám: 0938559098';
  }
  return (
    '💬 Cảm ơn bạn đã nhắn tin!\n\n' +
    'Để được hỗ trợ nhanh nhất:\n' +
    '• 📱 Mở app: bstuan247.com\n' +
    '• 📞 Hotline: 0938559098\n\n' +
    'Tôi sẽ nhắc bạn check-in sức khỏe mỗi tối lúc 20:00 🌙'
  );
}
