import React from 'react';

export default function HeroTracker({ week = 28, day = 3, firstName = 'Mẹ', onSettingsClick }) {
  const totalWeeks = 40;
  const progressPercent = ((week * 7 + day) / (totalWeeks * 7)) * 100;

  return (
    <div
      className="relative overflow-hidden rounded-[20px] shadow-sm"
      style={{
        background: '#1C1510', // Dark Ink
        color: '#FEFAF5', // Milk White
        padding: 'calc(env(safe-area-inset-top) + 24px) 28px 36px 28px',
      }}
    >
      {/* Orbs */}
      <div className="absolute -right-5 -top-5 w-[140px] h-[140px] rounded-full border-[0.5px] border-[rgba(184,129,74,.15)]" />
      <div className="absolute -left-8 -bottom-8 w-[110px] h-[110px] rounded-full border-[0.5px] border-[rgba(184,129,74,.1)]" />

      {/* Top bar */}
      <div className="flex justify-end mb-4 relative z-10">
        <button
          onClick={onSettingsClick}
          className="w-9 h-9 border-[0.5px] border-[rgba(184,129,74,.4)] rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-white/5"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(184,129,74,.9)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </div>

      {/* Greeting */}
      <div className="font-serif font-light text-[28px] leading-[1.2] tracking-[-0.02em] text-white mb-7 relative z-10 pl-1.5">
        Chào <em className="italic text-[#B8814A]">{firstName}</em>,<br />bé đang lớn từng ngày
      </div>

      {/* Big week number */}
      <div className="text-center cursor-pointer relative z-10 mb-5 group">
        <div className="inline-flex items-baseline gap-1.5 transition-transform group-hover:scale-105 duration-300">
          <span className="inline-block font-serif font-light text-[clamp(72px,18vw,96px)] leading-[.85] tracking-[-0.04em] text-white">{week}</span>
          <span className="font-serif italic text-[clamp(22px,5vw,28px)] text-[#B8814A] tracking-[-0.01em]"> tuần</span>
          <span className="font-serif font-light text-[clamp(44px,11vw,60px)] leading-[.85] tracking-[-0.04em] text-white">{day}</span>
          <span className="font-serif italic text-[clamp(18px,4vw,22px)] text-[#B8814A] tracking-[-0.01em]"> ngày</span>
        </div>
        <div className="text-[10px] tracking-[.28em] text-[rgba(245,235,227,.55)] uppercase font-semibold mt-3">Còn {totalWeeks - week} tuần đến ngày dự sinh</div>
      </div>

      {/* Trimester bar */}
      <div className="relative z-10 px-1.5">
        <div className="flex text-[8.5px] tracking-[.22em] text-[rgba(184,129,74,.7)] uppercase font-bold mb-2">
          <div className="flex-1">TCN 1</div>
          <div className="flex-1 text-center">TCN 2</div>
          <div className="flex-1 text-right">TCN 3</div>
        </div>
        <div className="relative h-[1px] bg-[rgba(199,164,123,.25)]">
          <div className="absolute left-0 top-0 h-[1px] bg-[#B8814A] transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} />
          <div className="absolute left-[33.3%] top-[-3px] w-[1px] h-[7px] bg-[rgba(184,129,74,.4)]" />
          <div className="absolute left-[66.6%] top-[-3px] w-[1px] h-[7px] bg-[rgba(184,129,74,.4)]" />
          <div 
            className="absolute top-[-4px] w-[9px] h-[9px] bg-[#B8814A] rounded-full -translate-x-1/2 shadow-[0_0_0_3px_rgba(184,129,74,.2)] transition-all duration-1000 ease-out" 
            style={{ left: `${progressPercent}%` }} 
          />
        </div>
        <div className="text-center mt-2 text-[10px] tracking-[.12em] text-[rgba(184,129,74,.8)] font-semibold">
          {week < 13 ? 'TAM CÁ NGUYỆT 1' : week < 28 ? 'TAM CÁ NGUYỆT 2' : 'TAM CÁ NGUYỆT 3'}
        </div>
      </div>
    </div>
  );
}
