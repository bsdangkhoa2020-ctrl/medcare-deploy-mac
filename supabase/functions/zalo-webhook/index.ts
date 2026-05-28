// ═══════════════════════════════════════════════════════════
//  Zalo Bot Creator — Webhook Handler v3.0 (Zalo Platforms API)
//  ✅ Xử lý chính xác định dạng message.image.received
//  URL: https://tnehhratorbrxjwzqnds.supabase.co/functions/v1/zalo-webhook
// ═══════════════════════════════════════════════════════════
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY = Deno.env.get('SB_SERVICE_KEY')!;
// Đã khôi phục lệnh đọc từ môi trường và fallback bằng token mới:
const ZALO_TOKEN   = Deno.env.get('ZALO_BOT_TOKEN') || '2942065296280499653:omLZHfVyvJAiHhWKZburnsSOPhzWqhmrVoWRvodfmZogKSiASWqUJCuFNrFEtIgM';
const GEMINI_KEY   = Deno.env.get('GEMINI_API_KEY')!;

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

Deno.serve(async (req) => {
  if (req.method === 'GET') {
    const url = new URL(req.url);
    if (url.searchParams.get('test_gemini')) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEY}`);
      return new Response(await res.text(), { status: 200 });
    }
    const challenge = url.searchParams.get('challenge') || 'ok';
    return new Response(challenge, { status: 200 });
  }

  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const body = await req.json();
    console.log('🔴 [WEBHOOK PAYLOAD]:', JSON.stringify(body));

    const event    = body?.event_name;
    const zaloId   = body?.message?.from?.id || body?.message?.chat?.id || body?.sender?.id || body?.follower?.id || body?.user_id_by_app;
    let msgText  = body?.message?.text || body?.message?.caption || '';

    if (!zaloId) {
      console.error('🔴 KHÔNG TÌM THẤY ZALO ID TRONG PAYLOAD:', JSON.stringify(body));
      return new Response('ok', { status: 200 });
    }

    // ── XỬ LÝ NHẬN ẢNH / FILE ──
    if (event === 'message.image.received' || event === 'message.file.received' || event === 'user_send_image' || event === 'user_send_file') {
      await handleFileUpload(zaloId, body);
      return new Response('ok', { status: 200 });
    }

    // ── XỬ LÝ NHẬN TEXT ──
    if (event === 'message.text.received' || event === 'user_send_text' || msgText.trim() !== '') {
      const code = msgText.trim().toUpperCase();
      const phoneRegex = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;
      
      if (code === '/START' || code === 'BẮT ĐẦU') {
        const { data: sub } = await sb.from('zalo_subscribers').select('zalo_id').eq('zalo_id', zaloId).maybeSingle();
        if (sub) {
          const magicLink = `https://bstuan247.com/login?token=${zaloId}`;
          await sendZaloMessage(zaloId, `🌸 Chào mừng chị quay trở lại!\n\nHồ sơ của chị đã sẵn sàng. Chị có thể hỏi em bất cứ vấn đề gì về sức khoẻ, hoặc bấm vào link dưới đây để xem hồ sơ bệnh án nhé:\n👉 ${magicLink}`);
        } else {
          await sendZaloMessage(zaloId, '🌸 Pk Bs Hoàng Thanh Tuấn, xin chào!\nĐể có thể tư vấn chính xác nhất, chị vui lòng "Chụp Ảnh Toa Thuốc" gần nhất gửi vào đây để đăng ký tài khoản nhé. 🙇‍♀️🙇‍♀️🙇‍♀️');
        }
      } else if (/^(OB|GY)\d{3,}$/.test(code)) {
        await handleBnCodeLink(zaloId, code);
      } else if (phoneRegex.test(code)) {
        const phone = code.match(phoneRegex)[0];
        await handlePhoneVerification(zaloId, phone);
      } else {
        // Kiểm tra xem bệnh nhân đã đăng ký chưa
        const { data: sub } = await sb.from('zalo_subscribers').select('zalo_id').eq('zalo_id', zaloId).maybeSingle();
        if (sub) {
          // Đã đăng ký -> Cho phép chat với AI ảo
          await handleChatWithBot(zaloId, msgText);
        } else {
          // Chưa đăng ký -> Yêu cầu chụp ảnh toa thuốc
          await sendZaloMessage(zaloId, '🌸 Pk Bs Hoàng Thanh Tuấn, xin chào!\nĐể có thể tư vấn chính xác nhất, chị vui lòng "Chụp Ảnh Toa Thuốc" gần nhất gửi vào đây để đăng ký tài khoản nhé. 🙇‍♀️🙇‍♀️🙇‍♀️');
        }
      }
      return new Response('ok', { status: 200 });
    }
    
    // ── NẾU GỬI FILE PDF BỊ ZALO CHẶN ──
    if (event === 'message.unsupported.received') {
      await sendZaloMessage(zaloId, "❌ Rất tiếc, hệ thống Zalo Bot hiện tại chưa hỗ trợ nhận File tài liệu (PDF/Word). Bạn vui lòng **gửi File ẢNH (JPG/PNG) hoặc chụp màn hình** kết quả xét nghiệm nhé!");
      return new Response('ok', { status: 200 });
    }

    if (event === 'follow') {
      const { data: sub } = await sb.from('zalo_subscribers').select('zalo_id').eq('zalo_id', zaloId).maybeSingle();
      if (sub) {
        const magicLink = `https://bstuan247.com/login?token=${zaloId}`;
        await sendZaloMessage(zaloId, `🌸 Chào mừng chị quay trở lại!\n\nHồ sơ của chị đã sẵn sàng. Chị có thể hỏi em bất cứ vấn đề gì về sức khoẻ, hoặc bấm vào link dưới đây để xem hồ sơ bệnh án nhé:\n👉 ${magicLink}`);
      } else {
        await sendZaloMessage(zaloId, '🌸 Pk Bs Hoàng Thanh Tuấn, xin chào!\nĐể có thể tư vấn chính xác nhất, chị vui lòng "Chụp Ảnh Toa Thuốc" gần nhất gửi vào đây để đăng ký tài khoản nhé. 🙇‍♀️🙇‍♀️🙇‍♀️');
      }
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
  
  await sendZaloMessage(zaloId, `📥 Hệ thống nhận được "Toa Thuốc" của chị, đang tiến hành tạo tài khoản...`);

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
    if (matchedBnCode || matchedName) {
      if (aiResult.is_abnormal) {
        await sendZaloMessage(zaloId, `⚠️ KẾT QUẢ BẤT THƯỜNG\n👤 Bệnh nhân: ${matchedName}\n📋 Tóm tắt: ${aiResult.summary}\n\n⏳ Kết quả đã được đưa vào diện cảnh báo và đang chờ Bác sĩ duyệt.`);
      } else {
        const dobStr = aiResult.dob ? `\n- Sinh ngày: ${aiResult.dob}` : '';
        const nextAppStr = aiResult.next_appointment ? `\n- Ngày tái khám tiếp theo là ${aiResult.next_appointment}.` : '';
        await sendZaloMessage(zaloId, `Em xin được tóm tắt hồ sơ:\n- Chị "${matchedName.toUpperCase()}",${dobStr}\n- Chẩn đoán: ${aiResult.summary}${nextAppStr}\nĐể hoàn tất, chị vui lòng cho em xin **Số Điện Thoại** nhé !`);
      }
    } else {
      await sendZaloMessage(zaloId, `📥 Đã lưu tài liệu thành công.\n👤 Tên trong phiếu: Không rõ\n⚠️ Không tìm thấy tên trên phiếu, chị vui lòng chụp lại rõ nét hơn nhé.`);
    }
  } catch (e) { 
    await sendZaloMessage(zaloId, `❌ Lỗi xử lý AI/Storage: ${(e as Error).message}`); 
  }
}

