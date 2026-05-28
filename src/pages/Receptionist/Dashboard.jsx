import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import QueueTab from './QueueTab';
import AppointmentsTab from './AppointmentsTab';
import InviteCodesTab from './InviteCodesTab';
import UploadTab from './UploadTab';

export default function ReceptionistDashboard() {
  const { appRole } = useAuth();
  const [activeTab, setActiveTab] = useState('queue');

  // Block doctors from accessing Receptionist Dashboard
  if (appRole === 'doctor') {
    return <Navigate to="/bacsi" replace />;
  }

  const tabs = [
    { id: 'queue', label: 'Hàng Đợi' },
    { id: 'appointments', label: 'Lịch Hẹn' },
    { id: 'codes', label: 'Thẻ Thành Viên' },
    { id: 'upload', label: 'Nhập Hồ Sơ' },
  ];

  return (
    <div className="min-h-screen bg-[#F5EBE3] p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-[#3E2A3D] mb-2">Trung Tâm Vận Hành</h1>
          <p className="text-[#3E2A3D]/70">Quản lý luồng bệnh nhân và điều phối phòng khám trực tuyến.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto space-x-2 bg-white p-2 rounded-2xl shadow-sm mb-8 border border-[#C7A47B]/20 hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-colors duration-200 flex-1 md:flex-none text-center ${
                activeTab === tab.id
                  ? 'bg-[#C7A47B] text-white shadow-sm'
                  : 'text-[#3E2A3D]/60 hover:text-[#3E2A3D] hover:bg-[#F5EBE3]/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'queue' && <QueueTab />}
          {activeTab === 'appointments' && <AppointmentsTab />}
          {activeTab === 'codes' && <InviteCodesTab />}
          {activeTab === 'upload' && <UploadTab />}
        </div>
      </div>
    </div>
  );
}
