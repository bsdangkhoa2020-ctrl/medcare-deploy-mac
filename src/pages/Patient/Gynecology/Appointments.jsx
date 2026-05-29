import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useRealtimeSchedule } from '../../../hooks/useRealtimeSchedule';

export default function GYAppointments() {
  const navigate = useNavigate();
  const [dbSchedule, setDbSchedule] = useState({});

  const loadSchedule = async () => {
    const { data } = await supabase
      .from('doctor_schedule')
      .select('date, shift_name, location')
      .in('location', ['hung_vuong', 'hv']);
    if (data) {
      const map = {};
      data.forEach(d => map[d.date] = d.shift_name);
      setDbSchedule(map);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  useRealtimeSchedule(() => {
    loadSchedule();
  });

  const DOW_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const schedule = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const shift = dbSchedule[dateStr] || '—';
    
    let session = shift;
    if (shift === 'HC') session = 'Hành chính (07:15 - 16:30)';
    else if (shift === 'A') session = 'Sáng (06:00 - 14:00)';
    else if (shift === 'C') session = 'Chiều (14:00 - 22:00)';
    else if (shift === 'OFF') session = 'Nghỉ';
    else if (shift === '—') session = 'Chưa có lịch';

    return {
      day: DOW_VI[d.getDay()],
      date: `${d.getDate()}/${d.getMonth() + 1}`,
      session: session,
      isOff: shift === 'OFF' || shift === '—',
      today: i === 0
    };
  });

  const pastVisits = [
    { date: '10/04/2026', type: 'Siêu âm nang noãn', note: 'Nang noãn đa dạng, không polycystic. Theo dõi tiếp.' },
    { date: '10/03/2026', type: 'Khám phụ khoa tổng quát', note: 'Không phát hiện bất thường. Chu kỳ ổn định 28 ngày.' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#FDEEF0' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-[22px] pt-[calc(env(safe-area-inset-top)+14px)] pb-0 bg-[#FDEEF0]">
        <button onClick={() => navigate('/phukhoa')} className="w-9 h-9 flex items-center justify-center">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9A6070" strokeWidth="1.8" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div className="text-[10px] font-bold tracking-[.1em] uppercase text-[#9A6070]">Lịch hẹn</div>
        <div className="w-9" />
      </div>

      <div className="px-[22px] pt-3.5 pb-24 space-y-5">
        {/* Hero */}
        <div className="rounded-[20px] p-[18px_20px]" style={{ background: '#2A1015' }}>
          <div className="text-[9px] font-bold tracking-[.2em] uppercase text-[rgba(240,184,192,.6)] mb-1.5">Lịch hẹn tiếp theo</div>
          <div className="flex items-baseline gap-2 mb-1">
            <div className="font-serif text-[28px] font-light text-white leading-none">15 tháng 5</div>
            <div className="text-[13px] text-[#F0B8C0] italic font-serif">09:00</div>
          </div>
          <div className="text-[12px] text-white/50 mb-2.5">BS. Hoàng Thanh Tuấn · PK Phụ Sản 315</div>
          <div className="text-[13px] font-semibold text-white">Siêu âm nang noãn</div>
        </div>

        {/* Lịch BS */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-full bg-[#FFF0F2] border-[0.5px] border-[#E8B8C4] flex-shrink-0 flex items-center justify-center text-[14px]">👨‍⚕️</div>
            <div className="text-[10px] font-bold tracking-[.2em] uppercase text-[#2A1015]">Lịch BS Tuấn · Tuần này</div>
          </div>
          <div className="bg-white border-[0.5px] border-[#E8B8C4] rounded-[14px] overflow-hidden">
            {schedule.map((s, i) => (
              <div key={i} className={`flex justify-between items-center px-4 py-3 ${i < schedule.length - 1 ? 'border-b-[0.5px] border-[#E8B8C4]' : ''} ${s.today ? 'bg-[#FFF0F2]' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold w-6 ${s.today ? 'text-[#C96080]' : 'text-[#9A6070]'}`}>{s.day}</span>
                  <span className={`text-[12px] ${s.today ? 'text-[#2A1015] font-semibold' : 'text-[#2A1015]'}`}>{s.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] ${s.isOff ? 'text-[#9A6070] italic' : s.today ? 'text-[#C96080] font-semibold' : 'text-[#9A6070]'}`}>{s.session}</span>
                  {s.today && <span className="text-[9px] font-bold bg-[#C96080] text-white px-2 py-0.5 rounded-full">Hôm nay</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nút đặt lịch */}
        <button className="w-full py-3.5 rounded-[12px] text-white font-bold text-[14px] tracking-[.06em]" style={{ background: '#C96080' }}>
          Đặt lịch khám mới
        </button>

        {/* Lịch sử */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-full bg-[#FFF0F2] border-[0.5px] border-[#E8B8C4] flex-shrink-0 flex items-center justify-center text-[14px]">📋</div>
            <div className="text-[10px] font-bold tracking-[.2em] uppercase text-[#2A1015]">Lịch sử đã khám</div>
          </div>
          <div className="space-y-2">
            {pastVisits.map((v, i) => (
              <div key={i} className="bg-white border-[0.5px] border-[#E8B8C4] rounded-[14px] p-4">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="font-semibold text-[13px] text-[#2A1015]">{v.type}</div>
                  <div className="text-[11px] text-[#9A6070]">{v.date}</div>
                </div>
                <div className="font-serif italic text-[12px] text-[#9A6070] leading-[1.6] border-l-2 border-[#E8B8C4] pl-3">{v.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
