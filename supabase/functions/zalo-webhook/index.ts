// ═══════════════════════════════════════════════════════════
//  Zalo Bot Creator — Webhook Handler v2.0
//  ✅ Nhận tin nhắn text → trả lời tự động
//  ✅ Nhận file PDF/Ảnh từ Lễ tân → Lưu Storage → AI phân loại
//  ✅ Bình thường → Tự động gửi BN
//  ✅ Bất thường → Báo BS duyệt
//  URL: https://tnehhratorbrxjwzqnds.supabase.co/functions/v1/zalo-webhook
// ═══════════════════════════════════════════════════════════
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY = Deno.env.get('SB_SERVICE_KEY')!;
const ZALO_TOKEN   = Deno.env.get('ZALO_BOT_TOKEN') || '2942065296280499653:LsDMgYWDiJmiDvXtqMtngiGuSrZzSqIkjpZnulLRwkDCAeVlJwTOEaRSXwjCiHvc';
const GEMINI_KEY   = Deno.env.get('GEMINI_API_KEY')!;

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

Deno.serve(async (req) => {
  // Zalo gửi GET để verify webhook khi mới setup
  if (req.method === 'GET') {
    const url = new URL(req.url);
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
    const zaloId   = body?.sender?.id || body?.user_id_by_app;
    const msgText  = body?.message?.text || '';

    if (!zaloId) {
      return new Response('ok', { status: 200 });
    }

    // Lưu zalo_id vào subscribers
    await sb.from('zalo_subscribers').upsert({
      zalo_id:    zaloId,
      last_event: event,
      last_msg:   msgText.slice(0, 200),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'zalo_id' });

    // ══════════════════════════════════════
    //  XỬ LÝ FILE/ẢNH TỪ LỄ TÂN
    // ══════════════════════════════════════
    if (event === 'user_send_image' || event === 'user_send_file') {
      await handleFileUpload(zaloId, body);
      return new Response('ok', { status: 200 });
    }

    // ══════════════════════════════════════
    //  XỬ LÝ TIN NHẮN TEXT
    // ══════════════════════════════════════
    if (event === 'user_send_text' && msgText) {
      const code = msgText.trim().toUpperCase();
      // Kiểm tra nếu BN gửi mã liên kết (OB001, GY002...)
      if (/^(OB|GY)\d{3,}$/.test(code)) {
        await handleBnCodeLink(zaloId, code);
      } else {
        await sendZaloMessage(zaloId, buildAutoReply(msgText));
      }
    }

    // ══════════════════════════════════════
    //  CHÀO MỪNG KHI FOLLOW BOT
    // ══════════════════════════════════════
    if (event === 'follow') {
      await sendZaloMessage(zaloId,
        '🌸 Chào mừng bạn đến với Bot của BS. Hoàng Thanh Tuấn!\n\n' +
        'Tôi sẽ nhắc nhở bạn ghi nhận sức khỏe mỗi tối lúc 20:00.\n\n' +
        'Để liên kết tài khoản, hãy nhắn: Mã BN của bạn (ví dụ: OB001)\n\n' +
        '💬 Bạn cũng có thể hỏi tôi bất cứ lúc nào!'
      );
    }

    return new Response('ok', { status: 200 });
  } catch (e) {
    console.error('[ZALO WEBHOOK ERROR]', e);
    return new Response('ok', { status: 200 }); // Luôn trả 200 để Zalo không retry
  }
});

