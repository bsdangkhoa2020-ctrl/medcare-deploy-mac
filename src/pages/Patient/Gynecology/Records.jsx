import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const TABS = [
  { id: 'visit', label: 'Lần khám' },
  { id: 'xn', label: 'Xét nghiệm' },
  { id: 'sa', label: 'Siêu âm' },
  { id: 'rx', label: 'Đơn thuốc' },
  { id: 'report', label: 'Báo cáo chu kỳ' },
];

const MOCK = {
  visit: [
    { date: '10/04/2026', type: 'Siêu âm nang noãn', doctor: 'BS. Hoàng Thanh Tuấn', note: 'Nang noãn đa dạng, không polycystic. Theo dõi tiếp.' },
    { date: '10/03/2026', type: 'Khám phụ khoa tổng quát', doctor: 'BS. Hoàng Thanh Tuấn', note: 'Không phát hiện bất thường. Chu kỳ 28 ngày ổn định.' },
  ],
  xn: [
    { date: '10/04/2026', type: 'Tổng phân tích tế bào âm đạo', result: 'Bình thường', note: 'Không vi khuẩn, không nấm.' },
    { date: '10/03/2026', type: 'Hormone FSH/LH', result: 'Bình thường', note: 'FSH: 6.2 mIU/mL · LH: 5.1 mIU/mL' },
  ],
  sa: [
    { date: '10/04/2026', type: 'Siêu âm tử cung phần phụ', result: 'Bình thường', note: 'Nội mạc tử cung 7mm. Không u xơ, không nang.' },
  ],
  rx: [
    { date: '10/04/2026', items: ['Acid Folic 5mg x 1 viên/ngày', 'Vitamin D3 1000 IU x 1 viên/ngày'] },
  ],
  report: [
    { month: 'Tháng 4/2026', cycle: '28 ngày', ovulation: 'Ngày 14', notes: 'Chu kỳ đều đặn. Cảm xúc ổn định.' },
    { month: 'Tháng 3/2026', cycle: '29 ngày', ovulation: 'Ngày 15', notes: 'Đau bụng nhẹ ngày 1-2 kinh.' },
  ],
};

