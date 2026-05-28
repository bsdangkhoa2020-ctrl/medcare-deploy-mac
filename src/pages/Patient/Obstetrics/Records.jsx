import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

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
  xn: [
    { date: '10/04/2026', type: 'Xét nghiệm máu tổng quát', result: 'Bình thường', note: 'Hb: 11.5 g/dL · HCT: 35%' },
    { date: '10/04/2026', type: 'Glucose lúc đói', result: 'Bình thường', note: '4.8 mmol/L' },
  ],
  sa: [
    { date: '01/05/2026', type: 'SA hình thái tuần 20', result: 'Bình thường', note: 'Không dị tật, bánh nhau trước thấp — theo dõi.' },
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

  return (
    <div style={{ background: '#FEFAF5', minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-[22px] pt-[calc(env(safe-area-inset-top)+14px)] pb-0 bg-[#FEFAF5]">
        <button onClick={() => navigate('/sankhoa')} className="w-9 h-9 flex items-center justify-center">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div className="font-serif text-[18px] font-light">Hồ sơ <em className="text-gold-dk not-italic">thai kỳ</em></div>
        <div className="w-9" />
      </div>

      {/* Hero strip */}
      <div className="mx-[18px] mt-3 bg-gold-lt rounded-[20px] p-[14px_16px] flex items-center gap-3.5 border-[0.5px] border-gold-md">
        <div className="text-center flex-1">
          <div className="font-serif text-[38px] font-light text-[#B8814A] leading-none">28</div>
          <div className="text-[9px] text-ink-muted tracking-[.1em] uppercase mt-0.5">tuần thai</div>
        </div>
        <div className="w-[0.5px] h-11 bg-gold-md" />
        <div className="flex-[2]">
          <div className="text-[15px] font-bold text-ink">{profile?.full_name || 'Bệnh nhân'}</div>
          <div className="text-[11px] text-ink-muted mt-0.5">OB · Thai 28 tuần</div>
        </div>
        <div className="w-[0.5px] h-11 bg-gold-md" />
        <div className="flex-1 text-right">
          <div className="text-[10px] text-ink-muted">Dự sinh</div>
          <div className="text-[12px] font-bold text-gold-dk mt-0.5">25/08/2026</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-[18px] py-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-3.5 py-[6px] rounded-full text-[11px] font-semibold border transition-all ${
              activeTab === tab.id
                ? 'bg-ink text-[#B8814A] border-ink'
                : 'bg-surface text-ink-muted border-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-[18px] pb-24 space-y-3">
        {/* Thông tin BN — luôn hiển thị */}
        <div className="bg-surface border-[0.5px] border-border rounded-[20px] overflow-hidden mb-1">
          <div className="grid grid-cols-3 border-b-[0.5px] border-border">
            {[['56.0', 'Cân nặng', 'kg'], ['160', 'Chiều cao', 'cm'], ['21.9', 'BMI', 'BT']].map(([val, label, unit]) => (
              <div key={label} className="p-[10px_12px] text-center border-r-[0.5px] last:border-r-0 border-border">
                <div className="text-[9px] tracking-[.14em] uppercase text-ink-muted mb-1">{label}</div>
                <div className="font-serif text-[20px] font-light text-ink leading-none">{val}</div>
                <div className="text-[10px] text-ink-muted">{unit}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 border-b-[0.5px] border-border">
            {[['80 bpm', 'Mạch'], ['110/70', 'Huyết áp']].map(([val, label]) => (
              <div key={label} className="p-[9px_14px] border-r-[0.5px] last:border-r-0 border-border">
                <div className="text-[9px] tracking-[.14em] uppercase text-ink-muted mb-1">{label}</div>
                <div className="text-[13px] font-semibold text-ink">{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Lần khám */}
        {activeTab === 'visit' && MOCK.visit.map((v, i) => (
          <div key={i} className="bg-surface border-[0.5px] border-border rounded-[14px] p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="font-semibold text-[13px] text-ink">{v.type}</div>
              <div className="text-[11px] text-ink-muted">{v.date}</div>
            </div>
            <div className="text-[10px] text-gold-dk font-bold tracking-[.08em] uppercase mb-1">{v.trimester}</div>
            <div className="text-[11px] text-ink-muted mb-2">{v.doctor}</div>
            <div className="bg-gold-lt border-l-2 border-gold rounded-r-lg p-[8px_12px]">
              <div className="font-serif italic text-[12px] text-ink-2 leading-[1.6]">{v.note}</div>
            </div>
          </div>
        ))}

        {/* Xét nghiệm */}
        {activeTab === 'xn' && MOCK.xn.map((v, i) => (
          <div key={i} className="bg-surface border-[0.5px] border-border rounded-[14px] p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="font-semibold text-[13px] text-ink">{v.type}</div>
              <div className="text-[11px] text-ink-muted">{v.date}</div>
            </div>
            <div className="inline-block bg-[#E8F4EC] text-[#2E6E50] text-[10px] font-bold px-2 py-0.5 rounded mb-2">{v.result}</div>
            <div className="text-[12px] text-ink-muted">{v.note}</div>
          </div>
        ))}

        {/* Siêu âm */}
        {activeTab === 'sa' && MOCK.sa.map((v, i) => (
          <div key={i} className="bg-surface border-[0.5px] border-border rounded-[14px] p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="font-semibold text-[13px] text-ink">{v.type}</div>
              <div className="text-[11px] text-ink-muted">{v.date}</div>
            </div>
            <div className="inline-block bg-[#E8F4EC] text-[#2E6E50] text-[10px] font-bold px-2 py-0.5 rounded mb-2">{v.result}</div>
            <div className="text-[12px] text-ink-muted">{v.note}</div>
          </div>
        ))}

        {/* Tiêm chủng */}
        {activeTab === 'tc' && MOCK.tc.map((v, i) => (
          <div key={i} className="bg-surface border-[0.5px] border-border rounded-[14px] p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="font-semibold text-[13px] text-ink">{v.type}</div>
              <div className="text-[11px] text-ink-muted">{v.date}</div>
            </div>
            <div className="inline-block bg-gold-lt text-gold-dk text-[10px] font-bold px-2 py-0.5 rounded mb-2">{v.dose}</div>
            <div className="text-[12px] text-ink-muted">{v.note}</div>
          </div>
        ))}

        {/* Đơn thuốc */}
        {activeTab === 'rx' && MOCK.rx.map((v, i) => (
          <div key={i} className="bg-surface border-[0.5px] border-border rounded-[14px] p-4">
            <div className="text-[11px] text-ink-muted mb-3">{v.date}</div>
            <div className="space-y-2">
              {v.items.map((item, j) => (
                <div key={j} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-1.5" />
                  <span className="text-[13px] text-ink">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
