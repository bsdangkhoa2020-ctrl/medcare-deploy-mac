import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = ['Tâm trạng', 'Cân nặng', 'Cử động'];

const MOODS = [
  { key: 'great', emoji: '😊', label: 'Khỏe' },
  { key: 'ok', emoji: '😐', label: 'Bình thường' },
  { key: 'tired', emoji: '😓', label: 'Mệt' },
  { key: 'worried', emoji: '😰', label: 'Lo lắng' },
];

const SYMPTOMS = [
  { key: 'bleeding', label: 'Ra máu', danger: true },
  { key: 'contraction', label: 'Cơn gò', danger: true },
  { key: 'rupture', label: 'Vỡ ối', danger: true },
  { key: 'headache', label: 'Đau đầu dữ', danger: true },
  { key: 'swelling', label: 'Phù mặt', danger: true },
  { key: 'nausea', label: 'Buồn nôn' },
  { key: 'back_pain', label: 'Đau lưng' },
  { key: 'fatigue', label: 'Mệt mỏi' },
];

const KICK_OPTS = [
  { key: 'yes', label: 'Bé máy nhiều — trên 10 lần', sub: 'Bình thường, mẹ yên tâm', color: '#2E6E50', bg: '#E8F4EC', border: '#2E6E50' },
  { key: 'few', label: 'Bé máy ít — 3 đến 9 lần', sub: 'Theo dõi thêm, ăn nhẹ rồi đếm lại', color: '#8C5C2E', bg: '#FDF0E8', border: '#B8814A' },
  { key: 'no', label: 'Chưa thấy bé cử động', sub: 'Hãy đếm cử động ngay', color: '#802020', bg: '#FFF0EE', border: '#C03030' },
];

