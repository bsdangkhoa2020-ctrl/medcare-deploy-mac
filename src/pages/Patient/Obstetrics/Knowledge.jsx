import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WEEKS = Array.from({ length: 28 }, (_, i) => i + 13); // tuần 13 - 40

const CONTENT = {
  28: {
    title: 'Tuần 28 — Bé mở mắt',
    body: 'Bé có thể mở và nhắm mắt, phản ứng với ánh sáng. Bộ não tiếp tục phát triển nhanh. Phổi đang trưởng thành nhưng vẫn cần thêm thời gian.',
    tips: ['Theo dõi cử động bé thường xuyên', 'Ngủ nghiêng trái để tăng lưu thông máu', 'Uống đủ 2L nước mỗi ngày'],
  },
  29: {
    title: 'Tuần 29 — Xương cứng hơn',
    body: 'Xương bé đang tích tụ canxi. Cử động bé có thể mạnh và rõ hơn. Bé bắt đầu nhận biết giọng nói của mẹ.',
    tips: ['Bổ sung canxi đầy đủ', 'Hạn chế đứng lâu', 'Tập thở sâu mỗi ngày'],
  },
};

export default function OBKnowledge() {
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState(28);
  const content = CONTENT[selectedWeek] || CONTENT[28];

  return (
    <div className="min-h-screen bg-[#FEFAF5]">
      {/* Header */}
      <div className="bg-[#FEFAF5] px-[22px] pt-[calc(env(safe-area-inset-top)+14px)] pb-0">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate('/sankhoa')} className="w-9 h-9 flex items-center justify-center">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <div className="text-[10px] font-bold tracking-[.1em] uppercase text-ink-muted">Kiến thức thai kỳ</div>
          <div className="w-9" />
        </div>
        <div className="text-[10px] font-bold tracking-[.18em] uppercase text-ink mb-2">Kiến thức theo tuần thai</div>
        {/* Week pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
          {WEEKS.map(w => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all"
              style={{
                background: selectedWeek === w ? '#1C1510' : '#FFFFFF',
                color: selectedWeek === w ? '#B8814A' : '#907060',
                border: selectedWeek === w ? '1px solid #1C1510' : '0.5px solid #E8D8C8',
              }}
            >
              T{w}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-[22px] pb-10 space-y-4">
        {/* Title card */}
        <div className="bg-ink rounded-[20px] p-[22px_22px_18px]">
          <div className="text-[9px] font-bold tracking-[.22em] uppercase text-[#B8814A] mb-3">TUẦN {selectedWeek}</div>
          <div className="font-serif text-[22px] font-normal text-white leading-[1.25] mb-3">{content.title}</div>
          <div className="font-serif italic text-[13px] text-white/60 leading-[1.7]">{content.body}</div>
        </div>

        {/* Tips */}
        <div className="bg-gold-lt border-[0.5px] border-gold-md rounded-[14px] p-4">
          <div className="text-[10px] font-bold tracking-[.2em] uppercase text-gold-dk mb-3">Mẹ nên làm trong tuần này</div>
          <div className="space-y-2.5">
            {content.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-gold-md flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[9px] font-bold text-white">{i + 1}</span>
                </div>
                <span className="text-[13px] text-ink leading-[1.5]">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Baby size card */}
        <div className="bg-surface border-[0.5px] border-border border-t-2 border-t-[#B8814A] rounded-[14px] p-4">
          <div className="text-[10px] font-bold tracking-[.2em] uppercase text-gold-dk mb-3">Bé tuần {selectedWeek}</div>
          <div className="flex gap-4">
            {[['37 cm', 'Chiều dài'], ['1.0 kg', 'Cân nặng'], ['140 bpm', 'Nhịp tim']].map(([val, label]) => (
              <div key={label} className="text-center flex-1">
                <div className="font-serif text-[20px] font-light text-gold-dk">{val}</div>
                <div className="text-[9px] tracking-[.1em] uppercase text-ink-muted mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Articles */}
        <div>
          <div className="flex justify-between items-baseline mb-3">
            <div className="text-[10px] font-bold tracking-[.2em] uppercase text-ink">Bài viết liên quan</div>
            <div className="font-serif italic text-[13px] text-gold-dk">Xem thêm →</div>
          </div>
          {[
            { title: '7 dấu hiệu mẹ bầu không nên bỏ qua trong 3 tháng cuối', read: '3 phút' },
            { title: 'Dinh dưỡng tối ưu cho tam cá nguyệt thứ 3', read: '5 phút' },
          ].map((art, i) => (
            <div key={i} className="bg-surface border-[0.5px] border-border rounded-[14px] p-4 mb-2">
              <div className="font-serif text-[15px] text-ink leading-[1.4] mb-2">{art.title}</div>
              <div className="text-[10px] text-ink-muted">BS. Hoàng Thanh Tuấn · {art.read} đọc</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