// ══════════════════════════════════════════════════════════
//  LUỒNG CHÍNH: LỄ TÂN GỬI FILE → BOT XỬ LÝ TẤT CẢ
// ══════════════════════════════════════════════════════════
async function handleFileUpload(zaloId: string, body: any) {
  const attachments = body?.message?.attachments;
  const fileUrl  = attachments?.[0]?.payload?.url || attachments?.[0]?.payload?.thumbnail;
  const fileName = attachments?.[0]?.payload?.name || `upload_${Date.now()}.jpg`;
  const fileType = attachments?.[0]?.payload?.type || 'image/jpeg';

  if (!fileUrl) {
    await sendZaloMessage(zaloId, '❌ Không đọc được file. Vui lòng gửi lại.');
    return;
  }

  // Báo đã nhận file
  await sendZaloMessage(zaloId, `📥 Đã nhận "${fileName}". Đang xử lý... ⏳`);

  try {
    // ── BƯỚC 1: Tải file từ Zalo ──
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) throw new Error('Không tải được file từ Zalo');
    const fileBuffer = await fileRes.arrayBuffer();
    const mimeType = fileRes.headers.get('content-type') || fileType;

    // ── BƯỚC 2: Upload lên Supabase Storage ──
    const storagePath = `zalo_uploads/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error: upErr } = await sb.storage
      .from('records')
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: false
      });

    if (upErr) throw new Error('Lỗi lưu file: ' + upErr.message);

    // Lấy Public URL để xem trực tiếp
    const { data: urlData } = sb.storage.from('records').getPublicUrl(storagePath);
    const publicUrl = urlData?.publicUrl || '';

    // ── BƯỚC 3: Gửi AI Gemini đọc & phân loại ──
    const base64 = arrayBufferToBase64(fileBuffer);
    const aiResult = await analyzeWithGemini(base64, mimeType);
    console.log('[AI RESULT]', JSON.stringify(aiResult));

    // ── BƯỚC 4: Tìm bệnh nhân trong Database ──
    let matchedBnCode: string | null = null;
    let matchedName = aiResult.patient_name || '';

    if (matchedName) {
      // Tìm chính xác theo tên
      const { data: patients } = await sb.from('patients')
        .select('bn_code, name')
        .ilike('name', `%${matchedName}%`)
        .limit(3);

      if (patients?.length === 1) {
        matchedBnCode = patients[0].bn_code;
        matchedName = patients[0].name;
      } else if (patients && patients.length > 1) {
        // Nhiều BN trùng tên → thử khớp chính xác hơn
        const exact = patients.find(p =>
          p.name.toLowerCase().trim() === matchedName.toLowerCase().trim()
        );
        if (exact) {
          matchedBnCode = exact.bn_code;
          matchedName = exact.name;
        }
      }
    }

    // ── BƯỚC 5: Lưu vào bảng attachments ──
    await sb.from('attachments').insert({
      bn_code: matchedBnCode,
      file_name: fileName,
      storage_path: storagePath,
      file_size: fileBuffer.byteLength,
      mime_type: mimeType,
      doctype: aiResult.doc_type || 'khac',
      scan_type: aiResult.doc_type || 'khac',
      status: 'ai_processed',
      ai_extracted: {
        result: aiResult.summary,
        parsed: aiResult,
        type: aiResult.doc_type,
        is_abnormal: aiResult.is_abnormal,
        abnormal_items: aiResult.abnormal_items,
        severity: aiResult.severity,
        public_url: publicUrl,
        source: 'zalo_bot',
        scanned_at: new Date().toISOString()
      },
      is_saved_to_emr: true,
      uploaded_by: null
    });

    // ── BƯỚC 6: Phân loại & Thông báo ──
    if (matchedBnCode) {
      if (aiResult.is_abnormal) {
        // ════════════════════════════════
        //  🔴 BẤT THƯỜNG → Chờ BS duyệt
        // ════════════════════════════════
        const abnormalList = (aiResult.abnormal_items || [])
          .map((i: string) => '  • ' + i).join('\n');

        await sendZaloMessage(zaloId,
          `⚠️ KẾT QUẢ BẤT THƯỜNG\n\n` +
          `👤 BN: ${matchedName} (${matchedBnCode})\n` +
          `📋 ${aiResult.summary}\n\n` +
          `🔴 Chỉ số bất thường:\n${abnormalList}\n\n` +
          `⏳ Đang chờ Bác sĩ Tuấn duyệt.\n` +
          `Chưa gửi cho bệnh nhân.`
        );

      } else {
        // ════════════════════════════════
        //  🟢 BÌNH THƯỜNG → Gửi BN tự động
        // ════════════════════════════════

        // Tìm zalo_id của bệnh nhân
        const { data: sub } = await sb.from('zalo_subscribers')
          .select('zalo_id')
          .eq('bn_code', matchedBnCode)
          .maybeSingle();

        if (sub?.zalo_id) {
          await sendZaloMessage(sub.zalo_id,
            `🌸 Chào ${matchedName}!\n\n` +
            `Kết quả xét nghiệm của bạn đã có.\n` +
            `✅ Tất cả chỉ số đều bình thường.\n\n` +
            `📄 Xem chi tiết: ${publicUrl}\n\n` +
            `Chúc bạn sức khỏe! 💚`
          );
        }

        await sendZaloMessage(zaloId,
          `✅ ĐÃ XỬ LÝ XONG\n\n` +
          `👤 BN: ${matchedName} (${matchedBnCode})\n` +
          `📋 ${aiResult.summary}\n\n` +
          `🟢 Bình thường → Đã gửi cho bệnh nhân.`
        );
      }
    } else {
      // ════════════════════════════════
      //  ⚠️ KHÔNG TÌM THẤY BN
      // ════════════════════════════════
      await sendZaloMessage(zaloId,
        `📥 Đã lưu file thành công!\n\n` +
        `👤 Tên trên giấy: ${aiResult.patient_name || 'Không rõ'}\n` +
        `📋 ${aiResult.summary}\n\n` +
        `⚠️ Không tìm thấy BN này trong hệ thống.\n` +
        `Vui lòng tạo hồ sơ mới trên bstuan247.com`
      );
    }

  } catch (e) {
    console.error('[FILE UPLOAD ERROR]', e);
    await sendZaloMessage(zaloId, `❌ Lỗi xử lý: ${(e as Error).message}`);
  }
}

// ══════════════════════════════════════════════════════════
//  GỌI GEMINI AI PHÂN LOẠI TÀI LIỆU Y TẾ
// ══════════════════════════════════════════════════════════
async function analyzeWithGemini(base64: string, mimeType: string) {
  const prompt = `Bạn là trợ lý y khoa chuyên khoa Sản Phụ. Hãy đọc tài liệu y tế này và trích xuất thông tin.

QUAN TRỌNG: Trả về KẾT QUẢ DƯỚI DẠNG JSON THUẦN TÚY, không markdown, không backtick.

{
  "patient_name": "Họ tên bệnh nhân (viết hoa đúng dấu tiếng Việt)",
  "dob": "Ngày sinh dd/mm/yyyy hoặc null nếu không có",
  "doc_type": "xet_nghiem hoặc don_thuoc hoặc ho_so hoặc khac",
  "summary": "Tóm tắt ngắn gọn 1-2 câu bằng tiếng Việt",
  "abnormal_items": ["Liệt kê từng chỉ số bất thường kèm giá trị, VD: Bạch cầu Mono 16.60% (cao)"],
  "is_abnormal": true hoặc false,
  "severity": "normal hoặc warning hoặc critical"
}

Quy tắc phân loại:
- is_abnormal = true nếu có BẤT KỲ chỉ số nào ngoài khoảng tham chiếu, hoặc Dương tính với bệnh truyền nhiễm (HIV, HBV, HCV, Giang mai, GBS).
- is_abnormal = false nếu TẤT CẢ chỉ số đều bình thường.
- severity = "critical" nếu có chỉ số nguy hiểm cần can thiệp ngay.
- severity = "warning" nếu có chỉ số bất thường nhẹ.
- severity = "normal" nếu mọi thứ bình thường.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: base64 } }
            ]
          }],
          generationConfig: { temperature: 0.1 }
        })
      }
    );

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    // Làm sạch response (loại bỏ markdown nếu có)
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('[GEMINI ERROR]', e);
    return {
      patient_name: '',
      doc_type: 'khac',
      summary: 'Không thể phân tích tài liệu này',
      abnormal_items: [],
      is_abnormal: false,
      severity: 'normal'
    };
  }
}

