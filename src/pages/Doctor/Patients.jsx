import { useState, useEffect } from 'react';
import { Search, UserCircle, Calendar, Phone, Activity, FileText, CheckCircle2, AlertTriangle, Baby } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../../components/Toast';
import { useRealtimePatientRecords } from '../../hooks/useRealtimePatientRecords';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ob'); // 'ob', 'gy'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientRecords(selectedPatient.bn_code);
    } else {
      setPatientRecords([]);
    }
  }, [selectedPatient]);

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  useRealtimePatientRecords(selectedPatient?.bn_code, (newRecord) => {
    setPatientRecords(prev => [newRecord, ...prev]);
    if (newRecord.ai_extracted?.is_abnormal) {
      showToast(`🚨 Báo động: Có kết quả BẤT THƯỜNG mới tải lên cho bệnh nhân này!`, 'error');
    } else {
      showToast(`Có hồ sơ mới được tự động cập nhật từ Lễ Tân!`, 'success');
    }
  });

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      showToast('Lỗi khi tải danh sách bệnh nhân', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatientRecords = async (bnCode) => {
    setIsLoadingRecords(true);
    try {
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('bn_code', bnCode)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPatientRecords(data || []);
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    if (activeTab === 'ob' && p.specialty !== 'ob') return false;
    if (activeTab === 'gy' && p.specialty !== 'gy') return false;
    
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (p.name?.toLowerCase().includes(s) || p.bn_code?.toLowerCase().includes(s) || p.phone?.includes(s));
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* HEADER */}
      <div className="bg-transparent md:glass rounded-none md:rounded-3xl px-4 pt-4 md:p-6 mb-2 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 relative overflow-hidden md:shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-lt/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="relative z-10 w-full md:w-auto">
          <h1 className="text-xl md:text-3xl font-serif font-semibold text-ink mb-1 flex items-center gap-2 md:gap-3">
            Quản Lý Bệnh Nhân
          </h1>
          <p className="text-xs md:text-sm text-ink-muted">Hồ sơ toàn diện Sản/Phụ khoa</p>
        </div>
        
        <div className="flex gap-1.5 md:gap-2 relative z-10 bg-white/40 p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-gold/20 shadow-sm overflow-x-auto w-full md:w-auto hide-scrollbar">
          {[
            { id: 'ob', label: 'Sản (OB)', icon: <Baby className="w-3.5 h-3.5" /> },
            { id: 'gy', label: 'Phụ (GY)', icon: <Activity className="w-3.5 h-3.5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1 md:gap-1.5 px-2 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-white text-ink shadow-sm scale-100 border border-gold/30' 
                  : 'text-ink-muted hover:text-ink hover:bg-white/50 scale-[0.98]'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex lg:grid lg:grid-cols-12 gap-0 md:gap-6 min-h-0">
        
        {/* DANH SÁCH BỆNH NHÂN (Trái) */}
        <div className={`lg:col-span-4 xl:col-span-3 w-full bg-transparent md:glass rounded-none md:rounded-3xl overflow-hidden flex-col h-full md:shadow-sm ${selectedPatient ? 'hidden lg:flex' : 'flex'}`}>
          <div className="px-4 py-2 md:p-4 border-b border-gold/10 md:border-gold/20 bg-transparent md:bg-white/40">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input 
                type="text" 
                placeholder="Tìm tên, mã, SĐT..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/60 border border-gold/30 rounded-lg md:rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-0 md:p-3 space-y-0 md:space-y-2">
            {isLoading ? (
              <div className="p-8 text-center text-ink-muted animate-pulse text-sm">Đang tải danh sách...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-8 text-center text-ink-muted text-sm italic">
                Không tìm thấy bệnh nhân nào.
              </div>
            ) : (
              filteredPatients.map(p => (
                <button
                  key={p.bn_code}
                  onClick={() => setSelectedPatient(p)}
                  className={`w-full text-left p-4 md:rounded-2xl transition-all border-b md:border ${selectedPatient?.bn_code === p.bn_code ? 'bg-gold-lt/80 border-gold md:shadow-md' : 'bg-transparent md:bg-white/40 border-gold/10 hover:bg-white hover:md:shadow-sm hover:md:border-gold/30'}`}
                >
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <span className={`font-mono font-bold px-2.5 py-1 rounded-md shadow-sm text-sm border ${p.specialty === 'ob' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                      {p.bn_code}
                    </span>
                    {p.specialty === 'ob' && p.lmp && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full uppercase tracking-wider">
                        Dự sinh: {new Date(new Date(p.lmp).getTime() + 280 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-ink truncate">{p.name || 'Chưa cập nhật tên'}</h4>
                  <p className="text-xs text-ink-muted mt-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {p.phone || 'Chưa có SĐT'}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* CHI TIẾT BỆNH NHÂN (Phải) */}
        <div className={`lg:col-span-8 xl:col-span-9 w-full bg-white md:glass rounded-none md:rounded-3xl flex-col h-full overflow-hidden relative md:shadow-sm ${!selectedPatient ? 'hidden lg:flex' : 'flex'}`}>
          <AnimatePresence mode="wait">
            {selectedPatient ? (
              <motion.div 
                key="detail"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-full overflow-y-auto p-4 md:p-8"
              >
                {/* Mobile Back Button */}
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="lg:hidden flex items-center gap-2 text-ink hover:text-gold-dk font-medium text-sm mb-6 pb-4 border-b border-gold/10 transition-colors w-fit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m15 18-6-6 6-6"/></svg>
                  Trở lại danh sách bệnh nhân
                </button>

                {/* Header Profile */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 border-b border-gold/20 pb-6 mb-6">
                  <div className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl flex items-center justify-center shadow-inner border ${selectedPatient.specialty === 'ob' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-purple-50 border-purple-200 text-purple-600'}`}>
                    {selectedPatient.specialty === 'ob' ? <Baby className="w-10 h-10" /> : <Activity className="w-10 h-10" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-serif font-semibold text-ink">
                        {selectedPatient.name || 'Không có tên'}
                      </h2>
                      <span className={`font-mono font-bold px-2.5 py-1 rounded-md text-sm border ${selectedPatient.specialty === 'ob' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                        {selectedPatient.bn_code}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="bg-white/50 p-3 rounded-xl border border-gold/10">
                        <p className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Năm sinh</p>
                        <p className="text-sm font-medium">{selectedPatient.dob || '—'}</p>
                      </div>
                      <div className="bg-white/50 p-3 rounded-xl border border-gold/10">
                        <p className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Số điện thoại</p>
                        <p className="text-sm font-medium">{selectedPatient.phone || '—'}</p>
                      </div>
                      {selectedPatient.specialty === 'ob' && (
                        <div className="bg-white/50 p-3 rounded-xl border border-gold/10">
                          <p className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-1">Kỳ kinh cuối (LMP)</p>
                          <p className="text-sm font-medium">{selectedPatient.lmp ? new Date(selectedPatient.lmp).toLocaleDateString('vi-VN') : '—'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tài liệu đính kèm (Timeline) */}
                <div>
                  <h3 className="text-lg font-serif font-semibold text-ink mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gold-dk" />
                    Hồ Sơ Y Khoa & AI Scan
                  </h3>
                  
                  {isLoadingRecords ? (
                    <div className="p-8 text-center text-ink-muted animate-pulse">Đang tải hồ sơ...</div>
                  ) : patientRecords.length === 0 ? (
                    <div className="bg-white/40 border border-dashed border-gold/30 rounded-2xl p-8 text-center">
                      <FileText className="w-8 h-8 text-gold/40 mx-auto mb-3" />
                      <p className="text-ink-muted text-sm">Bệnh nhân chưa có phiếu kết quả nào được tải lên.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {patientRecords.map(record => (
                        <div key={record.id} className="bg-white/60 border border-gold/20 p-5 rounded-2xl flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md transition-all">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xs font-bold text-ink-muted bg-gold-lt/50 px-2 py-1 rounded-md">
                                {new Date(record.created_at).toLocaleDateString('vi-VN')}
                              </span>
                              <span className="text-xs font-bold text-ink-muted bg-white/50 px-2 py-1 rounded-md uppercase border border-gold/10">
                                {record.doctype || 'Phiếu xét nghiệm'}
                              </span>
                              <span className="text-xs text-ink-muted italic border border-gold/20 px-2 py-1 rounded-full">
                                {record.status === 'doctor_reviewed' ? 'Đã xem' : 'Chưa xem'}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-start mb-3">
                              <p className="text-sm font-semibold text-ink">{record.file_name}</p>
                            </div>
                            
                            {/* Khung hiển thị trực tiếp file */}
                            {record.ai_extracted?.public_url ? (
                              <div className="w-full bg-white/80 rounded-xl border border-gold/20 overflow-hidden mt-2 relative" style={{ height: '500px' }}>
                                {record.mime_type?.includes('pdf') || record.file_name?.toLowerCase().endsWith('.pdf') ? (
                                  <iframe 
                                    src={`${record.ai_extracted.public_url}#toolbar=0`} 
                                    className="w-full h-full border-0" 
                                    title={record.file_name}
                                  />
                                ) : (
                                  <div className="w-full h-full overflow-auto bg-gray-50 flex items-center justify-center p-2">
                                    <img 
                                      src={record.ai_extracted.public_url} 
                                      alt={record.file_name}
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  </div>
                                )}
                                <a 
                                  href={record.ai_extracted.public_url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="absolute top-2 right-4 bg-ink/80 text-white p-2 rounded-full hover:bg-ink transition-colors shadow-md backdrop-blur-sm"
                                  title="Mở toàn màn hình"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                                </a>
                              </div>
                            ) : (
                              <div className="w-full h-32 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex items-center justify-center text-xs text-gray-400 mt-2">
                                Lỗi hiển thị file
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center p-8 text-center bg-white/20"
              >
                <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gold/10">
                  <UserCircle className="w-10 h-10 text-gold/50" />
                </div>
                <h3 className="text-xl font-serif text-ink mb-2">Chưa chọn bệnh nhân</h3>
                <p className="text-ink-muted text-sm max-w-xs leading-relaxed">
                  Vui lòng chọn một bệnh nhân từ danh sách bên trái để xem toàn bộ hồ sơ y khoa và lịch sử xét nghiệm.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <Toast 
        isVisible={toast.isVisible} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast(t => ({ ...t, isVisible: false }))} 
      />
    </div>
  );
}
