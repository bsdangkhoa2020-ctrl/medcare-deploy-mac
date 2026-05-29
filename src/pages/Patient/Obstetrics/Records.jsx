import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

const TABS = [
  { id: 'visit', label: 'Lần khám' },
  { id: 'xn', label: 'Xét nghiệm' },
  { id: 'sa', label: 'Siêu âm' },
  { id: 'tc', label: 'Tiêm chủng' },
  { id: 'rx', label: 'Đơn thuốc' },
];

const MOCK = {
  visit: [
    { date: '15/05/2026', type: 'Khám thai định kỳ', trimester: 'TCN 3', doctor: 'BS. Hoàng Thanh Tuấn', note: 'Thai phát triển bình thường. Tim thai 145 bpm. Bé nặng ~1kg.' },
    { date: '01/05/2026', type: 'Siêu âm hình thái', trimester: 'TCN 2', doctor: 'BS. Hoàng Thanh Tuấn', note: 'Không phát hiện bất thường hình thái.' },
  ],
  tc: [
    { date: '03/03/2026', type: 'Uốn ván', dose: 'Mũi 2/2', note: 'Hoàn thành phác đồ.' },
    { date: '05/01/2026', type: 'Cúm mùa', dose: 'Mũi 1', note: 'Phản ứng phụ nhẹ.' },
  ],
  rx: [
    { date: '15/05/2026', items: ['Canxi 600mg x 2 viên/ngày', 'Sắt 60mg x 1 viên/ngày', 'DHA 200mg x 1 viên/ngày'] },
  ],
};

