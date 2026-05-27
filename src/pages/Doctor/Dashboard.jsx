import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Toast from '../../components/Toast';
import { AlertTriangle, Send, CheckCircle2, Search, FileText, X, MessageCircle, Baby, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function DoctorDashboard() {
  const { profile, appRole } = useAuth();
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [doctorNote, setDoctorNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });
  const [activeTab, setActiveTab] = useState('red_alerts'); // 'red_alerts', 'ob', 'gy'

  // Block receptionist from accessing Doctor Dashboard
  if (appRole === 'receptionist') {
    return <Navigate to="/letan" replace />;
  }

  const showToast = (message, type = 'info') => {
    setToast({ isVisible: true, message, type });
  };

  useEffect(() => {
    fetchAttachments();
  }, []);

  // Set up real-time subscription for new results
  useEffect(() => {
    const channel = supabase
      .channel('public:attachments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attachments' }, (payload) => {
        setAttachments((current) => [payload.new, ...current]);
        
        if (payload.new.ai_extracted?.is_abnormal) {
          showToast(`⚠️ Bệnh nhân ${payload.new.bn_code} có kết quả BẤT THƯỜNG mới!`, 'error');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, profile?.specialty]);

  const fetchAttachments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.warn("Lỗi fetch DB:", error);
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
      
      const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zalo-webhook`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: 'doctor_note',
          bn_code: selectedItem.bn_code,
          note: doctorNote,
          file_url: selectedItem.ai_extracted?.public_url
        })
      });

      if (!response.ok) throw new Error('API Error');

      showToast(`Đã gửi Zalo cho BN ${selectedItem.bn_code}`, 'success');
      setDoctorNote('');
      
      // Update local state to mark as processed if needed
      setAttachments(prev => prev.map(a => a.id === selectedItem.id ? { ...a, status: 'doctor_reviewed' } : a));
      setSelectedItem(null);
    } catch (error) {
      showToast('Gửi thất bại: Không thể kết nối với Bot Zalo', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const filteredData = attachments.filter(item => {
    if (activeTab === 'red_alerts') return item.ai_extracted?.is_abnormal === true;
    if (activeTab === 'ob') return item.bn_code?.startsWith('OB');
    if (activeTab === 'gy') return item.bn_code?.startsWith('GY');
    return true;
  });

  const redAlertsCount = attachments.filter(i => i.ai_extracted?.is_abnormal).length;

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif text-ink mb-2">Bảng Điều Khiển Bác Sĩ</h1>
          <p className="text-ink-muted">Quản lý kết quả Sản/Phụ khoa và Cảnh báo đỏ tự động.</p>
        </div>
        
        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-gold/20 shadow-sm w-fit">
          <button 
            onClick={() => setActiveTab('red_alerts')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'red_alerts' ? 'bg-red-50 shadow-md text-danger border border-red-100' : 'text-ink-muted hover:bg-white/50'}`}
          >
            <AlertTriangle className={`w-4 h-4 ${activeTab === 'red_alerts' ? 'animate-pulse' : ''}`} />
            Cấp Cứu (Đỏ)
            {redAlertsCount > 0 && (
              <span className="bg-danger text-white text-[10px] px-2 py-0.5 rounded-full ml-1">
                {redAlertsCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('ob')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'ob' ? 'bg-white shadow-md text-ink border border-gold/20' : 'text-ink-muted hover:bg-white/50'}`}
          >
            <Baby className="w-4 h-4 text-emerald-500" />
            Sản Khoa (OB)
          </button>

          <button 
            onClick={() => setActiveTab('gy')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'gy' ? 'bg-white shadow-md text-ink border border-gold/20' : 'text-ink-muted hover:bg-white/50'}`}
          >
            <Activity className="w-4 h-4 text-purple-500" />
            Phụ Khoa (GY)
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LST BỆNH NHÂN */}
        <div className="lg:col-span-4 xl:col-span-3 glass rounded-3xl overflow-hidden flex flex-col h-full shadow-sm">
          <div className="p-4 border-b border-gold/20 bg-white/40">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input 
                type="text" 
                placeholder="Tìm mã BN..." 
                className="w-full pl-9 pr-4 py-2.5 bg-white/60 border border-gold/30 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoading ? (
              <div className="p-8 text-center text-ink-muted animate-pulse text-sm">Đang tải dữ liệu...</div>
            ) : filteredData.length === 0 ? (
              <div className="p-8 text-center text-ink-muted text-sm italic">
                {activeTab === 'red_alerts' ? 'Tuyệt vời! Không có cảnh báo đỏ nào.' : 'Không có hồ sơ nào.'}
              </div>
            ) : (
              filteredData.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedItem?.id === item.id ? 'bg-gold-light/80 border-gold shadow-md' : 'bg-white/40 border-gold/10 hover:bg-white hover:shadow-sm hover:border-gold/30'}`}
                >
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <span className={`font-mono font-bold px-2.5 py-1 rounded-md shadow-sm text-sm border ${item.bn_code?.startsWith('OB') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                      {item.bn_code || 'Chưa liên kết'}
                    </span>
                    {item.ai_extracted?.is_abnormal && (
                      <span className="flex items-center shrink-0 gap-1 text-[10px] font-bold text-danger-dark bg-red-100 px-2 py-1 rounded-full uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse"></span>
                        Bất thường
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-muted truncate mb-1" title={item.file_name}>{item.file_name}</p>
                  <p className="text-xs font-medium text-ink line-clamp-2 leading-relaxed">{item.ai_extracted?.result || 'Chưa có tóm tắt'}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* CHI TIẾT & LỜI DẶN */}
        <div className="lg:col-span-8 xl:col-span-9 glass rounded-3xl flex flex-col h-full overflow-hidden relative shadow-sm">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div 
                key="detail"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-full"
              >
                {/* Header detail */}
                <div className="p-5 border-b border-gold/20 bg-white/60 flex justify-between items-center shrink-0">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-serif font-semibold text-ink">
                        Hồ Sơ: {selectedItem.bn_code || 'Khách vãng lai'}
                      </h2>
                      {selectedItem.ai_extracted?.is_abnormal ? (
                        <span className="flex items-center gap-1.5 bg-red-100 text-danger-dark px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                          <AlertTriangle className="w-4 h-4" /> CẦN XỬ LÝ GẤP
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4" /> BÌNH THƯỜNG
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted font-medium">Tải lên lúc: {new Date(selectedItem.created_at).toLocaleString('vi-VN')}</p>
                  </div>
                  <button onClick={() => setSelectedItem(null)} className="p-2 text-ink-muted hover:bg-white rounded-full transition-colors shadow-sm">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content split */}
                <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
                  {/* File Preview */}
                  <div className="flex-1 p-0 border-b md:border-b-0 md:border-r border-gold/20 bg-ink/5 flex flex-col relative min-h-[300px]">
                    {selectedItem.ai_extracted?.public_url ? (
                      <iframe 
                        src={selectedItem.ai_extracted.public_url} 
                        className="w-full h-full absolute inset-0 border-none"
                        title="Document Preview"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <FileText className="w-16 h-16 text-gold/40 mb-4" />
                        <p className="text-ink-muted text-sm">Không thể xem trước tệp này.</p>
                      </div>
                    )}
                  </div>
                  
                  {/* AI Summary & Doctor Note */}
                  <div className="w-full md:w-[400px] flex flex-col shrink-0 bg-white/40">
                    <div className="p-6 flex-1 overflow-y-auto">
                      <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gold-dark"></span> 
                        AI Đánh Giá
                      </h3>
                      <div className="p-4 rounded-xl bg-white shadow-sm border border-gold/20 text-sm text-ink leading-relaxed mb-8">
                        <div className="font-semibold mb-2 text-ink">Bệnh nhân: {selectedItem.ai_extracted?.parsed?.patient_name || 'Không rõ'}</div>
                        {selectedItem.ai_extracted?.result}
                      </div>

                      <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Lời dặn Zalo
                      </h3>
                      <textarea 
                        value={doctorNote}
                        onChange={(e) => setDoctorNote(e.target.value)}
                        placeholder="Nhập lời dặn bác sĩ để gửi trực tiếp qua Zalo cho bệnh nhân..."
                        className="w-full min-h-[160px] p-4 bg-white shadow-inner border border-gold/30 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all resize-none"
                      />
                    </div>
                    
                    <div className="p-6 pt-0 mt-auto bg-transparent border-t border-gold/10">
                      <button 
                        onClick={handleSendZalo}
                        disabled={isSending || !doctorNote.trim()}
                        className="w-full py-4 px-4 bg-ink text-gold font-bold rounded-xl shadow-lg hover:bg-ink/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group"
                      >
                        {isSending ? (
                          <>Đang gửi tin Zalo...</>
                        ) : (
                          <>
                            <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> Gửi Chẩn Đoán Zalo
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
                <div className="w-24 h-24 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 shadow-sm border border-gold/20">
                  <MessageCircle className="w-12 h-12 text-gold/50" />
                </div>
                <h3 className="text-2xl font-serif text-ink mb-3">Chưa chọn hồ sơ</h3>
                <p className="text-ink-muted text-sm max-w-sm leading-relaxed">
                  Chọn một hồ sơ bệnh nhân từ danh sách bên trái để xem hình ảnh kết quả và trực tiếp gửi lời dặn qua Zalo.
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
