import React, { useState } from 'react';

export default function EmotionDiary() {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [note, setNote] = useState('');

  const emotions = [
    { id: 'happy', label: 'Hạnh phúc', icon: '✨', color: '#B8814A' },
    { id: 'calm', label: 'Bình yên', icon: '🕊️', color: '#8C5C2E' },
    { id: 'tired', label: 'Mệt mỏi', icon: '🥀', color: '#735F4D' },
    { id: 'anxious', label: 'Lo âu', icon: '🌧️', color: '#4A3D33' },
  ];

  return (
    <div className="bg-[#FEFAF5] rounded-[20px] overflow-hidden border border-[#E8D8C8] p-[24px_22px]">
      {/* Header */}
      <div className="mb-6">
        <div className="text-[10px] tracking-[.28em] text-[#B8814A] uppercase font-semibold mb-2">Nhật ký cảm xúc</div>
        <div className="font-serif font-normal text-[26px] text-[#1C1510] leading-[1.2]">
          Hôm nay mẹ <br />cảm thấy thế nào?
        </div>
      </div>

      {/* Quote */}
      <div className="border-l-[1.5px] border-[#B8814A]/30 pl-3.5 mb-8">
        <div className="font-serif italic text-[14px] text-[#735F4D] leading-[1.6]">
          "Lắng nghe cơ thể và ghi lại cảm xúc giúp bác sĩ đồng hành cùng bạn tốt hơn."
        </div>
        <div className="text-[9px] text-[#A69380] mt-1.5 tracking-[.06em] uppercase">— BS. Hoàng Thanh Tuấn</div>
      </div>

      {/* Emotion Selector */}
      <div className="grid grid-cols-4 gap-2.5 mb-8">
        {emotions.map((emo) => (
          <button
            key={emo.id}
            onClick={() => setSelectedEmotion(emo.id)}
            className={`flex flex-col items-center p-[14px_8px] rounded-[14px] border transition-all duration-300 ${
              selectedEmotion === emo.id 
                ? 'bg-[#1C1510] border-[#1C1510] shadow-[0_4px_12px_rgba(28,21,16,0.1)] scale-105' 
                : 'bg-white border-[#E8D8C8] hover:border-[#B8814A]/40 hover:bg-[#FEFAF5]'
            }`}
          >
            <div className={`text-[22px] mb-2 filter ${selectedEmotion === emo.id ? 'grayscale-0' : 'grayscale opacity-80'}`}>
              {emo.icon}
            </div>
            <div className={`text-[10px] font-medium tracking-wide ${
              selectedEmotion === emo.id ? 'text-white' : 'text-[#735F4D]'
            }`}>
              {emo.label}
            </div>
          </button>
        ))}
      </div>

      {/* Note Input */}
      <div className="mb-8">
        <div className="text-[10px] tracking-[.1em] uppercase text-[#735F4D] mb-2.5 ml-1">Ghi chú thêm (Tuỳ chọn)</div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Mẹ có muốn chia sẻ điều gì đặc biệt hôm nay không..."
          className="w-full h-28 bg-white border border-[#E8D8C8] rounded-[16px] p-4 text-[14px] text-[#1C1510] placeholder-[#A69380] focus:outline-none focus:border-[#B8814A] focus:ring-1 focus:ring-[#B8814A]/20 resize-none font-serif transition-shadow"
        />
      </div>

      {/* Submit Button */}
      <button 
        className={`w-full py-4 rounded-[14px] text-[12px] uppercase tracking-[.15em] font-semibold transition-all duration-300 ${
          selectedEmotion 
            ? 'bg-[#B8814A] text-white shadow-[0_4px_14px_rgba(184,129,74,0.3)] hover:bg-[#A3703E]' 
            : 'bg-[#E8D8C8]/50 text-[#A69380] cursor-not-allowed'
        }`}
        disabled={!selectedEmotion}
      >
        Lưu nhật ký
      </button>
    </div>
  );
}