export default function OBRecords() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('visit');
  
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // PDF Viewer State
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfTitle, setPdfTitle] = useState('');

  useEffect(() => {
    if (profile?.id) {
      const fetchDocs = async () => {
        setLoading(true);
        const { data } = await supabase
          .from('attachments')
          .select('*')
          .eq('patient_id', profile.id)
          .order('created_at', { ascending: false });
        
        if (data) setAttachments(data);
        setLoading(false);
      };
      fetchDocs();
    } else {
      setLoading(false);
    }
  }, [profile]);

  const xnDocs = attachments.filter(a => a.scan_type === 'Xét nghiệm' || a.scan_type === 'xet_nghiem' || a.scan_type === 'Hồ sơ giấy');
  const saDocs = attachments.filter(a => a.scan_type === 'Siêu âm' || a.scan_type === 'sieu_am');

  const handleOpenPdf = (url, title) => {
    if (!url) return;
    setPdfUrl(url);
    setPdfTitle(title || 'Kết quả xét nghiệm');
    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  const handleClosePdf = () => {
    setPdfUrl(null);
    setPdfTitle('');
    document.body.style.overflow = 'auto';
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div style={{ background: '#FEFAF5', minHeight: '100vh', position: 'relative' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-[22px] pt-[calc(env(safe-area-inset-top)+14px)] pb-0 bg-[#FEFAF5]">
        <button onClick={() => navigate('/sankhoa')} className="w-9 h-9 flex items-center justify-center">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div className="font-serif text-[18px] font-light">Hồ sơ <em className="text-[#8C5C2E] not-italic">thai kỳ</em></div>
        <div className="w-9" />
      </div>

      {/* Hero strip */}
      <div className="mx-[18px] mt-4 bg-[#FDF0E8] rounded-[20px] p-[16px_18px] flex items-center gap-3.5 border-[0.5px] border-[#B8814A]/30">
        <div className="text-center flex-1">
          <div className="font-serif text-[38px] font-light text-[#B8814A] leading-none">28</div>
          <div className="text-[9px] text-[#A69380] tracking-[.1em] uppercase mt-1">tuần thai</div>
        </div>
        <div className="w-[0.5px] h-11 bg-[#B8814A]/20" />
        <div className="flex-[2]">
          <div className="text-[16px] font-bold text-[#1C1510]">{profile?.full_name || 'Bệnh nhân'}</div>
          <div className="text-[11px] text-[#735F4D] mt-0.5">Sản khoa · Khám thai định kỳ</div>
        </div>
        <div className="w-[0.5px] h-11 bg-[#B8814A]/20" />
        <div className="flex-1 text-right">
          <div className="text-[10px] text-[#A69380]">Dự sinh</div>
          <div className="text-[12px] font-bold text-[#8C5C2E] mt-0.5">25/08/2026</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-[18px] py-4 overflow-x-auto mt-2" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-[8px] rounded-full text-[12px] font-bold tracking-wide transition-all ${
              activeTab === tab.id
                ? 'bg-[#1C1510] text-[#B8814A] shadow-md scale-[1.02]'
                : 'bg-white text-[#A69380] border-[0.5px] border-[#E8D8C8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-[18px] pb-24 space-y-4 animate-[ob-fade-up_0.3s_ease-out]">
        
        {/* Thông tin sinh hiệu — luôn hiển thị ở Tab Khám */}
        {activeTab === 'visit' && (
          <div className="bg-white border-[0.5px] border-[#E8D8C8] rounded-[20px] overflow-hidden mb-2 shadow-sm">
            <div className="grid grid-cols-3 border-b-[0.5px] border-[#E8D8C8]">
              {[['56.0', 'Cân nặng', 'kg'], ['160', 'Chiều cao', 'cm'], ['21.9', 'BMI', 'BT']].map(([val, label, unit]) => (
                <div key={label} className="p-[12px_12px] text-center border-r-[0.5px] last:border-r-0 border-[#E8D8C8]">
                  <div className="text-[9px] tracking-[.14em] uppercase text-[#A69380] mb-1.5">{label}</div>
                  <div className="font-serif text-[22px] font-light text-[#1C1510] leading-none">{val}</div>
                  <div className="text-[10px] text-[#A69380] mt-1">{unit}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2">
              {[['80 bpm', 'Mạch'], ['110/70', 'Huyết áp']].map(([val, label]) => (
                <div key={label} className="p-[12px_16px] border-r-[0.5px] last:border-r-0 border-[#E8D8C8]">
                  <div className="text-[9px] tracking-[.14em] uppercase text-[#A69380] mb-1">{label}</div>
                  <div className="text-[14px] font-bold text-[#1C1510]">{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lần khám */}
        {activeTab === 'visit' && MOCK.visit.map((v, i) => (
          <div key={i} className="bg-white border-[0.5px] border-[#E8D8C8] rounded-[16px] p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2.5">
              <div className="font-bold text-[14px] text-[#1C1510]">{v.type}</div>
              <div className="text-[11px] text-[#A69380]">{v.date}</div>
            </div>
            <div className="text-[10px] text-[#8C5C2E] font-bold tracking-[.08em] uppercase mb-1.5">{v.trimester}</div>
            <div className="text-[11px] text-[#735F4D] mb-3">{v.doctor}</div>
            <div className="bg-[#FEFAF5] border-l-[3px] border-[#B8814A] rounded-r-lg p-[10px_14px]">
              <div className="font-serif italic text-[13px] text-[#4A3D33] leading-[1.6]">{v.note}</div>
            </div>
          </div>
        ))}

        {/* Xét nghiệm (REAL DATA) */}
        {activeTab === 'xn' && (
          loading ? (
            <div className="text-center py-10 text-[12px] text-[#A69380]">Đang tải dữ liệu...</div>
          ) : xnDocs.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border-[0.5px] border-[#E8D8C8]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B8814A" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div className="text-[13px] font-serif text-[#735F4D]">Chưa có dữ liệu xét nghiệm</div>
            </div>
          ) : (
            xnDocs.map((doc, i) => {
              const ai = doc.ai_extracted || {};
              const isAbnormal = ai.is_abnormal;
              return (
                <div key={doc.id || i} className="bg-white border-[0.5px] border-[#E8D8C8] rounded-[16px] p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-bold text-[14px] text-[#1C1510] leading-[1.3] pr-2">{doc.file_name}</div>
                    <div className="text-[11px] text-[#A69380] whitespace-nowrap">{formatDate(doc.created_at)}</div>
                  </div>
                  
                  {ai.result && (
                    <div className="mb-3">
                      <div className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-md mb-2 ${isAbnormal ? 'bg-[#FFF0F0] text-[#D94545]' : 'bg-[#E8F4EC] text-[#2E6E50]'}`}>
                        {isAbnormal ? 'Cần lưu ý' : 'Bình thường'}
                      </div>
                      <div className="text-[13px] text-[#4A3D33] leading-[1.6]">{ai.result}</div>
                    </div>
                  )}

                  {ai.doctor_note && (
                    <div className="bg-[#FEFAF5] border-l-[3px] border-[#B8814A] rounded-r-lg p-[10px_14px] mb-4">
                      <div className="text-[10px] font-bold tracking-[.1em] text-[#8C5C2E] uppercase mb-1">BS Ghi chú</div>
                      <div className="font-serif italic text-[13px] text-[#4A3D33] leading-[1.6]">{ai.doctor_note}</div>
                    </div>
                  )}

                  {ai.public_url && (
                    <button 
                      onClick={() => handleOpenPdf(ai.public_url, doc.file_name)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-[12px] border-[0.5px] border-[#B8814A] text-[#B8814A] hover:bg-[#B8814A] hover:text-white transition-colors mt-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      <span className="text-[12px] font-bold uppercase tracking-wide">Xem Phiếu Kết Quả</span>
                    </button>
                  )}
                </div>
              )
            })
          )
        )}

        {/* Siêu âm (REAL DATA) */}
        {activeTab === 'sa' && (
          loading ? (
            <div className="text-center py-10 text-[12px] text-[#A69380]">Đang tải dữ liệu...</div>
          ) : saDocs.length === 0 ? (
             <div className="text-center py-10">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border-[0.5px] border-[#E8D8C8]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B8814A" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M10 4v16"></path><path d="M2 8h8"></path><path d="M2 16h8"></path><path d="M14 12h4"></path></svg>
              </div>
              <div className="text-[13px] font-serif text-[#735F4D]">Chưa có dữ liệu siêu âm</div>
            </div>
          ) : (
            saDocs.map((doc, i) => {
              const ai = doc.ai_extracted || {};
              const isAbnormal = ai.is_abnormal;
              return (
                <div key={doc.id || i} className="bg-white border-[0.5px] border-[#E8D8C8] rounded-[16px] p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-bold text-[14px] text-[#1C1510] leading-[1.3] pr-2">{doc.file_name}</div>
                    <div className="text-[11px] text-[#A69380] whitespace-nowrap">{formatDate(doc.created_at)}</div>
                  </div>
                  
                  {ai.result && (
                    <div className="mb-3">
                      <div className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-md mb-2 ${isAbnormal ? 'bg-[#FFF0F0] text-[#D94545]' : 'bg-[#E8F4EC] text-[#2E6E50]'}`}>
                        {isAbnormal ? 'Cần lưu ý' : 'Bình thường'}
                      </div>
                      <div className="text-[13px] text-[#4A3D33] leading-[1.6]">{ai.result}</div>
                    </div>
                  )}

                  {ai.doctor_note && (
                    <div className="bg-[#FEFAF5] border-l-[3px] border-[#B8814A] rounded-r-lg p-[10px_14px] mb-4">
                      <div className="text-[10px] font-bold tracking-[.1em] text-[#8C5C2E] uppercase mb-1">BS Ghi chú</div>
                      <div className="font-serif italic text-[13px] text-[#4A3D33] leading-[1.6]">{ai.doctor_note}</div>
                    </div>
                  )}

                  {ai.public_url && (
                    <button 
                      onClick={() => handleOpenPdf(ai.public_url, doc.file_name)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-[12px] border-[0.5px] border-[#B8814A] text-[#B8814A] hover:bg-[#B8814A] hover:text-white transition-colors mt-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      <span className="text-[12px] font-bold uppercase tracking-wide">Xem Phiếu Kết Quả</span>
                    </button>
                  )}
                </div>
              )
            })
          )
        )}

        {/* Tiêm chủng */}
        {activeTab === 'tc' && MOCK.tc.map((v, i) => (
          <div key={i} className="bg-white border-[0.5px] border-[#E8D8C8] rounded-[16px] p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2.5">
              <div className="font-bold text-[14px] text-[#1C1510]">{v.type}</div>
              <div className="text-[11px] text-[#A69380]">{v.date}</div>
            </div>
            <div className="inline-block bg-[#FDF0E8] text-[#8C5C2E] text-[10px] font-bold px-2.5 py-1 rounded mb-2 uppercase tracking-wide">{v.dose}</div>
            <div className="text-[13px] text-[#4A3D33]">{v.note}</div>
          </div>
        ))}

        {/* Đơn thuốc */}
        {activeTab === 'rx' && MOCK.rx.map((v, i) => (
          <div key={i} className="bg-white border-[0.5px] border-[#E8D8C8] rounded-[16px] p-4 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wide text-[#8C5C2E] mb-3">{v.date}</div>
            <div className="space-y-3">
              {v.items.map((item, j) => (
                <div key={j} className="flex items-start gap-3 border-b-[0.5px] border-[#E8D8C8] pb-2 last:border-0 last:pb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#B8814A] flex-shrink-0 mt-1.5" />
                  <span className="text-[14px] text-[#1C1510] font-medium leading-[1.4]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* PDF VIEWER MODAL */}
      {pdfUrl && (
        <div className="fixed inset-0 z-50 bg-[#1C1510]/90 backdrop-blur-sm flex flex-col animate-[ob-fade-up_0.2s_ease-out]">
          <div className="flex items-center justify-between px-4 py-4 bg-[#FEFAF5] border-b-[0.5px] border-[#E8D8C8] shadow-sm flex-shrink-0 pt-[calc(env(safe-area-inset-top)+16px)]">
            <div className="flex-1 mr-4 overflow-hidden">
              <div className="text-[10px] font-bold tracking-[.1em] uppercase text-[#8C5C2E] mb-1">Tài liệu đính kèm</div>
              <div className="font-serif text-[15px] font-bold text-[#1C1510] truncate">{pdfTitle}</div>
            </div>
            <button 
              onClick={handleClosePdf}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white border-[0.5px] border-[#E8D8C8] shadow-sm text-[#1C1510] hover:bg-gray-50 flex-shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div className="flex-1 bg-gray-100 overflow-hidden relative p-4">
            {/* Download button overlay */}
            <a 
              href={pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              download
              className="absolute bottom-8 right-6 z-10 w-14 h-14 bg-[#B8814A] rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </a>
            <iframe 
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
              className="w-full h-full rounded-xl shadow-inner border-[0.5px] border-gray-300 bg-white"
              title="PDF Viewer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
