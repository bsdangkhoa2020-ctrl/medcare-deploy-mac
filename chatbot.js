// ══════════════════════════════════════════════════════════
// CHATBOT.JS — AI Chat module tách từ index.html
// ══════════════════════════════════════════════════════════
// File này chứa toàn bộ logic chat AI:
//   - Persona BN (Cô Hương) + Persona BS (Trợ lý chuyên môn)
//   - Format markdown-lite, render bubble, typing indicator
//   - Emergency keyword detection
//   - Build context từ bệnh án (curUser, patientsDB)
//   - Gọi Gemini qua Supabase Edge Function (gemini-proxy)
//
// PHỤ THUỘC GLOBAL (phải đã load từ index.html):
//   - SUPABASE_URL          (URL Supabase project)
//   - DOC                   (avatar bot base64)
//   - curUser, chatHist     (state)
//   - patientsDB            (database BN cho admin/BS view)
//   - currentPatientCode    (BS đang xem BN nào)
//   - calcGA(lmpStr)        (tính tuần thai)
//   - toast(msg)            (hiển thị thông báo)
//
// EXPOSE GLOBAL (cần cho onclick handlers trong HTML):
//   - sendMsg, clearChat, sendChip, hideEmergency, showEmergency
//
// DEBUG: thêm ?debug=1 vào URL để xem log chi tiết
// ══════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════
// AI CHAT — NÂNG CẤP TOÀN DIỆN
// ══════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════
// AI CHAT — GỌI QUA SUPABASE EDGE FUNCTION (KHÔNG LỘ KEY)
// ══════════════════════════════════════════════════════════

const GEMINI_PROXY_URL = SUPABASE_URL + "/functions/v1/gemini-proxy";
const GEMINI_MODEL = "gemini-2.5-flash"; // free tier 15 RPM
const IS_DEMO_DATA = true; // ⚠️ false khi dùng BN thật → bắt buộc anonymize

// ── PERSONA 1: Cô Hương (dành cho BN) ─────────────────
const SYS_BN = `Bạn là Cô Hương — trợ lý AI của BS.CKI Hoàng Thanh Tuấn (Phụ Sản 315, 167-169 Bình Phú, Q.6, TP.HCM).

VAI TRÒ: Hỗ trợ BN mang thai. Giọng ấm áp, gần gũi, xưng "cô" gọi BN bằng tên.

NGUYÊN TẮC:
1. Trả lời NGẮN GỌN (3-5 câu), tiếng Việt, có emoji y tế (🟢🟡🔴) khi cần
2. Trấn an trước → đưa thông tin → khuyến nghị
3. KHÔNG kê đơn, KHÔNG chẩn đoán xác định
4. Câu hỏi về thuốc/triệu chứng cụ thể → "Cô khuyên con liên hệ BS Tuấn trực tiếp qua Zalo/hotline phòng khám"
5. Cấp cứu (ra máu, đau dữ dội, vỡ ối, không cử động thai) → trả JSON: {"emergency":true,"message":"...","reason":"..."}
6. Nhắc lịch khám sắp tới + tuần thai hiện tại nếu phù hợp

KIẾN THỨC SẢN KHOA:
- Mốc thai: tuần 12 (Double test), 20 (SA hình thái), 24-28 (OGTT 75g), 35-37 (GBS)
- Cử động thai: ≥10 lần/2h từ tuần 28
- Cảnh báo tiền sản giật: HA≥140/90 + phù + đau đầu sau tuần 20
- Thuốc an toàn (cat A/B): sắt, acid folic, canxi, vitamin D, paracetamol`;

