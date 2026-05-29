import React from 'react';

const PapSmearAlert = () => {
  // Mock data for PAP Smear alert
  const lastTestDate = new Date();
  lastTestDate.setFullYear(lastTestDate.getFullYear() - 1); // 1 year ago
  lastTestDate.setMonth(lastTestDate.getMonth() + 1); // Plus 1 month to simulate "overdue soon" or "just overdue"
  
  // Let's mock a scenario where the test is overdue
  const isOverdue = true;
  
  return (
    <div className={`gy-card ${isOverdue ? 'gy-alert-urgent' : ''}`}>
      <h2 className="gy-card-title serif-font" style={{ color: isOverdue ? 'var(--gy-rosewood)' : 'var(--gy-plum-dark)' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        Tầm soát Cổ tử cung
      </h2>
      
      <div className="gy-pap-status-text">
        {isOverdue ? "Đã đến hạn tầm soát định kỳ (PAP Smear)" : "Sức khỏe của bạn đang được bảo vệ tốt"}
      </div>

      <div style={{ fontSize: '0.9rem', color: 'var(--gy-plum-light)', lineHeight: 1.5 }}>
        Lần xét nghiệm gần nhất của bạn là cách đây hơn 1 năm. Tầm soát định kỳ giúp phát hiện sớm và phòng ngừa các nguy cơ ung thư cổ tử cung hiệu quả nhất.
      </div>

      <div className="gy-pap-timeline">
        <div className="gy-pap-point">
          <div className="gy-pap-dot"></div>
          <div className="gy-pap-date">{lastTestDate.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}</div>
        </div>
        <div className="gy-pap-point">
          <div className="gy-pap-dot active"></div>
          <div className="gy-pap-date" style={{ color: 'var(--gy-rosewood)' }}>Hiện tại</div>
        </div>
      </div>

      <button className="gy-btn-primary">
        Đặt lịch xét nghiệm ngay
      </button>
    </div>
  );
};

export default PapSmearAlert;
