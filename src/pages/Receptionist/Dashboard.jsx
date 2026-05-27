import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import FileUploader from '../../components/FileUploader';
import Toast from '../../components/Toast';
import { CheckCircle2, FileText, BrainCircuit, Activity, Baby } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ReceptionistDashboard() {
  const { appRole } = useAuth();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });
  const [analysisResult, setAnalysisResult] = useState(null);

  // Block doctors from accessing Receptionist Dashboard
  if (appRole === 'doctor') {
    return <Navigate to="/bacsi" replace />;
  }

  const showToast = (message, type = 'info') => {
    setToast({ isVisible: true, message, type });
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      
      // 1. Tải file lên Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `receptionist_uploads/${fileName}`;

      showToast('Đang đẩy file lên hệ thống...', 'info');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('records')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('records')
        .getPublicUrl(filePath);

      const fileUrl = publicUrlData.publicUrl;

      // 2. Kích hoạt AI Gemini qua Webhook
      showToast('AI đang bóc tách kết quả...', 'info');
      
      const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zalo-webhook`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: 'web_upload',
          file_url: fileUrl,
          file_name: file.name,
          mime_type: file.type
        })
      });

      if (!response.ok) throw new Error('Không thể kết nối với hệ thống AI');
      
      const resultData = await response.json();
      
      if (resultData.error) throw new Error(resultData.error);

      setAnalysisResult({
        patient_code: resultData.bn_code,
        patient_name: resultData.patient_name,
        status: resultData.is_abnormal ? 'BẤT THƯỜNG (CẦN BÁC SĨ DUYỆT)' : 'BÌNH THƯỜNG',
        summary: resultData.summary,
        is_abnormal: resultData.is_abnormal,
        doc_type: resultData.doc_type
      });

      showToast('Phân tích thành công! Đã tự động lưu hồ sơ.', 'success');
      
    } catch (error) {
      console.error(error);
      showToast(`Lỗi: ${error.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploader = () => {
    setFile(null);
    setAnalysisResult(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-serif text-ink mb-2">Cổng Tải Kết Quả (Lễ Tân)</h1>
        <p className="text-ink-muted">Tải lên file PDF hoặc Ảnh xét nghiệm. AI sẽ tự động đọc, liên kết hồ sơ và thông báo Zalo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="flex flex-col gap-6">
          <FileUploader 
            file={file} 
            setFile={setFile} 
            onUpload={handleUpload}
            isLoading={isUploading}
          />
        </div>

        {/* AI Analysis Result Section */}
        <div>
          <AnimatePresence mode="wait">
            {analysisResult ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass rounded-3xl p-8 relative overflow-hidden shadow-lg border border-gold/30"
              >
                {/* Background decorative element */}
                <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20 ${analysisResult.is_abnormal ? 'bg-danger' : 'bg-emerald-500'}`} />

                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gold/20 relative z-10">
                  <BrainCircuit className="w-8 h-8 text-gold-dark" />
                  <h3 className="text-2xl font-serif text-ink">Báo cáo bóc tách AI</h3>
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1.5">Mã Bệnh Nhân</p>
                      <div className="flex items-center gap-2">
                        <p className={`font-mono text-lg font-bold bg-white/80 inline-block px-3 py-1.5 rounded-lg shadow-sm border ${analysisResult.patient_code?.startsWith('OB') ? 'border-emerald-200 text-emerald-700' : 'border-purple-200 text-purple-700'}`}>
                          {analysisResult.patient_code || 'KHÔNG RÕ'}
                        </p>
                        {analysisResult.patient_code?.startsWith('OB') && <Baby className="w-5 h-5 text-emerald-500" />}
                        {analysisResult.patient_code?.startsWith('GY') && <Activity className="w-5 h-5 text-purple-500" />}
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1.5">Phân loại tài liệu</p>
                      <p className="font-semibold text-ink px-3 py-1.5 bg-white/50 rounded-lg inline-block border border-gold/20 uppercase text-sm">
                        {analysisResult.doc_type || 'Khác'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1.5">Tên Bệnh Nhân (AI Đọc Được)</p>
                    <p className="text-xl font-medium text-ink bg-white/40 px-3 py-2 rounded-lg border border-gold/10">
                      {analysisResult.patient_name || 'Không tìm thấy tên trên phiếu'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1.5">Đánh giá chung</p>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${analysisResult.is_abnormal ? 'bg-red-50 text-danger-dark border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                      {analysisResult.is_abnormal ? <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse" /> : <CheckCircle2 className="w-5 h-5" />}
                      {analysisResult.status}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1.5">Tóm tắt y khoa</p>
                    <p className="text-sm text-ink leading-relaxed bg-white/70 p-4 rounded-xl shadow-inner border border-gold/20 font-medium">
                      {analysisResult.summary}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={resetUploader}
                  className="w-full mt-8 py-3.5 bg-ink text-gold font-bold rounded-xl shadow-md hover:bg-ink/90 transition-all active:scale-[0.98]"
                >
                  Tải lên phiếu tiếp theo
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gold/30 rounded-3xl bg-white/30 backdrop-blur-sm"
              >
                <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <FileText className="w-10 h-10 text-gold/50" />
                </div>
                <h3 className="text-xl font-serif text-ink mb-2">Sẵn sàng phân tích</h3>
                <p className="text-ink-muted text-sm max-w-xs leading-relaxed">
                  Hệ thống AI Gemini đã được kích hoạt. Hãy tải một file lên để tự động bóc tách dữ liệu và tìm mã hồ sơ bệnh án.
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
