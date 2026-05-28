import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function OBDashboard() {
  const { profile } = useAuth();
  
  const weeks = 28;
  const days = 3;

  return (
    <div className="pb-20 bg-bg">
      {/* ═══ HERO ═══ */}
      <div className="bg-ink text-bg relative overflow-hidden" style={{ padding: 'calc(env(safe-area-inset-top) + 24px) 28px 36px 28px' }}>
        {/* Orbs */}
        <div className="absolute -right-5 -top-5 w-[140px] h-[140px] rounded-full border-[0.5px] border-gold/15 animate-[ob-orb-drift_10s_ease-in-out_infinite]"></div>
        <div className="absolute -left-[30px] -bottom-[30px] w-[110px] h-[110px] rounded-full border-[0.5px] border-gold/10 animate-[ob-orb-drift_14s_ease-in-out_infinite_reverse]"></div>
        
        {/* Top bar */}
        <div className="flex justify-end items-start mb-4 relative z-10 animate-[ob-fade-up_0.45s_ease_both]">
          <div className="flex gap-2">
            <button onClick={() => supabase.auth.signOut().then(() => window.location.href='/')} className="w-9 h-9 border-[0.5px] border-gold/40 rounded-full flex items-center justify-center cursor-pointer text-gold/90 hover:bg-gold/10">
              <LogOut className="w-[15px] h-[15px]" />
            </button>
          </div>
        </div>

        {/* Greeting */}
        <div className="font-serif font-light text-[28px] leading-[1.2] tracking-[-0.02em] text-white mb-7 relative z-10 pl-1.5 animate-[ob-fade-up_0.45s_0.1s_ease_both]">
          Chào <em className="italic text-gold">{profile?.full_name?.split(' ').pop() || 'Mẹ'}</em>,<br/>bé đang lớn từng ngày
        </div>

        {/* Big week number */}
        <div className="text-center cursor-pointer relative z-10 mb-5 animate-[ob-fade-up_0.45s_0.2s_ease_both]">
          <div className="inline-flex items-baseline gap-1.5">
            <span className="inline-block font-serif font-light text-[clamp(72px,18vw,96px)] leading-[0.85] tracking-[-0.04em] text-white animate-[ob-float_5s_ease-in-out_infinite]">{weeks}</span>
            <span className="font-serif italic text-[clamp(22px,5vw,28px)] text-gold tracking-[-0.01em]"> tuần</span>
            <span className="font-serif font-light text-[clamp(44px,11vw,60px)] leading-[0.85] tracking-[-0.04em] text-white">{days}</span>
            <span className="font-serif italic text-[clamp(18px,4vw,22px)] text-gold tracking-[-0.01em]"> ngày</span>
          </div>
          <div className="text-[10px] tracking-[0.28em] text-bg/55 uppercase font-semibold mt-3">
            Còn {40 - weeks} tuần đến ngày dự sinh
          </div>
        </div>

        {/* Trimester bar */}
        <div className="relative z-10 px-1.5 animate-[ob-fade-up_0.45s_0.3s_ease_both]">
          <div className="flex text-[8.5px] tracking-[0.22em] text-gold/70 uppercase font-bold mb-2">
            <div className="flex-1">TCN 1</div>
            <div className="flex-1 text-center">TCN 2</div>
            <div className="flex-1 text-right">TCN 3</div>
          </div>
          <div className="relative h-[1px] bg-[#C7A47B]/25">
            <div className="absolute left-0 top-0 h-[1px] bg-gold transition-all duration-700" style={{ width: '80%' }}></div>
            <div className="absolute left-[33.3%] -top-[3px] w-[1px] h-[7px] bg-gold/40"></div>
            <div className="absolute left-[66.6%] -top-[3px] w-[1px] h-[7px] bg-gold/40"></div>
            <div className="absolute -top-[4px] w-[9px] h-[9px] bg-gold rounded-full -translate-x-1/2 left-[80%] shadow-[0_0_0_3px_rgba(184,129,74,0.2)] transition-all duration-700"></div>
          </div>
          <div className="text-center mt-2 text-[10px] tracking-[0.12em] text-gold/80 font-semibold">
            Tam cá nguyệt thứ 3
          </div>
        </div>
      </div>

      {/* ═══ LỊCH HẸN + LỊCH BS — 2 ô ngang ═══ */}
      <div className="grid grid-cols-[2fr_3fr] gap-2.5 mt-5 mx-[22px]">
        {/* Lịch hẹn tiếp */}
        <div className="bg-surface border-[0.5px] border-gold-md rounded-[14px] p-3.5 cursor-pointer">
          <div className="text-[9px] tracking-[0.2em] uppercase text-muted font-semibold mb-2">Lịch hẹn tiếp theo</div>
          <div className="font-serif font-light text-[38px] leading-[0.9] tracking-[-0.03em] text-ink">12</div>
          <div className="font-serif italic text-[12px] text-gold-dk mt-1.5">tháng 6</div>
          <div className="text-[11px] text-muted mt-1.5 leading-[1.4]">08:30<br/>Khám định kỳ</div>
        </div>

        {/* Lịch BS — dạng list gọn (CUỘN NGANG) */}
        <div className="bg-gold-lt border-[0.5px] border-gold-md rounded-[14px] p-3.5 cursor-pointer">
          <div className="flex justify-between items-center mb-2.5">
            <div className="text-[9px] tracking-[0.2em] uppercase text-gold-dk font-semibold">Lịch BS Tuấn</div>
            <div className="text-[9px] text-gold-dk font-semibold tracking-[0.06em]">Xem →</div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 mt-2 hide-scrollbar">
            {[
              { label: 'T2', dateStr: '1/6', sessions: ['17h-20h'], isToday: true },
              { label: 'T3', dateStr: '2/6', sessions: ['17h-20h'] },
              { label: 'T4', dateStr: '3/6', sessions: ['17h-20h'] },
              { label: 'T5', dateStr: '4/6', sessions: ['17h-20h'] },
              { label: 'T6', dateStr: '5/6', sessions: ['17h-20h'] },
            ].map((sch, idx) => (
              <div key={idx} className={`min-w-[54px] text-center border-[0.5px] border-gold-md rounded-lg p-[8px_4px] flex-shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${sch.isToday ? 'bg-gold' : 'bg-surface'}`}>
                <div className={`text-[9px] font-semibold mb-0.5 ${sch.isToday ? 'text-white' : 'text-gold-dk'}`}>{sch.label}</div>
                <div className={`text-[11px] font-bold mb-1.5 ${sch.isToday ? 'text-white' : 'text-ink'}`}>{sch.dateStr}</div>
                <div className={`text-[8px] font-medium leading-[1.4] ${sch.isToday ? 'text-white/90' : 'text-muted'}`}>{sch.sessions.join('<br/>')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ CHECK-IN BUỔI TỐI ═══ */}
      <div className="mt-4 mx-[22px] bg-gold rounded-[20px] relative overflow-hidden cursor-pointer tap-highlight-transparent">
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent"></div>
        <div className="p-[20px_22px_16px]">
          <div className="flex justify-between items-start mb-2.5">
            <div>
              <div className="text-[9px] tracking-[0.28em] text-white/70 uppercase font-semibold mb-1">Check-in buổi tối</div>
              <div className="font-serif font-normal text-[20px] text-white leading-[1.2]">Hôm nay mẹ thế nào?</div>
            </div>
            <div className="text-right flex-shrink-0 pl-3.5">
              <div className="font-serif font-light text-[30px] text-white/90 leading-none tracking-[-0.02em]">3</div>
              <div className="text-[8px] tracking-[0.2em] text-white/60 uppercase font-semibold mt-0.5">ngày liên tiếp</div>
            </div>
          </div>
          
          <div className="border-l-2 border-white/35 pl-3 py-2 mb-3.5">
            <div className="font-serif italic text-[12px] text-white/75 leading-[1.6]">"Ghi nhận mỗi tối giúp tôi theo dõi bạn tốt hơn — dù chỉ 2 phút."</div>
            <div className="text-[9px] text-white/45 mt-1 tracking-[0.06em]">— BS. Hoàng Thanh Tuấn</div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3.5 pointer-events-none">
            <div className="bg-white/5 border-[0.5px] border-gold/25 rounded-[10px] p-[9px_8px] text-center">
              <div className="text-[9px] tracking-[0.1em] text-bg/50 uppercase font-semibold mb-1">Tình trạng</div>
              <div className="font-serif text-[12px] text-bg/75">Chưa ghi</div>
            </div>
            <div className="bg-white/5 border-[0.5px] border-gold/25 rounded-[10px] p-[9px_8px] text-center pointer-events-auto cursor-pointer">
              <div className="text-[9px] tracking-[0.1em] text-bg/50 uppercase font-semibold mb-1">Cân nặng</div>
              <div className="font-serif text-[12px] text-bg/75">Chưa cân</div>
            </div>
            <div className="bg-white/5 border-[0.5px] border-gold/25 rounded-[10px] p-[9px_8px] text-center pointer-events-auto cursor-pointer">
              <div className="text-[9px] tracking-[0.1em] text-bg/50 uppercase font-semibold mb-1">Cử động bé</div>
              <div className="font-serif text-[12px] text-bg/75">Chưa đếm</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2.5 border-t-[0.5px] border-gold-dk/40">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                 <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= 3 ? 'bg-white' : 'bg-white/30'}`}></div>
              ))}
            </div>
            <div className="text-[9px] tracking-[0.2em] text-white uppercase font-semibold">Bắt đầu →</div>
          </div>
        </div>
      </div>

      {/* ═══ BÉ TUẦN NÀY (Milestone card) ═══ */}
      <div className="mt-3.5 mx-[22px] border-[0.5px] border-border rounded-[20px] overflow-hidden bg-surface border-t-2 border-t-gold">
        <div className="p-[20px_20px_16px]">
          <div className="flex justify-between items-center mb-2.5">
            <div className="text-[10px] tracking-[0.28em] uppercase text-gold-dk font-semibold">Bé tuần này</div>
            <div className="text-[10px] text-muted font-serif italic">Tuần {weeks}</div>
          </div>
          
          <div className="float-right -mt-2 mb-2 ml-4 flex-shrink-0">
            <svg width="90" height="90" viewBox="0 0 200 200" fill="none" stroke="currentColor" className="text-gold-dk opacity-50 stroke-1">
              <circle cx="100" cy="100" r="88" strokeDasharray="3 5"/>
              <ellipse cx="60" cy="64" rx="42" ry="48" strokeWidth="0.8"/>
              <circle cx="56" cy="58" r="9" strokeWidth="1.2"/>
            </svg>
          </div>
          
          <div className="font-serif font-normal text-[18px] leading-[1.3] text-ink mb-2.5">
            Bé đang lớn mỗi ngày
          </div>
          
          <div className="flex gap-4 clear-both border-t-[0.5px] border-border pt-3">
            <div className="text-center">
              <div className="font-serif text-[20px] font-light text-gold-dk">37cm</div>
              <div className="text-[9px] tracking-[0.14em] uppercase text-muted mt-0.5">chiều dài</div>
            </div>
            <div className="w-[0.5px] bg-border"></div>
            <div className="text-center">
              <div className="font-serif text-[20px] font-light text-gold-dk">1kg</div>
              <div className="text-[9px] tracking-[0.14em] uppercase text-muted mt-0.5">cân nặng</div>
            </div>
            <div className="w-[0.5px] bg-border"></div>
            <div className="text-center">
              <div className="font-serif text-[20px] font-light text-gold-dk">140</div>
              <div className="text-[9px] tracking-[0.14em] uppercase text-muted mt-0.5">nhịp tim</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MẸ NÊN BIẾT ═══ */}
      <div className="mt-3.5 mx-[22px] rounded-[20px] overflow-hidden border-[0.5px] border-border border-t-2 border-t-gold">
        <div className="bg-surface p-[18px_18px_16px]">
          <div className="text-[9px] tracking-[0.28em] uppercase text-muted font-semibold mb-2">Mẹ nên biết · Tuần này</div>
          <div className="font-serif text-[15px] text-ink leading-[1.75]">
            Em bé bắt đầu nhắm mở mắt và tập luyện các cơ quan hô hấp. Mẹ có thể cảm nhận rõ hơn những cú đạp của con.
          </div>
        </div>
      </div>

    </div>
  );
}
