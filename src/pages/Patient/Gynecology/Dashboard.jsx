import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

export default function GYDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const firstName = profile?.full_name?.split(' ').pop() || 'Chị';

  return (
    <div className="pb-20" style={{ background: '#FFFFFF' }}>

      {/* ═══ HERO ═══ */}
      <div
        className="bg-white border-b-[0.5px] border-[#E8B8C4] relative"
        style={{ padding: 'calc(env(safe-area-inset-top) + 24px) 22px 22px' }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3 pl-1.5">
          <div className="text-[11px] font-bold tracking-[.16em] uppercase text-[#9A6070]">Chu kỳ tháng 5</div>
          <button
            onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
            className="w-[34px] h-[34px] border-[0.5px] border-[#E8B8C4] rounded-full flex items-center justify-center"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A6070" strokeWidth="1.5" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>

        {/* Name + Day */}
        <div className="flex items-end gap-3 mb-4 pl-1.5">
          <div>
            <div className="font-serif text-[28px] text-[#2A1015] font-light leading-none">
              Chào <em className="not-italic text-[#C96080]">{firstName}</em>
            </div>
            <div className="text-[14px] text-[#9A6070] mt-1.5">Ngày D8 · Nang noãn</div>
          </div>
          <div className="ml-auto text-right flex-shrink-0 pr-4">
            <div className="font-serif text-[52px] font-light text-[#F0B8C0] leading-none">8</div>
            <div className="text-[10px] font-bold text-[#C96080] tracking-[.1em]">NGÀY</div>
          </div>
        </div>

        {/* 4 phase chips */}
        <div className="flex gap-1 mb-2.5 px-1.5">
          <div className="flex-[5] bg-[#FFF0F2] border-[0.5px] border-[#C03030] rounded text-center py-1 text-[9px] font-bold text-[#C03030]">Kinh</div>
          <div className="flex-[8] bg-[#FFF0F2] border-[1.5px] border-[#C96080] rounded text-center py-1 text-[9px] font-bold text-[#C96080]">Nang noãn ●</div>
          <div className="flex-[1] bg-[#FFF0F2] border-[0.5px] border-[#E8B8C4] rounded text-center py-1 text-[9px] text-[#9A6070]">R.T</div>
          <div className="flex-[14] bg-[#FFF0F2] border-[0.5px] border-[#E8B8C4] rounded text-center py-1 text-[9px] text-[#9A6070]">Hoàng thể</div>
        </div>
        <div className="text-[11px] font-bold text-[#2A1015] pl-1.5">Trứng rụng sau khoảng 6 ngày nữa</div>
      </div>

      {/* ═══ CHECK-IN TỐI ═══ */}
      <div
        className="mx-[22px] mt-[14px] rounded-[20px] p-[16px_20px] cursor-pointer"
        style={{ background: '#C96080' }}
      >
        <div className="text-[9px] font-bold tracking-[.2em] uppercase text-white/60 mb-1">Check-in buổi tối</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-serif text-[17px] text-white">Hôm nay chị thế nào?</div>
            <div className="text-[11px] text-white/50 mt-1">3 ngày liên tiếp 🔥</div>
          </div>
          <div className="text-[11px] text-white/80 font-bold">Bắt đầu →</div>
        </div>
      </div>

      {/* ═══ LỊCH HẸN + LỊCH BS ═══ */}
      <div className="grid grid-cols-[2fr_3fr] gap-2.5 mt-[14px] mx-[22px]">
        {/* Lịch hẹn */}
        <div
          className="bg-white border-[0.5px] border-[#E8B8C4] rounded-[14px] p-3.5 cursor-pointer"
          onClick={() => navigate('/phukhoa/lich-hen')}
        >
          <div className="text-[9px] tracking-[.2em] uppercase text-[#9A6070] font-semibold mb-2">Lịch hẹn</div>
          <div className="font-serif font-light text-[34px] leading-[.9] text-[#2A1015]">15</div>
          <div className="font-serif italic text-[12px] text-[#C96080] mt-1.5">tháng 5</div>
          <div className="text-[11px] text-[#9A6070] mt-1">Siêu âm nang noãn</div>
        </div>

        {/* Lịch BS — cuộn ngang */}
        <div
          className="bg-[#FFF0F2] border-[0.5px] border-[#E8B8C4] rounded-[14px] p-3.5 cursor-pointer"
          onClick={() => navigate('/phukhoa/lich-hen')}
        >
          <div className="flex justify-between items-center mb-2.5">
            <div className="text-[9px] tracking-[.2em] uppercase text-[#C96080] font-semibold">Lịch BS Tuấn</div>
            <div className="text-[9px] text-[#C96080] font-semibold tracking-[.06em]">Xem →</div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {[
              { label: 'T2', date: '11/5', session: '17h-20h', today: true },
              { label: 'T3', date: '12/5', session: '17h-20h' },
              { label: 'T4', date: '13/5', session: '17h-20h' },
              { label: 'T7', date: '16/5', session: 'SA' },
            ].map((s, i) => (
              <div key={i} className={`min-w-[52px] text-center border-[0.5px] rounded-lg p-[7px_4px] flex-shrink-0 ${s.today ? 'border-[#C96080]' : 'border-[#E8B8C4] bg-white'}`}
                style={{ background: s.today ? '#C96080' : '#FFFFFF' }}>
                <div className={`text-[9px] font-semibold mb-0.5 ${s.today ? 'text-white/70' : 'text-[#C96080]'}`}>{s.label}</div>
                <div className={`text-[11px] font-bold mb-1.5 ${s.today ? 'text-white' : 'text-[#2A1015]'}`}>{s.date}</div>
                <div className={`text-[8px] font-medium ${s.today ? 'text-white/80' : 'text-[#9A6070]'}`}>{s.session}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ CHỊ NÊN BIẾT ═══ */}
      <div className="mt-5 mx-[22px]">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-7 h-7 rounded-full bg-[#FFF0F2] border-[0.5px] border-[#E8B8C4] flex-shrink-0 flex items-center justify-center text-[14px]">💛</div>
          <div className="text-[10px] font-bold tracking-[.2em] uppercase text-[#2A1015]">Chị nên biết</div>
        </div>
        <div className="bg-white p-[14px_14px_16px] rounded-[14px] border-[0.5px] border-[#E8B8C4]">
          <div className="font-serif text-[15px] text-[#2A1015] leading-[1.6]">
            Giai đoạn nang noãn cơ thể sản sinh nhiều estrogen, chị sẽ cảm thấy tràn đầy năng lượng. Hãy duy trì chế độ dinh dưỡng tốt và giữ tinh thần thoải mái.
          </div>
        </div>
      </div>

      {/* ═══ TẠP CHÍ SỨC KHOẺ ═══ */}
      <div className="mt-6 mx-[22px]">
        <div className="flex justify-between items-baseline mb-3">
          <div className="text-[10px] font-bold tracking-[.2em] uppercase text-[#2A1015]">Sức khoẻ phụ khoa</div>
          <div className="font-serif italic text-[13px] text-[#C96080] cursor-pointer" onClick={() => navigate('/phukhoa/kien-thuc')}>Kiến thức →</div>
        </div>
        <div
          className="rounded-[20px] p-[24px_22px_20px] cursor-pointer"
          style={{ background: '#2A1015' }}
          onClick={() => navigate('/phukhoa/kien-thuc')}
        >
          <div className="text-[9px] font-bold tracking-[.22em] uppercase text-[rgba(240,184,192,.6)] mb-3.5">TIÊU ĐIỂM · CHU KỲ</div>
          <div className="font-serif text-[24px] font-normal text-white leading-[1.25] mb-3">Chăm sóc bản thân ngày "đèn đỏ" đúng cách</div>
          <div className="font-serif italic text-[13px] text-white/50 leading-[1.65] mb-3.5">Những lầm tưởng phổ biến về dinh dưỡng và vệ sinh vùng kín.</div>
          <div className="flex items-center justify-between pt-3 border-t-[0.5px] border-[rgba(240,184,192,.15)]">
            <div className="text-[10px] text-[rgba(240,184,192,.4)]">BS. Hoàng Thanh Tuấn · 3 phút đọc</div>
            <div className="text-[11px] font-bold text-[#F0B8C0] tracking-[.06em]">Đọc tiếp →</div>
          </div>
        </div>
      </div>

    </div>
  );
}
