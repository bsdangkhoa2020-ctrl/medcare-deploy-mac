import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';
import FileUploader from '../../components/FileUploader';
import Toast from '../../components/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ReceptionistDashboard() {
  const { appRole } = useAuth();
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [specialty, setSpecialty] = useState('gy'); // 'ob' (Sản) hoặc 'gy' (Phụ)
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

        // 1. Tải lên Storage
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
        
        // 2. Kích hoạt AI Scan Edge Function (Nâng cấp)
        const aiScanUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-scan`;
        
        try {
          showToast(`AI đang đọc dữ liệu từ ${file.name}...`, 'info');
          const aiRes = await fetch(aiScanUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file_url: fileUrl,
              scan_type: 'Hồ sơ tải lên từ Lễ tân',
              specialty: specialty, // Truyền phân loại do Lễ tân chọn
              file_info: {
                file_name: fileName,
                storage_path: filePath,
                file_size: file.size,
                mime_type: file.type
              }
            })
          });
          
          if (aiRes.ok) {
            const aiResult = await aiRes.json();
            
            let isNewPatient = aiResult.isNewPatient;
            let matchedBnCode = aiResult.matchedBnCode;

            // FALLBACK LOGIC: NẾU Edge Function bản cũ không trả về matchedBnCode, tự xử lý trên Frontend
            if (!matchedBnCode && aiResult.extracted_name) {
              const pName = aiResult.extracted_name.trim().replace(/\s+/g, ' ');
              const searchPattern = '%' + pName.split(' ').join('%') + '%';
              
              const { data: patients } = await supabase.from('patients')
                .select('bn_code, name')
                .ilike('name', searchPattern)
                .limit(1);

              if (patients && patients.length > 0) {
                matchedBnCode = patients[0].bn_code;
                isNewPatient = false;
              } else {
                matchedBnCode = 'BN_' + Math.floor(100000 + Math.random() * 900000).toString();
                isNewPatient = true;
                
                // Parse DOB
                let dbDob = null;
                if (aiResult.dob) {
                  const parts = aiResult.dob.split('/');
                  if (parts.length === 3) dbDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }

                await supabase.from('patients').insert({
                  bn_code: matchedBnCode,
                  name: pName,
                  dob: dbDob,
                  phone: aiResult.phone,
                  address: aiResult.address,
                  blood_type: aiResult.blood_type,
                  allergy: aiResult.allergy,
                  weight_kg: aiResult.weight_kg,
                  height_cm: aiResult.height_cm,
                  para_full: aiResult.para_full,
                  para_preterm: aiResult.para_preterm,
                  para_abortion: aiResult.para_abortion,
                  para_alive: aiResult.para_alive,
                  specialty: specialty || 'gy'
                });
              }
            }

            if (isNewPatient && matchedBnCode) {
               showToast(`✨ Đã tạo hồ sơ Bệnh nhân mới: ${aiResult.extracted_name}`, 'success');
            } else if (matchedBnCode) {
               showToast(`✅ Đã tìm thấy Bệnh nhân cũ: ${aiResult.extracted_name}`, 'success');
            } else if (aiResult.dbError) {
               showToast(`⚠️ Lỗi CSDL: ${aiResult.dbError}`, 'warning');
            } else if (aiResult.extracted_name) {
               showToast(`⚠️ Không thể lưu hồ sơ cho: ${aiResult.extracted_name}`, 'warning');
            } else {
               showToast(`📥 File tải lên thành công, nhưng AI không tìm thấy tên.`, 'info');
            }

            // [RẤT QUAN TRỌNG]: Lưu file vào bảng attachments 100% để EMR hiển thị được!
            if (matchedBnCode) {
               let finalScanType = 'Khác';
               if (aiResult.doc_type === 'xet_nghiem') finalScanType = 'Xét nghiệm';
               else if (aiResult.doc_type === 'sieu_am') finalScanType = 'Siêu âm';
               else if (aiResult.doc_type === 'don_thuoc') finalScanType = 'Đơn thuốc';

               const { error: insertErr } = await supabase.from('attachments').insert({
                 bn_code: matchedBnCode,
                 file_name: file.name,
                 storage_path: filePath,
                 file_size: file.size,
                 mime_type: file.type,
                 scan_type: finalScanType,
                 doctype: aiResult.doc_type || 'khac',
                 status: 'ai_processed',
                 is_saved_to_emr: true,
                 ai_extracted: {
                   result: aiResult.summary,
                   is_abnormal: aiResult.is_abnormal,
                   public_url: fileUrl,
                   type: aiResult.doc_type
                 }
               });
               
               if (insertErr) {
                 console.error("Attachment Insert Error:", insertErr);
                 showToast(`Lỗi đính kèm file: ${insertErr.message}`, 'error');
               } else {
                 showToast(`Đã lưu file kết quả vào hồ sơ thành công!`, 'success');
               }
            }
          } else {
            console.error("AI Scan failed", await aiRes.text());
            showToast(`Lỗi khi phân tích AI`, 'error');
          }
        } catch (aiErr) {
           console.error("Lỗi mạng khi gọi AI Scan", aiErr);
           showToast(`Lỗi mạng khi gọi AI Scan`, 'error');
        }

        successCount++;
      }
      
    } catch (error) {
      console.error(error);
      showToast(`Lỗi hệ thống: ${error.message}`, 'error');
    } finally {
      setIsUploading(false);
      setFiles([]);
    }
  };

  const content = (
    // Dùng createPortal và z-[9999] để thoát khỏi stacking context của Layout, 
    // che khuất hoàn toàn sidebar menu (z-20) và AI Chatbot (z-50) ở global App.jsx.
    <div className="fixed inset-0 z-[9999] bg-[#F5EBE3] overflow-y-auto">
      <div className="min-h-screen p-4 sm:p-6 md:p-8 font-sans flex flex-col items-center justify-center relative">
        
        {/* Nút Đăng xuất thủ công vì Header mặc định đã bị che khuất */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
           <button 
             onClick={async () => {
               await supabase.auth.signOut();
               window.location.href = '/';
             }}
             className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-danger-dark bg-white rounded-xl shadow-sm border border-[#C7A47B]/20 hover:bg-red-50 transition-colors"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
             </svg>
             Đăng xuất
           </button>
        </div>

        <div className="w-full max-w-2xl mx-auto space-y-6 md:space-y-8 mt-12 sm:mt-0">
          <div className="text-center bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-[#C7A47B]/20">
            <div className="w-16 h-16 bg-[#F5EBE3] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#C7A47B]/30 shadow-sm">
              <svg className="w-8 h-8 text-[#3E2A3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-[#3E2A3D] mb-3">Khu vực dành riêng cho Lễ Tân</h1>
            <p className="text-[#3E2A3D]/70 text-sm md:text-base px-2">
              Tải lên file PDF hoặc ảnh kết quả các xét nghiệm.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-3xl shadow-sm border border-[#C7A47B]/20">
            
            {/* Bộ chọn Phân hệ (Sản khoa / Phụ khoa) */}
            <div className="mb-6 flex bg-[#F5EBE3] p-1 rounded-2xl border border-[#C7A47B]/20 shadow-inner max-w-sm mx-auto">
              <button 
                onClick={() => setSpecialty('gy')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${specialty === 'gy' ? 'bg-white text-[#3E2A3D] shadow-sm scale-100' : 'text-[#3E2A3D]/60 hover:text-[#3E2A3D] scale-[0.98]'}`}
              >
                Hồ sơ Phụ khoa
              </button>
              <button 
                onClick={() => setSpecialty('ob')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${specialty === 'ob' ? 'bg-white text-[#3E2A3D] shadow-sm scale-100' : 'text-[#3E2A3D]/60 hover:text-[#3E2A3D] scale-[0.98]'}`}
              >
                Hồ sơ Sản khoa
              </button>
            </div>

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

  return createPortal(content, document.body);
}
