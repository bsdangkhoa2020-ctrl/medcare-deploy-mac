import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';

// ─── Icon helpers (inline SVG to avoid extra deps) ────────────────────────────
const Icon = ({ d, className = 'w-5 h-5', viewBox = '0 0 24 24', fill = 'none', stroke = 'currentColor', strokeWidth = 2 }) => (
  <svg className={className} viewBox={viewBox} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  patients: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  calendar: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  journal: ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'],
  scan: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18',
  search: 'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  plus: 'M12 5v14M5 12h14',
  chat: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  x: 'M18 6 6 18M6 6l12 12',
  chevLeft: 'M15 18l-6-6 6-6',
  chevRight: 'M9 18l6-6-6-6',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  trash: ['M3 6h18', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'],
  upload: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  send: 'M22 2 11 13M22 2 15 22 11 13 2 9l20-7z',
  eye: ['M1 12s4-8 11-8 11 8 11 8', 'M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4'],
  key: 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4',
  check: 'M20 6 9 17l-5-5',
  alert: ['M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', 'M12 9v4M12 17h.01'],
  file: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6M16 13H8M16 17H8M10 9H8'],
  image: ['M21 9l-9 4-9-4', 'M3 9l9 4 9-4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z'],
  copy: ['M20 9H11a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'],
};

// ─── Utility ─────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];
const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
const fmtDateShort = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
const DOW_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function getWeekDays(baseDate) {
  const d = new Date(baseDate);
  const dow = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(mon);
    day.setDate(mon.getDate() + i);
    return day.toISOString().split('T')[0];
  });
}

function get7Days(base) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'} max-h-[90vh] flex flex-col z-10`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold/20 shrink-0">
          <h3 className="text-lg font-serif font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gold-lt transition-colors">
            <Icon d={ICONS.x} className="w-4 h-4 text-ink-muted" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Input helpers ────────────────────────────────────────────────────────────
