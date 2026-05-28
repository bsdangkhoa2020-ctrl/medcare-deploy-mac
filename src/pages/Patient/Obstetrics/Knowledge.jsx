import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getBabyDataForWeek, BABY_WEEKS_DATA } from './KnowledgeData';

const WEEKS = Object.keys(BABY_WEEKS_DATA).map(Number).sort((a,b) => a-b);

export default function OBKnowledge() {
  const navigate = useNavigate();
  const { patientLmp } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(28);
  const [actualCurrentWeek, setActualCurrentWeek] = useState(40); // default to max
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (patientLmp) {
      const lmpDate = new Date(patientLmp);
      const today = new Date();
      const diffTime = today.getTime() - lmpDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      let currentWeek = Math.floor(diffDays / 7);
      if (currentWeek < 12) currentWeek = 12;
      if (currentWeek > 40) currentWeek = 40;
      
      // Snap to closest available week in data
      let closest = WEEKS[0];
      let minDiff = Infinity;
      for (const w of WEEKS) {
        if (Math.abs(w - currentWeek) < minDiff && w <= currentWeek) {
          minDiff = Math.abs(w - currentWeek);
          closest = w;
        }
      }
      setSelectedWeek(closest);
      setActualCurrentWeek(currentWeek);
    }
  }, [patientLmp]);

  // Auto scroll to selected week pill
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeBtn = scrollContainerRef.current.querySelector('[data-active="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedWeek]);

  const content = getBabyDataForWeek(selectedWeek);

  return (
    <div className="min-h-screen bg-[#FEFAF5]">
      {/* Header */}
      <div className="bg-[#FEFAF5] px-[22px] pt-[calc(env(safe-area-inset-top)+14px)] pb-0">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/sankhoa')} className="w-10 h-10 flex items-center justify-center text-[#1C1510] bg-white rounded-full border-[0.5px] border-[#E8D8C8] shadow-sm hover:bg-gold-lt transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <div className="text-[10px] font-bold tracking-[.1em] uppercase text-[#735F4D]">Tiến trình thai kỳ</div>
          <div className="w-10" />
        </div>
        <div className="text-[10px] font-bold tracking-[.18em] uppercase text-[#1C1510] mb-3 ml-1">Giai đoạn phát triển</div>
        
        {/* Week pills */}
        <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto pb-4 pt-1" style={{ scrollbarWidth: 'none' }}>
          {WEEKS.map(w => {
            const isFuture = w > actualCurrentWeek;
            return (
            <button
              key={w}
              data-active={selectedWeek === w}
              onClick={() => !isFuture && setSelectedWeek(w)}
              disabled={isFuture}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-[12px] font-bold tracking-wide transition-all duration-300 flex items-center gap-1.5 ${isFuture ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                background: selectedWeek === w ? '#1C1510' : (isFuture ? '#F9F6F0' : '#FFFFFF'),
                color: selectedWeek === w ? '#B8814A' : '#A69380',
                border: selectedWeek === w ? '1px solid #1C1510' : '1px solid #E8D8C8',
                boxShadow: selectedWeek === w ? '0 4px 12px rgba(28,21,16,0.15)' : 'none',
                transform: selectedWeek === w ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              Tuần {w}
              {isFuture && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              )}
            </button>
          )})}
        </div>
      </div>

      {/* Content */}
      <div className="px-[22px] pb-10 mt-2 space-y-5 animate-[ob-fade-up_0.4s_ease-out]">
        {/* Title card */}
        <div className="bg-[#1C1510] rounded-[24px] p-[26px_22px_22px] shadow-lg relative overflow-hidden">
          {/* Decorative graphic */}
          <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-[radial-gradient(circle,rgba(184,129,74,0.15)_0%,transparent_70%)] rounded-full blur-xl" />
          
          <div className="text-[10px] font-bold tracking-[.22em] uppercase text-[#B8814A] mb-3 relative z-10">THAI KỲ TUẦN {selectedWeek}</div>
          <div className="font-serif text-[24px] font-normal text-white leading-[1.3] mb-4 relative z-10 pr-4">{content.title}</div>
          <div className="font-serif italic text-[14px] text-white/70 leading-[1.7] relative z-10">{content.body}</div>
        </div>

        {/* Baby size card */}
        <div className="bg-white border-[0.5px] border-[#E8D8C8] rounded-[20px] p-5 shadow-sm">
          <div className="flex justify-between items-end mb-5">
            <div className="text-[10px] font-bold tracking-[.2em] uppercase text-[#B8814A]">Kích thước thai nhi</div>
            <div className="text-[12px] text-[#A69380] italic">~ {content.size.fruit}</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              [content.size.length, 'Chiều dài'], 
              [content.size.weight, 'Cân nặng'], 
              [content.size.heartRate, 'Nhịp tim']
            ].map(([val, label]) => (
              <div key={label} className="text-center bg-[#FEFAF5] rounded-[14px] py-3 border-[0.5px] border-[#FDF0E8]">
                <div className="font-serif text-[18px] font-light text-[#1C1510]">{val}</div>
                <div className="text-[9px] tracking-[.05em] uppercase text-[#735F4D] mt-1 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-[#FDF0E8] border-[0.5px] border-[#B8814A]/30 rounded-[20px] p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8814A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <div className="text-[10px] font-bold tracking-[.2em] uppercase text-[#8C5C2E]">Lời khuyên y khoa</div>
          </div>
          <div className="space-y-3.5">
            {content.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#B8814A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#B8814A]" />
                </div>
                <span className="text-[14px] text-[#4A3D33] leading-[1.5]">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => navigate('/sankhoa')}
          className="w-full py-4 rounded-[16px] border-[1px] border-[#1C1510] text-[#1C1510] text-[13px] font-bold tracking-[.1em] uppercase hover:bg-[#1C1510] hover:text-white transition-all duration-300 mt-2"
        >
          Trở về trang chính
        </button>
      </div>
    </div>
  );
}
