import React from 'react';

export default function QueueTab() {
  const mockQueue = [
    { id: 1, name: 'Nguyễn Thị Hoa', time: '08:30 AM', type: 'Sản khoa', status: 'Đang đợi' },
    { id: 2, name: 'Lê Mai Phương', time: '09:00 AM', type: 'Phụ khoa', status: 'Đang đợi' },
    { id: 3, name: 'Trần Bích Ngọc', time: '09:15 AM', type: 'Sản khoa', status: 'Đã check-in' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-[#3E2A3D]">Hàng Đợi Hôm Nay</h2>
        <button className="bg-[#C7A47B] text-white px-4 py-2 rounded-xl shadow-sm hover:opacity-90 transition">
          + Thêm Bệnh Nhân
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#C7A47B]/20 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="text-[#3E2A3D]/70 border-b border-[#C7A47B]/20">
              <th className="pb-3 font-medium">Bệnh nhân</th>
              <th className="pb-3 font-medium">Thời gian</th>
              <th className="pb-3 font-medium">Khám</th>
              <th className="pb-3 font-medium">Trạng thái</th>
              <th className="pb-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {mockQueue.map(item => (
              <tr key={item.id} className="border-b border-[#C7A47B]/10 last:border-0 hover:bg-[#F5EBE3]/30 transition">
                <td className="py-4 font-medium text-[#3E2A3D]">{item.name}</td>
                <td className="py-4 text-[#3E2A3D]/80">{item.time}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${item.type === 'Sản khoa' ? 'bg-[#2E1F2D]/10 text-[#2E1F2D]' : 'bg-[#F4B6C2]/20 text-[#3E2A3D]'}`}>
                    {item.type}
                  </span>
                </td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${item.status === 'Đã check-in' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 text-right">
                  {item.status !== 'Đã check-in' && (
                    <button className="text-sm bg-[#3E2A3D] text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition shadow-sm">
                      Check-in
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
