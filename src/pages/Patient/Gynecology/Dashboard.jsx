import { Activity, CalendarDays, CheckCircle2, ChevronRight, FileText, Pill } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export default function GYDashboard() {
  const { profile } = useAuth();
  
  const mockRecords = [
    { id: 1, date: '12/05/2026', type: 'Tầm soát Ung thư cổ tử cung (Pap)', status: 'Bình thường' },
    { id: 2, date: '10/05/2026', type: 'Định tuýp HPV', status: 'Âm tính' },
  ];

  const mockSchedule = [
    { id: 1, date: 'Thứ 7, 06/06/2026', shift: 'Sáng (08:00 - 11:30)', doctor: 'BS Tuấn', room: 'PK Phụ Sản 315' },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header Info */}
      <div>
        <h1 className="text-3xl font-serif text-ink mb-1">Hồ sơ Phụ khoa</h1>
        <p className="text-ink-muted">Xin chào {profile?.full_name || 'Bệnh nhân'}.</p>
      </div>

      {/* GY Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gold/20 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-3">
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-1">Lần khám cuối</p>
          <p className="font-semibold text-ink">12/05/2026</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gold/20 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3 border border-blue-100">
            <Pill className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-1">Toa thuốc</p>
          <p className="font-semibold text-ink">Đang dùng (2)</p>
        </div>
      </div>

      {/* Recent Records */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-serif text-ink font-semibold">Kết quả Xét nghiệm</h3>
          <button className="text-sm font-medium text-gold-dark hover:underline flex items-center">Xem tất cả <ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          {mockRecords.map(record => (
            <div key={record.id} className="bg-white p-4 rounded-2xl border border-gold/20 flex items-center justify-between hover:border-gold/40 transition-colors cursor-pointer shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100 flex-shrink-0">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-ink text-sm leading-tight mb-1">{record.type}</h4>
                  <p className="text-xs text-ink-muted">{record.date}</p>
                </div>
              </div>
              <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-100 flex-shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                {record.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PK 315 Schedule */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-serif text-ink font-semibold">Lịch Khám - Phòng khám 315</h3>
          <button className="text-sm font-medium text-gold-dark hover:underline flex items-center">Đặt lịch <ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="bg-white rounded-3xl p-1 border border-gold/20 overflow-hidden shadow-sm">
          {mockSchedule.map((sch, idx) => (
            <div key={sch.id} className={`p-4 flex gap-4 items-start ${idx !== mockSchedule.length - 1 ? 'border-b border-gold/10' : ''}`}>
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 border border-purple-100">
                <CalendarDays className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-ink mb-1">{sch.date}</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="bg-gold-light/30 px-2.5 py-1 rounded text-ink-muted font-medium">{sch.shift}</span>
                  <span className="bg-gold-light/30 px-2.5 py-1 rounded text-ink-muted font-medium">{sch.room}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