export default function GYRecords() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('visit');

  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.bn_code) {
      fetchAttachments();
    } else {
      setIsLoading(false);
    }
  }, [profile?.bn_code]);

  const fetchAttachments = async () => {
    try {
      // Dùng require inline thay vì top-level import nếu cần, hoặc import supabase ở top
      const { supabase } = await import('../../../lib/supabase');
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('bn_code', profile.bn_code)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setAttachments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Phân loại attachments
  const xnRecords = attachments.filter(a => a.doctype === 'xet_nghiem' || a.doctype === 'khac' || !a.doctype);
  const saRecords = attachments.filter(a => a.doctype === 'sieu_am');

  return (
    <div style={{ background: '#FDEEF0', minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-[22px] pt-[calc(env(safe-area-inset-top)+14px)] pb-0 bg-[#FDEEF0] border-b-[0.5px] border-[#E8B8C4]">
        <button onClick={() => navigate('/phukhoa')} className="w-9 h-9 flex items-center justify-center">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9A6070" strokeWidth="1.8" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div className="font-serif text-[18px] font-light text-[#2A1015]">Hồ sơ <em className="not-italic text-[#C96080]">phụ khoa</em></div>
        <div className="w-9" />
      </div>

      {/* Hero strip */}
      <div className="mx-[18px] mt-3 bg-[#FFF0F2] rounded-[20px] p-[14px_16px] flex items-center gap-3.5 border-[0.5px] border-[#E8B8C4]">
        <div className="text-center flex-1">
          <div className="font-serif text-[38px] font-light text-[#C96080] leading-none">8</div>
          <div className="text-[9px] text-[#9A6070] tracking-[.1em] uppercase mt-0.5">ngày D</div>
        </div>
        <div className="w-[0.5px] h-11 bg-[#E8B8C4]" />
        <div className="flex-[2]">
          <div className="text-[15px] font-bold text-[#2A1015]">{profile?.full_name || 'Bệnh nhân'}</div>
          <div className="text-[11px] text-[#9A6070] mt-0.5">GY · {profile?.bn_code || 'Chưa liên kết mã'}</div>
        </div>
        <div className="w-[0.5px] h-11 bg-[#E8B8C4]" />
        <div className="flex-1 text-right">
          <div className="text-[10px] text-[#9A6070]">Chu kỳ</div>
          <div className="text-[12px] font-bold text-[#C96080] mt-0.5">28 ngày</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-[18px] py-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-shrink-0 px-3.5 py-[6px] rounded-full text-[11px] font-semibold border transition-all"
            style={{
              background: activeTab === tab.id ? '#C96080' : '#FFFFFF',
              color: activeTab === tab.id ? '#FFFFFF' : '#9A6070',
              border: activeTab === tab.id ? '1px solid #C96080' : '0.5px solid #E8B8C4',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-[18px] pb-24 space-y-3">
        {/* Lần khám */}
        {activeTab === 'visit' && MOCK.visit.map((v, i) => (
          <div key={i} className="bg-white border-[0.5px] border-[#E8B8C4] rounded-[14px] p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="font-semibold text-[13px] text-[#2A1015]">{v.type}</div>
              <div className="text-[11px] text-[#9A6070]">{v.date}</div>
            </div>
            <div className="text-[11px] text-[#9A6070] mb-2">{v.doctor}</div>
            <div className="border-l-2 border-[#F0B8C0] rounded-r-lg pl-3 bg-[#FFF0F2] p-[8px_12px]">
              <div className="font-serif italic text-[12px] text-[#2A1015] leading-[1.6]">{v.note}</div>
            </div>
          </div>
        ))}

        {/* Xét nghiệm (REAL DATA) */}
        {activeTab === 'xn' && (
          isLoading ? <div className="text-center text-sm text-[#9A6070] p-4">Đang tải...</div> :
          xnRecords.length === 0 ? <div className="text-center text-sm text-[#9A6070] p-4">Chưa có kết quả xét nghiệm</div> :
          xnRecords.map((record) => (
          <div key={record.id} className="bg-white border-[0.5px] border-[#E8B8C4] rounded-[14px] p-4 overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div className="font-semibold text-[13px] text-[#2A1015]">{record.file_name}</div>
              <div className="text-[11px] text-[#9A6070]">{new Date(record.created_at).toLocaleDateString('vi-VN')}</div>
            </div>
            {record.ai_extracted?.public_url ? (
              <div className="w-full bg-[#FFF0F2] rounded-xl overflow-hidden mt-3 relative" style={{ height: '300px' }}>
                {record.mime_type?.includes('pdf') || record.file_name?.toLowerCase().endsWith('.pdf') ? (
                  <iframe src={`${record.ai_extracted.public_url}#toolbar=0`} className="w-full h-full border-0" title={record.file_name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-2">
                    <img src={record.ai_extracted.public_url} alt={record.file_name} className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[12px] text-red-500 italic mt-2">File không khả dụng</div>
            )}
          </div>
        )))}

        {/* Siêu âm (REAL DATA) */}
        {activeTab === 'sa' && (
          isLoading ? <div className="text-center text-sm text-[#9A6070] p-4">Đang tải...</div> :
          saRecords.length === 0 ? <div className="text-center text-sm text-[#9A6070] p-4">Chưa có kết quả siêu âm</div> :
          saRecords.map((record) => (
          <div key={record.id} className="bg-white border-[0.5px] border-[#E8B8C4] rounded-[14px] p-4 overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div className="font-semibold text-[13px] text-[#2A1015]">{record.file_name}</div>
              <div className="text-[11px] text-[#9A6070]">{new Date(record.created_at).toLocaleDateString('vi-VN')}</div>
            </div>
            {record.ai_extracted?.public_url && (
              <div className="w-full bg-[#FFF0F2] rounded-xl overflow-hidden mt-3 relative" style={{ height: '300px' }}>
                {record.mime_type?.includes('pdf') || record.file_name?.toLowerCase().endsWith('.pdf') ? (
                  <iframe src={`${record.ai_extracted.public_url}#toolbar=0`} className="w-full h-full border-0" title={record.file_name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-2">
                    <img src={record.ai_extracted.public_url} alt={record.file_name} className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>
            )}
          </div>
        )))}

        {/* Đơn thuốc */}
        {activeTab === 'rx' && MOCK.rx.map((v, i) => (
          <div key={i} className="bg-white border-[0.5px] border-[#E8B8C4] rounded-[14px] p-4">
            <div className="text-[11px] text-[#9A6070] mb-3">{v.date}</div>
            <div className="space-y-2">
              {v.items.map((item, j) => (
                <div key={j} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C96080] flex-shrink-0 mt-1.5" />
                  <span className="text-[13px] text-[#2A1015]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Báo cáo chu kỳ */}
        {activeTab === 'report' && MOCK.report.map((v, i) => (
          <div key={i} className="bg-white border-[0.5px] border-[#E8B8C4] rounded-[14px] p-4">
            <div className="font-semibold text-[13px] text-[#2A1015] mb-3">{v.month}</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-[9px] tracking-[.12em] uppercase text-[#9A6070] mb-0.5">Độ dài chu kỳ</div>
                <div className="font-serif text-[18px] font-light text-[#C96080]">{v.cycle}</div>
              </div>
              <div>
                <div className="text-[9px] tracking-[.12em] uppercase text-[#9A6070] mb-0.5">Ngày rụng trứng</div>
                <div className="font-serif text-[18px] font-light text-[#C96080]">{v.ovulation}</div>
              </div>
            </div>
            <div className="text-[12px] text-[#9A6070] italic">{v.notes}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
