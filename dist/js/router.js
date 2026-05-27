/* ════════════════════════════════════════════════════════════
   JS — ROUTER & NAVIGATION (router.js)
   Quản lý định tuyến trang, bảo mật màn hình và thông báo
════════════════════════════════════════════════════════════ */

let _history = [];          // stack màn hình đã đi qua
let _isBackNav = false;     // flag để không push khi goBack

// Danh sách screens chỉ admin xem được
const ADMIN_ONLY = ['s-admin', 's-patient-detail', 's-admin-add-patient', 's-admin-invites'];
// Screens OB
const OB_SCREENS = ['s-ob-home', 's-ob-records', 's-ob-appts', 's-ob-kick', 's-ob-checkin', 's-ob-journey', 's-ob-doctor', 's-education-ob', 's-ob-journal', 's-chat'];
// Screens GY
const GY_SCREENS = ['s-gy-home', 's-gy-records', 's-gy-appts', 's-gy-checkin', 's-gy-journey', 's-education-gy', 's-chat'];

// Chuyển trang định tuyến chính
function goTo(id) {
  const next = document.getElementById(id);
  if (!next) { console.warn('[NAV] Screen không tồn tại:', id); return; }

  // Guard: màn hình admin chỉ admin vào được
  if (ADMIN_ONLY.includes(id) && curUser?.role !== 'admin') {
    console.warn('[NAV] Chặn truy cập admin screen:', id);
    return;
  }

  // Guard: OB screens chỉ dành cho OB patient (admin bypass)
  if (OB_SCREENS.includes(id) && id !== 's-chat' && curUser && curUser.role !== 'admin' && curUser.patient_type !== 'ob') {
    console.warn('[NAV] Chặn GY patient vào OB screen:', id);
    return;
  }

  // Guard: GY screens chỉ dành cho GY patient (admin bypass)
  if (GY_SCREENS.includes(id) && id !== 's-chat' && curUser && curUser.role !== 'admin' && curUser.patient_type !== 'gy') {
    console.warn('[NAV] Chặn OB patient vào GY screen:', id);
    return;
  }

  // Lưu màn hình hiện tại vào history (trừ khi đang back)
  const current = document.querySelector('.screen.active');
  if (current && !_isBackNav) {
    _history.push(current.id);
  }
  _isBackNav = false;

  // Ẩn tất cả screens
  document.querySelectorAll('.screen.active').forEach(s => s.classList.remove('active'));

  // Hiện screen mới
  next.classList.add('active');

  // Stop TTS khi rời chat
  if (id !== 's-chat' && typeof chatStopTTS === 'function') chatStopTTS();
  
  // Cập nhật FAB visibility
  _updateFabs(id);
  
  // History API — fix nút Back iOS/Android
  if (!_isBackNav && history.state?.screenId !== id) {
    history.pushState({ screenId: id }, '', '#' + id);
  }
  
  // Auto-init theo màn hình
  if (id === 's-ob-home')    setTimeout(() => { if (typeof initObHome === 'function') initObHome(); }, 50);
  if (id === 's-ob-records') setTimeout(() => { if (typeof initObRecords === 'function') initObRecords(); }, 50);
  if (id === 's-ob-appts')   setTimeout(() => { if (typeof initObAppts === 'function') initObAppts(); }, 50);
  if (id === 's-ob-kick')    setTimeout(() => { if (typeof initKickCounter === 'function') initKickCounter(); }, 50);
  if (id === 's-ob-journey') setTimeout(() => { if (typeof initEducation === 'function') initEducation(); }, 50);
  if (id === 's-ob-doctor')  setTimeout(() => { if (typeof initDocSchedule === 'function') initDocSchedule(); }, 50);
  if (id === 's-gy-home')    setTimeout(() => { if (typeof initGyHome === 'function') initGyHome(); }, 50);
  if (id === 's-gy-records') setTimeout(() => { if (typeof initGyRecords === 'function') initGyRecords(); }, 50);
  if (id === 's-gy-appts')   setTimeout(() => { if (typeof initGyAppts === 'function') initGyAppts(); }, 50);
  if (id === 's-gy-journey') setTimeout(() => { if (typeof initGyJourney === 'function') initGyJourney(); }, 50);
}

// Lắng nghe nút Back hệ điều hành (iOS swipe / Android back)
window.addEventListener('popstate', function(e) {
  if (e.state && e.state.screenId) {
    _isBackNav = true;
    goTo(e.state.screenId);
  } else if (_history.length > 0) {
    _isBackNav = true;
    goTo(_history.pop());
  }
});

function goBack() {
  if (_history.length === 0) {
    const home = curUser?.role === 'admin' ? 's-admin'
               : curUser?.patient_type === 'gy' ? 's-gy-home'
               : 's-ob-home';
    goTo(home);
    return;
  }
  _isBackNav = true;
  goTo(_history.pop());
}

