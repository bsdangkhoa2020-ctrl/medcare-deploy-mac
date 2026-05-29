import React, { useState } from 'react';

const CycleTracker = () => {
  // Mock data for the cycle tracker
  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const year = today.getFullYear();
  
  // Assuming a 28-day cycle, last period was 14 days ago
  const daysLeft = 14; 
  const predictedNextPeriod = new Date(today);
  predictedNextPeriod.setDate(today.getDate() + daysLeft);

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // Generating a simplified calendar view for the current month
  // 1. Find the first day of the month
  const firstDayOfMonth = new Date(year, today.getMonth(), 1).getDay();
  // 2. Find total days in month
  const daysInMonth = new Date(year, today.getMonth() + 1, 0).getDate();
  
  const calendarDays = [];
  
  // Fill empty spaces before the 1st
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ day: null, status: 'empty' });
  }
  
  // Fill the days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    let status = 'normal';
    
    // Mocking past menstruation (e.g., 14-18 days ago)
    const mockLastPeriodStart = today.getDate() - 18;
    const mockLastPeriodEnd = today.getDate() - 14;
    
    // Mocking ovulation (e.g., today)
    const mockOvulation = today.getDate();
    
    // Mocking next menstruation
    const mockNextPeriodStart = predictedNextPeriod.getDate();
    
    if (i >= mockLastPeriodStart && i <= mockLastPeriodEnd) {
      status = 'menstruation';
    } else if (i === mockOvulation) {
      status = 'ovulation';
    } else if (i === today.getDate()) {
      status = 'today';
    } else if (i >= mockNextPeriodStart && i <= mockNextPeriodStart + 4 && predictedNextPeriod.getMonth() === today.getMonth()) {
      status = 'future-menstruation';
    }
    
    calendarDays.push({ day: i, status });
  }

  return (
    <div className="gy-card">
      <h2 className="gy-card-title serif-font">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gy-rosewood)' }}>
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        Theo dõi chu kỳ
      </h2>
      
      <div className="gy-cycle-status">
        <div className="gy-cycle-days-left serif-font">{daysLeft}</div>
        <div className="gy-cycle-label">Ngày nữa đến kỳ tiếp theo</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--gy-text-muted)', marginTop: '0.5rem' }}>
          Dự kiến: {predictedNextPeriod.toLocaleDateString('vi-VN')}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="serif-font" style={{ fontSize: '1.2rem', margin: 0 }}>{currentMonth} {year}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--gy-text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--gy-pink-light)' }}></span> Đèn đỏ
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', border: '1px dashed var(--gy-pink-accent)' }}></span> Rụng trứng
          </span>
        </div>
      </div>

      <div className="gy-calendar">
        {daysOfWeek.map((day, idx) => (
          <div key={`header-${idx}`} className="gy-calendar-day-header">{day}</div>
        ))}
        
        {calendarDays.map((item, idx) => (
          <div 
            key={`day-${idx}`} 
            className={`gy-calendar-day ${item.status}`}
          >
            {item.day}
          </div>
        ))}
      </div>
      
      <button className="gy-btn-primary" style={{ marginTop: '1.5rem' }}>
        Ghi chú hôm nay
      </button>
    </div>
  );
};

export default CycleTracker;
