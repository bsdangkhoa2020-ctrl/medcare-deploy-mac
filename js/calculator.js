/* ════════════════════════════════════════════════════════════
   JS — CALCULATOR & FORMATTERS
   Các hàm logic tính tuổi thai, tuổi bệnh nhân và định dạng
════════════════════════════════════════════════════════════ */

// Tính tuổi thai từ LMP (Ngày đầu chu kỳ kinh cuối)
function calcGA(lmpStr) {
  if (!lmpStr) return null;
  const lmp   = new Date(lmpStr);
  const today = new Date();
  const diff  = Math.floor((today - lmp) / 86400000);
  if (diff < 0) return null;
  const weeks = Math.min(Math.floor(diff / 7), 42); // Giới hạn tối đa tuần 42
  const days  = diff % 7;
  const trimester = weeks < 14 ? 1 : weeks < 28 ? 2 : 3;
  const edd = new Date(lmp.getTime() + 280 * 86400000);
  return {
    weeks, days, total_days: diff, trimester,
    display: `${weeks} tuần ${days} ngày`,
    edd: formatDate(edd),
    edd_iso: edd.toISOString().split('T')[0]
  };
}

// Format ngày dd/mm/yyyy
function formatDate(d) {
  if (!d) return '—';
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dt)) return '—';
  return dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Format ngày rút gọn "Thứ Hai, 26/05"
function formatDateShort(d) {
  if (!d) return '—';
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dt)) return '—';
  const days = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
  return `${days[dt.getDay()]}, ${dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
}

// Format giờ "08:30"
function formatTime(d) {
  if (!d) return '—';
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dt)) return '—';
  return dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

// Chuẩn hoá số điện thoại
function normPhone(p) {
  if (!p) return '';
  return p.replace(/\D/g, '').replace(/^84/, '0');
}

// Tính tuổi từ ngày sinh
function calcAge(dobStr) {
  if (!dobStr) return null;
  const dob = new Date(dobStr);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

// Generate mã BN
function genBnCode(existingCodes = []) {
  let n = (existingCodes.length + 1);
  return 'BN-' + String(n).padStart(3, '0');
}

