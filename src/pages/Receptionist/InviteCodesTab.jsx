import React, { useState } from 'react';

export default function InviteCodesTab() {
  const [codes, setCodes] = useState([
    { id: 1, code: 'BSTUAN-88FA', status: 'Đã sử dụng', user: 'Lê Mai Phương' },
    { id: 2, code: 'BSTUAN-99BB', status: 'Chưa sử dụng', user: '-' },
  ]);

  const generateCode = () => {
    const newCode = 'BSTUAN-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    setCodes([{ id: Date.now(), code: newCode, status: 'Chưa sử dụng', user: '-' }, ...codes]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-[#3E2A3D]">Cấp Thẻ Thành Viên</h2>
        <button 
          onClick={generateCode}
          className="bg-[#C7A47B] text-white px-4 py-2 rounded-xl shadow-sm hover:opacity-90 transition"
        >
          + Tạo Mã Mới
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#C7A47B]/20">
        <p className="text-[#3E2A3D]/80 mb-6 text-sm">
          Mã định danh được dùng để bệnh nhân đăng ký tài khoản và tự động kết nối với hồ sơ bệnh án tại phòng khám.
        </p>
        
        <div className="space-y-3">
          {codes.map(item => (
            <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#F5EBE3]/30 rounded-xl border border-[#C7A47B]/10 gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white px-4 py-2 rounded-lg font-mono font-bold text-[#3E2A3D] border border-[#C7A47B]/30 tracking-wider shadow-sm">
                  {item.code}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-[#3E2A3D]">
                    Trạng thái: <span className={item.status === 'Chưa sử dụng' ? 'text-green-600' : 'text-gray-500'}>{item.status}</span>
                  </p>
                  {item.user !== '-' && <p className="text-[#3E2A3D]/70 mt-0.5">Người dùng: {item.user}</p>}
                </div>
              </div>
              <button 
                className="text-sm bg-white border border-[#C7A47B] text-[#C7A47B] hover:bg-[#C7A47B] hover:text-white px-4 py-2 rounded-lg transition font-medium shadow-sm w-full md:w-auto"
                onClick={() => navigator.clipboard.writeText(item.code)}
              >
                Copy Mã
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
