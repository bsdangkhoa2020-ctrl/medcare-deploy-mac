import { Baby, CalendarDays, Activity, CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function OBDashboard() {
  const { profile } = useAuth();
  
  // Mock data for now
  const weeks = 28;
  const days = 3;
  const progressPercent = (weeks / 40) * 100;

  const mockRecords = [
    { id: 1, date: '10/05/2026', type: 'Siêu âm hình thái 4D', status: 'Bình thường' },
    { id: 2, date: '15/04/2026', type: 'Siêu âm độ mờ da gáy', status: 'Bình thường' },
  ];

  const mockSchedule = [
    { id: 1, date: 'Thứ 2, 01/06/2026', shift: 'Sáng (07:00 - 11:30)', doctor: 'BS Tuấn', room: 'Phòng Khám Sản 1' },
    { id: 2, date: 'Thứ 4, 03/06/2026', shift: 'Chiều (13:00 - 16:30)', doctor: 'BS Tuấn', room: 'Phòng Khám Sản 1' },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header Info */}
      <div>
        <h1 className="text-3xl font-serif text-ink mb-1">Chào mẹ, {profile?.full_name?.split(' ').pop() || 'Bầu'}!</h1>
        <p className="text-ink-muted">Chúc mẹ một thai kỳ khỏe mạnh và bình an.</p>
      </div>

      {/* Pregnancy Progress */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E0D0B0] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-serif text-ink font-semibold flex items-center gap-2">
              <Baby className="w-6 h-6 text-emerald-600" />
              Tuổi thai hiện tại
            </h2>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 text-sm">
              Tuần {weeks}
            </span>
          </div>
          
          <div className="mb-2 flex justify-between items-end">
            <p className="text-3xl font-bold text-ink">{weeks}<span className="text-lg font-medium text-ink-muted ml-1">tuần</span> {days}<span className="text-lg font-medium text-ink-muted ml-1">ngày</span></p>
            <p className="text-sm font-medium text-ink-muted">Dự sinh: 15/08/2026</p>
          </div>
          
          {/* Progress Bar */}
          <div className="h-3 w-full bg-gold-light/40 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs font-bold text-ink-muted uppercase tracking-wider">
            <span>Tuần 1</span>
            <span>Tuần 40</span>
          </div>
        </div>
      </div>

      {/* Recent Records */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-serif text-ink font-semibold">Kết quả Siêu âm</h3>
          <button className="text-sm font-medium text-gold-dark hover:underline flex items-center">Xem tất cả <ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          {mockRecords.map(record => (
            <div key={record.id} className="bg-white p-4 rounded-2xl border border-gold/20 flex items-center justify-between hover:border-gold/40 transition-colors cursor-pointer shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold-light/50 flex items-center justify-center border border-gold/10">
                  <FileText className="w-6 h-6 text-gold-dark" />
                </div>
                <div>
                  <h4 className="font-semibold text-ink text-sm mb-1">{record.type}</h4>
                  <p className="text-xs text-ink-muted">{record.date}</p>
                </div>
              </div>
              <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-100">
                <CheckCircle2 className="w-3 h-3" />
                {record.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hung Vuong Schedule */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-serif text-ink font-semibold">Lịch làm việc theo tuần</h3>
          <button className="text-sm font-medium text-gold-dark hover:underline flex items-center">Đặt lịch <ChevronRight className="w-4 h-4" /></button>
        </div>
        
        {/* Horizontal Scrolling Schedule Cards */}
        <div className="flex overflow-x-auto gap-4 pb-4 -mx-1 px-1 snap-x snap-mandatory custom-scrollbar">
          {mockSchedule.map((sch) => (
            <div key={sch.id} className="snap-start min-w-[260px] max-w-[280px] bg-white rounded-2xl p-4 border border-gold/20 shadow-sm flex-shrink-0 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-emerald-600" />
                    <p className="font-bold text-ink">{sch.date.split(', ')[0]}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100">
                    {sch.date.split(', ')[1]}
                  </span>
                </div>
                <p className="text-sm font-semibold text-ink mb-1">{sch.shift}</p>
                <p className="text-xs text-ink-muted leading-relaxed">{sch.room}</p>
              </div>
            </div>
          ))}
          
          {/* Nút xem thêm lịch hoặc thẻ trống nếu ít lịch */}
          <div className="snap-start min-w-[120px] bg-white/40 rounded-2xl p-4 border border-dashed border-gold/30 flex-shrink-0 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gold-light/20 transition-colors">
            <p className="text-sm font-medium text-gold-dark">Tuần tới</p>
            <ChevronRight className="w-5 h-5 text-gold-dark mt-1" />
          </div>
        </div>
      </div>

    </div>
  );
}
