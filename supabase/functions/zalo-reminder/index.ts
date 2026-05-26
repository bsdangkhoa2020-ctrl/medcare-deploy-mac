// ═══════════════════════════════════════════════════════════
//  Zalo Bot Creator — Nightly Reminder
//  Gửi nhắc nhở check-in mỗi tối 20:00 (ICT = 13:00 UTC)
//  Trigger: Supabase Cron "0 13 * * *"
// ═══════════════════════════════════════════════════════════
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY = Deno.env.get('SB_SERVICE_KEY')!;
const ZALO_TOKEN   = Deno.env.get('ZALO_BOT_TOKEN')!;

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

Deno.serve(async (req) => {
  // Bảo vệ endpoint — chỉ Supabase cron hoặc admin gọi được
  const authHeader = req.headers.get('Authorization');
  const cronSecret = Deno.env.get('CRON_SECRET') || '';
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // ── Lấy danh sách bệnh nhân có zalo_id đã liên kết ──
    const { data: subscribers, error } = await sb
      .from('zalo_subscribers')
      .select('zalo_id, bn_code, name')
      .not('bn_code', 'is', null);

    if (error) throw error;
    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ sent: 0, msg: 'Không có subscriber' }), { status: 200 });
    }

    let sentCount   = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const sub of subscribers) {
      try {
        // Kiểm tra hôm nay bệnh nhân đã check-in chưa
        const { data: todayLog } = await sb
          .from('patient_logs')
          .select('id')
          .eq('bn_code', sub.bn_code)
          .eq('log_type', 'checkin')
          .gte('created_at', today + 'T00:00:00')
          .lte('created_at', today + 'T23:59:59')
          .maybeSingle();

        if (todayLog) {
          // Đã check-in → không gửi nhắc nữa, gửi lời khen thay thế
          // (Tuỳ chọn: bỏ dòng dưới nếu không muốn gửi gì khi đã checkin)
          skippedCount++;
          continue;
        }

        // Chưa check-in → gửi nhắc nhở cá nhân hóa
        const firstName = (sub.name || 'bạn').split(' ').pop();
        const specialty = sub.bn_code?.startsWith('OB') ? 'ob' : 'gy';
        const message   = buildReminderMessage(firstName!, specialty);

        await sendZaloMessage(sub.zalo_id, message);
        sentCount++;

        // Delay nhỏ để tránh rate limit
        await new Promise(r => setTimeout(r, 200));
      } catch (e: any) {
        errors.push(`${sub.bn_code}: ${e.message}`);
      }
    }

    const result = {
      date:    today,
      total:   subscribers.length,
      sent:    sentCount,
      skipped: skippedCount,
      errors,
    };
    console.log('[ZALO REMINDER]', result);

    // Ghi log vào DB
    await sb.from('zalo_reminder_logs').insert({
      run_date:     today,
      total_users:  subscribers.length,
      sent_count:   sentCount,
      skip_count:   skippedCount,
      error_detail: errors.length > 0 ? errors.join('; ') : null,
    }).throwOnError().catch(() => {}); // Không crash nếu bảng chưa tồn tại

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('[ZALO REMINDER ERROR]', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
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
  return res.json();
}

// ── Nội dung tin nhắc nhở theo chuyên khoa ──
function buildReminderMessage(firstName: string, specialty: string): string {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Sáng' : hour < 18 ? 'Chiều' : 'Tối';

  if (specialty === 'ob') {
    return (
      `🌙 ${greeting} nay chị ${firstName} ơi!\n\n` +
      `BS. Tuấn nhắc nhở chị ghi nhận sức khỏe tối nay nhé:\n` +
      `• 🤰 Cảm giác của mẹ hôm nay\n` +
      `• 👶 Thai máy (nếu có)\n` +
      `• ⚖️ Cân nặng (nếu đo)\n\n` +
      `👉 Mở app: bstuan247.com\n\n` +
      `Chỉ mất 1 phút — giúp BS theo dõi bé yêu tốt hơn 💕`
    );
  } else {
    return (
      `🌸 ${greeting} nay chị ${firstName} ơi!\n\n` +
      `BS. Tuấn nhắc nhở chị ghi nhận sức khỏe tối nay nhé:\n` +
      `• 💊 Thuốc đã uống chưa?\n` +
      `• 🌡️ Cảm giác sức khỏe hôm nay\n` +
      `• 📝 Triệu chứng nếu có\n\n` +
      `👉 Mở app: bstuan247.com\n\n` +
      `BS. Tuấn luôn đồng hành cùng chị 💕`
    );
  }
}