export default function OBCheckin() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [weight, setWeight] = useState(60.0);
  const [kick, setKick] = useState(null);
  const [done, setDone] = useState(false);

  const toggleSym = (key) => {
    setSymptoms(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]);
  };

  const hasDanger = symptoms.some(s => SYMPTOMS.find(sy => sy.key === s)?.danger);

  if (done) {
    return (
      <div className="min-h-screen bg-[#FEFAF5] flex flex-col items-center justify-center text-center px-8">
        <div className="w-16 h-16 rounded-full border-[0.5px] border-[#B8814A] flex items-center justify-center mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8C5C2E" strokeWidth="1.5" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <div className="font-serif text-[26px] font-light text-ink mb-2">Đã ghi nhận</div>
        <div className="font-serif italic text-[14px] text-ink-muted leading-[1.7] mb-8">
          BS. Tuấn đã nhận thông tin hôm nay.<br />Chúc mẹ ngủ ngon.
        </div>
        <button onClick={() => navigate('/sankhoa')} className="px-8 py-3 rounded-[12px] border-[0.5px] border-border text-[13px] text-ink-muted">
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFAF5]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+14px)] pb-3 bg-[#FEFAF5]">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/sankhoa')} className="w-9 h-9 flex items-center justify-center">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div className="text-[10px] font-bold tracking-[.1em] uppercase text-ink-muted">Bước {step + 1} / {STEPS.length}</div>
        <div className="w-9" />
      </div>

      {/* Step bar */}
      <div className="flex gap-1 px-5 mb-6">
        {STEPS.map((_, i) => (
          <div key={i} className="flex-1 h-[2px] rounded-full transition-colors" style={{ background: i <= step ? '#B8814A' : '#E8D8C8' }} />
        ))}
      </div>

      <div className="px-5 pb-10">
        {/* STEP 1 — Tâm trạng */}
        {step === 0 && (
          <div>
            <div className="font-serif text-[28px] font-light text-ink leading-[1.2] mb-1.5">Hôm nay<br /><em className="text-gold-dk not-italic">mẹ thế nào?</em></div>
            <div className="text-[13px] text-ink-muted mb-6">Chọn tâm trạng và triệu chứng nếu có</div>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {MOODS.map(m => (
                <button
                  key={m.key}
                  onClick={() => setMood(m.key)}
                  className="text-center py-3.5 px-1.5 border-[0.5px] rounded-[12px] transition-all"
                  style={{
                    border: mood === m.key ? '1.5px solid #B8814A' : '0.5px solid #E8D8C8',
                    background: mood === m.key ? '#FDF0E8' : '#FFFFFF',
                  }}
                >
                  <div className="text-[24px] mb-1">{m.emoji}</div>
                  <div className="text-[10px] text-ink-muted font-semibold">{m.label}</div>
                </button>
              ))}
            </div>

            <div className="text-[11px] font-bold tracking-[.08em] uppercase text-ink-muted mb-2.5">Triệu chứng (nếu có)</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {SYMPTOMS.map(s => (
                <button
                  key={s.key}
                  onClick={() => toggleSym(s.key)}
                  className="px-3 py-1.5 rounded-full text-[12px] border-[0.5px] transition-all"
                  style={{
                    background: symptoms.includes(s.key) ? (s.danger ? '#FFF0EE' : '#FDF0E8') : '#FFFFFF',
                    border: symptoms.includes(s.key) ? (s.danger ? '1px solid #C03030' : '1px solid #B8814A') : '0.5px solid #E8D8C8',
                    color: symptoms.includes(s.key) ? (s.danger ? '#802020' : '#8C5C2E') : '#907060',
                    fontWeight: symptoms.includes(s.key) ? '600' : '400',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {hasDanger && (
              <div className="border-l-2 border-[#C03030] pl-3 mb-4">
                <div className="text-[12px] font-bold text-[#802020] mb-1">Dấu hiệu cần chú ý</div>
                <div className="text-[12px] text-ink-2 leading-[1.6]">Nếu triệu chứng nghiêm trọng, liên hệ BS ngay.</div>
                <a href="tel:0938559098" className="text-[12px] font-bold text-[#802020] mt-1.5 block">Gọi BS. Tuấn ngay →</a>
              </div>
            )}

            <button
              disabled={!mood}
              onClick={() => setStep(1)}
              className="w-full py-3.5 rounded-[12px] text-[14px] font-bold tracking-[.04em] transition-all"
              style={{ background: mood ? '#1C1510' : '#E8D8C8', color: mood ? '#fff' : '#C0A888' }}
            >
              Tiếp theo
            </button>
          </div>
        )}

        {/* STEP 2 — Cân nặng */}
        {step === 1 && (
          <div>
            <div className="font-serif text-[28px] font-light text-ink leading-[1.2] mb-1.5">Cân nặng<br /><em className="text-gold-dk not-italic">hôm nay</em></div>
            <div className="text-[13px] text-ink-muted mb-8">Cập nhật cân nặng để theo dõi</div>

            <div className="text-center mb-6">
              <div className="font-serif text-[80px] font-light text-ink leading-[.9] tracking-[-0.04em]">{weight.toFixed(1)}</div>
              <div className="text-[16px] text-ink-muted mt-1.5">kg</div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setWeight(w => Math.max(30, parseFloat((w - 0.1).toFixed(1))))}
                className="w-11 h-11 rounded-full border-[0.5px] border-border bg-surface text-[20px] flex items-center justify-center text-ink flex-shrink-0"
              >−</button>
              <input
                type="number" step="0.1" min="30" max="200"
                value={weight}
                onChange={e => setWeight(parseFloat(e.target.value) || weight)}
                className="flex-1 text-center text-[18px] font-semibold border-[0.5px] border-border rounded-[10px] py-2.5 outline-none bg-surface text-ink"
              />
              <button
                onClick={() => setWeight(w => parseFloat((w + 0.1).toFixed(1)))}
                className="w-11 h-11 rounded-full border-[0.5px] border-border bg-surface text-[20px] flex items-center justify-center text-ink flex-shrink-0"
              >+</button>
            </div>

            <button onClick={() => setStep(2)} className="w-full py-3.5 rounded-[12px] bg-ink text-white text-[14px] font-bold tracking-[.04em]">Tiếp theo</button>
            <button onClick={() => setStep(2)} className="w-full py-3.5 rounded-[12px] border-[0.5px] border-border text-[14px] text-ink-muted mt-2">Bỏ qua</button>
          </div>
        )}

        {/* STEP 3 — Cử động bé */}
        {step === 2 && (
          <div>
            <div className="font-serif text-[28px] font-light text-ink leading-[1.2] mb-1.5">Bé cử động<br /><em className="text-gold-dk not-italic">hôm nay chưa?</em></div>
            <div className="text-[13px] text-ink-muted mb-7">Chọn mức độ cử động của bé</div>

            <div className="space-y-3 mb-5">
              {KICK_OPTS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setKick(opt.key)}
                  className="w-full text-left p-[18px_16px] rounded-[14px] transition-all border-[1.5px]"
                  style={{
                    background: kick === opt.key ? opt.bg : '#FFFFFF',
                    border: `${kick === opt.key ? '1.5px' : '0.5px'} solid ${opt.border}`,
                  }}
                >
                  <div className="text-[14px] font-semibold" style={{ color: opt.color }}>{opt.label}</div>
                  <div className="text-[12px] text-ink-muted mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>

            <button
              disabled={!kick}
              onClick={() => setDone(true)}
              className="w-full py-3.5 rounded-[12px] text-[14px] font-bold tracking-[.04em] transition-all"
              style={{ background: kick ? '#1C1510' : '#E8D8C8', color: kick ? '#fff' : '#C0A888' }}
            >
              Hoàn thành
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