// ══════════════════════════════════════════════════════════
//  LIÊN KẾT MÃ BỆNH NHÂN
// ══════════════════════════════════════════════════════════
async function handleBnCodeLink(zaloId: string, code: string) {
  const { data: patient } = await sb
    .from('patients')
    .select('bn_code, name, profile_id')
    .eq('bn_code', code)
    .maybeSingle();

  if (patient) {
    if (patient.profile_id) {
      await sb.from('profiles')
        .update({ zalo_id: zaloId })
        .eq('id', patient.profile_id);
    }

    await sb.from('zalo_subscribers')
      .update({ bn_code: code, name: patient.name })
      .eq('zalo_id', zaloId);

    await sendZaloMessage(zaloId,
      `✅ Đã liên kết thành công!\n\nXin chào ${patient.name} 🌸\n` +
      `Từ nay tôi sẽ nhắc bạn ghi nhận sức khỏe mỗi tối lúc 20:00 nhé!`
    );
  } else {
    await sendZaloMessage(zaloId,
      `❌ Không tìm thấy mã ${code}.\n` +
      `Vui lòng kiểm tra lại mã bệnh nhân trong app hoặc liên hệ phòng khám.`
    );
  }
}

// ══════════════════════════════════════════════════════════
//  GỬI TIN NHẮN QUA ZALO BOT PLATFORMS API
// ══════════════════════════════════════════════════════════
async function sendZaloMessage(toId: string, content: string) {
  try {
    const res = await fetch(`https://bot-api.zaloplatforms.com/bot${ZALO_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: toId,
        text: content
      }),
    });
    const result = await res.json();
    console.log('[ZALO SEND]', result);
    return result;
  } catch (e) {
    console.error('[ZALO SEND ERROR]', e);
  }
}

// ══════════════════════════════════════════════════════════
//  TRẢ LỜI TỰ ĐỘNG
// ══════════════════════════════════════════════════════════
function buildAutoReply(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('xin chào') || m.includes('hello') || m.includes('hi'))
    return '🌸 Xin chào! Tôi là Bot của BS. Tuấn. Có điều gì tôi có thể giúp bạn không?';
  if (m.includes('lịch') || m.includes('hẹn'))
    return '📅 Để xem lịch hẹn, vui lòng mở app tại bstuan247.com và vào mục Lịch hẹn.';
  if (m.includes('kết quả') || m.includes('xét nghiệm'))
    return '🧪 Kết quả xét nghiệm sẽ được gửi tự động khi có. Bạn cũng có thể xem tại bstuan247.com';
  if (m.includes('khẩn cấp') || m.includes('cấp cứu'))
    return '🚨 KHẨN CẤP: Gọi ngay 115 hoặc đến cơ sở y tế gần nhất!\nHotline phòng khám: 0938559098';
  return (
    '💬 Cảm ơn bạn đã nhắn tin!\n\n' +
    'Để được hỗ trợ nhanh nhất:\n' +
    '• 📱 Mở app: bstuan247.com\n' +
    '• 📞 Hotline: 0938559098\n\n' +
    'Tôi sẽ nhắc bạn check-in sức khỏe mỗi tối lúc 20:00 🌙'
  );
}

// ── Helper: ArrayBuffer → Base64 ──
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
