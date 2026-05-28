import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import HeroTracker from '../OB/HeroTracker';

export default function OBDashboard() {
  const navigate = useNavigate();
  const { profile, patientLmp } = useAuth();
  const firstName = profile?.full_name?.split(' ').pop() || 'Mẹ';

  const [todayCheckin, setTodayCheckin] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('medcare_ob_checkin');
    if (saved) {
      try {
        const checkins = JSON.parse(saved);
        const todayStr = new Date().toISOString().split('T')[0];
        const found = checkins.find(c => c.date === todayStr);
        if (found) setTodayCheckin(found);
      } catch(e){}
    }
  }, []);

  // Calculate Gestational Age
  let week = 28, day = 3;
  if (patientLmp) {
    const lmpDate = new Date(patientLmp);
    const today = new Date();
    const diffTime = today.getTime() - lmpDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    week = Math.floor(diffDays / 7);
    day = diffDays % 7;
    // Fallback if lmp is in the future or corrupted
    if (week < 0 || week > 42) { week = 28; day = 3; }
  }

  const handleSettingsClick = () => {
    supabase.auth.signOut().then(() => window.location.href = '/');
  };

  return (
    <div className="pb-20" style={{ background: 'var(--bg, #FEFAF5)' }}>

      {/* ═══ HERO ═══ */}
      <div className="mx-[22px] mt-[calc(env(safe-area-inset-top)+14px)] mb-5">
        <HeroTracker week={week} day={day} firstName={firstName} onSettingsClick={handleSettingsClick} />
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
            {[
              { label: 'Tình trạng', val: todayCheckin?.mood ? 'Đã ghi' : 'Chưa ghi' },
              { label: 'Cân nặng', val: todayCheckin?.weight ? `${todayCheckin.weight} kg` : 'Chưa ghi' },
              { label: 'Cử động bé', val: todayCheckin?.kick ? 'Đã đếm' : 'Chưa đếm' }
            ].map((item) => (
              <div key={item.label} className="bg-white/7 border-[0.5px] border-[rgba(184,129,74,.25)] rounded-[10px] p-[9px_8px] text-center">
                <div className="text-[9px] tracking-[.1em] text-white/50 uppercase font-semibold mb-1">{item.label}</div>
                <div className="font-serif text-[12px] text-white/75">{item.val}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2.5 border-t-[0.5px] border-[rgba(184,129,74,.2)]">
            <div className="flex gap-1.5" />
            <div className="text-[9px] tracking-[.2em] text-[#B8814A] uppercase font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {todayCheckin ? 'Cập nhật →' : 'Bắt đầu →'}
            </div>
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
        <div className="bg-gold-lt p-[16px_16px_18px]">
          <div className="flex justify-between items-center mb-3.5">
            <div className="text-[9px] tracking-[.14em] uppercase text-gold-dk font-semibold flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              BS khuyên dùng
            </div>
            <div className="text-[9px] font-bold text-[#B8814A] tracking-[.06em] cursor-pointer hover:underline">Mua chính hãng →</div>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {/* Sản phẩm 1 */}
            <div className="bg-white rounded-[12px] border-[0.5px] border-border p-3 w-[140px] flex-shrink-0 flex flex-col shadow-sm cursor-pointer hover:border-[#B8814A]/40 transition-colors">
              <div className="w-full aspect-square bg-[#FEFAF5] rounded-lg mb-2 flex items-center justify-center p-2">
                <img src="https://data-service.pharmacity.io/pmc-upload-media/production/pmc-ecm-asm/products/P01170_1.jpg" alt="Canxi" className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div className="text-[11px] font-bold text-ink leading-[1.3] mb-1">NextG Cal</div>
              <div className="text-[9px] text-ink-muted mb-2 line-clamp-2">Canxi hữu cơ dễ hấp thu, không gây táo bón.</div>
              <div className="mt-auto">
                <button className="w-full py-1.5 rounded-full border border-[#B8814A] text-[#B8814A] text-[9px] font-bold uppercase tracking-wide hover:bg-[#B8814A] hover:text-white transition-colors">Tìm hiểu ngay</button>
              </div>
            </div>
            
            {/* Sản phẩm 2 */}
            <div className="bg-white rounded-[12px] border-[0.5px] border-border p-3 w-[140px] flex-shrink-0 flex flex-col shadow-sm cursor-pointer hover:border-[#B8814A]/40 transition-colors">
              <div className="w-full aspect-square bg-[#FEFAF5] rounded-lg mb-2 flex items-center justify-center p-2">
                <img src="https://data-service.pharmacity.io/pmc-upload-media/production/pmc-ecm-core/products/P18073_1.jpg" alt="Elevit" className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div className="text-[11px] font-bold text-ink leading-[1.3] mb-1">Vitamin Elevit</div>
              <div className="text-[9px] text-ink-muted mb-2 line-clamp-2">Vitamin tổng hợp số 1 cho mẹ bầu.</div>
              <div className="mt-auto">
                <button className="w-full py-1.5 rounded-full border border-[#B8814A] text-[#B8814A] text-[9px] font-bold uppercase tracking-wide hover:bg-[#B8814A] hover:text-white transition-colors">Tìm hiểu ngay</button>
              </div>
            </div>
          </div>
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
