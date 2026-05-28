import { useNavigate } from 'react-router-dom';

export default function OBAppointments() {
  const navigate = useNavigate();

  const mockSchedule = [
    { day: 'T2', date: '2/6', session: '17h–20h', active: true },
    { day: 'T3', date: '3/6', session: '17h–20h' },
    { day: 'T4', date: '4/6', session: 'Sáng+Tối' },
    { day: 'T5', date: '5/6', session: 'Nghỉ' },
    { day: 'T6', date: '6/6', session: '17h–20h' },
    { day: 'T7', date: '7/6', session: '08h–11h' },
    { day: 'CN', date: '8/6', session: 'Nghỉ' },
  ];

  const pastVisits = [
    { date: '15/05/2026', type: 'Khám thai định kỳ', trimester: 'Tam cá nguyệt 3', note: 'Thai phát triển bình thường. Bé nặng khoảng 1kg.' },
    { date: '01/05/2026', type: 'Siêu âm hình thái', trimester: 'Tam cá nguyệt 2', note: 'Không phát hiện bất thường về hình thái.' },
    { date: '10/04/2026', type: 'Khám thai định kỳ', trimester: 'Tam cá nguyệt 2', note: 'Tim thai ổn định 145 bpm.' },
  ];

  return (
    <div className="pb-6" style={{ background: '#FEFAF5', minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-[22px] pt-[calc(env(safe-area-inset-top)+14px)] pb-0 bg-[#FEFAF5]">
        <button onClick={() => navigate('/sankhoa')} className="w-9 h-9 flex items-center justify-center">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div className="text-[10px] font-bold tracking-[.1em] uppercase text-ink-muted">Lịch hẹn</div>
        <div className="w-9" />
      </div>

      <div className="px-[22px] pt-3.5 space-y-5">
        {/* 1. Hero lịch hẹn tiếp theo */}
        <div className="bg-ink rounded-[20px] p-[18px_20px]">
          <div className="text-[9px] font-bold tracking-[.2em] uppercase text-[rgba(184,129,74,.6)] mb-1.5">Lịch hẹn tiếp theo</div>
          <div className="flex items-baseline gap-2 mb-1">
            <div className="font-serif text-[28px] font-light text-white leading-none">20 tháng 6</div>
            <div className="text-[13px] text-[#B8814A] italic font-serif">09:30</div>
          </div>
          <div className="text-[12px] text-white/50 mb-2.5">BS. Hoàng Thanh Tuấn · PK Phụ Sản 315</div>
          <div className="text-[13px] font-semibold text-white">Khám thai định kỳ</div>
        </div>

        {/* 2. Lịch BS tuần này */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-full bg-gold-lt border-[0.5px] border-border flex-shrink-0 flex items-center justify-center text-[14px]">👨‍⚕️</div>
            <div className="text-[10px] font-bold tracking-[.2em] uppercase text-ink">Lịch BS Tuấn · Tuần này</div>
          </div>
          <div className="bg-surface border-[0.5px] border-border rounded-[14px] overflow-hidden">
            {mockSchedule.map((s, i) => (
              <div key={i} className={`flex justify-between items-center px-4 py-3 ${i < mockSchedule.length - 1 ? 'border-b-[0.5px] border-border' : ''} ${s.active ? 'bg-gold-lt' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold w-6 ${s.active ? 'text-gold-dk' : 'text-ink-muted'}`}>{s.day}</span>
                  <span className={`text-[12px] ${s.active ? 'text-ink font-semibold' : 'text-ink'}`}>{s.date}</span>
                </div>
                <span className={`text-[11px] ${s.session === 'Nghỉ' ? 'text-ink-muted italic' : s.active ? 'text-gold-dk font-semibold' : 'text-ink-muted'}`}>{s.session}</span>
                {s.active && (
                  <span className="text-[9px] font-bold bg-gold text-white px-2 py-0.5 rounded-full">Hôm nay</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. Nút đặt lịch */}
        <button className="w-full py-3.5 rounded-[12px] bg-ink text-white font-bold text-[14px] tracking-[.06em]">
          Đặt lịch khám mới
        </button>

        {/* 4. Lịch sử đã khám */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-full bg-gold-lt border-[0.5px] border-border flex-shrink-0 flex items-center justify-center text-[14px]">📋</div>
            <div className="text-[10px] font-bold tracking-[.2em] uppercase text-ink">Lịch sử đã khám</div>
          </div>
          <div className="space-y-2">
            {pastVisits.map((v, i) => (
              <div key={i} className="bg-surface border-[0.5px] border-border rounded-[14px] p-4">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="font-semibold text-[13px] text-ink">{v.type}</div>
                  <div className="text-[11px] text-ink-muted">{v.date}</div>
                </div>
                <div className="text-[10px] text-gold-dk font-bold tracking-[.08em] uppercase mb-1.5">{v.trimester}</div>
                <div className="font-serif italic text-[12px] text-ink-muted leading-[1.6]">{v.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
