// ═══════════════════════════════════════════════════════════
//  Zalo Bot Creator — Webhook Handler v3.0 (Zalo Platforms API)
//  ✅ Xử lý chính xác định dạng message.image.received
//  URL: https://tnehhratorbrxjwzqnds.supabase.co/functions/v1/zalo-webhook
// ═══════════════════════════════════════════════════════════
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY = Deno.env.get('SB_SERVICE_KEY')!;
// Đã xóa lệnh đọc két sắt cũ để máy chủ BẮT BUỘC dùng token mới:
const ZALO_TOKEN   = '2942065296280499653:LsDMgYWDiJmiDvXtqMtngiGuSrZzSqIkjpZnulLRwkDCAeVlJwTOEaRSXwjCiHvc';
const GEMINI_KEY   = Deno.env.get('GEMINI_API_KEY')!;

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

Deno.serve(async (req) => {
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const challenge = url.searchParams.get('challenge') || 'ok';
    return new Response(challenge, { status: 200 });
  }

  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const body = await req.json();
    console.log('🔴 [WEBHOOK PAYLOAD]:', JSON.stringify(body));

    const event    = body?.event_name;
    const zaloId   = body?.message?.from?.id || body?.message?.chat?.id || body?.sender?.id;
    const msgText  = body?.message?.text || body?.message?.caption || '';

    if (!zaloId) {
      return new Response('ok', { status: 200 });
    }

    // ── XỬ LÝ NHẬN ẢNH / FILE ──
    if (event === 'message.image.received' || event === 'message.file.received' || event === 'user_send_image' || event === 'user_send_file') {
      await handleFileUpload(zaloId, body);
      return new Response('ok', { status: 200 });
    }

    // ── XỬ LÝ NHẬN TEXT ──
    if (event === 'message.text.received' || event === 'user_send_text') {
      const code = msgText.trim().toUpperCase();
      if (/^(OB|GY)\d{3,}$/.test(code)) {
        await handleBnCodeLink(zaloId, code);
      } else {
        // Chat với AI ảo
        await handleChatWithBot(zaloId, msgText);
      }
      return new Response('ok', { status: 200 });
    }
    
    // ── NẾU GỬI FILE PDF BỊ ZALO CHẶN ──
    if (event === 'message.unsupported.received') {
      await sendZaloMessage(zaloId, "❌ Rất tiếc, hệ thống Zalo Bot hiện tại chưa hỗ trợ nhận File tài liệu (PDF/Word). Bạn vui lòng **gửi File ẢNH (JPG/PNG) hoặc chụp màn hình** kết quả xét nghiệm nhé!");
      return new Response('ok', { status: 200 });
    }

    if (event === 'follow') {
      await sendZaloMessage(zaloId, '🌸 Chào mừng bạn đến với Bot của BS. Hoàng Thanh Tuấn!\n\nĐể liên kết tài khoản, hãy nhắn mã BN (ví dụ: OB001)');
    }

    return new Response('ok', { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response('ok', { status: 200 });
  }
});

async function handleFileUpload(zaloId: string, body: any) {
  // Bóc tách URL dựa theo các chuẩn Zalo khác nhau
  let fileUrl = body?.message?.photo_url || body?.message?.file_url;
  let fileType = 'application/octet-stream';
  
  if (body?.message?.attachments) {
    const attachments = body.message.attachments;
    fileUrl  = attachments?.[0]?.payload?.url || attachments?.[0]?.payload?.thumbnail;
    fileType = attachments?.[0]?.payload?.type || fileType;
  }

  if (!fileUrl) { 
    await sendZaloMessage(zaloId, '❌ Lỗi: Bot không thể tìm thấy đường dẫn file đính kèm từ Zalo.'); 
    return; 
  }
  
  await sendZaloMessage(zaloId, `📥 Đã nhận một tài liệu mới. Đang nạp vào kho AI Gemini để phân tích... ⏳`);

  try {
    const fileRes = await fetch(fileUrl);
    const fileBuffer = await fileRes.arrayBuffer();
    const mimeType = fileRes.headers.get('content-type') || fileType;
    let ext = 'bin';
    if (mimeType.includes('pdf')) ext = 'pdf';
    else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('word')) ext = 'docx';

    const fileName = `upload_${Date.now()}.${ext}`;
    
    // Upload Storage
    const storagePath = `zalo_uploads/${fileName}`;
    await sb.storage.from('records').upload(storagePath, fileBuffer, { contentType: mimeType, upsert: false });
    const { data: urlData } = sb.storage.from('records').getPublicUrl(storagePath);

    // AI Gemini
    const base64 = arrayBufferToBase64(fileBuffer);
    const aiResult = await analyzeWithGemini(base64, mimeType);

    // Tìm BN & Lưu EMR
    let matchedBnCode = null, matchedName = aiResult.patient_name || '';
    if (matchedName) {
      const { data: patients } = await sb.from('patients').select('bn_code, name').ilike('name', `%${matchedName}%`).limit(3);
      if (patients?.length === 1) { 
        matchedBnCode = patients[0].bn_code; 
        matchedName = patients[0].name; 
      }
    }

    await sb.from('attachments').insert({
      bn_code: matchedBnCode, file_name: fileName, storage_path: storagePath, file_size: fileBuffer.byteLength,
      mime_type: mimeType, doctype: aiResult.doc_type || 'khac', scan_type: aiResult.doc_type || 'khac',
      status: 'ai_processed', is_saved_to_emr: true,
      ai_extracted: { result: aiResult.summary, parsed: aiResult, type: aiResult.doc_type, is_abnormal: aiResult.is_abnormal, public_url: urlData?.publicUrl }
    });

    // Thông báo
    if (matchedBnCode) {
      if (aiResult.is_abnormal) {
        await sendZaloMessage(zaloId, `⚠️ KẾT QUẢ BẤT THƯỜNG\n👤 Bệnh nhân: ${matchedName}\n📋 Tóm tắt: ${aiResult.summary}\n\n⏳ Kết quả đã được đưa vào diện cảnh báo và đang chờ Bác sĩ duyệt.`);
      } else {
        const { data: sub } = await sb.from('zalo_subscribers').select('zalo_id').eq('bn_code', matchedBnCode).maybeSingle();
        if (sub?.zalo_id) {
          await sendZaloMessage(sub.zalo_id, `🌸 Chào ${matchedName}! Phòng khám đã nhận được kết quả khám của bạn. Mọi thứ bình thường.\n📄 Xem chi tiết: ${urlData?.publicUrl}`);
        }
        await sendZaloMessage(zaloId, `✅ Đã lưu hồ sơ thành công!\n👤 Bệnh nhân: ${matchedName}\n🟢 Đánh giá: Bình thường (Đã tự động gửi kết quả cho bệnh nhân).`);
      }
    } else {
      await sendZaloMessage(zaloId, `📥 Đã lưu tài liệu thành công.\n👤 Tên trong phiếu: ${matchedName || 'Không rõ'}\n⚠️ Không tìm thấy mã hồ sơ trên hệ thống web để tự động liên kết.`);
    }
  } catch (e) { 
    await sendZaloMessage(zaloId, `❌ Lỗi xử lý AI/Storage: ${(e as Error).message}`); 
  }
}

