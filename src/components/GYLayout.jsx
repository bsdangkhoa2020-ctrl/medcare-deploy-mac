import { Outlet } from 'react-router-dom';
import GYBottomNav from './Patient/GYBottomNav';

export default function GYLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gy-bg">
      <main className="flex-1 w-full max-w-[480px] mx-auto relative shadow-2xl overflow-hidden bg-gy-bg pb-[60px]">
        <Outlet />
      </main>
      <div className="w-full max-w-[480px] mx-auto">
        <GYBottomNav />
      </div>
    </div>
  );
}
