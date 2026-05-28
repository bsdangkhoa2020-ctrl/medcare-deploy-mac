import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function GYDashboard() {
  const { profile } = useAuth();

  return (
    <div className="pb-20 bg-bg">
      {/* ═══ HERO ═══ */}
      <div className="bg-white border-b-[0.5px] border-gy-md relative" style={{ padding: 'calc(env(safe-area-inset-top) + 24px) 22px 22px' }}>
        {/* Top bar: cycle month + logout */}
        <div className="flex items-center justify-between mb-3 pl-1.5">
          <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-gy-muted">Chu kỳ tháng 5</div>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.href='/')} className="w-[34px] h-[34px] border-[0.5px] border-gy-md rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 hover:bg-gy-lt transition-colors">
            <LogOut className="w-[15px] h-[15px] text-gy-muted" />
          </button>
        </div>
        
        <div className="flex items-end gap-3 mb-4 pl-1.5">
          <div>
            <div className="font-serif text-[28px] text-gy-ink font-light leading-none">
              Chào <em className="text-gy-dk not-italic">{profile?.full_name?.split(' ').pop() || 'Chị'}</em>
            </div>
            <div className="text-[14px] text-gy-muted mt-1.5">Ngày D8 · Nang noãn</div>
          </div>
          <div className="ml-auto text-right flex-shrink-0 pr-4">
            <div className="font-serif text-[52px] font-light text-gy leading-none">8</div>
            <div className="text-[10px] font-bold text-gy-dk tracking-[0.1em]">NGÀY</div>
          </div>
        </div>

        {/* 4 phase chips */}
        <div className="flex gap-1 mb-2.5 px-1.5">
          <div className="flex-[5] bg-gy-lt border-[0.5px] border-danger rounded text-center py-1 text-[9px] font-bold text-danger">Kinh</div>
          <div className="flex-[8] bg-gy-lt border-[1.5px] border-gy-dk rounded text-center py-1 text-[9px] font-bold text-gy-dk">Nang noãn ●</div>
          <div className="flex-[1] bg-gy-lt border-[0.5px] border-gy-md rounded text-center py-1 text-[9px] text-gy-muted">R.T</div>
          <div className="flex-[14] bg-gy-lt border-[0.5px] border-gy-md rounded text-center py-1 text-[9px] text-gy-muted">Hoàng thể</div>
        </div>
        <div className="text-[11px] font-bold text-gy-ink pl-1.5">Trứng rụng sau khoảng 6 ngày nữa</div>
      </div>

      {/* ═══ CHECK-IN TỐI ═══ */}
      <div className="mx-[22px] mt-[14px] bg-gy-dk rounded-[20px] p-[16px_20px] cursor-pointer tap-highlight-transparent hover:bg-gy-dk/90 transition-colors">
        <div className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/60 mb-1">Check-in buổi tối</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-serif text-[17px] text-white">Hôm nay chị thế nào?</div>
            <div className="text-[11px] text-white/50 mt-1">3 ngày liên tiếp</div>
          </div>
          <div className="text-[11px] text-white/80 font-bold">Bắt đầu →</div>
        </div>
      </div>

      {/* ═══ LỊCH HẸN + LỊCH BS ═══ */}
      <div className="grid grid-cols-[2fr_3fr] gap-2.5 mt-[14px] mx-[22px]">
        {/* Lịch hẹn */}
        <div className="bg-surface border-[0.5px] border-gy-md rounded-[14px] p-3.5 cursor-pointer">
          <div className="text-[9px] tracking-[0.2em] uppercase text-gy-muted font-semibold mb-2">Lịch hẹn</div>
          <div className="font-serif font-light text-[34px] leading-[0.9] text-gy-ink">15</div>
          <div className="font-serif italic text-[12px] text-gy-dk mt-1.5">tháng 5</div>
          <div className="text-[11px] text-gy-muted mt-1">Siêu âm nang noãn</div>
        </div>

        {/* Lịch BS — CUỘN NGANG */}
        <div className="bg-gy-lt border-[0.5px] border-gy-md rounded-[14px] p-3.5 cursor-pointer">
          <div className="flex justify-between items-center mb-2.5">
            <div className="text-[9px] tracking-[0.2em] uppercase text-gy-dk font-semibold">Lịch BS Tuấn</div>
            <div className="text-[9px] text-gy-dk font-semibold tracking-[0.06em]">Xem →</div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 mt-2 hide-scrollbar">
            {[
              { label: 'T2', dateStr: '11/5', sessions: ['17h-20h'], isToday: true },
              { label: 'T3', dateStr: '12/5', sessions: ['17h-20h'] },
              { label: 'T4', dateStr: '13/5', sessions: ['17h-20h'] },
            ].map((sch, idx) => (
              <div key={idx} className={`min-w-[54px] text-center border-[0.5px] border-gy-md rounded-lg p-[8px_4px] flex-shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${sch.isToday ? 'bg-gy-dk border-gy-dk' : 'bg-surface'}`}>
                <div className={`text-[9px] font-semibold mb-0.5 ${sch.isToday ? 'text-white' : 'text-gy-dk'}`}>{sch.label}</div>
                <div className={`text-[11px] font-bold mb-1.5 ${sch.isToday ? 'text-white' : 'text-gy-ink'}`}>{sch.dateStr}</div>
                <div className={`text-[8px] font-medium leading-[1.4] ${sch.isToday ? 'text-white/90' : 'text-gy-muted'}`}>{sch.sessions.join('<br/>')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ CHỊ NÊN BIẾT + BS KHUYÊN DÙNG ═══ */}
      <div className="mt-5 mx-[22px]">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-7 h-7 rounded-full bg-gy-lt border-[0.5px] border-gy-md flex-shrink-0 flex items-center justify-center text-[14px]">💛</div>
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-gy-ink">Chị nên biết</div>
        </div>
        <div className="bg-white p-[14px_14px_16px] rounded-[14px] border-[0.5px] border-gy-md">
           <div className="font-serif text-[15px] text-gy-ink leading-[1.6]">
            Giai đoạn nang noãn cơ thể sản sinh nhiều estrogen, chị sẽ cảm thấy tràn đầy năng lượng. Hãy duy trì chế độ dinh dưỡng tốt và giữ tinh thần thoải mái.
          </div>
        </div>
      </div>

      {/* ═══ TẠP CHÍ SỨC KHOẺ ═══ */}
      <div className="mt-6 mx-[22px]">
        <div className="flex justify-between items-baseline mb-3">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-gy-ink">Sức khoẻ phụ khoa</div>
          <div className="font-serif italic text-[13px] text-gy-dk cursor-pointer">Kiến thức →</div>
        </div>
        <div className="bg-gy-darkBg rounded-[20px] p-[24px_22px_20px] cursor-pointer tap-highlight-transparent hover:bg-gy-darkBg/90 transition-colors">
          <div className="text-[9px] font-bold tracking-[0.22em] uppercase text-gy/60 mb-3.5">TIÊU ĐIỂM · CHU KỲ</div>
          <div className="font-serif text-[24px] font-normal text-white leading-[1.25] mb-3">Chăm sóc bản thân ngày "đèn đỏ" đúng cách</div>
          <div className="font-serif italic text-[13px] text-white/50 leading-[1.65] mb-3.5">Những lầm tưởng phổ biến về dinh dưỡng và vệ sinh vùng kín.</div>
          <div className="flex items-center justify-between pt-3 border-t-[0.5px] border-gy/15">
            <div className="text-[10px] text-gy/40">BS. Hoàng Thanh Tuấn · 3 phút đọc</div>
            <div className="text-[11px] font-bold text-gy tracking-[0.06em]">Đọc tiếp →</div>
          </div>
        </div>
      </div>

    </div>
  );
}
