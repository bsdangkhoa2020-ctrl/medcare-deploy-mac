import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Toast from '../../../components/Toast';
import { Icon, ICONS, Modal, InputField, today, fmtDate, fmtDateShort, DOW_VI, getWeekDays, get7Days } from './shared';

const HV_SHIFTS = ['HC', 'A', 'C', 'OFF'];
const PK_SHIFTS = ['Sáng', 'Tối', 'Sáng+Tối', 'Nghỉ'];

const SHIFT_COLOR = {
  HC: 'bg-blue-50 text-blue-800 border-blue-200',
  A: 'bg-amber-50 text-amber-800 border-amber-200',
  C: 'bg-purple-50 text-purple-800 border-purple-200',
  OFF: 'bg-[#F5F1EB] text-ink-muted border-[#E8D8C8]',
  'Sáng': 'bg-sky-50 text-sky-800 border-sky-200',
  'Tối': 'bg-indigo-50 text-indigo-800 border-indigo-200',
  'Sáng+Tối': 'bg-teal-50 text-teal-800 border-teal-200',
  'Nghỉ': 'bg-[#F5F1EB] text-ink-muted border-[#E8D8C8]',
};

function ScheduleBlock({ title, location, shifts, weekDays, schedule, onEdit, onEditWeek }) {
  return (
    <div className="bg-surface rounded-2xl border border-gold/30 shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gold/20 bg-[#FDFBF7] flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-ink">{title}</h3>
          <p className="text-xs font-medium text-ink-muted">{location}</p>
        </div>
        <button onClick={onEditWeek}
          className="text-xs text-ink bg-gold-lt px-3 py-1.5 rounded-lg font-bold hover:bg-gold/30 transition-colors border border-gold/40 flex items-center gap-1.5 shadow-sm">
          <Icon d={ICONS.edit} className="w-3.5 h-3.5" /> Sửa lịch tuần
        </button>
      </div>
      <div className="grid grid-cols-7 divide-x divide-gold/15">
        {weekDays.map(day => {
          const d = new Date(day);
          const isToday = day === today();
          const shift = schedule[day] || '—';
          return (
            <button key={day} onClick={() => onEdit(day, shift)}
              className={`flex flex-col items-center py-4 gap-2 hover:bg-gold-lt/30 transition-colors ${isToday ? 'bg-gold-lt/50' : ''}`}>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isToday ? 'text-gold-dk' : 'text-ink-muted'}`}>{DOW_VI[d.getDay()]}</span>
              <span className={`font-serif text-xl sm:text-2xl font-bold ${isToday ? 'text-gold-dk' : 'text-ink'}`}>{d.getDate()}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md border font-bold shadow-sm ${SHIFT_COLOR[shift] || 'bg-surface text-ink-muted border-gold/20'}`}>
                {shift}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TabSchedule() {
  const [selectedDate, setSelectedDate] = useState(today());
  const [weekBase, setWeekBase] = useState(today());
  const [weekOffset, setWeekOffset] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [hvSchedule, setHvSchedule] = useState({});
  const [pkSchedule, setPkSchedule] = useState({});
  const [loading, setLoading] = useState(true);

  const [editModal, setEditModal] = useState({ open: false, day: '', shift: '', type: '' });
  const [weekModal, setWeekModal] = useState({ open: false, type: '', values: {} });
  const [apptModal, setApptModal] = useState(false);
  const [apptForm, setApptForm] = useState({ patient_name: '', time: '08:00', note: '', date: today() });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });

  const showToast = (msg, type = 'info') => setToast({ isVisible: true, message: msg, type });

  const weekDays = getWeekDays((() => {
    const d = new Date(weekBase);
    d.setDate(d.getDate() + weekOffset * 7);
    return d.toISOString().split('T')[0];
  })());

  const strip7 = get7Days(today());

  useEffect(() => { fetchAll(); }, [selectedDate]);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: appts }, { data: sched }] = await Promise.all([
      supabase.from('appointments').select('*').eq('date', selectedDate).order('time'),
      supabase.from('doctor_schedule').select('*'),
    ]);
    setAppointments(appts || []);
    const hv = {}, pk = {};
    (sched || []).forEach(r => {
      if (r.location === 'hv') hv[r.date] = r.shift_name;
      if (r.location === 'pk') pk[r.date] = r.shift_name;
    });
    setHvSchedule(hv);
    setPkSchedule(pk);
    setLoading(false);
  };

  const saveShift = async (day, shift, location) => {
    setSaving(true);
    const { error } = await supabase.from('doctor_schedule').upsert({ date: day, shift_name: shift, location }, { onConflict: 'date,location', ignoreDuplicates: false });
    setSaving(false);
    if (error) return showToast('Lỗi lưu lịch: ' + error.message, 'error');
    if (location === 'hv') setHvSchedule(s => ({ ...s, [day]: shift }));
    else setPkSchedule(s => ({ ...s, [day]: shift }));
    showToast('Đã lưu lịch', 'success');
    setEditModal({ open: false, day: '', shift: '', type: '' });
  };

  const saveWeek = async () => {
    setSaving(true);
    const rows = weekDays.map(day => ({ date: day, shift_name: weekModal.values[day] || (weekModal.type === 'hv' ? 'HC' : 'Sáng'), location: weekModal.type }));
    const { error } = await supabase.from('doctor_schedule').upsert(rows, { onConflict: 'date,location', ignoreDuplicates: false });
    setSaving(false);
    if (error) return showToast('Lỗi lưu lịch tuần: ' + error.message, 'error');
    const update = {};
    rows.forEach(r => { update[r.date] = r.shift_name; });
    if (weekModal.type === 'hv') setHvSchedule(s => ({ ...s, ...update }));
    else setPkSchedule(s => ({ ...s, ...update }));
    showToast('Đã lưu lịch cả tuần', 'success');
    setWeekModal({ open: false, type: '', values: {} });
  };

  const saveAppt = async () => {
    if (!apptForm.patient_name.trim()) return showToast('Nhập tên bệnh nhân', 'error');
    setSaving(true);
    const { error } = await supabase.from('appointments').insert({
      patient_name: apptForm.patient_name,
      time: apptForm.time,
      note: apptForm.note,
      date: apptForm.date,
    });
    setSaving(false);
    if (error) return showToast('Lỗi: ' + error.message, 'error');
    showToast('Đã tạo lịch hẹn', 'success');
    setApptModal(false);
    setApptForm({ patient_name: '', time: '08:00', note: '', date: today() });
    if (apptForm.date === selectedDate) fetchAll();
  };

  const openEditDay = (day, shift, type) => setEditModal({ open: true, day, shift: shift === '—' ? (type === 'hv' ? 'HC' : 'Sáng') : shift, type });
  const openEditWeek = (type) => {
    const sched = type === 'hv' ? hvSchedule : pkSchedule;
    const vals = {};
    weekDays.forEach(d => { vals[d] = sched[d] || (type === 'hv' ? 'HC' : 'Sáng'); });
    setWeekModal({ open: true, type, values: vals });
  };

  return (
    <div className="space-y-8">
      {/* Block 1 & 2: Row for Calendar Strip and Appointments */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        
        {/* Calendar strip 7 ngày */}
        <div className="bg-surface rounded-2xl border border-gold/30 shadow-md overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gold/20 bg-[#FDFBF7]">
            <h3 className="font-serif text-lg font-bold text-ink">Lịch hẹn trong 7 ngày tới</h3>
          </div>
          <div className="flex divide-x divide-gold/15 flex-1 items-stretch">
            {strip7.map(day => {
              const d = new Date(day);
              const isSelected = day === selectedDate;
              return (
                <button key={day} onClick={() => setSelectedDate(day)}
                  className={`flex-1 min-w-[48px] flex flex-col justify-center items-center py-4 gap-1.5 transition-all ${isSelected ? 'bg-ink text-gold-lt shadow-inner' : 'hover:bg-gold-lt/40 text-ink'}`}>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-gold-lt' : 'text-ink-muted'}`}>{DOW_VI[d.getDay()]}</span>
                  <span className="font-serif text-2xl font-bold">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lịch hẹn */}
        <div className="bg-surface rounded-2xl border border-gold/30 shadow-md overflow-hidden flex flex-col h-full max-h-[300px]">
          <div className="px-5 py-4 border-b border-gold/20 bg-[#FDFBF7] flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-serif text-base font-bold text-ink">Cuộc hẹn</h3>
              <p className="text-xs font-medium text-ink-muted">{fmtDate(selectedDate)}</p>
            </div>
            <button onClick={() => setApptModal(true)}
              className="flex items-center justify-center w-8 h-8 bg-ink text-gold-lt rounded-full hover:bg-ink-2 transition-all shadow-sm">
              <Icon d={ICONS.plus} className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-ink-muted text-sm font-medium animate-pulse">Đang tải...</div>
            ) : appointments.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <Icon d={ICONS.calendar} className="w-8 h-8 text-gold-md mb-2" />
                <p className="text-sm font-medium text-ink-muted">Trống lịch</p>
              </div>
            ) : (
              <div className="divide-y divide-gold/15">
                {appointments.map(a => (
                  <div key={a.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gold-lt/20 transition-colors">
                    <div className="w-12 text-center pt-0.5">
                      <span className="font-mono font-bold text-sm text-gold-dk">{a.time?.slice(0, 5)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-ink">{a.patient_name}</p>
                      {a.note && <p className="text-xs text-ink-muted mt-1 bg-[#FDFBF7] p-2 rounded border border-gold/10 line-clamp-2">{a.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-gold/20 my-4" />

      {/* Block 3 & 4: Ca trực */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="font-serif text-2xl font-bold text-ink">Phân bổ Ca trực</h2>
          <div className="flex items-center bg-surface shadow-sm border border-gold/30 rounded-xl overflow-hidden p-1">
            <button onClick={() => setWeekOffset(o => o - 1)} className="p-2 rounded-lg hover:bg-gold-lt transition-colors">
              <Icon d={ICONS.chevLeft} className="w-4 h-4 text-ink" />
            </button>
            <span className="px-4 py-1 text-sm font-bold text-ink">
              Tuần {weekDays[0] && fmtDateShort(weekDays[0])} - {weekDays[6] && fmtDateShort(weekDays[6])}
            </span>
            <button onClick={() => setWeekOffset(0)} className="px-3 py-1 text-xs text-gold-dk bg-gold-lt/50 rounded-lg hover:bg-gold-lt transition-colors font-bold mx-1">Hiện tại</button>
            <button onClick={() => setWeekOffset(o => o + 1)} className="p-2 rounded-lg hover:bg-gold-lt transition-colors">
              <Icon d={ICONS.chevRight} className="w-4 h-4 text-ink" />
            </button>
          </div>
        </div>
        
        <ScheduleBlock
          title="BV Hùng Vương"
          location="Ca HC / A / C / OFF"
          shifts={HV_SHIFTS}
          weekDays={weekDays}
          schedule={hvSchedule}
          onEdit={(day, shift) => openEditDay(day, shift, 'hv')}
          onEditWeek={() => openEditWeek('hv')}
        />

        <ScheduleBlock
          title="PK Phụ Sản 315"
          location="Ca Sáng / Tối / Sáng+Tối / Nghỉ"
          shifts={PK_SHIFTS}
          weekDays={weekDays}
          schedule={pkSchedule}
          onEdit={(day, shift) => openEditDay(day, shift, 'pk')}
          onEditWeek={() => openEditWeek('pk')}
        />
      </div>

      {/* Modal sửa từng ngày */}
      <Modal open={editModal.open} onClose={() => setEditModal({ open: false, day: '', shift: '', type: '' })}
        title={`Ca trực – ${editModal.day && fmtDate(editModal.day)}`}>
        <div className="space-y-5">
          <p className="text-sm font-medium text-ink-muted">Cập nhật ca trực tại {editModal.type === 'hv' ? 'BV Hùng Vương' : 'PK 315'}:</p>
          <div className="grid grid-cols-2 gap-3">
            {(editModal.type === 'hv' ? HV_SHIFTS : PK_SHIFTS).map(s => (
              <button key={s} onClick={() => setEditModal(m => ({ ...m, shift: s }))}
                className={`py-4 rounded-xl border-2 font-bold text-sm shadow-sm transition-all ${editModal.shift === s ? 'border-gold-dk ring-4 ring-gold-lt scale-[1.02]' : 'border-gold/20 hover:border-gold/50'} ${SHIFT_COLOR[s]}`}>
                {s}
              </button>
            ))}
          </div>
          <button onClick={() => saveShift(editModal.day, editModal.shift, editModal.type)} disabled={saving}
            className="w-full bg-ink text-gold-lt py-3.5 rounded-xl font-bold text-base hover:bg-ink-2 shadow-md transition-all disabled:opacity-50 mt-2">
            {saving ? 'Đang lưu...' : 'Xác nhận'}
          </button>
        </div>
      </Modal>

      {/* Modal sửa cả tuần */}
      <Modal open={weekModal.open} onClose={() => setWeekModal({ open: false, type: '', values: {} })}
        title={`Lịch tuần – ${weekModal.type === 'hv' ? 'BV Hùng Vương' : 'PK 315'}`} wide>
        <div className="space-y-4">
          {weekDays.map(day => {
            const d = new Date(day);
            return (
              <div key={day} className="flex items-center gap-4 py-2 border-b border-gold/10 last:border-0">
                <div className="w-20 shrink-0">
                  <p className="text-sm font-bold text-ink">{DOW_VI[d.getDay()]}</p>
                  <p className="text-xs font-medium text-ink-muted">{fmtDateShort(day)}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(weekModal.type === 'hv' ? HV_SHIFTS : PK_SHIFTS).map(s => (
                    <button key={s} onClick={() => setWeekModal(m => ({ ...m, values: { ...m.values, [day]: s } }))}
                      className={`px-3.5 py-2 rounded-lg border text-xs font-bold shadow-sm transition-all ${weekModal.values[day] === s ? 'border-gold-dk ring-2 ring-gold-lt scale-[1.05]' : 'border-gold/20 hover:border-gold/50'} ${SHIFT_COLOR[s]}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="pt-4">
            <button onClick={saveWeek} disabled={saving}
              className="w-full bg-ink text-gold-lt py-3.5 rounded-xl font-bold text-base hover:bg-ink-2 shadow-md transition-all disabled:opacity-50">
              {saving ? 'Đang lưu...' : 'Lưu toàn bộ tuần'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal tạo lịch hẹn */}
      <Modal open={apptModal} onClose={() => setApptModal(false)} title="Thêm lịch hẹn">
        <div className="space-y-5">
          <InputField label="Tên bệnh nhân" value={apptForm.patient_name} onChange={e => setApptForm(f => ({ ...f, patient_name: e.target.value }))} placeholder="Nguyễn Thị A" />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Ngày hẹn" type="date" value={apptForm.date} onChange={e => setApptForm(f => ({ ...f, date: e.target.value }))} />
            <InputField label="Giờ hẹn" type="time" value={apptForm.time} onChange={e => setApptForm(f => ({ ...f, time: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Ghi chú thêm</label>
            <textarea value={apptForm.note} onChange={e => setApptForm(f => ({ ...f, note: e.target.value }))}
              placeholder="VD: Siêu âm 4D, khám định kỳ..."
              className="w-full px-4 py-3 bg-white border border-gold/40 shadow-sm rounded-xl text-sm focus:outline-none focus:border-gold-dk focus:ring-2 focus:ring-gold/30 transition-all resize-none min-h-[100px] text-ink" />
          </div>
          <button onClick={saveAppt} disabled={saving}
            className="w-full bg-ink text-gold-lt py-3.5 rounded-xl font-bold text-base hover:bg-ink-2 shadow-md transition-all disabled:opacity-50 mt-2">
            {saving ? 'Đang tạo...' : 'Xác nhận tạo'}
          </button>
        </div>
      </Modal>

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(t => ({ ...t, isVisible: false }))} />
    </div>
  );
}
