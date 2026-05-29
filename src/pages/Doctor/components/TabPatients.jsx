import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Toast from '../../../components/Toast';
import { Icon, ICONS, Modal, InputField, SelectField, fmtDate } from './shared';

export default function TabPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ob');
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);

  const showToast = (msg, type = 'info') => setToast({ isVisible: true, message: msg, type });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const { data: pts } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
    setPatients(pts || []);
    setLoading(false);
  };

  const filteredPatients = patients.filter(p => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.bn_code?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = p.specialty === filter;
    return matchSearch && matchFilter;
  });

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setLoadingAttachments(true);
    const { data } = await supabase.from('attachments').select('*').eq('patient_id', patient.id).order('created_at', { ascending: false });
    setAttachments(data || []);
    setLoadingAttachments(false);
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
          {[['ob', 'Sản khoa'], ['gy', 'Phụ khoa']].map(([v, l]) => (
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
              <div key={p.id} onClick={() => handleSelectPatient(p)} className="flex items-center gap-4 px-6 py-4 hover:bg-gold-lt/30 transition-colors cursor-pointer">
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



      {/* Patient Detail Modal */}
      {selectedPatient && (
        <Modal title={`Hồ sơ: ${selectedPatient.name}`} onClose={() => setSelectedPatient(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm mb-6 bg-surface p-4 rounded-xl border border-gold/20">
              <div>
                <span className="text-ink-muted text-xs block uppercase">Mã BN</span>
                <p className="font-bold font-mono">{selectedPatient.bn_code || '---'}</p>
              </div>
              <div>
                <span className="text-ink-muted text-xs block uppercase">Chuyên khoa</span>
                <p className="font-bold">{selectedPatient.specialty === 'ob' ? 'Sản khoa' : 'Phụ khoa'}</p>
              </div>
              <div>
                <span className="text-ink-muted text-xs block uppercase">Ngày sinh</span>
                <p className="font-bold">{selectedPatient.dob || '---'}</p>
              </div>
              <div>
                <span className="text-ink-muted text-xs block uppercase">Liên hệ</span>
                <p className="font-bold truncate">{selectedPatient.phone || selectedPatient.email || '---'}</p>
              </div>
            </div>

            <h4 className="font-serif font-bold text-ink border-b border-gold/20 pb-2">Tài liệu xét nghiệm (AI Scan)</h4>
            {loadingAttachments ? (
              <div className="flex justify-center py-8">
                <svg className="w-5 h-5 animate-spin text-gold-dk" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
              </div>
            ) : attachments.length === 0 ? (
              <p className="text-sm text-ink-muted py-8 text-center italic bg-surface/50 rounded-xl border border-dashed border-gold/30">Chưa có kết quả xét nghiệm nào.</p>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {attachments.map(att => (
                  <div key={att.id} className="p-4 border border-gold/30 rounded-xl bg-surface shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-bold text-ink block">{att.file_name}</span>
                        <span className="text-xs text-ink-muted font-mono">{att.scan_type}</span>
                      </div>
                      <span className="text-xs text-ink-muted font-medium bg-gold-lt/30 px-2 py-1 rounded-md">{fmtDate(att.created_at)}</span>
                    </div>
                    {att.ai_extracted ? (
                       <div className="bg-white p-3 rounded-lg border border-gold/20 shadow-inner">
                         <pre className="whitespace-pre-wrap font-mono text-xs overflow-x-auto text-ink-muted">
                           {JSON.stringify(att.ai_extracted, null, 2)}
                         </pre>
                       </div>
                    ) : (
                       <p className="text-xs italic text-ink-muted">Đang cập nhật dữ liệu AI...</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(t => ({ ...t, isVisible: false }))} />
    </div>
  );
}
