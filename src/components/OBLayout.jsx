import { Outlet } from 'react-router-dom';
import OBBottomNav from './Patient/OBBottomNav';

export default function OBLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <main className="flex-1 w-full max-w-[480px] mx-auto relative shadow-2xl overflow-hidden bg-bg pb-[60px]">
        <Outlet />
      </main>
      <div className="w-full max-w-[480px] mx-auto">
        <OBBottomNav />
      </div>
    </div>
  );
}
