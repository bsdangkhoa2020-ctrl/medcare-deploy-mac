import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Hospital, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../../components/Toast';

const SCH_DOW = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const HV_CA_TIMES = {
  'OFF': { label: 'OFF', bg: 'bg-transparent border-dashed border-2 border-gold/20', text: 'text-ink-muted' },
  'HC': { label: 'HC (Hành chính)', bg: 'bg-emerald-50 border border-emerald-200 shadow-sm', text: 'text-emerald-700' },
  'A': { label: 'A (Ca sáng)', bg: 'bg-blue-50 border border-blue-200 shadow-sm', text: 'text-blue-700' },
  'C': { label: 'C (Ca đêm)', bg: 'bg-purple-50 border border-purple-200 shadow-sm', text: 'text-purple-700' }
};

const PK_CA_TIMES = {
  'Nghỉ': { label: 'Nghỉ', bg: 'bg-transparent border-dashed border-2 border-gold/20', text: 'text-ink-muted' },
  'Sáng': { label: 'Sáng', bg: 'bg-orange-50 border border-orange-200 shadow-sm', text: 'text-orange-700' },
  'Tối': { label: 'Tối', bg: 'bg-indigo-50 border border-indigo-200 shadow-sm', text: 'text-indigo-700' },
  'Sáng + Tối': { label: 'Sáng + Tối', bg: 'bg-rose-50 border border-rose-200 shadow-sm', text: 'text-rose-700' }
};

function getWeekTag(offset) {
  if (offset === 0) return 'Tuần này';
  if (offset === 1) return 'Tuần sau';
  if (offset === -1) return 'Tuần trước';
  return `Tuần (${offset > 0 ? '+' : ''}${offset})`;
}

function getWeekDates(offset) {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff); // Monday of current week
  d.setDate(d.getDate() + offset * 7); // Apply offset
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const nd = new Date(d);
    nd.setDate(d.getDate() + i);
    dates.push(nd);
  }
  return dates;
}

function toLocalDateString(d) {
  const tzo = -d.getTimezoneOffset();
  const dif = tzo >= 0 ? '+' : '-';
  const pad = (num) => (num < 10 ? '0' : '') + num;
  return d.getFullYear() +
    '-' + pad(d.getMonth() + 1) +
    '-' + pad(d.getDate()) +
    'T00:00:00.000' + dif + pad(Math.floor(Math.abs(tzo) / 60)) + ':' + pad(Math.abs(tzo) % 60);
}

