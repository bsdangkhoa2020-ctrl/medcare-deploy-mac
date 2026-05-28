import React, { useState } from 'react';
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
        const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zalo-webhook`;
        
        try {
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
           successCount++; 
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
      setFiles([]);
    }
  };

  return (
    // Dùng fixed, inset-0 và z-[100] để phủ kín toàn màn hình, che đi Layout menu bên trái theo yêu cầu mà không cần sửa Layout.jsx
    <div className="fixed inset-0 z-[100] bg-[#F5EBE3] overflow-y-auto">
      <div className="min-h-screen p-4 sm:p-6 md:p-8 font-sans flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl mx-auto space-y-6 md:space-y-8">
          <div className="text-center bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-[#C7A47B]/20">
            <div className="w-16 h-16 bg-[#F5EBE3] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#C7A47B]/30 shadow-sm">
              <svg className="w-8 h-8 text-[#3E2A3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-[#3E2A3D] mb-3">Cổng Nhập Liệu Hồ Sơ</h1>
            <p className="text-[#3E2A3D]/70 text-sm md:text-base px-2">
              Khu vực dành riêng cho Lễ tân tải lên file PDF/Ảnh xét nghiệm cũ. AI sẽ tự động đọc hiểu và phân bổ.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-3xl shadow-sm border border-[#C7A47B]/20">
            <FileUploader 
              files={files} 
              setFiles={setFiles} 
              onUpload={handleUpload}
              isLoading={isUploading}
            />
          </div>
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