// ── PERSONA 2: Trợ lý BS (dành cho BS Tuấn) ────────────
const SYS_BS = `Bạn là trợ lý AI chuyên môn của BS.CKI Hoàng Thanh Tuấn — chuyên Sản Phụ Khoa, BV Hùng Vương TP.HCM (10+ năm kinh nghiệm).

VAI TRÒ: Hỗ trợ BS Tuấn ra quyết định lâm sàng nhanh. Giọng đồng nghiệp ngang hàng, xưng "tôi" gọi BS là "anh" hoặc "BS".

NGUYÊN TẮC:
1. NGẮN GỌN, đi thẳng vào chuyên môn — không giải thích lay
2. Dùng thuật ngữ y khoa chuẩn (PARA, GA, EFW, NT, OGTT, NST, BPP, CTG...)
3. Trích nguồn khi có (ACOG, RCOG, Bộ Y tế, Cochrane)
4. Hiểu cả viết tắt y khoa lẫn tiếng Việt
5. Khi không chắc → nói "tôi không chắc, anh check lại guideline X"

KHẢ NĂNG:
- Tóm tắt bệnh án (khi BS hỏi "tóm tắt" / "BN này thế nào")
- Draft tin nhắn dặn dò BN (khi BS hỏi "soạn tin nhắn..." / "draft message...")
- Gợi ý câu hỏi cần hỏi BN lần khám tới
- Phân tích chỉ số XN/SA bất thường
- Suggest differential diagnosis
- KHÔNG thay BS quyết định cuối — chỉ là second opinion

FORMAT TÓM TẮT BỆNH ÁN:
👤 [Tên · Mã · Tuổi · PARA]
🤰 [GA · EDD · Tam cá nguyệt]
📋 [Tiền sử nổi bật]
🔬 [XN/SA gần nhất + flag bất thường]
💊 [Đơn thuốc đang dùng]
⚠️ [Risk factors / điểm cần lưu ý]`;

// Backward compat — code cũ vẫn dùng biến SYS
const SYS = SYS_BN;

