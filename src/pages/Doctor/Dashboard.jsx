import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Toast from '../../components/Toast';
import { AlertTriangle, Send, CheckCircle2, Search, FileText, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DoctorDashboard() {
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [doctorNote, setDoctorNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });
  const [filterRedFlag, setFilterRedFlag] = useState(true);

  const showToast = (message, type = 'info') => {
    setToast({ isVisible: true, message, type });
  };

  useEffect(() => {
    fetchAttachments();
  }, [filterRedFlag]);

  const fetchAttachments = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('attachments')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterRedFlag) {
        query = query.eq('red_flag', true);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setAttachments(data || []);
      
    } catch (error) {
      console.warn("Lỗi fetch DB (có thể chưa có bảng attachments):", error);
      // Mock data if table doesn't exist yet
      setAttachments([
        {
          id: 1,
          patient_code: 'OB045',
          file_name: 'xet_nghiem_mau_Q2.pdf',
          file_url: 'https://example.com/mock.pdf',
          ai_status: 'BẤT THƯỜNG',
          ai_summary: 'Bạch cầu tăng cao (15.2 G/L). Đường huyết đói 6.8 mmol/L.',
          red_flag: true,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          patient_code: 'GY112',
          file_name: 'sieu_am_tuyen_giap.png',
          file_url: 'https://example.com/mock2.png',
          ai_status: 'BÌNH THƯỜNG',
          ai_summary: 'Không có dấu hiệu bất thường, kích thước tuyến bình thường.',
          red_flag: false,
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ].filter(a => filterRedFlag ? a.red_flag : true));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendZalo = async () => {
    if (!selectedItem || !doctorNote.trim()) {
      showToast('Vui lòng nhập lời dặn trước khi gửi', 'error');
      return;
    }

    try {
      setIsSending(true);
      
      // Lệnh gọi webhook Zalo
      const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zalo-webhook`;
      
      // Simulate API call for Demo
      // await fetch(webhookUrl, { ... })
      await new Promise(resolve => setTimeout(resolve, 1500));

      showToast(`Đã gửi Zalo cho BN ${selectedItem.patient_code}`, 'success');
      setDoctorNote('');
      setSelectedItem(null);
    } catch (error) {
      showToast('Gửi thất bại: ' + error.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif text-ink mb-2">Bảng Điều Khiển Bác Sĩ</h1>
          <p className="text-ink-muted">Quản lý kết quả xét nghiệm và gửi lời dặn trực tiếp qua Zalo.</p>
        </div>
        
        <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-xl border border-gold-DEFAULT/20 shadow-sm w-fit">
          <button 
            onClick={() => setFilterRedFlag(true)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterRedFlag ? 'bg-white shadow text-danger' : 'text-ink-muted hover:text-ink'}`}
          >
            <AlertTriangle className="w-4 h-4 inline-block mr-2 mb-0.5" />
            Cảnh Báo Đỏ
          </button>
          <button 
            onClick={() => setFilterRedFlag(false)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${!filterRedFlag ? 'bg-white shadow text-ink' : 'text-ink-muted hover:text-ink'}`}
          >
            Tất cả
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
        
        {/* LST BỆNH NHÂN */}
        <div className="lg:col-span-1 glass rounded-3xl overflow-hidden flex flex-col h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-gold-DEFAULT/20 bg-white/40">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input 
                type="text" 
                placeholder="Tìm mã BN..." 
                className="w-full pl-9 pr-4 py-2.5 bg-white/60 border border-gold-DEFAULT/30 rounded-xl text-sm focus:outline-none focus:border-gold-DEFAULT focus:ring-2 focus:ring-gold-DEFAULT/20 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoading ? (
              <div className="p-8 text-center text-ink-muted animate-pulse text-sm">Đang tải dữ liệu...</div>
            ) : attachments.length === 0 ? (
              <div className="p-8 text-center text-ink-muted text-sm italic">Không có hồ sơ nào.</div>
            ) : (
              attachments.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedItem?.id === item.id ? 'bg-gold-light/80 border-gold-DEFAULT shadow-sm' : 'bg-transparent border-transparent hover:bg-white/40 hover:border-gold-DEFAULT/20'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono font-bold text-ink bg-white px-2 py-0.5 rounded shadow-sm text-sm border border-gold-DEFAULT/20">
                      {item.patient_code}
                    </span>
                    {item.red_flag && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-danger-dark bg-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse"></span>
                        Cảnh báo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-muted truncate mb-1" title={item.file_name}>{item.file_name}</p>
                  <p className="text-xs font-medium text-ink line-clamp-2">{item.ai_summary}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* CHI TIẾT & LỜI DẶN */}
        <div className="lg:col-span-2 glass rounded-3xl flex flex-col h-[calc(100vh-200px)] overflow-hidden relative">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div 
                key="detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full"
              >
                {/* Header detail */}
                <div className="p-5 border-b border-gold-DEFAULT/20 bg-white/40 flex justify-between items-center shrink-0">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-lg font-serif font-semibold text-ink">Hồ Sơ: {selectedItem.patient_code}</h2>
                      {selectedItem.red_flag && <AlertTriangle className="w-5 h-5 text-danger" />}
                    </div>
                    <p className="text-xs text-ink-muted">Tải lên lúc: {new Date(selectedItem.created_at).toLocaleString('vi-VN')}</p>
                  </div>
                  <button onClick={() => setSelectedItem(null)} className="p-2 text-ink-muted hover:bg-white rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content split */}
                <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
                  {/* File Preview Mock */}
                  <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-gold-DEFAULT/20 bg-ink/5 flex flex-col items-center justify-center min-h-[250px]">
                    <FileText className="w-16 h-16 text-gold-DEFAULT/40 mb-4" />
                    <a href={selectedItem.file_url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gold-DEFAULT/30 text-sm font-semibold text-ink hover:text-gold-dark transition-colors">
                      Mở file gốc
                    </a>
                  </div>
                  
                  {/* AI Summary */}
                  <div className="w-full md:w-80 p-6 flex flex-col shrink-0 bg-white/20">
                    <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">AI Tóm Tắt</h3>
                    <div className="p-4 rounded-xl bg-white/60 border border-gold-DEFAULT/20 text-sm text-ink leading-relaxed mb-6">
                      {selectedItem.ai_summary}
                    </div>

                    <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">Zalo Lời Dặn</h3>
                    <div className="flex-1 flex flex-col">
                      <textarea 
                        value={doctorNote}
                        onChange={(e) => setDoctorNote(e.target.value)}
                        placeholder="Nhập lời dặn bác sĩ..."
                        className="w-full flex-1 min-h-[120px] p-4 bg-white/80 border border-gold-DEFAULT/30 rounded-xl text-sm focus:outline-none focus:border-gold-DEFAULT focus:ring-2 focus:ring-gold-DEFAULT/20 transition-all resize-none mb-4"
                      />
                      <button 
                        onClick={handleSendZalo}
                        disabled={isSending || !doctorNote.trim()}
                        className="w-full py-3 px-4 bg-ink text-gold-DEFAULT font-semibold rounded-xl shadow-md hover:bg-ink/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSending ? (
                          <>Đang gửi Zalo...</>
                        ) : (
                          <>
                            <Send className="w-4 h-4" /> Gửi Bệnh Nhân
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-20 h-20 bg-gold-light rounded-full flex items-center justify-center mb-6 shadow-inner border border-gold-DEFAULT/20">
                  <MessageCircle className="w-10 h-10 text-gold-DEFAULT/50" />
                </div>
                <h3 className="text-xl font-serif text-ink mb-2">Chưa chọn hồ sơ</h3>
                <p className="text-ink-muted text-sm max-w-sm">
                  Chọn một hồ sơ bệnh nhân từ danh sách bên trái để xem chi tiết và gửi lời dặn qua Zalo.
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
