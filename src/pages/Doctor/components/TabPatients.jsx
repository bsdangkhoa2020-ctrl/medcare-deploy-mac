import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Toast from '../../../components/Toast';
import { Icon, ICONS, Modal, InputField, SelectField, fmtDate } from './shared';

export default function TabPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [attFilter, setAttFilter] = useState('all');

  const showToast = (msg, type = 'info') => setToast({ isVisible: true, message: msg, type });

  useEffect(() => {
    fetchAll();
    const channel = supabase.channel('public:patients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, payload => {
        fetchAll();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const { data: pts } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
    setPatients(pts || []);
    setLoading(false);
  };

  const filteredPatients = patients.filter(p => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.bn_code?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.specialty === filter;
    return matchSearch && matchFilter;
  });

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setAttFilter('all');
    setLoadingAttachments(true);
    const { data, error } = await supabase.from('attachments').select('*').eq('bn_code', patient.bn_code).order('uploaded_at', { ascending: false });
    if (error) console.error("Error fetching attachments:", error);
    setAttachments(data || []);
    setLoadingAttachments(false);
  };

  useEffect(() => {
    if (!selectedPatient) return;
    const channel = supabase.channel(`public:attachments:${selectedPatient.bn_code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attachments', filter: `bn_code=eq.${selectedPatient.bn_code}` }, async () => {
        const { data } = await supabase.from('attachments').select('*').eq('bn_code', selectedPatient.bn_code).order('uploaded_at', { ascending: false });
        setAttachments(data || []);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [selectedPatient]);



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



      {/* Patient EMR Full Modal */}
      {selectedPatient && (
        <Modal open={true} full={true} title="Hồ Sơ Bệnh Án Điện Tử (EMR)" onClose={() => setSelectedPatient(null)}>
          <div className="flex flex-col sm:flex-row h-full gap-8">
            
            {/* LEFT COLUMN: DEMOGRAPHICS & HISTORY */}
            <div className="w-full sm:w-1/3 flex flex-col gap-6 sm:overflow-y-auto pr-2 sm:border-r border-gold/15 custom-scrollbar pb-6">
              
              {/* Header Info */}
              <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-gold/20 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-gold-lt flex items-center justify-center font-serif text-gold-dk font-bold text-2xl shrink-0 border-2 border-gold/40 shadow-sm">
                  {(selectedPatient.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-ink leading-tight">{selectedPatient.name}</h3>
                  <div className="flex gap-2 mt-1.5">
                    <span className="text-xs font-mono bg-ink text-gold-lt px-2 py-0.5 rounded-md">{selectedPatient.bn_code}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${typeColor(selectedPatient.specialty)}`}>
                      {selectedPatient.specialty === 'ob' ? 'Sản khoa' : 'Phụ khoa'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact & Basics */}
              <div className="space-y-4 px-1">
                <h4 className="font-semibold text-ink-muted text-sm uppercase tracking-wider">Hành chính & Liên hệ</h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm bg-[#FDFBF7] p-4 rounded-xl border border-gold/15">
                  <div>
                    <span className="text-ink-muted/70 text-xs block mb-0.5">Ngày sinh</span>
                    <p className="font-medium text-ink">{selectedPatient.dob || '---'}</p>
                  </div>
                  <div>
                    <span className="text-ink-muted/70 text-xs block mb-0.5">Tuổi</span>
                    <p className="font-medium text-ink">{selectedPatient.dob ? new Date().getFullYear() - parseInt(selectedPatient.dob.slice(-4)) : '---'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-ink-muted/70 text-xs block mb-0.5">Điện thoại</span>
                    <p className="font-medium text-ink">{selectedPatient.phone || '---'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-ink-muted/70 text-xs block mb-0.5">Địa chỉ</span>
                    <p className="font-medium text-ink">{selectedPatient.address || '---'}</p>
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div className="space-y-4 px-1">
                <h4 className="font-semibold text-ink-muted text-sm uppercase tracking-wider">Tiền sử y khoa</h4>
                <div className="space-y-3">
                  <div className="bg-surface p-4 rounded-xl border border-gold/20 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-ink">Chỉ số PARA (Sản khoa)</span>
                      <button className="text-gold-dk hover:bg-gold-lt p-1.5 rounded-md transition-colors"><Icon d={ICONS.edit} className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-white p-2 rounded-lg border border-gold/15">
                        <span className="block text-xs text-ink-muted">Sinh</span>
                        <span className="font-bold text-lg text-ink">{selectedPatient.para_s || 0}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gold/15">
                        <span className="block text-xs text-ink-muted">Sớm</span>
                        <span className="font-bold text-lg text-ink">{selectedPatient.para_so || 0}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gold/15">
                        <span className="block text-xs text-ink-muted">Sẩy</span>
                        <span className="font-bold text-lg text-ink">{selectedPatient.para_sa || 0}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gold/15">
                        <span className="block text-xs text-ink-muted">Sống</span>
                        <span className="font-bold text-lg text-ink">{selectedPatient.para_so_ng || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface p-4 rounded-xl border border-gold/20 text-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-ink">Dị ứng & Bệnh nền</span>
                      <button className="text-gold-dk hover:bg-gold-lt p-1.5 rounded-md transition-colors"><Icon d={ICONS.edit} className="w-3.5 h-3.5" /></button>
                    </div>
                    {selectedPatient.allergies ? (
                      <p className="text-danger-dk bg-danger-lt px-3 py-2 rounded-lg border border-red-200">{selectedPatient.allergies}</p>
                    ) : (
                      <p className="text-ink-muted italic">Không ghi nhận dị ứng.</p>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: TIMELINE & AI SCAN RESULTS */}
            <div className="w-full sm:w-2/3 flex flex-col sm:h-full overflow-visible sm:overflow-hidden mt-6 sm:mt-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 px-1 shrink-0 gap-3">
                <h4 className="font-serif font-bold text-xl text-ink flex items-center gap-2">
                  <Icon d={ICONS.journal} className="w-5 h-5 text-gold-dk" />
                  Dòng thời gian
                </h4>
                <div className="flex bg-surface shadow-sm rounded-xl p-1 gap-1 border border-gold/30 text-xs font-bold overflow-x-auto max-w-full hide-scrollbar">
                  {[['all', 'Tất cả'], ['Hồ sơ giấy', 'Lịch sử khám'], ['Xét nghiệm', 'Xét nghiệm'], ['Đơn thuốc', 'Toa thuốc']].map(([v, l]) => (
                    <button key={v} onClick={() => setAttFilter(v)}
                      className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${attFilter === v ? 'bg-ink text-gold-lt shadow' : 'text-ink-muted hover:text-ink'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 sm:overflow-y-auto overflow-visible pr-2 custom-scrollbar pb-6">
                {loadingAttachments ? (
                  <div className="flex flex-col justify-center items-center py-20 gap-3 text-ink-muted">
                    <svg className="w-8 h-8 animate-spin text-gold-dk" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                    <p className="font-medium">Đang tải lịch sử khám...</p>
                  </div>
                ) : attachments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-surface/50 rounded-2xl border border-dashed border-gold/30">
                    <div className="w-16 h-16 bg-gold-lt rounded-full flex items-center justify-center text-gold-dk mb-4">
                      <Icon d={ICONS.file} className="w-8 h-8" />
                    </div>
                    <p className="font-serif text-lg font-bold text-ink">Chưa có dữ liệu cận lâm sàng</p>
                    <p className="text-sm text-ink-muted mt-1 max-w-sm">Bệnh nhân này chưa có phiếu siêu âm hay xét nghiệm nào được tải lên hệ thống.</p>
                  </div>
                ) : (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gold/40 before:via-gold/20 before:to-transparent">
                    {attachments.filter(a => {
                      if (attFilter === 'all') return true;
                      
                      // Map raw doc_type from AI to UI filter
                      let uiType = a.scan_type;
                      if (uiType === 'xet_nghiem') uiType = 'Xét nghiệm';
                      else if (uiType === 'sieu_am') uiType = 'Siêu âm';
                      else if (uiType === 'don_thuoc') uiType = 'Đơn thuốc';
                      
                      return uiType === attFilter || a.scan_type === attFilter;
                    }).map((att, idx) => {
                      const ai = att.ai_extracted;
                      const isAbnormal = ai?.is_abnormal;
                      
                      // Map scan type for UI Display
                      let displayType = att.scan_type;
                      if (displayType === 'xet_nghiem') displayType = 'Xét nghiệm';
                      else if (displayType === 'sieu_am') displayType = 'Siêu âm';
                      else if (displayType === 'don_thuoc') displayType = 'Đơn thuốc';
                      
                      return (
                        <div key={att.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          {/* Timeline Dot */}
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-bg bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${isAbnormal ? 'ring-2 ring-danger/50 text-danger' : 'text-gold-dk'}`}>
                            <Icon d={isAbnormal ? ICONS.alert : ICONS.check} className="w-4 h-4" />
                          </div>
                          
                          {/* Card Content */}
                          <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl shadow-sm border transition-all bg-surface hover:shadow-md ${isAbnormal ? 'border-red-300' : 'border-gold/30'}`}>
                            <div className="flex justify-between items-start mb-3 border-b border-gold/15 pb-3">
                              <div>
                                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md mb-2 inline-block ${isAbnormal ? 'bg-danger-lt text-danger-dk' : 'bg-gold-lt text-gold-dk'}`}>
                                  {displayType}
                                </span>
                                <h5 className="font-bold text-ink text-base line-clamp-1" title={att.file_name}>{att.file_name}</h5>
                              </div>
                              <span className="text-xs text-ink-muted font-medium bg-white px-2 py-1 rounded border border-gold/20 whitespace-nowrap shadow-sm">
                                {fmtDate(att.uploaded_at)}
                              </span>
                            </div>
                            
                            {/* AI Result Area */}
                            {ai ? (
                              <div className="space-y-4 text-sm">
                                <div className={`p-3 rounded-xl leading-relaxed ${isAbnormal ? 'bg-danger-lt/50 text-danger-dk' : 'bg-ok-lt/30 text-ink'}`}>
                                  <p className={isAbnormal ? 'font-medium' : ''}>
                                    <strong className="font-serif">Kết luận AI: </strong> 
                                    {ai.result || ai.summary || 'Không có tóm tắt.'}
                                  </p>
                                </div>

                                {/* Render Additional Extracted Data */}
                                {ai.parsed?.diagnosis && (
                                  <div className="bg-white p-3 rounded-xl border border-gold/15 shadow-sm">
                                    <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">Chẩn đoán</p>
                                    <p className="font-medium text-ink">{ai.parsed.diagnosis}</p>
                                  </div>
                                )}

                                {ai.parsed?.vitals && (
                                  <div className="bg-[#FDFBF7] p-3 rounded-xl border border-gold/15">
                                    <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Sinh hiệu</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                      {ai.parsed.vitals.weight_kg && <div><span className="text-ink-muted block">Cân nặng</span><span className="font-bold">{ai.parsed.vitals.weight_kg}</span></div>}
                                      {ai.parsed.vitals.height_cm && <div><span className="text-ink-muted block">Chiều cao</span><span className="font-bold">{ai.parsed.vitals.height_cm}</span></div>}
                                      {ai.parsed.vitals.blood_pressure && <div><span className="text-ink-muted block">Huyết áp</span><span className="font-bold text-danger">{ai.parsed.vitals.blood_pressure}</span></div>}
                                      {ai.parsed.vitals.heart_rate && <div><span className="text-ink-muted block">Mạch</span><span className="font-bold">{ai.parsed.vitals.heart_rate}</span></div>}
                                    </div>
                                  </div>
                                )}

                                {ai.parsed?.prescriptions && ai.parsed.prescriptions.length > 0 && (
                                  <div className="bg-white p-3 rounded-xl border border-gold/15 shadow-sm">
                                    <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Đơn thuốc ({ai.parsed.prescriptions.length})</p>
                                    <ul className="space-y-2">
                                      {ai.parsed.prescriptions.map((med, i) => (
                                        <li key={i} className="text-xs pb-2 border-b border-gold/10 last:border-0 last:pb-0">
                                          <div className="flex justify-between font-bold text-ink">
                                            <span>{i+1}. {med.medication}</span>
                                            <span>{med.quantity}</span>
                                          </div>
                                          <p className="text-ink-muted mt-0.5">{med.instructions}</p>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Doctor Note */}
                                {ai.doctor_note && (
                                  <div className="bg-[#FDFBF7] p-3 rounded-xl border border-gold/20">
                                    <p className="text-xs font-bold text-ink-muted mb-1 flex items-center gap-1"><Icon d={ICONS.edit} className="w-3 h-3"/> Ghi chú Bác sĩ:</p>
                                    <p className="text-ink font-medium">{ai.doctor_note}</p>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-2 mt-2 border-t border-gold/10">
                                  {ai.public_url && (
                                    <a href={att.file_name?.toLowerCase().endsWith('.pdf') ? `https://docs.google.com/viewer?url=${encodeURIComponent(ai.public_url)}` : ai.public_url} target="_blank" rel="noreferrer" 
                                      className="flex-1 text-center py-2 bg-white border border-gold/30 hover:border-gold hover:bg-gold-lt/30 text-ink text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                                      <Icon d={ICONS.eye} className="w-3.5 h-3.5" /> Xem bản gốc
                                    </a>
                                  )}
                                  <button className="flex-1 py-2 bg-surface border border-gold/30 hover:border-gold hover:bg-gold-lt/30 text-ink text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                                    <Icon d={ICONS.edit} className="w-3.5 h-3.5" /> Cập nhật KQ
                                  </button>
                                </div>
                              </div>
                            ) : (
                               <p className="text-sm italic text-ink-muted py-2">Đang đồng bộ dữ liệu AI...</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        </Modal>
      )}

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(t => ({ ...t, isVisible: false }))} />
    </div>
  );
}
