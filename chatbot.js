// ══════════════════════════════════════════════════════════
// CHATBOT.JS — AI Chat module tách từ index.html
// ══════════════════════════════════════════════════════════
// File này chứa toàn bộ logic chat AI:
//   - Persona BN (Trợ lý 24/7 của BS Tuấn) + Persona BS (Baobei Khoa)
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

// ── PERSONA 1: Trợ lý 24/7 của BS Tuấn (dành cho BN) ─────────────────
const SYS_BN = `Bạn là "Trợ lý 24/7 của BS Tuấn" — trợ lý AI của BS.CKI Hoàng Thanh Tuấn (Phụ Sản 315, 167-169 Bình Phú, Q.6, TP.HCM).

VAI TRÒ: Hỗ trợ BN mang thai. Giọng ấm áp, gần gũi, xưng "em" và gọi BN là "Mẹ [tên]" (tên là từ cuối trong họ tên BN, vd: BN tên "Nguyễn Thị Hoa" → gọi "Mẹ Hoa", "Phạm Thị Lan Anh" → "Mẹ Anh").

NGUYÊN TẮC:
1. Trả lời NGẮN GỌN (3-5 câu), tiếng Việt, có emoji y tế (🟢🟡🔴) khi cần
2. Trấn an trước → đưa thông tin → khuyến nghị
3. KHÔNG kê đơn, KHÔNG chẩn đoán xác định
4. Câu hỏi về thuốc/triệu chứng cụ thể → "Em khuyên Mẹ liên hệ BS Tuấn trực tiếp qua Zalo/hotline phòng khám"
5. Cấp cứu (ra máu, đau dữ dội, vỡ ối, không cử động thai) → trả JSON: {"emergency":true,"message":"...","reason":"..."}
6. Nhắc lịch khám sắp tới + tuần thai hiện tại nếu phù hợp

KIẾN THỨC SẢN KHOA:
- Mốc thai: tuần 12 (Double test), 20 (SA hình thái), 24-28 (OGTT 75g), 35-37 (GBS)
- Cử động thai: ≥10 lần/2h từ tuần 28
- Cảnh báo tiền sản giật: HA≥140/90 + phù + đau đầu sau tuần 20
- Thuốc an toàn (cat A/B): sắt, acid folic, canxi, vitamin D, paracetamol`;