async function analyzeWithGemini(base64: string, mimeType: string) {
  const prompt = `Trích xuất thông tin y tế dưới dạng JSON THUẦN TÚY: {"patient_name": "Tên bệnh nhân nếu có", "dob": "Ngày tháng năm sinh nếu có (VD: 01/01/1990), nếu không có để trống", "doc_type": "xet_nghiem/don_thuoc/khac", "summary": "Chẩn đoán ngắn gọn (VD: thai 5 tuần)", "next_appointment": "Ngày tái khám tiếp theo nếu có (VD: 19/05/2026), nếu không để trống", "abnormal_items": ["..."], "is_abnormal": true/false (nếu có bất thường cần bác sĩ xem)}`;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`, {
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

async function handlePhoneVerification(zaloId: string, phone: string) {
  // Lưu user vào bảng zalo_subscribers để đánh dấu là Đã Đăng Ký
  await sb.from('zalo_subscribers').upsert({ zalo_id: zaloId, bn_code: `TEMP_${phone}`, name: 'Bệnh nhân' }, { onConflict: 'zalo_id' });

  const magicLink = `https://bstuan247.com/login?token=${zaloId}`;
  const msg = `✅ Tài khoản đã được tạo! Để xem hồ sơ bệnh án, kết quả xét nghiệm, toa thuốc của mình, chị hãy ấn vào link bên dưới:\n\n👉 ${magicLink}\n\nTừ bây giờ, chị có thể hỏi em bất cứ vấn đề gì về sức khoẻ nhé!`;
  await sendZaloMessage(zaloId, msg);
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
  
  const systemPrompt = `Bạn là Trợ lý ảo Y khoa cao cấp của Hệ thống Y tế Bstuan247 (Phòng khám Sản Phụ khoa BS CK1 Hoàng Thanh Tuấn).
🎯 PHONG CÁCH GIAO TIẾP:
- Ấm áp, thấu cảm, lịch sự và mang hơi hướng phòng khám "boutique" cao cấp.
- Xưng hô: "Trợ lý ảo" hoặc "Phòng khám" và gọi người dùng là "chị" hoặc "bạn".
- Luôn dùng emoji nhẹ nhàng (🌸, 💖, 🩺). Câu văn ngắn gọn, dễ hiểu, chia đoạn rõ ràng (tối đa 150-200 chữ).

🩺 NGUYÊN TẮC Y KHOA TỐI THƯỢNG:
1. Đưa ra lời khuyên tham khảo, trấn an tâm lý. TUYỆT ĐỐI KHÔNG kê đơn thuốc hay chẩn đoán xác định.
2. Dấu hiệu NGUY HIỂM (đau bụng dữ dội, ra máu thai kỳ, thai ít máy...): Phải cảnh báo KHẨN CẤP và khuyên đến phòng khám ngay lập tức.
3. Luôn khéo léo mời bệnh nhân đặt lịch đến phòng khám để BS Tuấn trực tiếp siêu âm/thăm khám.
4. Nhắc nhẹ: Bệnh nhân có thể gửi ẢNH chụp kết quả siêu âm/xét nghiệm vào đây, AI sẽ tự động đọc và báo cáo cho Bác sĩ.

💬 CÂU HỎI CỦA BỆNH NHÂN:
"${userText}"`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`, {
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
