import React from 'react';
import './gy-theme.css';
import CycleTracker from './components/CycleTracker';
import PapSmearAlert from './components/PapSmearAlert';

const GYDashboard = () => {
  return (
    <div className="gy-workspace">
      <div className="gy-container">
        
        {/* Header Section */}
        <header className="gy-header">
          <h1 className="gy-header-title">Chào buổi sáng, Hoa</h1>
          <p className="gy-header-subtitle">Hãy cùng chăm sóc sức khỏe của bạn hôm nay nhé.</p>
        </header>

        {/* Main Content Area */}
        <main>
          {/* Cycle Tracker Component */}
          <CycleTracker />

          {/* Pap Smear Alert Component */}
          <PapSmearAlert />

          {/* Additional static card for aesthetic and future-proofing */}
          <div className="gy-card" style={{ background: 'transparent', border: '1px dashed var(--gy-border)', boxShadow: 'none' }}>
            <h2 className="gy-card-title serif-font" style={{ fontSize: '1.2rem', color: 'var(--gy-plum-light)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              Hồ sơ Phụ khoa
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--gy-text-muted)' }}>
              Toàn bộ kết quả khám, soi cổ tử cung và phác đồ điều trị của bạn được lưu trữ an toàn tại đây.
            </p>
            <button className="gy-btn-primary" style={{ marginTop: '1rem', background: 'transparent', border: '1px solid var(--gy-pink-accent)' }}>
              Xem hồ sơ
            </button>
          </div>
        </main>
        
      </div>
    </div>
  );
};

export default GYDashboard;