// Trang chủ theo role
function goHomeScreen() {
  if (!curUser) { goTo('s-landing'); return; }
  if (curUser.role === 'admin') { goTo('s-admin'); return; }
  goTo(curUser.patient_type === 'gy' ? 's-gy-home' : 's-ob-home');
}

// Cập nhật FAB (AI + SOS) theo màn hình
function _updateFabs(screenId) {
  const fabAI = document.getElementById('fab-ai');
  if (!fabAI) return;

  const authScreens = ['s-landing', 's-login', 's-register', 's-consent'];
  const adminScreens = ['s-admin', 's-patient-detail', 's-admin-add-patient'];
  const hideFab = authScreens.includes(screenId) || adminScreens.includes(screenId);
  fabAI.classList.toggle('hidden', hideFab);
}

// Resolve role và patient_type từ profile DB
function _resolveUser(sbUser, profile) {
  let role = 'ob';
  if (profile?.role === 'admin') role = 'admin';

  let patientType = null;
  if (role !== 'admin') {
    patientType = profile?.patient_type || profile?.specialty || 'ob';
    if (profile?.role === 'gy_patient') patientType = 'gy';
    if (patientType !== 'gy') patientType = 'ob';
  }

  return {
    id:           sbUser.id,
    email:        sbUser.email,
    role,
    patient_type: patientType,
    name:         profile?.full_name || profile?.name || sbUser.email,
    lmp:          profile?.lmp  || null,
    phone:        profile?.phone || null,
    dob:          profile?.dob  || null,
    bn_code:      profile?.bn_code || null,
    _supabase:    true
  };
}

// Route sau khi login thành công
async function _routeAfterLogin(user) {
  curUser = user;
  _history = []; // Reset history
  
  // Định tuyến nhân viên phòng khám (Staff) sang Cổng React
  if (user.email === 'bstuanhoang@gmail.com') {
    window.location.href = '/bacsi';
    return;
  }
  if (user.email === 'letan@gmail.com') {
    window.location.href = '/letan';
    return;
  }

  // Định tuyến Bệnh nhân (Patients) vào App Vanilla
  // Kiểm tra consent — nếu bảng chưa có hoặc lỗi thì cho vào app bình thường
  try {
    const { data: consent, error: consentErr } = await db.getConsent(user.id);
    if (!consentErr && !consent) { goTo('s-consent'); return; }
  } catch(e) {
    console.warn('[AUTH] getConsent error (bảng chưa tồn tại?):', e.message);
  }
  
  if (user.bn_code) {
    try {
        const { data: pt } = await db.getMyPatient(user.bn_code);
        if (pt) {
          if (pt.lmp)       curUser.lmp    = pt.lmp;
          if (pt.phone)     curUser.phone  = pt.phone;
          if (pt.dob)       curUser.dob    = pt.dob;
          if (pt.name)      curUser.name   = pt.name;
          if (pt.height_cm) curUser.height_cm = pt.height_cm;
          if (pt.weight_kg) curUser.weight_kg = pt.weight_kg;
        }
      } catch(e) {}
    }
    _enterApp(user);
}


function _enterApp(user) {
  if (user.role === 'admin') {
    goTo('s-admin');
    if (typeof initAdmin === 'function') setTimeout(initAdmin, 100);
    return;
  }

  if (user.patient_type === 'gy') {
    const el = document.getElementById('gy-name');
    if (el) el.textContent = 'Chị ' + (user.name || '').split(' ').pop();
    goTo('s-gy-home');
    return;
  }

  const el = document.getElementById('ob-name');
  if (el) el.textContent = (user.name || 'Mẹ').split(' ').pop();
  if (user.lmp && typeof calcGA === 'function') {
    const ga = calcGA(user.lmp);
    if (ga) {
      const weeksEl  = document.getElementById('ob-ga-weeks');
      const daysEl   = document.getElementById('ob-ga-days');
      const remainEl = document.getElementById('ob-week-remaining');
      const trimEl   = document.getElementById('ob-trimester');
      if (weeksEl)  weeksEl.textContent  = ga.weeks;
      if (daysEl)   daysEl.textContent   = ga.days;
      if (remainEl) remainEl.textContent = `Còn ${40 - ga.weeks} tuần đến ngày dự sinh`;
      if (trimEl)   trimEl.textContent   = `Tam cá nguyệt thứ ${ga.trimester}`;
    }
  }
  goTo('s-ob-home');
}

// Toast notification
function toast(msg, type = '') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'toast show' + (type ? ' toast-' + type : '');
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = 'toast'; }, 2800);
}

// Loading overlay
function showLoading(msg = 'Đang tải...') {
  const el = document.getElementById('loading-overlay');
  const txt = document.getElementById('loading-text');
  if (el) { el.classList.add('show'); }
  if (txt) txt.textContent = msg;
}
function hideLoading() {
  const el = document.getElementById('loading-overlay');
  if (el) el.classList.remove('show');
}

// Web Audio API tick/pop sound for premium haptics
function playTickSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch(err) {}
}

