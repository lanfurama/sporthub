import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background text-gray-100 flex font-sans">
      {/* Animated Background Elements */}
      <div className="bg-shape shape-1 opacity-[0.03]" />
      <div className="bg-shape shape-2 opacity-[0.03]" />
      
      <AdminSidebar />
      <main className="flex-1 ml-[220px] min-h-screen relative z-10">
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
