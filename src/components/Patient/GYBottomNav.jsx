import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  {
    path: '/phukhoa',
    label: 'Trang chủ',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M4 10.5L12 3l8 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
    ),
  },
  {
    path: '/phukhoa/ho-so',
    label: 'Hồ sơ',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
      </svg>
    ),
  },
  {
    path: '/phukhoa/lich-hen',
    label: 'Lịch hẹn',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="5" width="18" height="16" rx="2"/>
        <path d="M8 3v4M16 3v4M3 10h18"/>
      </svg>
    ),
  },
  {
    path: '/phukhoa/kien-thuc',
    label: 'Kiến thức',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
      </svg>
    ),
  },
];

export default function GYBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/phukhoa') return location.pathname === '/phukhoa';
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex bg-surface border-t-[0.5px] border-gy-md">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 py-2 gap-[3px] transition-colors"
              style={{ color: active ? '#C96080' : '#E8B8C4' }}
            >
              {item.icon}
              <span
                className="text-[10px] font-semibold tracking-wide"
                style={{ color: active ? '#C96080' : '#E8B8C4' }}
              >
                {item.label}
              </span>
              {active && (
                <div className="absolute top-0 w-5 h-[2px] bg-gy-dk rounded-b-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
