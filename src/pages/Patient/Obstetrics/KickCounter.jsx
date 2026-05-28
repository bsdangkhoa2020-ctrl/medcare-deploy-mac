import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function KickCounter() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [ripples, setRipples] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const tap = (e) => {
    if (!running) setRunning(true);
    setCount(c => c + 1);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(r => [...r, { id, x, y }]);
    setTimeout(() => setRipples(r => r.filter(rip => rip.id !== id)), 600);
  };

  const reset = () => { setCount(0); setElapsed(0); setRunning(false); };

  const mockHistory = [
    { day: 'Hôm nay', count: count, elapsed: formatTime(elapsed) },
    { day: 'Hôm qua', count: 12, elapsed: '00:48' },
    { day: 'T3', count: 15, elapsed: '01:02' },
    { day: 'T2', count: 11, elapsed: '00:55' },
    { day: 'CN', count: 14, elapsed: '00:50' },
    { day: 'T7', count: 13, elapsed: '00:45' },
    { day: 'T6', count: 10, elapsed: '00:38' },
  ];
  const maxCount = Math.max(...mockHistory.map(h => h.count), 1);

  return (
    <div className="min-h-screen bg-[#FEFAF5]">
      {/* Header */}
      <div className="flex items-center justify-between px-[22px] pt-[calc(env(safe-area-inset-top)+14px)] pb-3">
        <button onClick={() => { reset(); navigate('/sankhoa'); }} className="w-9 h-9 flex items-center justify-center">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div className="text-[10px] font-bold tracking-[.1em] uppercase text-ink-muted">Đếm cử động</div>
        <button onClick={reset} className="font-serif italic text-[13px] text-gold-dk cursor-pointer">Đặt lại</button>
      </div>

      <div className="pb-10">
        {/* Counter display */}
        <div className="text-center px-[26px] pb-5">
          <div className="text-[10px] tracking-[.12em] uppercase text-ink-muted mb-1">Phiên đếm hôm nay</div>
          <div className="font-serif italic text-[13px] text-ink-hint">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        </div>

        <div className="text-center px-[26px] pb-5">
          <div className="font-serif font-light text-[clamp(100px,28vw,160px)] leading-[.85] tracking-[-0.04em] text-ink">{count}</div>
          <div className="w-10 h-[0.5px] bg-[#B8814A] mx-auto my-3.5" />
          <div className="font-serif italic text-[15px] text-ink-muted">cử động trong <span className="text-ink">{formatTime(elapsed)}</span></div>
          <div className="text-[10px] tracking-[.1em] uppercase text-ink-hint mt-1.5">Mục tiêu · 10 lần / 2 giờ</div>
        </div>

        {/* Tap zone */}
        <div
          onClick={tap}
          className="relative overflow-hidden mx-[22px] p-8 bg-ink rounded-[20px] text-center cursor-pointer select-none"
          style={{ WebkitTapHighlightColor: 'transparent', userSelect: 'none' }}
        >
          {ripples.map(r => (
            <div
              key={r.id}
              className="absolute rounded-full pointer-events-none animate-ping"
              style={{
                left: r.x - 20, top: r.y - 20,
                width: 40, height: 40,
                background: 'rgba(184,129,74,.25)',
              }}
            />
          ))}
          <div className="text-[10px] tracking-[.12em] uppercase text-[rgba(184,129,74,.8)] mb-3.5">Chạm để đếm</div>
          <div className="font-serif font-light italic text-[28px] leading-[1.35] text-white mb-4">
            Mỗi lần bé đạp,<br />hãy chạm vào đây.
          </div>
          <div className="w-11 h-11 rounded-full border-[0.5px] border-[rgba(184,129,74,.6)] flex items-center justify-center mx-auto">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(184,129,74,.9)" strokeWidth="1.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
        </div>

        {/* Tips */}
        <div className="px-[22px] mt-7">
          <div className="text-[10px] tracking-[.1em] uppercase text-ink-muted mb-3.5">Khi nào nên gọi bác sĩ</div>
          {[
            'Ít hơn 10 cử động trong 2 giờ — nghỉ ngơi rồi đếm lại; nếu vẫn ít, liên hệ BS. Tuấn ngay.',
            'Cử động đột nhiên giảm hẳn so với ngày trước — gọi BS. Tuấn.',
            'Bé yên lặng trên 12 tiếng — đến bệnh viện kiểm tra ngay.',
          ].map((tip, i) => (
            <div key={i} className="grid grid-cols-[20px_1fr] gap-3 pb-3.5 border-b-[0.5px] border-border mb-3.5 items-start last:border-0">
              <div className="font-serif italic text-[16px] text-gold-dk">{['i', 'ii', 'iii'][i]}.</div>
              <div className="text-[13px] text-ink-2 leading-[1.6]" dangerouslySetInnerHTML={{ __html: tip.replace(/(10 cử động|đột nhiên giảm hẳn|12 tiếng)/g, '<strong>$1</strong>') }} />
            </div>
          ))}
        </div>

        {/* Chart 7 ngày */}
        <div className="px-[22px] mt-7">
          <div className="text-[10px] tracking-[.1em] uppercase text-ink-muted mb-3.5">Lịch sử 7 ngày</div>
          <div className="flex justify-between items-end h-20 border-b-[0.5px] border-borderMd pb-1.5">
            {mockHistory.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className="w-4 rounded-t-sm transition-all"
                  style={{
                    height: `${Math.max(4, (h.count / maxCount) * 60)}px`,
                    background: i === 0 ? '#B8814A' : '#E8D8C8',
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {mockHistory.map((h, i) => (
              <div key={i} className="flex-1 text-center text-[9px] text-ink-muted">{h.day === 'Hôm nay' ? 'Hôm nay' : h.day}</div>
            ))}
          </div>
        </div>

        <div className="text-center font-serif italic text-[12px] text-ink-hint tracking-[.06em] py-8">— Yên lòng mẹ —</div>
      </div>
    </div>
  );
}