// ── Format bot message (markdown-lite) ───────────────
function formatBotMsg(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^#{1,3}\s+(.+)$/gm, '<div style="font-size:14px;font-weight:800;margin:8px 0 4px;">$1</div>')
    .replace(/^[•\-]\s+(.+)$/gm, '<div style="display:flex;gap:6px;margin:2px 0;"><span>•</span><span>$1</span></div>')
    .replace(/^\d+\.\s+(.+)$/gm, '<div style="display:flex;gap:6px;margin:2px 0;"><span style="font-weight:700;color:var(--bl);">$&</span></div>')
    .replace(/🟢/g, '<span style="color:#16A34A;">🟢</span>')
    .replace(/🟡/g, '<span style="color:#CA8A04;">🟡</span>')
    .replace(/🔴/g, '<span style="color:#DC2626;">🔴</span>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

// ── Render message ────────────────────────────────────
function addMsg(txt, role) {
  const L = document.getElementById('msgList');
  const u = role === 'user';
  const r = document.createElement('div');
  r.className = 'mrow' + (u ? ' u' : '');

  const content = u
    ? `<div class="muser">BN</div>
       <div>
         <div class="bbl usr">${txt.replace(/\n/g,'<br>')}</div>
         <div class="mt" style="text-align:right;">${gt()}</div>
       </div>`
    : `<div class="mbot"><img src="${DOC}"></div>
       <div style="max-width:280px;">
         <div class="bbl bot" style="line-height:1.7;">${formatBotMsg(txt)}</div>
         <div class="mt">${gt()}</div>
       </div>`;

  r.innerHTML = content;
  L.appendChild(r);
  L.scrollTop = L.scrollHeight;
}

// ── Show/hide typing ──────────────────────────────────
function showTyping() {
  const L = document.getElementById('msgList');
  const r = document.createElement('div');
  r.className = 'mrow'; r.id = 'trow';
  r.innerHTML = `<div class="mbot"><img src="${DOC}"></div>
    <div class="bbl bot typ"><div class="tdots"><span></span><span></span><span></span></div></div>`;
  L.appendChild(r);
  L.scrollTop = L.scrollHeight;
}
function rmTyping() { const t = document.getElementById('trow'); if (t) t.remove(); }

// ── Emergency detection ───────────────────────────────
const EMERGENCY_KW = [
  'ra máu nhiều','chảy máu nhiều','xuất huyết ồ ạt',
  'đau không chịu được','đau dữ dội','co thắt liên tục',
  'thai không đạp','bé không đạp','không cảm nhận thai',
  'vỡ ối','nước ối chảy','ối vỡ',
  'co giật','ngất','bất tỉnh',
  'khó thở đột ngột','không thở được',
  'nhức đầu dữ','hoa mắt tối sầm','mờ mắt đột ngột',
  'sốt 39','sốt 40','sốt cao không hạ',
  'tai nạn','ngã mạnh','chấn thương bụng',
  'đau ngực dữ','tim đập loạn',
  'phù nặng','tay chân phù to'
];
function isEmergency(text) {
  const t = text.toLowerCase();
  return EMERGENCY_KW.some(k => t.includes(k));
}
function showEmergency() {
  const b = document.getElementById('emergency-banner');
  if (b) b.style.display = 'block';
}
function hideEmergency() {
  const b = document.getElementById('emergency-banner');
  if (b) b.style.display = 'none';
}

// ── Build context đầy đủ từ bệnh án ─────────────────
// Dùng cho cả BN (currentBNProfile/curUser) và BS (currentPatientCode)
function buildUserContext() {
  // Detect role: BS đang xem BN nào → dùng patientsDB; BN tự xem mình → dùng curUser
  var isBS = (curUser && curUser.role === 'admin') || (typeof currentPatientCode !== 'undefined' && currentPatientCode && typeof patientsDB !== 'undefined' && patientsDB[currentPatientCode]);
  var p = null;

  if (isBS && typeof currentPatientCode !== 'undefined' && currentPatientCode) {
    // BS đang xem 1 BN cụ thể trong patientsDB
    p = patientsDB[currentPatientCode];
  } else if (curUser && curUser.role === 'ob') {
    // BN tự đăng nhập — dùng curUser + map sang patientsDB nếu match code
    if (curUser.code && typeof patientsDB !== 'undefined' && patientsDB[curUser.code]) {
      p = patientsDB[curUser.code];
    } else {
      // Fallback: chỉ có thông tin curUser
      var g = curUser.lmp ? calcGA(curUser.lmp) : null;
      var ctx = '\n\n[BỐI CẢNH BN]\nTên: ' + (curUser.name || 'BN') + '\nMã: ' + (curUser.code || '') + '\nVai trò: BN sản khoa';
      if (g) ctx += '\nTuần thai: ' + g.wk + ' tuần ' + g.d + ' ngày, EDD ' + g.edd;
      return ctx;
    }
  }

  if (!p) return '\n\n[BỐI CẢNH] Chưa chọn BN cụ thể.';

  // ── Build full context ──
  var lines = [];
  lines.push('\n\n[HỒ SƠ BỆNH NHÂN ' + (IS_DEMO_DATA ? '(DEMO)' : '') + ']');
  lines.push('Họ tên: ' + (p.name || ''));
  lines.push('Mã BN: ' + (p.code || ''));
  if (p.age) lines.push('Tuổi: ' + p.age);
  if (p.sex) lines.push('Giới: ' + p.sex);
  if (p.phone) lines.push('SĐT: ' + p.phone);
  if (p.history) lines.push('Tiền sử: ' + p.history);

  // PARA
  if (p.para) {
    lines.push('PARA: ' + p.para.full + '-' + p.para.preterm + '-' + p.para.abortion + '-' + p.para.alive +
      ' (đủ tháng-non tháng-sảy-sống)');
  }

  // Thai kỳ
  if (p.lmp && typeof calcGA === 'function') {
    var g = calcGA(p.lmp);
    if (g && g.wk) {
      lines.push('LMP: ' + p.lmp);
      lines.push('Tuần thai: ' + g.wk + ' tuần ' + g.d + ' ngày');
      lines.push('EDD: ' + g.edd);
    }
  }
  if (p.pregnancy) {
    if (p.pregnancy.gainWeight) lines.push('Tăng cân: ' + p.pregnancy.gainWeight);
    if (p.pregnancy.bp) lines.push('HA: ' + p.pregnancy.bp);
    if (p.pregnancy.note) lines.push('Ghi chú thai kỳ: ' + p.pregnancy.note);
  }
  if (p.dx) lines.push('Chẩn đoán: ' + p.dx);

  // Visits (3 gần nhất)
  if (p.visits && p.visits.length) {
    lines.push('\n[LẦN KHÁM GẦN ĐÂY]');
    p.visits.slice(0, 3).forEach(function(v, i) {
      lines.push((i+1) + '. ' + (v.date||'') + ' · ' + (v.type||'') +
        (v.bp ? ' · HA ' + v.bp : '') +
        (v.weight ? ' · CN ' + v.weight + 'kg' : '') +
        (v.ga ? ' · GA ' + v.ga : '') +
        (v.note ? ' — ' + v.note : ''));
    });
  }

  // Exams (XN)
  if (p.exams && p.exams.length) {
    lines.push('\n[XÉT NGHIỆM]');
    p.exams.slice(0, 5).forEach(function(e, i) {
      lines.push((i+1) + '. ' + (e.date||'') + ' · ' + (e.name||'') +
        (e.result ? ' — ' + e.result : '') +
        (e.note ? ' (' + e.note + ')' : ''));
    });
  }

  // Ultrasounds
  if (p.ultrasounds && p.ultrasounds.length) {
    lines.push('\n[SIÊU ÂM]');
    p.ultrasounds.slice(0, 3).forEach(function(u, i) {
      lines.push((i+1) + '. ' + (u.date||'') + ' · ' + (u.name||'') +
        (u.note ? ' — ' + u.note : ''));
    });
  }

  // Prescriptions
  if (p.prescriptions && p.prescriptions.length) {
    lines.push('\n[ĐƠN THUỐC]');
    p.prescriptions.slice(0, 3).forEach(function(rx, i) {
      lines.push((i+1) + '. ' + (rx.date||''));
      if (rx.drugs) rx.drugs.forEach(function(d, j) {
        lines.push('   - ' + d);
      });
      if (rx.note) lines.push('   Lời dặn: ' + rx.note);
    });
  }

  return lines.join('\n');
}

// ── Detect role để chọn persona phù hợp ──────────────
function getActivePersona() {
  // BS: login admin HOẶC đang ở screen quản lý BN
  if (curUser && curUser.role === 'admin') return 'BS';
  // Mặc định BN
  return 'BN';
}

// ── Send message ──────────────────────────────────────
async function sendMsg() {
  if (sending) return;
  const inp = document.getElementById('chatInp');
  const txt = inp.value.trim();
  if (!txt) return;

  inp.value = '';
  document.getElementById('sendBtn').disabled = true;
  const cr = document.getElementById('chipsRow');
  if (cr) cr.style.display = 'none';
  sending = true;

  addMsg(txt, 'user');
  if (isEmergency(txt)) showEmergency();

  chatHist.push({ role: 'user', content: txt });
  showTyping();

  try {
    // Chọn persona theo role (BS hoặc BN)
    const activePersona = getActivePersona();
    const baseSys = (activePersona === 'BS') ? SYS_BS : SYS_BN;
    const sysWithCtx = baseSys + buildUserContext();

    // Build Gemini messages từ chatHist (giữ 6 lượt gần nhất để tiết kiệm token)
    const prior = chatHist.slice(-7); // gồm cả tin user vừa gửi
    const contents = prior.map(function(m) {
      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      };
    });

    // Body gửi tới Edge Function (Edge Function sẽ forward sang Gemini)
    const requestBody = JSON.stringify({
      model: GEMINI_MODEL,
      systemInstruction: sysWithCtx,
      contents: contents,
      generationConfig: {
        temperature: activePersona === 'BS' ? 0.3 : 0.5, // BS cần chính xác hơn
        maxOutputTokens: 800
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
      ]
    });

    // Auto-retry cho lỗi tạm thời (503/500/429)
    const RETRY_CODES = [500, 502, 503, 504, 429];
    const MAX_RETRIES = 3;
    const BACKOFF = [0, 1500, 3000]; // ms: lần 1 ngay, lần 2 sau 1.5s, lần 3 sau 3s
    let resp = null;
    let lastErrText = '';

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (BACKOFF[attempt] > 0) {
        const tEl = document.querySelector('#trow .bbl');
        if (tEl) tEl.innerHTML = '<div class="tdots"><span></span><span></span><span></span></div><div style="font-size:10px;color:#8A7787;margin-top:4px;">Đang thử lại lần ' + (attempt+1) + '...</div>';
        await new Promise(r => setTimeout(r, BACKOFF[attempt]));
      }
      try {
        resp = await fetch(GEMINI_PROXY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + SUPABASE_PUBLISHABLE_KEY,
            'apikey': SUPABASE_PUBLISHABLE_KEY
          },
          body: requestBody
        });
        if (resp.ok) break; // ✅ thành công
        lastErrText = await resp.text();
        if (RETRY_CODES.indexOf(resp.status) === -1) break; // lỗi không đáng retry → stop
        console.warn('Edge Function retry', attempt+1, 'status', resp.status);
      } catch (netErr) {
        lastErrText = 'Network: ' + (netErr.message || '');
        console.warn('Network retry', attempt+1, netErr);
      }
    }

    if (!resp || !resp.ok) {
      throw new Error('Edge Function ' + (resp ? resp.status : 'NETWORK') + ': ' + lastErrText.substring(0, 300));
    }

    const data = await resp.json();
    const raw = (data.candidates && data.candidates[0] && data.candidates[0].content &&
                 data.candidates[0].content.parts && data.candidates[0].content.parts[0])
                 ? data.candidates[0].content.parts[0].text
                 : '⚠️ AI không trả lời. ' + (data.promptFeedback ? 'Lý do: ' + JSON.stringify(data.promptFeedback) : '');
    rmTyping();

    // Check for emergency JSON
    let display = raw;
    try {
      const jm = raw.match(/\{[\s\S]*?"emergency"\s*:\s*true[\s\S]*?\}/);
      if (jm) {
        const parsed = JSON.parse(jm[0]);
        if (parsed.emergency) { showEmergency(); display = parsed.message || raw; }
      }
    } catch(e) {}

    if (isEmergency(raw)) showEmergency();

    addMsg(display, 'bot');
    chatHist.push({ role: 'assistant', content: raw });

  } catch(e) {
    rmTyping();
    var errMsg = '⚠️ Lỗi kết nối AI: ' + (e.message || 'không rõ');
    if (e.message && e.message.indexOf('401') > -1) errMsg = '⚠️ Auth lỗi. Kiểm tra SUPABASE key.';
    else if (e.message && e.message.indexOf('400') > -1) errMsg = '⚠️ Request không hợp lệ.';
    else if (e.message && e.message.indexOf('429') > -1) errMsg = '⚠️ Vượt quota (15 req/phút). Đợi 1 phút thử lại.';
    else if (e.message && e.message.indexOf('403') > -1) errMsg = '⚠️ Edge Function từ chối. Kiểm tra Supabase Secrets.';
    else if (e.message && (e.message.indexOf('503') > -1 || e.message.indexOf('500') > -1 || e.message.indexOf('502') > -1)) errMsg = '⚠️ Server đang quá tải (đã thử lại 3 lần). Đợi 1-2 phút thử lại.';
    addMsg(errMsg, 'bot');
    console.error('AI error:', e);
  }

  sending = false;
  document.getElementById('sendBtn').disabled = false;
  inp.focus();
}

function sendChip(el) {
  document.getElementById('chatInp').value = el.textContent.trim();
  sendMsg();
}

function clearChat() {
  chatHist = [];
  hideEmergency();
  const L = document.getElementById('msgList');
  if (L) {
    L.innerHTML = '<div style="text-align:center;font-size:10px;color:var(--t3);font-weight:700;letter-spacing:.5px;text-transform:uppercase;">Hôm nay</div>';
    addMsg('Cuộc trò chuyện mới. Tôi có thể giúp gì cho bạn?', 'bot');
  }
  const cr = document.getElementById('chipsRow');
  if (cr) cr.style.display = 'flex';
  toast('Đã xoá lịch sử');
}