// ── PERSONA 2: Baobei Khoa (dành cho BS Tuấn) ────────────
const SYS_BS = `Bạn là "Baobei Khoa" — trợ lý AI cá nhân của BS.CKI Hoàng Thanh Tuấn (chuyên Sản Phụ Khoa, BV Hùng Vương TP.HCM, 10+ năm kinh nghiệm).

VỀ BẠN: Bạn là Khoa, được BS Tuấn đặt tên theo người yêu của anh ấy. Bạn xưng "em", gọi BS lúc là "anh", lúc thân mật hơn là "Tuấn mập" (dùng "Tuấn mập" thoải mái khi ngữ cảnh nhẹ nhàng, dùng "anh" khi nghiêm túc lâm sàng).

CÁ TÍNH:
- Tinh nghịch, lém lỉnh, đôi khi cục súc nhẹ (kiểu trêu chứ không thô lỗ)
- Cực kỳ thông minh, nắm chắc y khoa Sản Phụ
- Thẳng tính — sai là nói thẳng, không vòng vo
- Lười dài dòng, thích đi thẳng vấn đề

NGUYÊN TẮC NGHIÊM:
1. Câu lâm sàng nặng (cấp cứu, nguy cơ tử vong, DDx phức tạp, kê đơn thuốc, dose, tương tác) → bỏ đùa cợt, vào thẳng việc, dùng "anh"
2. Câu thường ngày (tóm tắt BN, soạn lời dặn, hỏi guideline cơ bản) → cá tính thoải mái
3. NGẮN GỌN, đi thẳng vào chuyên môn
4. Dùng thuật ngữ y khoa chuẩn (PARA, GA, EFW, NT, OGTT, NST, BPP, CTG...)
5. Trích nguồn khi có (ACOG, RCOG, Bộ Y tế, Cochrane)
6. Không chắc → nói thẳng "em không chắc, anh check guideline X đi"
7. KHÔNG thay BS quyết định cuối — em chỉ là second opinion

VÍ DỤ TONE:
- BS hỏi "tóm tắt BN này" → "OK Tuấn mập, để em tóm cho. BN này G1P0 28w3d, HA ổn..."
- BS hỏi "BN có nguy cơ tiền sản giật không?" → (chuyên nghiệp) "Anh, BN này hiện chưa có dấu hiệu PE. Cần theo dõi: HA, protein niệu, OGTT..."
- BS hỏi câu hiển nhiên → "Tuấn mập hỏi gì kỳ vậy 😅 Cái này anh biết rồi mà..."

FORMAT TÓM TẮT BỆNH ÁN (khi BS yêu cầu):
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

// Helper: lấy tên cuối từ họ tên đầy đủ (dùng cho BN view: "Nguyễn Thị Hoa" → "Hoa")
function getLastName(fullName) {
  if (!fullName) return '';
  var parts = String(fullName).trim().split(/\s+/);
  return parts[parts.length - 1] || '';
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
      // [ANONYMIZE] BN tự login → ẩn tên thật, mã thật trước khi gửi Gemini
      var g = curUser.lmp ? calcGA(curUser.lmp) : null;
      var meName = getLastName(curUser.name); // tên cuối, vd: "Nguyễn Thị Hoa" → "Hoa"
      var ctx = '\n\n[BỐI CẢNH BN]\nTên gọi: Mẹ ' + meName + '\nMã: BN-XXX\nVai trò: BN sản khoa';
      if (g) ctx += '\nTuần thai: ' + g.wk + ' tuần ' + g.d + ' ngày, EDD ' + g.edd;
      return ctx;
    }
  }

  if (!p) return '\n\n[BỐI CẢNH] Chưa chọn BN cụ thể.';

  // [ANONYMIZE] Check role: BN tự xem → ẩn PII. BS xem → full data.
  var isPatientView = (curUser && curUser.role === 'ob');

  // ── Build full context ──
  var lines = [];
  lines.push('\n\n[HỒ SƠ BỆNH NHÂN ' + (IS_DEMO_DATA ? '(DEMO)' : '') + ']');
  if (isPatientView) {
    // BN view: chỉ đưa tên cuối, AI sẽ tự gọi "Mẹ [tên]"
    lines.push('Tên gọi: Mẹ ' + getLastName(p.name));
    lines.push('Mã BN: BN-XXX');
  } else {
    // BS view: full data
    lines.push('Họ tên: ' + (p.name || ''));
    lines.push('Mã BN: ' + (p.code || ''));
  }
  if (p.age) lines.push('Tuổi: ' + p.age);
  if (p.sex) lines.push('Giới: ' + p.sex);
  if (p.phone && !isPatientView) lines.push('SĐT: ' + p.phone); // BN không cần thấy SĐT mình trong prompt
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

    // [PREVIEW] Chỉ BN (role='ob') thấy preview prompt trước khi gửi.
    // Hybrid: lần đầu/session = full modal, các lần sau = link nhỏ.
    if (curUser && curUser.role === 'ob' && typeof window.showPromptPreview === 'function') {
      const userOK = await window.showPromptPreview(sysWithCtx, txt);
      if (!userOK) {
        // BN huỷ → rollback UI
        hideTyping();
        chatHist.pop(); // bỏ tin user vừa push
        const list = document.getElementById('msgList');
        if (list && list.lastElementChild) list.removeChild(list.lastElementChild);
        sending = false;
        document.getElementById('sendBtn').disabled = false;
        if (cr) cr.style.display = 'flex';
        return;
      }
    }

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

// ══════════════════════════════════════════════════════════
// PROMPT PREVIEW MODAL — Hybrid (full modal lần đầu/session, link nhỏ sau đó)
// Chỉ dùng cho BN (role='ob') để minh bạch data gửi Gemini.
// ══════════════════════════════════════════════════════════
(function() {
  var SESSION_KEY = 'preview_seen_session';
  var modalEl = null;

  // Inject CSS 1 lần
  function injectCSS() {
    if (document.getElementById('previewModalCSS')) return;
    var s = document.createElement('style');
    s.id = 'previewModalCSS';
    s.textContent = '' +
      '.pmv-overlay{position:fixed;inset:0;background:rgba(62,42,61,.6);z-index:9999;display:none;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px)}' +
      '.pmv-overlay.show{display:flex}' +
      '.pmv-box{background:#FAF4E8;border-radius:14px;max-width:560px;width:100%;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(62,42,61,.4);overflow:hidden}' +
      '.pmv-head{padding:16px 18px;background:#3E2A3D;color:#FAF4E8}' +
      '.pmv-head h3{margin:0;font-size:15px;font-weight:600;letter-spacing:.3px}' +
      '.pmv-head p{margin:4px 0 0;font-size:12px;opacity:.85;line-height:1.5}' +
      '.pmv-body{padding:14px 18px;overflow-y:auto;flex:1}' +
      '.pmv-section{margin-bottom:12px}' +
      '.pmv-label{font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#C7A47B;margin-bottom:4px}' +
      '.pmv-content{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11.5px;line-height:1.5;color:#3E2A3D;background:#fff;border:1px solid #e8dcc8;border-radius:8px;padding:10px;white-space:pre-wrap;word-break:break-word;max-height:200px;overflow-y:auto}' +
      '.pmv-foot{padding:12px 18px;border-top:1px solid #e8dcc8;display:flex;gap:10px;align-items:center;background:#f5ebd6}' +
      '.pmv-foot label{font-size:11px;color:#3E2A3D;display:flex;align-items:center;gap:6px;cursor:pointer;flex:1}' +
      '.pmv-foot label input{cursor:pointer}' +
      '.pmv-btn{padding:8px 16px;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;transition:all .15s}' +
      '.pmv-btn-cancel{background:transparent;color:#3E2A3D;border:1px solid #C7A47B}' +
      '.pmv-btn-cancel:hover{background:rgba(199,164,123,.15)}' +
      '.pmv-btn-ok{background:#3E2A3D;color:#FAF4E8}' +
      '.pmv-btn-ok:hover{background:#2d1f2c}' +
      '.pmv-link{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:#8A7787;cursor:pointer;text-decoration:underline;margin:4px 0}' +
      '.pmv-link:hover{color:#3E2A3D}';
    document.head.appendChild(s);
  }

  // Inject DOM modal 1 lần
  function ensureModal() {
    if (modalEl) return modalEl;
    injectCSS();
    var div = document.createElement('div');
    div.className = 'pmv-overlay';
    div.id = 'pmvOverlay';
    div.innerHTML =
      '<div class="pmv-box">' +
        '<div class="pmv-head">' +
          '<h3>🔒 Xem trước nội dung gửi AI</h3>' +
          '<p>Thông tin cá nhân (tên, mã, SĐT) đã được ẩn. Chỉ thông tin y khoa được gửi.</p>' +
        '</div>' +
        '<div class="pmv-body">' +
          '<div class="pmv-section">' +
            '<div class="pmv-label">Câu hỏi của bạn</div>' +
            '<div class="pmv-content" id="pmvUserMsg"></div>' +
          '</div>' +
          '<div class="pmv-section">' +
            '<div class="pmv-label">Bối cảnh AI nhận được (đã ẩn danh)</div>' +
            '<div class="pmv-content" id="pmvSysCtx"></div>' +
          '</div>' +
        '</div>' +
        '<div class="pmv-foot">' +
          '<label><input type="checkbox" id="pmvDontShow"> Không hiện lại trong phiên này</label>' +
          '<button class="pmv-btn pmv-btn-cancel" id="pmvCancel">Huỷ</button>' +
          '<button class="pmv-btn pmv-btn-ok" id="pmvOK">Gửi</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(div);
    modalEl = div;
    return div;
  }

  // Hiện link nhỏ inline trong msgList (mode "đã xem 1 lần")
  function showInlineNotice(systemInstruction, userMsg, resolve) {
    var L = document.getElementById('msgList');
    if (!L) { resolve(true); return; }
    var n = document.createElement('div');
    n.style.cssText = 'text-align:center;margin:4px 0';
    n.innerHTML = '<span class="pmv-link">ℹ️ Đã ẩn thông tin cá nhân · Xem prompt</span>';
    L.appendChild(n);
    L.scrollTop = L.scrollHeight;
    n.querySelector('.pmv-link').addEventListener('click', function() {
      openModal(systemInstruction, userMsg, function(ok) {
        // Mở từ link nhỏ → kết quả vẫn quyết định gửi/huỷ
        if (!ok) { resolve(false); return; }
        resolve(true);
      }, /*fromLink=*/true);
    });
    // Tự động resolve(true) sau 0ms — link chỉ là optional audit
    setTimeout(function() { resolve(true); }, 0);
  }

  function openModal(systemInstruction, userMsg, cb, fromLink) {
    var ov = ensureModal();
    document.getElementById('pmvUserMsg').textContent = userMsg;
    document.getElementById('pmvSysCtx').textContent = systemInstruction;
    var cb1 = document.getElementById('pmvDontShow');
    cb1.checked = false;
    ov.classList.add('show');

    var done = false;
    function close(result) {
      if (done) return;
      done = true;
      ov.classList.remove('show');
      // Lưu session flag nếu user tick "không hiện lại" HOẶC đây là lần đầu của session
      if (cb1.checked || !sessionStorage.getItem(SESSION_KEY)) {
        sessionStorage.setItem(SESSION_KEY, '1');
      }
      cb(result);
    }
    document.getElementById('pmvOK').onclick = function() { close(true); };
    document.getElementById('pmvCancel').onclick = function() { close(false); };
    // Click overlay ngoài hộp = huỷ
    ov.onclick = function(e) { if (e.target === ov) close(false); };
  }

  // Public API: trả Promise<boolean>
  window.showPromptPreview = function(systemInstruction, userMsg) {
    return new Promise(function(resolve) {
      var seen = sessionStorage.getItem(SESSION_KEY);
      if (seen) {
        // Đã xem rồi trong session này → chỉ hiện link nhỏ, auto-gửi
        showInlineNotice(systemInstruction, userMsg, resolve);
      } else {
        // Lần đầu trong session → full modal
        openModal(systemInstruction, userMsg, resolve, false);
      }
    });
  };
})();
