import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

export default function OBDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(' ').pop() || 'Mẹ';

  return (
    <div className="pb-20" style={{ background: 'var(--bg, #FEFAF5)' }}>

      {/* ═══ HERO ═══ */}
      <div
        className="relative overflow-hidden"
        style={{
          background: '#1C1510',
          color: '#FEFAF5',
          padding: 'calc(env(safe-area-inset-top) + 24px) 28px 36px 28px',
        }}
      >
        {/* Orbs */}
        <div className="ob-orb1 absolute -right-5 -top-5 w-[140px] h-[140px] rounded-full border-[0.5px] border-[rgba(184,129,74,.15)]" />
        <div className="ob-orb2 absolute -left-8 -bottom-8 w-[110px] h-[110px] rounded-full border-[0.5px] border-[rgba(184,129,74,.1)]" />

        {/* Top bar */}
        <div className="ob-fade1 flex justify-end mb-4 relative z-10">
          <button
            onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
            className="w-9 h-9 border-[0.5px] border-[rgba(184,129,74,.4)] rounded-full flex items-center justify-center cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(184,129,74,.9)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>

        {/* Greeting */}
        <div className="ob-fade2 font-serif font-light text-[28px] leading-[1.2] tracking-[-0.02em] text-white mb-7 relative z-10 pl-1.5">
          Chào <em className="italic text-[#B8814A]">{firstName}</em>,<br />bé đang lớn từng ngày
        </div>

        {/* Big week number */}
        <div className="ob-fade3 text-center cursor-pointer relative z-10 mb-5">
          <div className="inline-flex items-baseline gap-1.5">
            <span className="ob-float inline-block font-serif font-light text-[clamp(72px,18vw,96px)] leading-[.85] tracking-[-0.04em] text-white">28</span>
            <span className="font-serif italic text-[clamp(22px,5vw,28px)] text-[#B8814A] tracking-[-0.01em]"> tuần</span>
            <span className="font-serif font-light text-[clamp(44px,11vw,60px)] leading-[.85] tracking-[-0.04em] text-white">3</span>
            <span className="font-serif italic text-[clamp(18px,4vw,22px)] text-[#B8814A] tracking-[-0.01em]"> ngày</span>
          </div>
          <div className="text-[10px] tracking-[.28em] text-[rgba(245,235,227,.55)] uppercase font-semibold mt-3">Còn 11 tuần đến ngày dự sinh</div>
        </div>

        {/* Trimester bar */}
        <div className="relative z-10 px-1.5">
          <div className="flex text-[8.5px] tracking-[.22em] text-[rgba(184,129,74,.7)] uppercase font-bold mb-2">
            <div className="flex-1">TCN 1</div>
            <div className="flex-1 text-center">TCN 2</div>
            <div className="flex-1 text-right">TCN 3</div>
          </div>
          <div className="relative h-[1px] bg-[rgba(199,164,123,.25)]">
            <div className="absolute left-0 top-0 h-[1px] bg-[#B8814A] transition-all duration-500" style={{ width: `${(28 / 40) * 100}%` }} />
            <div className="absolute left-[33.3%] top-[-3px] w-[1px] h-[7px] bg-[rgba(184,129,74,.4)]" />
            <div className="absolute left-[66.6%] top-[-3px] w-[1px] h-[7px] bg-[rgba(184,129,74,.4)]" />
            <div className="absolute top-[-4px] w-[9px] h-[9px] bg-[#B8814A] rounded-full -translate-x-1/2 shadow-[0_0_0_3px_rgba(184,129,74,.2)] transition-all duration-500" style={{ left: `${(28 / 40) * 100}%` }} />
          </div>
          <div className="text-center mt-2 text-[10px] tracking-[.12em] text-[rgba(184,129,74,.8)] font-semibold">TAM CÁ NGUYỆT 3</div>
        </div>
      </div>

      {/* ═══ LỊCH HẸN + LỊCH BS ═══ */}
      <div className="grid grid-cols-[2fr_3fr] gap-2.5 mt-5 mx-[22px]">
        {/* Lịch hẹn tiếp */}
        <div className="bg-surface border-[0.5px] border-gold-md rounded-[14px] p-3.5 cursor-pointer" onClick={() => navigate('/sankhoa/lich-hen')}>
          <div className="text-[9px] tracking-[.2em] uppercase text-ink-muted font-semibold mb-2">Lịch hẹn tiếp theo</div>
          <div className="font-serif font-light text-[38px] leading-[.9] tracking-[-0.03em] text-ink">20</div>
          <div className="font-serif italic text-[12px] text-gold-dk mt-1.5">tháng 6</div>
          <div className="text-[11px] text-ink-muted mt-1.5 leading-[1.4]">Khám thai định kỳ</div>
        </div>

        {/* Lịch BS — cuộn ngang */}
        <div className="bg-gold-lt border-[0.5px] border-gold-md rounded-[14px] p-3.5 cursor-pointer" onClick={() => navigate('/sankhoa/lich-hen')}>
          <div className="flex justify-between items-center mb-2.5">
            <div className="text-[9px] tracking-[.2em] uppercase text-gold-dk font-semibold">Lịch BS Tuấn</div>
            <div className="text-[9px] text-gold-dk font-semibold tracking-[.06em]">Xem →</div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            {[
              { label: 'T2', date: '2/6', sessions: ['17h-20h'], today: true },
              { label: 'T3', date: '3/6', sessions: ['17h-20h'] },
              { label: 'T4', date: '4/6', sessions: ['S+T'] },
              { label: 'T5', date: '5/6', sessions: ['Nghỉ'] },
            ].map((s, i) => (
              <div key={i} className={`min-w-[52px] text-center border-[0.5px] rounded-lg p-[7px_4px] flex-shrink-0 ${s.today ? 'bg-ink border-ink' : 'bg-surface border-border'}`}>
                <div className={`text-[9px] font-semibold mb-0.5 ${s.today ? 'text-[rgba(184,129,74,.7)]' : 'text-gold-dk'}`}>{s.label}</div>
                <div className={`text-[11px] font-bold mb-1.5 ${s.today ? 'text-white' : 'text-ink'}`}>{s.date}</div>
                <div className={`text-[8px] font-medium leading-[1.4] ${s.today ? 'text-[rgba(255,255,255,.7)]' : 'text-ink-muted'}`}>{s.sessions[0]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ CHECK-IN BUỔI TỐI ═══ */}
      <div
        onClick={() => navigate('/sankhoa/check-in')}
        className="mx-[22px] mt-4 rounded-[20px] relative overflow-hidden cursor-pointer"
        style={{ background: '#B8814A' }}
      >
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
        <div className="p-[20px_22px_16px]">
          <div className="flex justify-between items-start mb-2.5">
            <div>
              <div className="text-[9px] tracking-[.28em] text-white/70 uppercase font-semibold mb-1">Check-in buổi tối</div>
              <div className="font-serif font-normal text-[20px] text-white leading-[1.2]">Hôm nay mẹ thế nào?</div>
            </div>
            <div className="text-right flex-shrink-0 pl-3.5">
              <div className="font-serif font-light text-[30px] text-white/90 leading-none tracking-[-0.02em]">0</div>
              <div className="text-[8px] tracking-[.2em] text-white/60 uppercase font-semibold mt-0.5">ngày liên tiếp</div>
            </div>
          </div>
          <div className="border-l-2 border-white/35 pl-3 mb-3.5">
            <div className="font-serif italic text-[12px] text-white/75 leading-[1.6]">"Ghi nhận mỗi tối giúp tôi theo dõi bạn tốt hơn — dù chỉ 2 phút."</div>
            <div className="text-[9px] text-white/45 mt-1 tracking-[.06em]">— BS. Hoàng Thanh Tuấn</div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3.5 pointer-events-none">
            {['Tình trạng', 'Cân nặng', 'Cử động bé'].map((label) => (
              <div key={label} className="bg-white/7 border-[0.5px] border-[rgba(184,129,74,.25)] rounded-[10px] p-[9px_8px] text-center">
                <div className="text-[9px] tracking-[.1em] text-white/50 uppercase font-semibold mb-1">{label}</div>
                <div className="font-serif text-[12px] text-white/75">Chưa ghi</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2.5 border-t-[0.5px] border-[rgba(184,129,74,.2)]">
            <div className="flex gap-1.5" />
            <div className="text-[9px] tracking-[.2em] text-[#B8814A] uppercase font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>Bắt đầu →</div>
          </div>
        </div>
      </div>

      {/* ═══ BÉ TUẦN NÀY ═══ */}
      <div className="mx-[22px] mt-3.5 border-[0.5px] border-border rounded-[20px] overflow-hidden bg-surface border-t-2 border-t-[#B8814A] cursor-pointer" onClick={() => navigate('/sankhoa/kien-thuc')}>
        <div className="p-[20px_20px_16px]">
          <div className="flex justify-between items-center mb-2.5">
            <div className="text-[10px] tracking-[.28em] uppercase text-gold-dk font-semibold">Bé tuần này</div>
            <div className="text-[10px] text-ink-muted font-serif italic">Tuần 28</div>
          </div>
          <div className="float-right -mt-2 mb-2 ml-4 flex-shrink-0">
            <svg width="90" height="90" viewBox="0 0 200 200" fill="none" stroke="#8C5C2E" strokeWidth="1" strokeLinecap="round" opacity=".5">
              <circle cx="100" cy="100" r="88" strokeDasharray="3 5"/>
              <ellipse cx="60" cy="64" rx="42" ry="48" strokeWidth=".8"/>
              <circle cx="56" cy="58" r="9" strokeWidth="1.2"/>
            </svg>
          </div>
          <div className="font-serif font-normal text-[18px] leading-[1.3] text-ink mb-2.5">Bé nặng khoảng 1kg, mắt đã mở được</div>
          <div className="flex gap-4 border-t-[0.5px] border-border pt-3 clear-both">
            {[['37 cm', 'chiều dài'], ['1.0 kg', 'cân nặng'], ['140 bpm', 'nhịp tim']].map(([val, unit]) => (
              <div key={unit} className="text-center">
                <div className="font-serif text-[20px] font-light text-gold-dk">{val}</div>
                <div className="text-[9px] tracking-[.14em] uppercase text-ink-muted mt-0.5">{unit}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ MẸ NÊN BIẾT ═══ */}
      <div className="mx-[22px] mt-3.5 rounded-[20px] overflow-hidden border-[0.5px] border-border border-t-2 border-t-[#B8814A]">
        <div className="bg-surface p-[18px_18px_16px]">
          <div className="text-[9px] tracking-[.28em] uppercase text-ink-muted font-semibold mb-2">Mẹ nên biết · Tuần này</div>
          <div className="font-serif text-[15px] text-ink leading-[1.75]">
            Ở tuần 28, bé bắt đầu chuẩn bị cho tư thế chào đời. Mẹ có thể cảm nhận nhiều cử động hơn, đặc biệt vào buổi tối.
          </div>
        </div>
        <div className="bg-gold-lt p-[12px_14px_14px]">
          <div className="text-[9px] tracking-[.14em] uppercase text-gold-dk font-semibold mb-2">BS khuyên dùng</div>
          {['Canxi 600mg · sau bữa ăn', 'Sắt 60mg · trước khi ngủ', 'DHA 200mg · sau ăn sáng'].map((item) => (
            <div key={item} className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
              <span className="text-[12px] text-ink-muted">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ WORKSHOP ═══ */}
      <div className="mx-[22px] mt-6">
        <div className="flex justify-between items-baseline mb-3">
          <div className="text-[10px] font-bold tracking-[.2em] uppercase text-ink">Workshop tuần này</div>
          <div className="font-serif italic text-[13px] text-gold-dk cursor-pointer">Xem tất cả →</div>
        </div>
        <a
          href="https://tnehhratorbrxjwzqnds.supabase.co/storage/v1/object/public/public-assets/ManHinhCho_WS_NextG_Cal_Final.PNG"
          target="_blank" rel="noopener noreferrer"
          className="block border-[0.5px] border-border rounded-[20px] overflow-hidden no-underline cursor-pointer"
        >
          <div className="relative">
            <img
              src="https://tnehhratorbrxjwzqnds.supabase.co/storage/v1/object/public/public-assets/ManHinhCho_WS_NextG_Cal_Final.PNG"
              alt="Workshop"
              className="w-full block aspect-[2/1] object-cover"
            />
            <div className="absolute inset-0 bg-[rgba(28,21,16,.18)] flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/92 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1C1510"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            </div>
          </div>
          <div className="p-[10px_14px_12px] flex items-center justify-between">
            <div>
              <div className="text-[9px] text-gold-dk font-bold tracking-[.1em] uppercase mb-1">10.05.2026 · 10h00–11h00</div>
              <div className="font-serif text-[15px] text-ink leading-[1.3]">Hậu sản không <em className="text-gold-dk">"rệu rã"</em></div>
            </div>
            <div className="text-[11px] text-gold-dk font-bold flex items-center gap-1 flex-shrink-0 ml-3">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#8C5C2E"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Xem video
            </div>
          </div>
        </a>
      </div>

      {/* ═══ TẠP CHÍ SỨC KHỎE ═══ */}
      <div className="mx-[22px] mt-6">
        <div className="flex justify-between items-baseline mb-3">
          <div className="text-[10px] font-bold tracking-[.2em] uppercase text-ink">Tạp chí sức khỏe</div>
          <div className="font-serif italic text-[13px] text-gold-dk cursor-pointer" onClick={() => navigate('/sankhoa/kien-thuc')}>Kiến thức thai kỳ →</div>
        </div>
        <div className="bg-ink rounded-[20px] p-[24px_22px_20px] cursor-pointer" onClick={() => navigate('/sankhoa/kien-thuc')}>
          <div className="text-[9px] font-bold tracking-[.22em] uppercase text-[#B8814A] mb-3.5">TIÊU ĐIỂM · TAM CÁ NGUYỆT 3</div>
          <div className="font-serif text-[26px] font-normal text-white leading-[1.2] mb-3">
            7 dấu hiệu mẹ bầu <em className="italic text-[#B8814A]">không nên bỏ qua</em> trong 3 tháng cuối
          </div>
          <div className="font-serif italic text-[13px] text-white/50 leading-[1.65] mb-3.5">
            Ra dịch hồng bất thường, đau bụng dữ dội, cử động thai giảm rõ — những chia sẻ y khoa cần biết.
          </div>
          <div className="flex items-center justify-between pt-3 border-t-[0.5px] border-[rgba(184,129,74,.2)]">
            <div className="text-[10px] text-[rgba(184,129,74,.5)]">BS. Hoàng Thanh Tuấn · 3 phút đọc</div>
            <div className="text-[11px] font-bold text-[#B8814A] tracking-[.06em]">Đọc tiếp →</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mx-[22px] mt-7 mb-2 text-center">
        <div className="w-8 h-[0.5px] bg-gold-md mx-auto mb-4" />
        <div className="font-serif italic text-[13px] text-ink-muted leading-[1.8]">
          App này là một phần trong đề tài nghiên cứu<br />của BS. CK1 Hoàng Thanh Tuấn
        </div>
        <div className="text-[10px] tracking-[.14em] uppercase text-gold-dk font-semibold mt-3">bstuan247.com</div>
      </div>

    </div>
  );
}
