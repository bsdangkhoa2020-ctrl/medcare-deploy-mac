export const Icon = ({ d, className = 'w-5 h-5', viewBox = '0 0 24 24', fill = 'none', stroke = 'currentColor', strokeWidth = 2 }) => (
  <svg className={className} viewBox={viewBox} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

export const ICONS = {
  patients: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  calendar: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  journal: ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'],
  scan: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18',
  search: 'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  plus: 'M12 5v14M5 12h14',
  chat: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  x: 'M18 6 6 18M6 6l12 12',
  chevLeft: 'M15 18l-6-6 6-6',
  chevRight: 'M9 18l6-6-6-6',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  trash: ['M3 6h18', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'],
  upload: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  send: 'M22 2 11 13M22 2 15 22 11 13 2 9l20-7z',
  eye: ['M1 12s4-8 11-8 11 8 11 8', 'M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4'],
  key: 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4',
  check: 'M20 6 9 17l-5-5',
  alert: ['M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', 'M12 9v4M12 17h.01'],
  file: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6M16 13H8M16 17H8M10 9H8'],
  image: ['M21 9l-9 4-9-4', 'M3 9l9 4 9-4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z'],
  copy: ['M20 9H11a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'],
};

export const today = () => new Date().toISOString().split('T')[0];
export const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
export const fmtDateShort = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
export const DOW_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function getWeekDays(baseDate) {
  const d = new Date(baseDate);
  const dow = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(mon);
    day.setDate(mon.getDate() + i);
    return day.toISOString().split('T')[0];
  });
}

export function get7Days(base) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

export function Modal({ open, onClose, title, children, wide, full }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-bg rounded-t-3xl sm:rounded-3xl shadow-2xl w-full ${full ? 'sm:max-w-5xl h-[95vh]' : wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'} ${!full && 'max-h-[90vh]'} flex flex-col z-10 border border-gold/30`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gold/20 shrink-0">
          <h3 className="text-xl font-serif font-bold text-ink">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full bg-gold-lt hover:bg-gold/30 text-gold-dk transition-colors">
            <Icon d={ICONS.x} className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6 text-ink">{children}</div>
      </div>
    </div>
  );
}

const inputCls = 'w-full px-4 py-2.5 bg-white border border-gold/40 rounded-xl text-sm focus:outline-none focus:border-gold-dk focus:ring-2 focus:ring-gold/30 transition-all text-ink shadow-sm';

export const InputField = ({ label, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">{label}</label>
    <input className={inputCls} {...props} />
  </div>
);

export const SelectField = ({ label, children, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">{label}</label>
    <select className={inputCls} {...props}>{children}</select>
  </div>
);
