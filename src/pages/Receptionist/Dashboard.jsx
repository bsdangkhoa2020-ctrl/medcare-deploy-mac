import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import FileUploader from '../../components/FileUploader';
import Toast from '../../components/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ReceptionistDashboard() {
  const { appRole } = useAuth();
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });

  // Block doctors from accessing Receptionist Dashboard
  if (appRole === 'doctor') {
    return <Navigate to="/bacsi" replace />;
  }

  const showToast = (message, type = 'info') => {
    setToast({ isVisible: true, message, type });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    
    try {
      showToast(`Đang đẩy ${files.length} file lên hệ thống...`, 'info');
      
      for (const file of files) {
        // 1. Tải file lên Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `receptionist_uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('records')
          .upload(filePath, file);

        if (uploadError) {
          showToast(`Lỗi tải lên file ${file.name}`, 'error');
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('records')
          .getPublicUrl(filePath);

        const fileUrl = publicUrlData.publicUrl;

        // 2. Gọi Webhook (Xử lý ngầm, Lễ tân không cần quan tâm kết quả)
        const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zalo-webhook`;
        
        try {
          // Gửi request ngầm cho AI chạy, Lễ tân vẫn coi như đã tải xong
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_name: 'web_upload',
              file_url: fileUrl,
              file_name: file.name,
              mime_type: file.type
            })
          });
          successCount++;
        } catch (webhookErr) {
           console.error("Webhook trigger error for", file.name, webhookErr);
           successCount++; // Vẫn tính là upload thành công ở góc độ Lễ tân
        }
      }

      if (successCount > 0) {
        showToast(`Đã đẩy thành công ${successCount}/${files.length} file vào hệ thống!`, 'success');
      }
      
    } catch (error) {
      console.error(error);
      showToast(`Lỗi hệ thống: ${error.message}`, 'error');
    } finally {
      setIsUploading(false);
      setFiles([]); // Xoá file đã chọn sau khi xử lý xong
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-serif text-ink mb-2">Cổng Nhập Liệu Hồ Sơ</h1>
        <p className="text-ink-muted">Tải lên hàng loạt file PDF/Ảnh xét nghiệm. Hệ thống sẽ tự động phân bổ về đúng hồ sơ Bệnh nhân.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gold/20">
        <FileUploader 
          files={files} 
          setFiles={setFiles} 
          onUpload={handleUpload}
          isLoading={isUploading}
        />
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
