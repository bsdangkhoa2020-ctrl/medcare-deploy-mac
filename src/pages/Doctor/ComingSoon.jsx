import { Construction } from 'lucide-react';

export default function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white/20 glass rounded-3xl p-8 text-center border border-gold/10">
      <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gold/20">
        <Construction className="w-12 h-12 text-gold-dark" />
      </div>
      <h2 className="text-2xl font-serif font-semibold text-ink mb-3">{title}</h2>
      <p className="text-ink-muted max-w-md">
        Tính năng này đang được nâng cấp toàn diện bằng công nghệ React mới để mang lại trải nghiệm tốt nhất cho Bác sĩ. Vui lòng quay lại sau!
      </p>
    </div>
  );
}