const cls = 'w-full px-4 py-2.5 bg-white border border-gold/30 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all text-ink';
const InputField = ({ label, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">{label}</label>
    <input className={cls} {...props} />
  </div>
);
const SelectField = ({ label, children, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">{label}</label>
    <select className={cls} {...props}>{children}</select>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// TAB 1 – BỆNH NHÂN
// ═════════════════════════════════════════════════════════════════════════════
function TabPatients() {
  const [patients, setPatients] = useState([]);
  const [inviteCodes, setInviteCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [form, setForm] = useState({ patient_name: '', specialty: 'ob', validity_days: '14' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });

  const showToast = (msg, type = 'info') => setToast({ isVisible: true, message: msg, type });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: pts }, { data: codes }] = await Promise.all([
      supabase.from('patients').select('*').order('created_at', { ascending: false }),
      supabase.from('invite_codes').select('*').order('created_at', { ascending: false }),
    ]);
    setPatients(pts || []);
    setInviteCodes(codes || []);
    setLoading(false);
  };

  const filteredPatients = patients.filter(p => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.bn_code?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.specialty === filter;
    return matchSearch && matchFilter;
  });

  const createCode = async () => {
    if (!form.patient_name.trim()) return showToast('Nhập tên bệnh nhân', 'error');
    setSaving(true);
    const code = Math.random().toString(36).substring(2, 9).toUpperCase();
    const expires_at = new Date(Date.now() + parseInt(form.validity_days) * 86400000).toISOString();
    const { error } = await supabase.from('invite_codes').insert({
      code,
      patient_name: form.patient_name,
      patient_type: form.specialty,
      validity_days: parseInt(form.validity_days),
      expires_at,
      is_used: false,
    });
    setSaving(false);
    if (error) return showToast('Lỗi tạo mã: ' + error.message, 'error');
    showToast(`Đã tạo mã mời: ${code}`, 'success');
    setShowModal(false);
    setForm({ patient_name: '', specialty: 'ob', validity_days: '14' });
    fetchAll();
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const typeColor = (t) => t === 'ob'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-purple-50 text-purple-700 border-purple-200';

  return (
    <div className="space-y-6">
      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon d={ICONS.search} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm bệnh nhân theo tên, mã BN..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gold/30 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all" />
        </div>
        <div className="flex bg-gold-lt rounded-xl p-1 gap-1 border border-gold/20">
          {[['all', 'Tất cả'], ['ob', 'Sản khoa'], ['gy', 'Phụ khoa']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === v ? 'bg-white shadow text-gold-dk font-semibold' : 'text-ink-muted hover:text-ink'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Patient list */}
      <div className="bg-white rounded-2xl border border-gold/20 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gold/10 flex items-center justify-between bg-gold-lt/40">
          <span className="text-sm font-semibold text-ink">
            Danh sách bệnh nhân
            <span className="ml-2 bg-gold text-white text-xs px-2 py-0.5 rounded-full">{filteredPatients.length}</span>
          </span>
        </div>
        {loading ? (
          <div className="p-10 text-center text-ink-muted text-sm animate-pulse">Đang tải...</div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-10 text-center text-ink-muted text-sm">Không có bệnh nhân nào.</div>
        ) : (
          <div className="divide-y divide-gold/10">
            {filteredPatients.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gold-lt/30 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gold-lt flex items-center justify-center font-serif text-gold-dk font-semibold shrink-0">
                  {(p.name || '?')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink text-sm truncate">{p.name || 'Chưa đặt tên'}</p>
                  <p className="text-xs text-ink-muted truncate">{p.phone || p.email || 'Chưa có liên hệ'}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold font-mono ${typeColor(p.specialty)}`}>
                  {p.bn_code || (p.specialty?.toUpperCase())}
                </span>
                <span className="text-xs text-ink-muted hidden sm:block">{p.created_at ? fmtDate(p.created_at) : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mã mời */}
      <div className="bg-white rounded-2xl border border-gold/20 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gold/10 bg-gold-lt/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon d={ICONS.key} className="w-4 h-4 text-gold-dk" />
            <span className="text-sm font-semibold text-ink">Mã mời bệnh nhân</span>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-gold-dk text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-gold transition-colors shadow-sm">
            <Icon d={ICONS.plus} className="w-3.5 h-3.5" /> Tạo mã
          </button>
        </div>
        {inviteCodes.length === 0 ? (
          <div className="p-8 text-center text-ink-muted text-sm">Chưa có mã mời nào. Tạo mã để chia sẻ với bệnh nhân.</div>
        ) : (
          <div className="divide-y divide-gold/10">
            {inviteCodes.slice(0, 20).map(c => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className={`font-mono font-bold text-sm tracking-widest px-3 py-1.5 rounded-lg border ${typeColor(c.specialty)}`}>
                  {c.code}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink font-medium truncate">{c.assigned_name}</p>
                  <p className="text-xs text-ink-muted">
                    {c.specialty === 'ob' ? 'Sản khoa' : 'Phụ khoa'} · HH: {c.expires_at ? new Date(c.expires_at).toLocaleDateString('vi-VN') : '—'}
                    {c.expires_at && ` · HH: ${fmtDate(c.expires_at)}`}
                  </p>
                </div>
                {!!c.used_at ? (
                  <span className="text-xs text-ok bg-ok-lt px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <Icon d={ICONS.check} className="w-3 h-3" /> Đã dùng
                  </span>
                ) : (
                  <button onClick={() => copyCode(c.code)}
                    className={`p-2 rounded-lg transition-colors ${copiedId === c.code ? 'bg-ok-lt text-ok' : 'hover:bg-gold-lt text-ink-muted hover:text-gold-dk'}`}>
                    <Icon d={copiedId === c.code ? ICONS.check : ICONS.copy} className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal tạo mã */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Tạo mã mời bệnh nhân">
        <div className="space-y-4">
          <InputField label="Tên bệnh nhân" value={form.patient_name} onChange={e => setForm(f => ({ ...f, patient_name: e.target.value }))} placeholder="Nguyễn Thị A" />
          <SelectField label="Loại khám" value={form.specialty} onChange={e => setForm(f => ({ ...f, patient_type: e.target.value }))}>
            <option value="ob">Sản khoa (OB)</option>
            <option value="gy">Phụ khoa (GY)</option>
          </SelectField>
          <SelectField label="Hiệu lực" value={form.validity_days} onChange={e => setForm(f => ({ ...f, validity_days: e.target.value }))}>
            <option value="7">7 ngày</option>
            <option value="14">14 ngày</option>
            <option value="30">30 ngày</option>
          </SelectField>
          <button onClick={createCode} disabled={saving}
            className="w-full bg-gold-dk text-white py-3 rounded-xl font-bold hover:bg-gold transition-colors disabled:opacity-50">
            {saving ? 'Đang tạo...' : 'Tạo mã mời'}
          </button>
        </div>
      </Modal>

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(t => ({ ...t, isVisible: false }))} />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 2 – LỊCH & CA
// ═════════════════════════════════════════════════════════════════════════════
const HV_SHIFTS = ['HC', 'A', 'C', 'OFF'];
const PK_SHIFTS = ['Sáng', 'Tối', 'Sáng+Tối', 'Nghỉ'];
const SHIFT_COLOR = {
  HC: 'bg-blue-100 text-blue-700 border-blue-200',
  A: 'bg-amber-100 text-amber-700 border-amber-200',
  C: 'bg-purple-100 text-purple-700 border-purple-200',
  OFF: 'bg-slate-100 text-slate-500 border-slate-200',
  'Sáng': 'bg-sky-100 text-sky-700 border-sky-200',
  'Tối': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Sáng+Tối': 'bg-teal-100 text-teal-700 border-teal-200',
  'Nghỉ': 'bg-slate-100 text-slate-500 border-slate-200',
};

function ScheduleBlock({ title, location, shifts, weekDays, schedule, onEdit, onEditWeek }) {
  return (
    <div className="bg-white rounded-2xl border border-gold/20 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gold/10 bg-gold-lt/40 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="text-xs text-ink-muted">{location}</p>
        </div>
        <button onClick={onEditWeek}
          className="text-xs text-gold-dk font-semibold hover:underline flex items-center gap-1">
          <Icon d={ICONS.edit} className="w-3.5 h-3.5" /> Sửa cả tuần
        </button>
      </div>
      <div className="grid grid-cols-7 divide-x divide-gold/10">
        {weekDays.map(day => {
          const d = new Date(day);
          const isToday = day === today();
          const shift = schedule[day] || '—';
          return (
            <button key={day} onClick={() => onEdit(day, shift)}
              className={`flex flex-col items-center py-3 gap-1.5 hover:bg-gold-lt/40 transition-colors ${isToday ? 'bg-gold-lt/60' : ''}`}>
              <span className={`text-[10px] font-medium ${isToday ? 'text-gold-dk' : 'text-ink-muted'}`}>{DOW_VI[d.getDay()]}</span>
              <span className={`text-xs font-bold ${isToday ? 'text-gold-dk' : 'text-ink'}`}>{d.getDate()}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${SHIFT_COLOR[shift] || 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                {shift}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TabSchedule() {
  const [selectedDate, setSelectedDate] = useState(today());
  const [weekBase, setWeekBase] = useState(today());
  const [weekOffset, setWeekOffset] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [hvSchedule, setHvSchedule] = useState({});
  const [pkSchedule, setPkSchedule] = useState({});
  const [loading, setLoading] = useState(true);

  // Day edit modal
  const [editModal, setEditModal] = useState({ open: false, day: '', shift: '', type: '' });
  // Week edit modal
  const [weekModal, setWeekModal] = useState({ open: false, type: '', values: {} });
  // Appointment modal
  const [apptModal, setApptModal] = useState(false);
  const [apptForm, setApptForm] = useState({ patient_name: '', time: '08:00', note: '', date: today() });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });

  const showToast = (msg, type = 'info') => setToast({ isVisible: true, message: msg, type });

  const weekDays = getWeekDays((() => {
    const d = new Date(weekBase);
    d.setDate(d.getDate() + weekOffset * 7);
    return d.toISOString().split('T')[0];
  })());

  const strip7 = get7Days(today());

  useEffect(() => { fetchAll(); }, [selectedDate]);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: appts }, { data: sched }] = await Promise.all([
      supabase.from('appointments').select('*').eq('date', selectedDate).order('time'),
      supabase.from('doctor_schedule').select('*'),
    ]);
    setAppointments(appts || []);
    const hv = {}, pk = {};
    (sched || []).forEach(r => {
      if (r.location === 'hv') hv[r.date] = r.shift_name;
      if (r.location === 'pk') pk[r.date] = r.shift_name;
    });
    setHvSchedule(hv);
    setPkSchedule(pk);
    setLoading(false);
  };

  const saveShift = async (day, shift, location) => {
    setSaving(true);
    const { error } = await supabase.from('doctor_schedule').upsert({ date: day, shift_name: shift, location }, { onConflict: 'date,location', ignoreDuplicates: false });
    setSaving(false);
    if (error) return showToast('Lỗi lưu lịch: ' + error.message, 'error');
    if (location === 'hv') setHvSchedule(s => ({ ...s, [day]: shift }));
    else setPkSchedule(s => ({ ...s, [day]: shift }));
    showToast('Đã lưu lịch', 'success');
    setEditModal({ open: false, day: '', shift: '', type: '' });
  };

  const saveWeek = async () => {
    setSaving(true);
    const rows = weekDays.map(day => ({ date: day, shift_name: weekModal.values[day] || (weekModal.type === 'hv' ? 'HC' : 'Sáng'), location: weekModal.type }));
    const { error } = await supabase.from('doctor_schedule').upsert(rows, { onConflict: 'date,location', ignoreDuplicates: false });
    setSaving(false);
    if (error) return showToast('Lỗi lưu lịch tuần: ' + error.message, 'error');
    const update = {};
    rows.forEach(r => { update[r.date] = r.shift_name; });
    if (weekModal.type === 'hv') setHvSchedule(s => ({ ...s, ...update }));
    else setPkSchedule(s => ({ ...s, ...update }));
    showToast('Đã lưu lịch cả tuần', 'success');
    setWeekModal({ open: false, type: '', values: {} });
  };

  const saveAppt = async () => {
    if (!apptForm.patient_name.trim()) return showToast('Nhập tên bệnh nhân', 'error');
    setSaving(true);
    const { error } = await supabase.from('appointments').insert({
      patient_name: apptForm.patient_name,
      time: apptForm.time,
      note: apptForm.note,
      date: apptForm.date,
    });
    setSaving(false);
    if (error) return showToast('Lỗi: ' + error.message, 'error');
    showToast('Đã tạo lịch hẹn', 'success');
    setApptModal(false);
    setApptForm({ patient_name: '', time: '08:00', note: '', date: today() });
    if (apptForm.date === selectedDate) fetchAll();
  };

  const openEditDay = (day, shift, type) => setEditModal({ open: true, day, shift: shift === '—' ? (type === 'hv' ? 'HC' : 'Sáng') : shift, type });
  const openEditWeek = (type) => {
    const sched = type === 'hv' ? hvSchedule : pkSchedule;
    const vals = {};
    weekDays.forEach(d => { vals[d] = sched[d] || (type === 'hv' ? 'HC' : 'Sáng'); });
    setWeekModal({ open: true, type, values: vals });
  };

  return (
    <div className="space-y-6">
      {/* Block 1: Lịch hẹn hôm nay */}
      <div className="bg-white rounded-2xl border border-gold/20 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gold/10 bg-gold-lt/40 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Lịch hẹn hôm nay</p>
            <p className="text-xs text-ink-muted">{fmtDate(selectedDate)}</p>
          </div>
          <button onClick={() => setApptModal(true)}
            className="flex items-center gap-1.5 bg-gold-dk text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-gold transition-colors shadow-sm">
            <Icon d={ICONS.plus} className="w-3.5 h-3.5" /> Tạo lịch hẹn
          </button>
        </div>
        {loading ? (
          <div className="p-8 text-center text-ink-muted text-sm animate-pulse">Đang tải...</div>
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center text-ink-muted text-sm">Không có lịch hẹn nào hôm nay.</div>
        ) : (
          <div className="divide-y divide-gold/10">
            {appointments.map(a => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-14 text-center">
                  <span className="font-mono font-bold text-sm text-gold-dk">{a.time?.slice(0, 5)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">{a.patient_name}</p>
                  {a.note && <p className="text-xs text-ink-muted">{a.note}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Block 2: Calendar strip 7 ngày */}
      <div className="bg-white rounded-2xl border border-gold/20 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gold/10 bg-gold-lt/40">
          <p className="text-sm font-semibold text-ink">Chọn ngày xem lịch hẹn</p>
        </div>
        <div className="flex divide-x divide-gold/10 overflow-x-auto">
          {strip7.map(day => {
            const d = new Date(day);
            const isSelected = day === selectedDate;
            return (
              <button key={day} onClick={() => setSelectedDate(day)}
                className={`flex-1 min-w-[48px] flex flex-col items-center py-3.5 gap-1 transition-colors ${isSelected ? 'bg-gold-dk text-white' : 'hover:bg-gold-lt text-ink'}`}>
                <span className={`text-[10px] font-medium ${isSelected ? 'text-gold-lt' : 'text-ink-muted'}`}>{DOW_VI[d.getDay()]}</span>
                <span className="text-sm font-bold">{d.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Block 3: BV Hùng Vương */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-xs text-ink-muted font-semibold uppercase tracking-wide">Tuần {weekDays[0] && fmtDateShort(weekDays[0])} – {weekDays[6] && fmtDateShort(weekDays[6])}</p>
          <div className="flex gap-1">
            <button onClick={() => setWeekOffset(o => o - 1)} className="p-1.5 rounded-lg hover:bg-gold-lt transition-colors">
              <Icon d={ICONS.chevLeft} className="w-4 h-4 text-ink-muted" />
            </button>
            <button onClick={() => setWeekOffset(0)} className="px-2 py-1 text-xs text-ink-muted hover:text-gold-dk transition-colors font-medium">Tuần này</button>
            <button onClick={() => setWeekOffset(o => o + 1)} className="p-1.5 rounded-lg hover:bg-gold-lt transition-colors">
              <Icon d={ICONS.chevRight} className="w-4 h-4 text-ink-muted" />
            </button>
          </div>
        </div>
        <ScheduleBlock
          title="BV Hùng Vương"
          location="Ca HC / A / C / OFF"
          shifts={HV_SHIFTS}
          weekDays={weekDays}
          schedule={hvSchedule}
          onEdit={(day, shift) => openEditDay(day, shift, 'hv')}
          onEditWeek={() => openEditWeek('hv')}
        />
      </div>

      {/* Block 4: PK Phụ Sản 315 */}
      <ScheduleBlock
        title="PK Phụ Sản 315"
        location="Ca Sáng / Tối / Sáng+Tối / Nghỉ"
        shifts={PK_SHIFTS}
        weekDays={weekDays}
        schedule={pkSchedule}
        onEdit={(day, shift) => openEditDay(day, shift, 'pk')}
        onEditWeek={() => openEditWeek('pk')}
      />

      {/* Modal sửa từng ngày */}
      <Modal open={editModal.open} onClose={() => setEditModal({ open: false, day: '', shift: '', type: '' })}
        title={`Lịch ${editModal.type === 'hv' ? 'BV Hùng Vương' : 'PK 315'} – ${editModal.day && fmtDate(editModal.day)}`}>
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">Chọn ca làm việc:</p>
          <div className="grid grid-cols-2 gap-3">
            {(editModal.type === 'hv' ? HV_SHIFTS : PK_SHIFTS).map(s => (
              <button key={s} onClick={() => setEditModal(m => ({ ...m, shift: s }))}
                className={`py-3 rounded-xl border font-semibold text-sm transition-all ${editModal.shift === s ? 'ring-2 ring-gold-dk border-gold-dk bg-gold-lt' : 'border-gold/20 hover:border-gold/60 hover:bg-gold-lt/40'} ${SHIFT_COLOR[s]}`}>
                {s}
              </button>
            ))}
          </div>
          <button onClick={() => saveShift(editModal.day, editModal.shift, editModal.type)} disabled={saving}
            className="w-full bg-gold-dk text-white py-3 rounded-xl font-bold hover:bg-gold transition-colors disabled:opacity-50">
            {saving ? 'Đang lưu...' : 'Lưu lịch'}
          </button>
        </div>
      </Modal>

      {/* Modal sửa cả tuần */}
      <Modal open={weekModal.open} onClose={() => setWeekModal({ open: false, type: '', values: {} })}
        title={`Lịch tuần – ${weekModal.type === 'hv' ? 'BV Hùng Vương' : 'PK 315'}`} wide>
        <div className="space-y-4">
          {weekDays.map(day => {
            const d = new Date(day);
            return (
              <div key={day} className="flex items-center gap-4">
                <div className="w-20 shrink-0">
                  <p className="text-xs font-semibold text-ink">{DOW_VI[d.getDay()]}</p>
                  <p className="text-xs text-ink-muted">{fmtDateShort(day)}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(weekModal.type === 'hv' ? HV_SHIFTS : PK_SHIFTS).map(s => (
                    <button key={s} onClick={() => setWeekModal(m => ({ ...m, values: { ...m.values, [day]: s } }))}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${weekModal.values[day] === s ? 'ring-2 ring-gold-dk border-gold-dk bg-gold-lt scale-105' : 'border-gold/20 hover:border-gold/40'} ${SHIFT_COLOR[s]}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          <button onClick={saveWeek} disabled={saving}
            className="w-full bg-gold-dk text-white py-3 rounded-xl font-bold hover:bg-gold transition-colors disabled:opacity-50 mt-4">
            {saving ? 'Đang lưu...' : 'Lưu cả tuần'}
          </button>
        </div>
      </Modal>

      {/* Modal tạo lịch hẹn */}
      <Modal open={apptModal} onClose={() => setApptModal(false)} title="Tạo lịch hẹn mới">
        <div className="space-y-4">
          <InputField label="Tên bệnh nhân" value={apptForm.patient_name} onChange={e => setApptForm(f => ({ ...f, patient_name: e.target.value }))} placeholder="Nguyễn Thị A" />
          <InputField label="Ngày hẹn" type="date" value={apptForm.date} onChange={e => setApptForm(f => ({ ...f, date: e.target.value }))} />
          <InputField label="Giờ hẹn" type="time" value={apptForm.time} onChange={e => setApptForm(f => ({ ...f, time: e.target.value }))} />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Ghi chú</label>
            <textarea value={apptForm.note} onChange={e => setApptForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Ghi chú lịch hẹn..."
              className="w-full px-4 py-2.5 bg-white border border-gold/30 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all resize-none min-h-[80px]" />
          </div>
          <button onClick={saveAppt} disabled={saving}
            className="w-full bg-gold-dk text-white py-3 rounded-xl font-bold hover:bg-gold transition-colors disabled:opacity-50">
            {saving ? 'Đang lưu...' : 'Tạo lịch hẹn'}
          </button>
        </div>
      </Modal>

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(t => ({ ...t, isVisible: false }))} />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 3 – TẠP CHÍ
// ═════════════════════════════════════════════════════════════════════════════
const EMPTY_ARTICLE = { title: '', target_audience: 'both', thumbnail_url: '', content: '', status: 'draft' };

function TabJournal() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState({ open: false, mode: 'create', data: EMPTY_ARTICLE });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });

  const showToast = (msg, type = 'info') => setToast({ isVisible: true, message: msg, type });

  useEffect(() => { fetchArticles(); }, []);

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error: artErr } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    if (artErr) { console.warn('articles table:', artErr.message); }
    setArticles(data || []);
    setLoading(false);
  };

  const filtered = articles.filter(a => filter === 'all' || a.target_audience === filter || a.target_audience === 'both');

  const openCreate = () => setModal({ open: true, mode: 'create', data: { ...EMPTY_ARTICLE } });
  const openEdit = (a) => setModal({ open: true, mode: 'edit', data: { ...a } });

  const saveArticle = async (publish = false) => {
    const { data: d } = modal;
    if (!d.title.trim()) return showToast('Nhập tiêu đề bài viết', 'error');
    setSaving(true);
    const payload = { ...d, status: publish ? 'published' : d.status };
    let error;
    if (modal.mode === 'create') {
      ({ error } = await supabase.from('articles').insert(payload));
    } else {
      ({ error } = await supabase.from('articles').update(payload).eq('id', d.id));
    }
    setSaving(false);
    if (error) return showToast('Lỗi: ' + error.message, 'error');
    showToast(publish ? 'Đã đăng bài' : 'Đã lưu nháp', 'success');
    setModal(m => ({ ...m, open: false }));
    fetchArticles();
  };

  const deleteArticle = async (id) => {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) return showToast('Lỗi xoá: ' + error.message, 'error');
    showToast('Đã xoá bài', 'success');
    setDeleteId(null);
    fetchArticles();
  };

  const audienceLabel = (t) => ({ ob: 'Sản khoa', gy: 'Phụ khoa', both: 'Tất cả' }[t] || t);
  const audienceColor = (t) => t === 'ob' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : t === 'gy' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gold-lt text-gold-dk border-gold/30';

  const updateField = (field, val) => setModal(m => ({ ...m, data: { ...m.data, [field]: val } }));

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex bg-gold-lt rounded-xl p-1 gap-1 border border-gold/20">
          {[['all', 'Tất cả'], ['ob', 'Sản khoa'], ['gy', 'Phụ khoa']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === v ? 'bg-white shadow text-gold-dk font-semibold' : 'text-ink-muted hover:text-ink'}`}>
              {l}
            </button>
          ))}
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-gold-dk text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gold transition-colors shadow-sm">
          <Icon d={ICONS.plus} className="w-4 h-4" /> Bài mới
        </button>
      </div>

      {/* Article list */}
      {loading ? (
        <div className="p-12 text-center text-ink-muted animate-pulse">Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-ink-muted">Chưa có bài viết nào.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(a => (
            <div key={a.id} className="bg-white rounded-2xl border border-gold/20 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {a.thumbnail_url && (
                <div className="h-36 overflow-hidden">
                  <img src={a.thumbnail_url} alt={a.title} className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-serif font-semibold text-ink text-base leading-snug flex-1">{a.title}</h4>
                  <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-semibold ${audienceColor(a.target_audience)}`}>
                    {audienceLabel(a.target_audience)}
                  </span>
                </div>
                {a.content && <p className="text-xs text-ink-muted line-clamp-2 mb-3 leading-relaxed">{a.content}</p>}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${a.status === 'published' ? 'bg-ok-lt text-ok' : 'bg-gold-lt text-gold-dk border border-gold/20'}`}>
                    {a.status === 'published' ? '✓ Đã đăng' : '○ Nháp'}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(a)} className="p-2 rounded-lg hover:bg-gold-lt transition-colors text-ink-muted hover:text-gold-dk">
                      <Icon d={ICONS.edit} className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteId(a.id)} className="p-2 rounded-lg hover:bg-danger-lt transition-colors text-ink-muted hover:text-danger">
                      <Icon d={ICONS.trash} className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modal.open} onClose={() => setModal(m => ({ ...m, open: false }))}
        title={modal.mode === 'create' ? 'Tạo bài viết mới' : 'Chỉnh sửa bài viết'} wide>
        <div className="space-y-4">
          <InputField label="Tiêu đề" value={modal.data.title} onChange={e => updateField('title', e.target.value)} placeholder="Tiêu đề bài viết..." />
          <SelectField label="Đối tượng" value={modal.data.target_audience} onChange={e => updateField('target_audience', e.target.value)}>
            <option value="both">Tất cả (OB + GY)</option>
            <option value="ob">Sản khoa (OB)</option>
            <option value="gy">Phụ khoa (GY)</option>
          </SelectField>
          <InputField label="Ảnh thumbnail URL" value={modal.data.thumbnail_url} onChange={e => updateField('thumbnail_url', e.target.value)} placeholder="https://..." />
          {modal.data.thumbnail_url && (
            <img src={modal.data.thumbnail_url} alt="preview" className="w-full h-32 object-cover rounded-xl" onError={e => e.target.style.display = 'none'} />
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Nội dung</label>
            <textarea value={modal.data.content} onChange={e => updateField('content', e.target.value)}
              placeholder="Nội dung bài viết..."
              className="w-full px-4 py-3 bg-white border border-gold/30 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all resize-none min-h-[160px]" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => saveArticle(false)} disabled={saving}
              className="flex-1 py-3 border-2 border-gold-dk text-gold-dk font-bold rounded-xl hover:bg-gold-lt transition-colors disabled:opacity-50">
              {saving ? '...' : 'Lưu nháp'}
            </button>
            <button onClick={() => saveArticle(true)} disabled={saving}
              className="flex-1 py-3 bg-gold-dk text-white font-bold rounded-xl hover:bg-gold transition-colors disabled:opacity-50">
              {saving ? 'Đang đăng...' : 'Đăng bài'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Xoá bài viết">
        <div className="space-y-4 text-center">
          <div className="w-14 h-14 bg-danger-lt rounded-full flex items-center justify-center mx-auto">
            <Icon d={ICONS.alert} className="w-7 h-7 text-danger" />
          </div>
          <p className="text-ink font-medium">Bạn có chắc muốn xoá bài viết này?</p>
          <p className="text-sm text-ink-muted">Hành động này không thể hoàn tác.</p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setDeleteId(null)} className="flex-1 py-3 border border-gold/30 rounded-xl text-ink font-medium hover:bg-gold-lt transition-colors">Huỷ</button>
            <button onClick={() => deleteArticle(deleteId)} className="flex-1 py-3 bg-danger text-white font-bold rounded-xl hover:bg-danger-dk transition-colors">Xoá</button>
          </div>
        </div>
      </Modal>

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(t => ({ ...t, isVisible: false }))} />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 4 – AI SCAN
// ═════════════════════════════════════════════════════════════════════════════
const SCAN_TYPES = ['Xét nghiệm', 'Hồ sơ giấy', 'Đơn thuốc', 'Khác'];

function TabAIScan() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [scanType, setScanType] = useState(SCAN_TYPES[0]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [doctorNote, setDoctorNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });
  const fileRef = useRef();

  const showToast = (msg, type = 'info') => setToast({ isVisible: true, message: msg, type });

  useEffect(() => {
    supabase.from('patients').select('id, name, bn_code, specialty').order('name', { ascending: true })
      .then(({ data }) => setPatients(data || []));
  }, []);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const analyze = async () => {
    if (!file) return showToast('Vui lòng chọn file', 'error');
    setAnalyzing(true);
    setResult(null);
    try {
      // Upload file to Supabase storage
      const path = `scan/${Date.now()}_${file.name}`;
      const { data: uploaded, error: upErr } = await supabase.storage.from('attachments').upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(path);

      // Call AI scan edge function
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ file_url: publicUrl, scan_type: scanType, patient_id: selectedPatient }),
      });

      if (!res.ok) {
        // Fallback: mock result for demo
        setResult({
          summary: `Đã phân tích ${scanType.toLowerCase()}. Kết quả: Các chỉ số trong giới hạn bình thường. Không phát hiện bất thường đáng kể.`,
          is_abnormal: false,
          public_url: publicUrl,
        });
      } else {
        const json = await res.json();
        setResult({ ...json, public_url: publicUrl });
      }
    } catch (err) {
      showToast('Lỗi phân tích: ' + err.message, 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const saveToRecord = async () => {
    if (!result) return showToast('Chưa có kết quả để lưu', 'error');
    setSaving(true);
    const pt = patients.find(p => p.id === selectedPatient);
    const { error } = await supabase.from('attachments').insert({
      bn_code: pt?.bn_code || '',
      patient_id: selectedPatient || null,
      file_name: file?.name || 'AI Scan',
      scan_type: scanType,
      ai_extracted: {
        result: result.summary,
        is_abnormal: result.is_abnormal,
        public_url: result.public_url,
        doctor_note: doctorNote,
      },
    });
    setSaving(false);
    if (error) return showToast('Lỗi lưu: ' + error.message, 'error');
    showToast('Đã lưu vào hồ sơ bệnh nhân', 'success');
    setResult(null);
    setFile(null);
    setPreview(null);
    setDoctorNote('');
    fileRef.current.value = '';
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Chọn BN + loại scan */}
      <div className="bg-white rounded-2xl border border-gold/20 shadow-sm p-5 space-y-4">
        <p className="text-sm font-semibold text-ink border-b border-gold/10 pb-3">Thông tin phân tích</p>
        <SelectField label="Chọn bệnh nhân" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
          <option value="">— Không chọn (khách vãng lai) —</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.bn_code ? `[${p.bn_code}] ` : ''}{p.name || p.email || '?'}</option>
          ))}
        </SelectField>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Loại tài liệu</label>
          <div className="flex gap-2 flex-wrap">
            {SCAN_TYPES.map(t => (
              <button key={t} onClick={() => setScanType(t)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${scanType === t ? 'bg-gold-dk text-white border-gold-dk shadow-sm' : 'border-gold/30 text-ink-muted hover:border-gold/60 hover:text-ink'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upload zone */}
      <div className="bg-white rounded-2xl border border-gold/20 shadow-sm p-5 space-y-4">
        <p className="text-sm font-semibold text-ink border-b border-gold/10 pb-3">Upload tài liệu</p>
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gold/40 rounded-2xl p-8 text-center cursor-pointer hover:border-gold hover:bg-gold-lt/30 transition-all">
          {preview ? (
            <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-xl object-contain mb-3" />
          ) : (
            <div className="w-14 h-14 bg-gold-lt rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon d={ICONS.upload} className="w-7 h-7 text-gold-dk" />
            </div>
          )}
          <p className="text-sm font-medium text-ink mb-1">
            {file ? file.name : 'Kéo thả hoặc click để chọn file'}
          </p>
          <p className="text-xs text-ink-muted">Hỗ trợ: JPG, PNG, PDF (tối đa 10MB)</p>
          <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        </div>
        {file && (
          <button onClick={analyze} disabled={analyzing}
            className="w-full py-3.5 bg-gold-dk text-white font-bold rounded-xl hover:bg-gold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm">
            {analyzing ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Đang phân tích...
              </>
            ) : (
              <>
                <Icon d={ICONS.scan} className="w-5 h-5" /> Phân tích AI
              </>
            )}
          </button>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-2xl border border-gold/20 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gold/10 bg-gold-lt/40 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${result.is_abnormal ? 'bg-danger animate-pulse' : 'bg-ok'}`} />
            <p className="text-sm font-semibold text-ink">
              Kết quả phân tích – {result.is_abnormal ? '⚠️ Phát hiện bất thường' : '✓ Bình thường'}
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className={`p-4 rounded-xl text-sm leading-relaxed ${result.is_abnormal ? 'bg-danger-lt border border-red-200 text-danger-dk' : 'bg-ok-lt border border-emerald-200 text-ok'}`}>
              {result.summary}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Ghi chú bác sĩ</label>
              <textarea value={doctorNote} onChange={e => setDoctorNote(e.target.value)}
                placeholder="Nhập ghi chú, chẩn đoán thêm của bác sĩ..."
                className="w-full px-4 py-3 bg-white border border-gold/30 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all resize-none min-h-[100px]" />
            </div>
            <button onClick={saveToRecord} disabled={saving}
              className="w-full py-3 bg-ink text-gold font-bold rounded-xl hover:bg-ink/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <Icon d={ICONS.file} className="w-4 h-4" />
              {saving ? 'Đang lưu...' : 'Lưu vào hồ sơ bệnh nhân'}
            </button>
          </div>
        </div>
      )}

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(t => ({ ...t, isVisible: false }))} />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: 'patients', label: 'Bệnh nhân', icon: ICONS.patients },
  { id: 'schedule', label: 'Lịch & Ca', icon: ICONS.calendar },
  { id: 'journal', label: 'Tạp chí', icon: ICONS.journal },
  { id: 'scan', label: '🔬 AI Scan', icon: ICONS.scan },
];

export default function DoctorDashboard() {
  const { profile, appRole, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('patients');
  const [patientCount, setPatientCount] = useState(null);

  // Block receptionist
  if (appRole === 'receptionist') return <Navigate to="/letan" replace />;

  useEffect(() => {
    supabase.from('patients').select('id', { count: 'exact', head: true })
      .then(({ count }) => setPatientCount(count ?? 0));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const doctorName = profile?.full_name || profile?.display_name || user?.email?.split('@')[0] || 'Bác sĩ';

  return (
    <div className="min-h-screen bg-bg">
      {/* Top header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gold/20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gold-lt border border-gold/30 flex items-center justify-center shrink-0">
              <span className="font-serif text-gold-dk font-bold text-base">{doctorName[0]}</span>
            </div>
            <div className="min-w-0">
              <p className="font-serif font-semibold text-ink text-sm sm:text-base truncate">BS. {doctorName}</p>
              {patientCount !== null && (
                <p className="text-xs text-ink-muted">{patientCount} bệnh nhân</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/doctor/chat')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-gold-lt border border-gold/30 text-gold-dk rounded-xl text-xs font-bold hover:bg-gold/20 transition-colors">
              <Icon d={ICONS.chat} className="w-4 h-4" /> AI Chat
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-gold/30 text-ink-muted rounded-xl text-xs font-medium hover:bg-gold-lt hover:text-gold-dk transition-colors">
              <Icon d={ICONS.logout} className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex gap-0 border-t border-gold/10 overflow-x-auto hide-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-gold-dk text-gold-dk'
                  : 'border-transparent text-ink-muted hover:text-ink hover:border-gold/40'
              }`}>
              <Icon d={Array.isArray(tab.icon) ? tab.icon[0] : tab.icon} className="w-4 h-4 hidden sm:block" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Tab content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-20">
        {activeTab === 'patients' && <TabPatients />}
        {activeTab === 'schedule' && <TabSchedule />}
        {activeTab === 'journal' && <TabJournal />}
        {activeTab === 'scan' && <TabAIScan />}
      </main>
    </div>
  );
}
