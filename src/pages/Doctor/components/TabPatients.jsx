import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Toast from '../../../components/Toast';
import { Icon, ICONS, Modal, InputField, SelectField, fmtDate } from './shared';

export default function TabPatients() {
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
    : 'bg-gy-lt text-gy-dk border-gy-md';

  return (
    <div className="space-y-6">
      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Icon d={ICONS.search} className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm bệnh nhân theo tên, mã BN..."
            className="w-full pl-11 pr-4 py-3 bg-surface border border-gold/40 shadow-sm rounded-xl text-sm focus:outline-none focus:border-gold-dk focus:ring-2 focus:ring-gold/20 transition-all text-ink placeholder:text-ink-muted/60" />
        </div>
        <div className="flex bg-surface shadow-sm rounded-xl p-1.5 gap-1 border border-gold/30 w-full sm:w-auto">
          {[['all', 'Tất cả'], ['ob', 'Sản khoa'], ['gy', 'Phụ khoa']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-semibold transition-all ${filter === v ? 'bg-gold-lt text-gold-dk shadow border border-gold/30' : 'text-ink-muted hover:text-ink hover:bg-gold-lt/30'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Patient list */}
      <div className="bg-surface rounded-2xl border border-gold/30 shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gold/20 flex items-center justify-between bg-[#FDFBF7]">
          <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
            Hồ sơ bệnh nhân
            <span className="bg-ink text-gold-lt text-xs px-2.5 py-0.5 rounded-full font-sans">{filteredPatients.length}</span>
          </h3>
        </div>
        {loading ? (
          <div className="p-10 flex justify-center items-center gap-3 text-ink-muted text-sm font-medium">
            <svg className="w-5 h-5 animate-spin text-gold-dk" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            Đang tải dữ liệu...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gold-lt rounded-full flex items-center justify-center text-gold-dk">
              <Icon d={ICONS.patients} className="w-8 h-8" />
            </div>
            <p className="font-serif text-xl font-semibold text-ink mb-1">Chưa có hồ sơ nào</p>
            <p className="text-sm text-ink-muted">Danh sách bệnh nhân sẽ hiển thị ở đây.</p>
          </div>
        ) : (
          <div className="divide-y divide-gold/15">
            {filteredPatients.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gold-lt/20 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gold-lt flex items-center justify-center font-serif text-gold-dk font-bold text-lg shrink-0 border border-gold/30">
                  {(p.name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink text-sm sm:text-base truncate">{p.name || 'Chưa đặt tên'}</p>
                  <p className="text-xs text-ink-muted truncate">{p.phone || p.email || 'Chưa có liên hệ'}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg border text-xs font-bold font-mono shadow-sm ${typeColor(p.specialty)}`}>
                  {p.bn_code || (p.specialty?.toUpperCase())}
                </span>
                <span className="text-xs text-ink-muted font-medium hidden sm:block w-24 text-right">{p.created_at ? fmtDate(p.created_at) : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mã mời */}
      <div className="bg-surface rounded-2xl border border-gold/30 shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gold/20 bg-[#FDFBF7] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gold-lt/50 flex items-center justify-center text-gold-dk">
              <Icon d={ICONS.key} className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-lg font-bold text-ink">Thẻ định danh (Mã mời)</h3>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-ink text-gold-lt px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-ink-2 transition-all shadow-sm border border-ink">
            <Icon d={ICONS.plus} className="w-4 h-4" /> Cấp thẻ mới
          </button>
        </div>
        {inviteCodes.length === 0 ? (
          <div className="p-12 text-center text-ink-muted text-sm font-medium">Chưa phát hành thẻ định danh nào.</div>
        ) : (
          <div className="divide-y divide-gold/15">
            {inviteCodes.slice(0, 20).map(c => (
              <div key={c.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gold-lt/10 transition-colors">
                <div className={`font-mono font-bold text-sm tracking-widest px-3.5 py-1.5 rounded-lg border shadow-sm ${typeColor(c.specialty)}`}>
                  {c.code}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ink truncate">{c.assigned_name}</p>
                  <p className="text-xs font-medium text-ink-muted mt-0.5">
                    {c.specialty === 'ob' ? 'Sản khoa' : 'Phụ khoa'}
                    {c.expires_at && <span className="mx-2">•</span>}
                    {c.expires_at && `Hạn: ${fmtDate(c.expires_at)}`}
                  </p>
                </div>
                {!!c.used_at ? (
                  <span className="text-xs text-ok bg-ok-lt px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-sm border border-emerald-200">
                    <Icon d={ICONS.check} className="w-3.5 h-3.5" /> Đã dùng
                  </span>
                ) : (
                  <button onClick={() => copyCode(c.code)}
                    className={`p-2.5 rounded-xl transition-all shadow-sm border ${copiedId === c.code ? 'bg-ok-lt text-ok border-emerald-200' : 'bg-surface hover:bg-gold-lt text-ink-muted hover:text-gold-dk border-gold/30'}`}>
                    <Icon d={copiedId === c.code ? ICONS.check : ICONS.copy} className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Cấp thẻ định danh mới">
        <div className="space-y-5">
          <InputField label="Tên bệnh nhân" value={form.patient_name} onChange={e => setForm(f => ({ ...f, patient_name: e.target.value }))} placeholder="Nguyễn Thị A" />
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Loại khám" value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}>
              <option value="ob">Sản khoa (OB)</option>
              <option value="gy">Phụ khoa (GY)</option>
            </SelectField>
            <SelectField label="Hiệu lực" value={form.validity_days} onChange={e => setForm(f => ({ ...f, validity_days: e.target.value }))}>
              <option value="7">7 ngày</option>
              <option value="14">14 ngày</option>
              <option value="30">30 ngày</option>
            </SelectField>
          </div>
          <button onClick={createCode} disabled={saving}
            className="w-full bg-ink text-gold-lt py-3.5 rounded-xl font-bold text-base hover:bg-ink-2 shadow-md transition-all disabled:opacity-50 mt-2">
            {saving ? 'Đang tạo thẻ...' : 'Phát hành thẻ'}
          </button>
        </div>
      </Modal>

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(t => ({ ...t, isVisible: false }))} />
    </div>
  );
}
