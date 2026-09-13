import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/admin/login');
  }



  return (
    <div className="min-h-screen bg-neutral-50 md:flex">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