async function analyzeWithGemini(base64: string, mimeType: string) {
  const prompt = `Trích xuất thông tin y tế dưới dạng JSON THUẦN TÚY: {"patient_name": "Tên bệnh nhân nếu có", "doc_type": "xet_nghiem/don_thuoc/khac", "summary": "Tóm tắt ngắn gọn", "abnormal_items": ["..."], "is_abnormal": true/false (nếu có bất thường cần bác sĩ xem)`;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data: base64 } }] }], generationConfig: { temperature: 0.1 } })
    });
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch (e) { 
    console.error('[GEMINI ERROR]', e);
    return { is_abnormal: false }; 
  }
}

async function handleBnCodeLink(zaloId: string, code: string) {
  const { data: p } = await sb.from('patients').select('bn_code, name, profile_id').eq('bn_code', code).maybeSingle();
  if (p) {
    if (p.profile_id) await sb.from('profiles').update({ zalo_id: zaloId }).eq('id', p.profile_id);
    await sb.from('zalo_subscribers').upsert({ zalo_id: zaloId, bn_code: code, name: p.name }, { onConflict: 'zalo_id' });
    await sendZaloMessage(zaloId, `✅ Kích hoạt thành công hồ sơ bệnh nhân: ${p.name}\nTừ giờ bạn sẽ tự động nhận được thông báo từ Bác sĩ Tuấn nhé!`);
  } else {
    await sendZaloMessage(zaloId, `❌ Không tìm thấy hồ sơ mang mã ${code}. Bạn vui lòng kiểm tra lại nhé.`);
  }
}

async function sendZaloMessage(toId: string, content: string) {
  try {
    const res = await fetch(`https://bot-api.zaloplatforms.com/bot${ZALO_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: toId, text: content }),
    });
    console.log('[ZALO SEND]', await res.json());
  } catch (e) { console.error('[ZALO SEND ERROR]', e); }
}

function buildAutoReply(m: string) { return '🌸 Xin chào! Cảm ơn bạn đã nhắn tin cho Bot của BS. Tuấn. Nếu bạn là Lễ tân, hãy đính kèm ảnh chụp/PDF xét nghiệm để hệ thống tự động xử lý nhé.'; }
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ── HÀM CHAT AI CHO BỆNH NHÂN ──
async function handleChatWithBot(zaloId: string, userText: string) {
  await sendZaloMessage(zaloId, "💭 Bác sĩ ảo đang suy nghĩ...");
  
  const systemPrompt = `Bạn là Trợ lý ảo AI của Phòng khám Sản phụ khoa BS CK1 Hoàng Thanh Tuấn. Bạn có kiến thức y khoa chuyên sâu. 
Nhiệm vụ của bạn: Trả lời thân thiện, ngắn gọn (dưới 150 chữ), và luôn khuyên bệnh nhân nếu có dấu hiệu nặng thì nên đến phòng khám gặp Bác sĩ Tuấn.
Bệnh nhân hỏi: "${userText}"`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: systemPrompt }] }], 
        generationConfig: { temperature: 0.7 } 
      })
    });
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, não AI của tôi đang bận. Bạn thử lại sau nhé!';
    await sendZaloMessage(zaloId, text);
  } catch (e) { 
    await sendZaloMessage(zaloId, "Xin lỗi, đường truyền đến AI đang bị gián đoạn.");
  }
}
