import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = ['Tâm trạng', 'Cân nặng', 'Cử động'];

const MOODS = [
  { id: 'happy', label: 'Hạnh phúc', icon: '✨', color: '#B8814A' },
  { id: 'calm', label: 'Bình yên', icon: '🕊️', color: '#8C5C2E' },
  { id: 'tired', label: 'Mệt mỏi', icon: '🥀', color: '#735F4D' },
  { id: 'anxious', label: 'Lo âu', icon: '🌧️', color: '#4A3D33' },
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
  const [note, setNote] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [weight, setWeight] = useState(60.0);
  const [kick, setKick] = useState(null);
  const [done, setDone] = useState(false);

  // Load existing check-in for today if any
  useEffect(() => {
    const saved = localStorage.getItem('medcare_ob_checkin');
    if (saved) {
      try {
        const checkins = JSON.parse(saved);
        const todayStr = new Date().toISOString().split('T')[0];
        const todayCheckin = checkins.find(c => c.date === todayStr);
        if (todayCheckin) {
          setMood(todayCheckin.mood);
          setNote(todayCheckin.note || '');
          setSymptoms(todayCheckin.symptoms || []);
          setWeight(todayCheckin.weight || 60.0);
          setKick(todayCheckin.kick);
        }
      } catch (e) {}
    }
  }, []);

  const toggleSym = (key) => {
    setSymptoms(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]);
  };

  const hasDanger = symptoms.some(s => SYMPTOMS.find(sy => sy.key === s)?.danger);

  const saveCheckin = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newEntry = { date: todayStr, mood, note, symptoms, weight, kick };
    
    let checkins = [];
    try {
      const saved = localStorage.getItem('medcare_ob_checkin');
      if (saved) checkins = JSON.parse(saved);
    } catch (e) {}
    
    const idx = checkins.findIndex(c => c.date === todayStr);
    if (idx >= 0) {
      checkins[idx] = newEntry;
    } else {
      checkins.push(newEntry);
    }
    
    localStorage.setItem('medcare_ob_checkin', JSON.stringify(checkins));
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#FEFAF5] flex flex-col items-center justify-center text-center px-8">
        <div className="w-16 h-16 rounded-full border-[0.5px] border-[#B8814A] flex items-center justify-center mb-5 bg-[#1C1510]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B8814A" strokeWidth="1.5" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <div className="font-serif text-[26px] font-light text-ink mb-2">Đã ghi nhận</div>
        <div className="font-serif italic text-[14px] text-ink-muted leading-[1.7] mb-8">
          BS. Tuấn đã nhận thông tin hôm nay.<br />Chúc mẹ ngủ ngon.
        </div>
        <button onClick={() => navigate('/sankhoa')} className="px-8 py-3 rounded-[12px] border-[0.5px] border-[#B8814A] text-[13px] text-ink-muted hover:bg-gold-lt transition-colors">
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFAF5]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+14px)] pb-3 bg-[#FEFAF5]">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/sankhoa')} className="w-9 h-9 flex items-center justify-center text-[#1C1510] hover:bg-gold-lt rounded-full transition-colors">
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
          <div key={i} className="flex-1 h-[2px] rounded-full transition-colors duration-500" style={{ background: i <= step ? '#B8814A' : '#E8D8C8' }} />
        ))}
      </div>

      <div className="px-5 pb-10">
        {/* STEP 1 — Tâm trạng */}
        {step === 0 && (
          <div className="animate-[ob-fade-up_0.5s_ease-out]">
            <div className="font-serif text-[28px] font-light text-ink leading-[1.2] mb-1.5">Hôm nay<br /><em className="text-gold-dk not-italic">mẹ cảm thấy thế nào?</em></div>
            <div className="text-[13px] text-ink-muted mb-6">Ghi lại cảm xúc giúp BS đồng hành cùng bạn tốt hơn.</div>

            {/* Emotion Diary Selector */}
            <div className="grid grid-cols-4 gap-2.5 mb-6">
              {MOODS.map((emo) => (
                <button
                  key={emo.id}
                  onClick={() => setMood(emo.id)}
                  className={`flex flex-col items-center p-[14px_8px] rounded-[14px] border transition-all duration-300 ${
                    mood === emo.id 
                      ? 'bg-[#1C1510] border-[#1C1510] shadow-[0_4px_12px_rgba(28,21,16,0.1)] scale-105' 
                      : 'bg-white border-[#E8D8C8] hover:border-[#B8814A]/40 hover:bg-[#FEFAF5]'
                  }`}
                >
                  <div className={`text-[22px] mb-2 filter ${mood === emo.id ? 'grayscale-0' : 'grayscale opacity-80'}`}>
                    {emo.icon}
                  </div>
                  <div className={`text-[10px] font-medium tracking-wide ${
                    mood === emo.id ? 'text-white' : 'text-[#735F4D]'
                  }`}>
                    {emo.label}
                  </div>
                </button>
              ))}
            </div>

            {/* Note Input */}
            <div className="mb-6">
              <div className="text-[10px] tracking-[.1em] uppercase text-[#735F4D] mb-2.5 ml-1">Ghi chú thêm (Tuỳ chọn)</div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Mẹ có muốn chia sẻ điều gì đặc biệt hôm nay không..."
                className="w-full h-24 bg-white border border-[#E8D8C8] rounded-[16px] p-4 text-[14px] text-[#1C1510] placeholder-[#A69380] focus:outline-none focus:border-[#B8814A] focus:ring-1 focus:ring-[#B8814A]/20 resize-none font-serif transition-shadow"
              />
            </div>

            <div className="text-[11px] font-bold tracking-[.08em] uppercase text-ink-muted mb-2.5 ml-1">Triệu chứng (nếu có)</div>
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
              <div className="border-l-2 border-[#C03030] pl-3 mb-6 bg-[#FFF0EE] p-3 rounded-r-[12px]">
                <div className="text-[12px] font-bold text-[#802020] mb-1">Dấu hiệu cần chú ý</div>
                <div className="text-[12px] text-ink-2 leading-[1.6]">Nếu triệu chứng nghiêm trọng, liên hệ BS ngay.</div>
                <a href="tel:0938559098" className="text-[12px] font-bold text-[#C03030] mt-1.5 inline-block">Gọi BS. Tuấn ngay →</a>
              </div>
            )}

            <button
              disabled={!mood}
              onClick={() => setStep(1)}
              className="w-full py-3.5 rounded-[12px] text-[14px] font-bold tracking-[.04em] transition-all duration-300"
              style={{ background: mood ? '#1C1510' : '#E8D8C8', color: mood ? '#fff' : '#C0A888' }}
            >
              Tiếp theo
            </button>
          </div>
        )}

        {/* STEP 2 — Cân nặng */}
        {step === 1 && (
          <div className="animate-[ob-fade-up_0.5s_ease-out]">
            <div className="font-serif text-[28px] font-light text-ink leading-[1.2] mb-1.5">Cân nặng<br /><em className="text-gold-dk not-italic">hôm nay</em></div>
            <div className="text-[13px] text-ink-muted mb-8">Cập nhật cân nặng để theo dõi sự phát triển của bé.</div>

            <div className="text-center mb-6">
              <div className="font-serif text-[80px] font-light text-ink leading-[.9] tracking-[-0.04em] transition-all">{weight.toFixed(1)}</div>
              <div className="text-[16px] text-ink-muted mt-1.5">kg</div>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={() => setWeight(w => Math.max(30, parseFloat((w - 0.1).toFixed(1))))}
                className="w-12 h-12 rounded-full border-[0.5px] border-gold-md bg-white hover:bg-[#FDF0E8] transition-colors text-[24px] flex items-center justify-center text-ink flex-shrink-0"
              >−</button>
              <input
                type="number" step="0.1" min="30" max="200"
                value={weight}
                onChange={e => setWeight(parseFloat(e.target.value) || weight)}
                className="flex-1 text-center text-[22px] font-semibold border-[0.5px] border-gold-md rounded-[12px] py-3 outline-none bg-white text-ink focus:border-[#B8814A] focus:ring-1 focus:ring-[#B8814A]/20 transition-shadow"
              />
              <button
                onClick={() => setWeight(w => parseFloat((w + 0.1).toFixed(1)))}
                className="w-12 h-12 rounded-full border-[0.5px] border-gold-md bg-white hover:bg-[#FDF0E8] transition-colors text-[24px] flex items-center justify-center text-ink flex-shrink-0"
              >+</button>
            </div>

            <button onClick={() => setStep(2)} className="w-full py-3.5 rounded-[12px] bg-ink text-white text-[14px] font-bold tracking-[.04em] shadow-md hover:bg-[#2A1F18] transition-colors">Tiếp theo</button>
            <button onClick={() => setStep(2)} className="w-full py-3.5 rounded-[12px] border-[0.5px] border-[#E8D8C8] text-[14px] text-ink-muted mt-3 hover:bg-gold-lt transition-colors">Bỏ qua</button>
          </div>
        )}

        {/* STEP 3 — Cử động bé */}
        {step === 2 && (
          <div className="animate-[ob-fade-up_0.5s_ease-out]">
            <div className="font-serif text-[28px] font-light text-ink leading-[1.2] mb-1.5">Bé cử động<br /><em className="text-gold-dk not-italic">hôm nay chưa?</em></div>
            <div className="text-[13px] text-ink-muted mb-7">Chọn mức độ cử động của bé</div>

            <div className="space-y-3 mb-8">
              {KICK_OPTS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setKick(opt.key)}
                  className="w-full text-left p-[18px_16px] rounded-[14px] transition-all border-[1.5px]"
                  style={{
                    background: kick === opt.key ? opt.bg : '#FFFFFF',
                    border: `${kick === opt.key ? '1.5px' : '0.5px'} solid ${kick === opt.key ? opt.border : '#E8D8C8'}`,
                    transform: kick === opt.key ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: kick === opt.key ? `0 4px 12px ${opt.border}20` : 'none',
                  }}
                >
                  <div className="text-[14px] font-semibold" style={{ color: kick === opt.key ? opt.color : '#1C1510' }}>{opt.label}</div>
                  <div className="text-[12px] mt-1" style={{ color: kick === opt.key ? opt.color : '#735F4D', opacity: 0.8 }}>{opt.sub}</div>
                </button>
              ))}
            </div>

            <button
              disabled={!kick}
              onClick={saveCheckin}
              className="w-full py-3.5 rounded-[12px] text-[14px] font-bold tracking-[.04em] transition-all duration-300"
              style={{ background: kick ? '#1C1510' : '#E8D8C8', color: kick ? '#fff' : '#C0A888' }}
            >
              Lưu & Hoàn thành
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