export default function Schedule() {
  const [hvOffset, setHvOffset] = useState(0);
  const [pkOffset, setPkOffset] = useState(0);
  const [hvShifts, setHvShifts] = useState({});
  const [pkShifts, setPkShifts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [slideDirHv, setSlideDirHv] = useState(0);
  const [slideDirPk, setSlideDirPk] = useState(0);

  // Edit Modal State
  const [editDay, setEditDay] = useState(null); // { date: 'YYYY-MM-DD', type: 'hv' | 'pk', currentVal: 'OFF' }
  const [editVal, setEditVal] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const fetchScheduleData = async () => {
    setIsLoading(true);
    try {
      // Lấy lịch từ 90 ngày trước để cover
      const fromDate = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from('doctor_schedule')
        .select('*')
        .gte('date', fromDate);
      
      if (error) throw error;
      
      const newHv = {};
      const newPk = {};
      (data || []).forEach(r => {
        if (r.location === 'hung_vuong') newHv[r.date] = r.shift_name;
        else if (r.location === 'pk315') newPk[r.date] = r.shift_name;
      });
      
      setHvShifts(newHv);
      setPkShifts(newPk);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      showToast('Lỗi khi tải dữ liệu lịch trực', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const handleHvNav = (dir) => {
    setSlideDirHv(dir);
    setHvOffset(prev => prev + dir);
  };

  const handlePkNav = (dir) => {
    setSlideDirPk(dir);
    setPkOffset(prev => prev + dir);
  };

  const openEditModal = (ds, type, currentVal) => {
    setEditDay({ date: ds, type, currentVal });
    setEditVal(currentVal);
  };

  const handleSaveShift = async () => {
    if (!editDay) return;
    setIsSaving(true);
    
    try {
      const loc = editDay.type === 'hv' ? 'hung_vuong' : 'pk315';
      const spec = editDay.type === 'hv' ? 'gy' : 'ob';
      const isOff = editVal === 'OFF' || editVal === 'Nghỉ';
      
      // 1. Delete existing shift for this date and location
      await supabase
        .from('doctor_schedule')
        .delete()
        .eq('date', editDay.date)
        .eq('location', loc);
      
      // 2. Insert new shift if not OFF
      if (!isOff) {
        const timeMap = {
          'A': { s: '06:00', e: '14:00' },
          'HC': { s: '07:15', e: '16:30' },
          'C': { s: '09:00', e: '17:00' },
          'Sáng': { s: '08:00', e: '11:00' },
          'Tối': { s: '17:00', e: '20:00' },
          'Sáng + Tối': { s: '08:00', e: '20:00' }
        };
        const t = timeMap[editVal] || { s: '07:00', e: '17:00' };
        
        const { error } = await supabase
          .from('doctor_schedule')
          .insert({
            date: editDay.date,
            location: loc,
            shift_name: editVal,
            start_time: t.s,
            end_time: t.e,
            specialty: spec
          });
          
        if (error) throw error;
      }
      
      showToast('Đã cập nhật lịch trực thành công');
      fetchScheduleData(); // Reload data
      setEditDay(null);
    } catch (error) {
      console.error("Error saving shift:", error);
      showToast('Lỗi khi lưu lịch trực: ' + error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const renderGrid = (offset, shifts, caMap, type, slideDir) => {
    const dates = getWeekDates(offset);
    const today = new Date().toISOString().slice(0, 10);

    return (
      <AnimatePresence mode="popLayout" custom={slideDir}>
        <motion.div
          key={offset}
          custom={slideDir}
          initial={(dir) => ({ opacity: 0, x: dir > 0 ? 50 : -50 })}
          animate={{ opacity: 1, x: 0 }}
          exit={(dir) => ({ opacity: 0, x: dir > 0 ? -50 : 50 })}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="grid grid-cols-1 gap-2 md:grid-cols-7 md:gap-4 mt-4 md:mt-6"
        >
          {dates.map((d, i) => {
            const ds = toLocalDateString(d).slice(0, 10);
            const isPast = ds < today;
            const isToday = ds === today;
            const shiftKey = shifts[ds] || (type === 'hv' ? 'OFF' : 'Nghỉ');
            const ca = caMap[shiftKey] || Object.values(caMap)[0];
            const isOff = shiftKey === 'OFF' || shiftKey === 'Nghỉ';

            return (
              <button 
                key={ds}
                onClick={() => openEditModal(ds, type, shiftKey)}
                className={`flex flex-row md:flex-col items-center md:items-stretch justify-between p-3 md:p-4 rounded-xl md:rounded-2xl min-h-[60px] md:min-h-[110px] transition-all text-left cursor-pointer active:scale-95
                  ${isToday ? 'bg-gold-light/20 border-2 border-gold ring-4 ring-gold/10 md:scale-105 z-10 shadow-md' : 'bg-white/40 border border-gold/10 hover:bg-white hover:shadow-sm hover:border-gold/30'}
                  ${isPast && !isToday ? 'opacity-60 grayscale-[0.2]' : ''}
                `}
              >
                {/* Mobile: Day & Date side-by-side. Desktop: Stacked */}
                <div className="flex flex-row md:flex-col items-center gap-3 md:gap-1 text-center">
                  <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${isToday ? 'text-gold-dark' : 'text-ink-muted'}`}>
                    {SCH_DOW[i]}
                  </span>
                  <div className="flex items-center justify-center gap-1">
                    <span className={`text-base md:text-2xl font-serif ${isToday ? 'text-ink font-bold' : 'text-ink'}`}>
                      {d.getDate()}
                    </span>
                    <span className={`text-xs ${isToday ? 'text-ink font-bold' : 'text-ink-muted/60'}`}>
                      /{d.getMonth() + 1}
                    </span>
                  </div>
                </div>

                {/* Shift Badge */}
                <div className={`mt-0 md:mt-auto px-3 py-1.5 md:py-2 rounded-lg text-xs font-bold text-center w-fit md:w-full ml-auto md:ml-0 flex items-center justify-center gap-1.5 ${ca.bg} ${ca.text}`}>
                  {!isOff && <Clock className="w-3 h-3 hidden md:block" />}
                  {ca.label}
                </div>
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* HEADER */}
      <div className="bg-transparent md:glass rounded-none md:rounded-3xl px-4 pt-4 md:p-6 mb-4 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 relative overflow-hidden md:shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-light/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="relative z-10 w-full md:w-auto">
          <h1 className="text-xl md:text-3xl font-serif font-semibold text-ink mb-1 flex items-center gap-2 md:gap-3">
            Lịch & Ca Trực
          </h1>
          <p className="text-xs md:text-sm text-ink-muted">Quản lý lịch làm việc đa cơ sở</p>
        </div>
        
        {/* Placeholder for Future Integrations */}
        <div className="flex gap-2 relative z-10 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/50 hover:bg-white text-ink rounded-xl text-sm font-semibold transition-all border border-gold/20 shadow-sm border-dashed">
            <Calendar className="w-4 h-4 text-ink-muted" />
            Đồng bộ Lịch
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-8 min-h-0 overflow-y-auto px-0 md:px-0 hide-scrollbar pb-8">
        
        {/* BLOCK 1: HUNG VUONG (CÔNG) */}
        <div className="bg-transparent md:glass rounded-none md:rounded-3xl p-4 md:p-8 flex flex-col md:shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 md:mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-inner shrink-0">
                <Hospital className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-serif font-bold text-ink flex items-center gap-2">
                  BV Hùng Vương
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-sans mt-0.5 hidden md:inline-block">Nhà nước</span>
                </h2>
                <p className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> Q.5, TP.HCM
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-4 bg-white/40 md:bg-transparent p-2 md:p-0 rounded-xl md:rounded-none border border-gold/10 md:border-none">
              <button onClick={() => handleHvNav(-1)} className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white text-ink border border-gold/20 shadow-sm hover:bg-gold-light hover:text-gold-dark transition-all group">
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 group-active:-translate-x-1 transition-transform" />
              </button>
              
              <div className="flex flex-col items-center justify-center min-w-[100px]">
                <span className="text-sm font-bold text-ink">{getWeekTag(hvOffset)}</span>
                <span className="text-[10px] text-ink-muted">
                  {getWeekDates(hvOffset)[0].getDate()}/{getWeekDates(hvOffset)[0].getMonth() + 1} - {getWeekDates(hvOffset)[6].getDate()}/{getWeekDates(hvOffset)[6].getMonth() + 1}
                </span>
              </div>
              
              <button onClick={() => handleHvNav(1)} className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white text-ink border border-gold/20 shadow-sm hover:bg-gold-light hover:text-gold-dark transition-all group">
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-active:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="flex-1 relative z-10">
            {isLoading ? (
              <div className="py-20 text-center text-ink-muted animate-pulse">Đang tải lịch trực...</div>
            ) : (
              renderGrid(hvOffset, hvShifts, HV_CA_TIMES, 'hv', slideDirHv)
            )}
          </div>
        </div>

        {/* BLOCK 2: PK 315 (TƯ) */}
        <div className="bg-transparent md:glass rounded-none md:rounded-3xl p-4 md:p-8 flex flex-col md:shadow-sm relative overflow-hidden mt-2 md:mt-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/30 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 md:mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200 shadow-inner shrink-0">
                <Building2 className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-serif font-bold text-ink flex items-center gap-2">
                  Phòng Khám 315
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-sans mt-0.5 hidden md:inline-block">Tư nhân</span>
                </h2>
                <p className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> Chi nhánh Q.10
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-4 bg-white/40 md:bg-transparent p-2 md:p-0 rounded-xl md:rounded-none border border-gold/10 md:border-none">
              <button onClick={() => handlePkNav(-1)} className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white text-ink border border-gold/20 shadow-sm hover:bg-gold-light hover:text-gold-dark transition-all group">
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 group-active:-translate-x-1 transition-transform" />
              </button>
              
              <div className="flex flex-col items-center justify-center min-w-[100px]">
                <span className="text-sm font-bold text-ink">{getWeekTag(pkOffset)}</span>
                <span className="text-[10px] text-ink-muted">
                  {getWeekDates(pkOffset)[0].getDate()}/{getWeekDates(pkOffset)[0].getMonth() + 1} - {getWeekDates(pkOffset)[6].getDate()}/{getWeekDates(pkOffset)[6].getMonth() + 1}
                </span>
              </div>
              
              <button onClick={() => handlePkNav(1)} className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white text-ink border border-gold/20 shadow-sm hover:bg-gold-light hover:text-gold-dark transition-all group">
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-active:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="flex-1 relative z-10">
            {isLoading ? (
              <div className="py-20 text-center text-ink-muted animate-pulse">Đang tải lịch trực...</div>
            ) : (
              renderGrid(pkOffset, pkShifts, PK_CA_TIMES, 'pk', slideDirPk)
            )}
          </div>
        </div>

      </div>
      
      {/* Edit Modal */}
      <AnimatePresence>
        {editDay && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
              onClick={() => setEditDay(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-gold/20"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-gold/20 pb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editDay.type === 'hv' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                  {editDay.type === 'hv' ? <Hospital className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-ink text-lg">Chỉnh sửa ca trực</h3>
                  <p className="text-sm text-ink-muted">
                    {editDay.type === 'hv' ? 'BV Hùng Vương' : 'Phòng Khám 315'} • {new Date(editDay.date).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">Chọn ca trực</label>
                <div className="grid grid-cols-2 gap-3">
                  {(editDay.type === 'hv' ? ['OFF', 'HC', 'A', 'C'] : ['Nghỉ', 'Sáng', 'Tối', 'Sáng + Tối']).map(preset => (
                    <button
                      key={preset}
                      onClick={() => setEditVal(preset)}
                      className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border ${
                        editVal === preset 
                          ? 'bg-gold-light/40 border-gold text-ink shadow-sm' 
                          : 'bg-white border-gold/20 text-ink-muted hover:border-gold hover:text-ink'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Hoặc nhập ca tùy chỉnh</label>
                <input 
                  type="text" 
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 border border-gold/30 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                  placeholder="Ví dụ: Hội chẩn, Nghỉ phép..."
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setEditDay(null)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-ink-muted hover:bg-gold-light/20 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSaveShift}
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-ink text-gold hover:bg-ink/90 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isSaving ? (
                    <span className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin"></span>
                  ) : 'Lưu Thay Đổi'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Toast 
        isVisible={toast.isVisible} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast(t => ({ ...t, isVisible: false }))} 
      />
    </div>
  );
}
