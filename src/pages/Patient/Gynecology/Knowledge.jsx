import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TOPICS = [
  { id: 'cycle', label: 'Chu kỳ kinh' },
  { id: 'ovulation', label: 'Rụng trứng' },
  { id: 'hormones', label: 'Hormone' },
  { id: 'hygiene', label: 'Vệ sinh vùng kín' },
  { id: 'pain', label: 'Đau bụng kinh' },
  { id: 'fertility', label: 'Sinh sản' },
];

const CONTENT = {
  cycle: {
    title: 'Hiểu đúng về chu kỳ kinh nguyệt',
    body: 'Chu kỳ kinh nguyệt trung bình từ 21 đến 35 ngày. Mỗi phụ nữ có chu kỳ riêng, điều quan trọng là theo dõi tính đều đặn của chu kỳ của mình.',
    tips: ['Ghi chú ngày bắt đầu mỗi kỳ kinh', 'Chu kỳ ngắn hơn 21 ngày hoặc dài hơn 35 ngày nên khám BS', 'Lượng máu kinh bình thường 20–80ml/kỳ'],
  },
  ovulation: {
    title: 'Nhận biết ngày rụng trứng',
    body: 'Rụng trứng thường xảy ra vào giữa chu kỳ, khoảng ngày 14 nếu chu kỳ 28 ngày. Cơ thể thường có dấu hiệu: huyết trắng trong hơn, nhiệt độ cơ thể tăng nhẹ.',
    tips: ['Theo dõi huyết trắng — trong và dai như lòng trắng trứng là dấu hiệu rụng trứng', 'Đau bụng nhẹ một bên có thể là đau rụng trứng', 'Test thử rụng trứng có thể hỗ trợ xác định chính xác'],
  },
  hormones: {
    title: 'Hormone phụ nữ và sức khoẻ',
    body: 'Estrogen và progesterone là 2 hormone chủ yếu điều phối chu kỳ. Mất cân bằng hormone có thể gây rối loạn kinh nguyệt, mụn, tăng cân bất thường.',
    tips: ['Vận động đều đặn giúp cân bằng hormone', 'Hạn chế stress kéo dài', 'Ngủ đủ 7–8 tiếng mỗi đêm'],
  },
  hygiene: {
    title: 'Vệ sinh vùng kín đúng cách',
    body: 'Vùng kín có khả năng tự làm sạch nhờ cơ chế pH tự nhiên. Việc dùng các sản phẩm có hương liệu có thể phá vỡ hệ vi khuẩn có lợi.',
    tips: ['Chỉ rửa bằng nước ấm hoặc dung dịch vệ sinh không có hương liệu', 'Thay băng vệ sinh 4–6 tiếng/lần', 'Mặc đồ lót cotton thoáng mát'],
  },
  pain: {
    title: 'Đau bụng kinh — bình thường và bất thường',
    body: 'Đau bụng kinh nhẹ ở ngày 1–2 là bình thường do co bóp tử cung. Đau dữ dội kéo dài, không đáp ứng với thuốc giảm đau thông thường cần được khám.',
    tips: ['Chườm ấm bụng dưới giúp giảm đau hiệu quả', 'Tránh thức khuya, ăn lạnh trong ngày kinh', 'Nếu đau ảnh hưởng sinh hoạt, hãy gặp BS. Tuấn'],
  },
  fertility: {
    title: 'Sức khoẻ sinh sản tối ưu',
    body: 'Sức khoẻ sinh sản phụ thuộc vào nhiều yếu tố: dinh dưỡng, cân nặng, stress, và các bệnh lý phụ khoa. Tầm soát định kỳ là chìa khóa phòng ngừa.',
    tips: ['Tầm soát ung thư cổ tử cung (Pap smear) 1–3 năm/lần', 'Acid folic 400mcg/ngày nếu có kế hoạch mang thai', 'Duy trì BMI trong khoảng 18.5–24.9'],
  },
};

export default function GYKnowledge() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState('cycle');
  const content = CONTENT[selectedTopic];

  return (
    <div className="min-h-screen" style={{ background: '#FDEEF0' }}>
      {/* Header */}
      <div className="bg-white border-b-[0.5px] border-[#E8B8C4] px-[22px] pt-[calc(env(safe-area-inset-top)+14px)] pb-0">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate('/phukhoa')} className="w-9 h-9 flex items-center justify-center">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9A6070" strokeWidth="1.8" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <div className="text-[10px] font-bold tracking-[.1em] uppercase text-[#9A6070]">Kiến thức phụ khoa</div>
          <div className="w-9" />
        </div>
        {/* Topic pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
          {TOPICS.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTopic(t.id)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all"
              style={{
                background: selectedTopic === t.id ? '#C96080' : '#FFFFFF',
                color: selectedTopic === t.id ? '#FFFFFF' : '#9A6070',
                border: selectedTopic === t.id ? '1px solid #C96080' : '0.5px solid #E8B8C4',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-[22px] py-4 pb-24 space-y-4">
        {/* Main card */}
        <div className="rounded-[20px] p-[22px_22px_18px]" style={{ background: '#2A1015' }}>
          <div className="text-[9px] font-bold tracking-[.22em] uppercase text-[rgba(240,184,192,.6)] mb-3">PHỤ KHOA · KIẾN THỨC</div>
          <div className="font-serif text-[22px] font-normal text-white leading-[1.25] mb-3">{content.title}</div>
          <div className="font-serif italic text-[13px] text-white/60 leading-[1.7]">{content.body}</div>
        </div>

        {/* Tips */}
        <div className="bg-white border-[0.5px] border-[#E8B8C4] rounded-[14px] p-4">
          <div className="text-[10px] font-bold tracking-[.2em] uppercase text-[#C96080] mb-3">Chị nên nhớ</div>
          <div className="space-y-2.5">
            {content.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#FFF0F2] border-[0.5px] border-[#E8B8C4] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[9px] font-bold text-[#C96080]">{i + 1}</span>
                </div>
                <span className="text-[13px] text-[#2A1015] leading-[1.5]">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Articles */}
        <div>
          <div className="flex justify-between items-baseline mb-3">
            <div className="text-[10px] font-bold tracking-[.2em] uppercase text-[#2A1015]">Bài viết liên quan</div>
            <div className="font-serif italic text-[13px] text-[#C96080]">Xem thêm →</div>
          </div>
          {[
            { title: 'Chăm sóc bản thân ngày "đèn đỏ" đúng cách', read: '3 phút' },
            { title: 'Khi nào cần đi khám phụ khoa?', read: '4 phút' },
          ].map((art, i) => (
            <div key={i} className="bg-white border-[0.5px] border-[#E8B8C4] rounded-[14px] p-4 mb-2">
              <div className="font-serif text-[15px] text-[#2A1015] leading-[1.4] mb-2">{art.title}</div>
              <div className="text-[10px] text-[#9A6070]">BS. Hoàng Thanh Tuấn · {art.read} đọc</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
