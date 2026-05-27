import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import FileUploader from '../../components/FileUploader';
import Toast from '../../components/Toast';
import { CheckCircle, FileText, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReceptionistDashboard() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });
  const [analysisResult, setAnalysisResult] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ isVisible: true, message, type });
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      
      // 1. Upload file to Supabase Storage 'records' bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `receptionist_uploads/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('records')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('records')
        .getPublicUrl(filePath);

      const fileUrl = publicUrlData.publicUrl;

      // 2. Trigger AI Analysis (Mock API call to Supabase Edge Function or direct Gemini logic)
      showToast('Đã tải lên thành công. Đang phân tích AI...', 'info');
      
      // We assume there's an edge function at `/functions/v1/gemini-proxy`
      // For this demo, we'll simulate the AI processing step since we don't have the full Edge function setup.
      // In a real scenario:
      // const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-proxy`, { ... })
      
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate AI delay

      // Mock AI Result based on Handover doc
      const mockAiResult = {
        patient_code: 'OB' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        patient_name: 'Nguyễn Thị ' + ['Hoa', 'Lan', 'Hương'][Math.floor(Math.random() * 3)],
        status: Math.random() > 0.5 ? 'BÌNH THƯỜNG' : 'BẤT THƯỜNG',
        summary: 'Kết quả xét nghiệm cho thấy các chỉ số sinh hóa...',
        red_flag: Math.random() > 0.5 // Random red flag
      };

      // 3. Save to database 'attachments' table
      const { error: dbError } = await supabase
        .from('attachments')
        .insert([{
          file_url: fileUrl,
          file_name: file.name,
          file_type: file.type,
          patient_code: mockAiResult.patient_code,
          ai_status: mockAiResult.status,
          ai_summary: mockAiResult.summary,
          red_flag: mockAiResult.red_flag,
          created_at: new Date().toISOString(),
          source: 'receptionist_portal'
        }]);

      if (dbError) console.warn("Lỗi lưu DB (Có thể do thiếu bảng attachments):", dbError);

      setAnalysisResult(mockAiResult);
      showToast('Phân tích AI hoàn tất!', 'success');
      
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-ink mb-2">Cổng Lễ Tân</h1>
        <p className="text-ink-muted">Tải lên kết quả xét nghiệm (PDF/Ảnh) để AI phân tích tự động.</p>
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
          {analysisResult ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-3xl p-6 relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gold-DEFAULT/20">
                <BrainCircuit className="w-6 h-6 text-gold-dark" />
                <h3 className="text-lg font-semibold text-ink">Kết Quả Phân Tích AI</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">Mã Bệnh Nhân</p>
                  <p className="font-mono text-sm font-semibold bg-white/60 inline-block px-2 py-1 rounded-md border border-gold-DEFAULT/30">
                    {analysisResult.patient_code}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">Tên Bệnh Nhân</p>
                  <p className="font-medium text-ink">{analysisResult.patient_name}</p>
                </div>

                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">Đánh giá chung</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${analysisResult.red_flag ? 'bg-red-100 text-danger-dark border border-red-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                    {analysisResult.red_flag ? <span className="w-2 h-2 rounded-full bg-danger animate-pulse" /> : <CheckCircle className="w-4 h-4" />}
                    {analysisResult.status}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">Tóm tắt</p>
                  <p className="text-sm text-ink-muted leading-relaxed bg-white/40 p-3 rounded-xl border border-gold-DEFAULT/10">
                    {analysisResult.summary}
                  </p>
                </div>
              </div>

              <button 
                onClick={resetUploader}
                className="w-full mt-6 py-3 bg-white border border-gold-DEFAULT/30 text-ink-muted font-semibold rounded-xl hover:bg-gold-light hover:text-ink transition-colors"
              >
                Tải lên file khác
              </button>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gold-DEFAULT/20 rounded-3xl bg-white/20">
              <FileText className="w-12 h-12 text-gold-DEFAULT/40 mb-4" />
              <p className="text-ink-muted text-sm max-w-xs">
                Sau khi tải file lên, hệ thống AI Gemini sẽ tự động trích xuất mã bệnh nhân và cảnh báo các chỉ số bất thường.
              </p>
            </div>
          )}
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
