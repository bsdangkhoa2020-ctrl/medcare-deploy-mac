import React from 'react';

export default function AppointmentsTab() {
  const mockAppointments = [
    { id: 1, date: '29/05/2026', time: '14:00', name: 'Hoàng Ánh', type: 'Sản khoa' },
    { id: 2, date: '30/05/2026', time: '09:30', name: 'Đinh Hương', type: 'Phụ khoa' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-[#3E2A3D]">Quản Trị Lịch Hẹn</h2>
        <div className="flex gap-2">
          <button className="bg-white text-[#3E2A3D] border border-[#C7A47B] px-4 py-2 rounded-xl shadow-sm hover:bg-[#F5EBE3] transition hidden md:block">
            Lịch Bác sĩ
          </button>
          <button className="bg-[#C7A47B] text-white px-4 py-2 rounded-xl shadow-sm hover:opacity-90 transition">
            + Đặt Lịch Mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockAppointments.map(appt => (
          <div key={appt.id} className="bg-white p-5 rounded-2xl shadow-sm border border-[#C7A47B]/20 flex justify-between items-center transition hover:shadow-md">
            <div>
              <p className="font-semibold text-[#3E2A3D] text-lg">{appt.name}</p>
              <p className="text-sm text-[#3E2A3D]/70">{appt.date} • {appt.time}</p>
              <p className="text-sm mt-1 font-medium text-[#C7A47B]">{appt.type}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button className="text-sm bg-[#3E2A3D] text-white px-4 py-1.5 rounded-lg hover:opacity-90 transition shadow-sm">Sửa</button>
              <button className="text-sm bg-red-50 text-red-600 px-4 py-1.5 rounded-lg hover:bg-red-100 transition">Dời/Huỷ</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
