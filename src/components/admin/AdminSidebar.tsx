'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Utensils, Tag, QrCode, Star, Menu, X, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

const links = [
  { href: '/admin/dashboard', label: 'Özet', icon: LayoutDashboard },
  { href: '/admin/categories', label: 'Kategoriler', icon: Tag },
  { href: '/admin/products', label: 'Ürünler', icon: Utensils },
  { href: '/admin/feedback', label: 'Değerlendirmeler', icon: Star },
  { href: '/admin/qrcode', label: 'QR Kod', icon: QrCode },
];

function NavLinks({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  return (
    <>
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href || (link.href === '/admin/dashboard' && pathname === '/admin');
        return (
          <Link 
            key={link.href} 
            href={link.href}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 md:py-2.5 rounded-xl transition-all ${
              isActive 
                ? 'bg-[#e3372c] text-white font-bold shadow-sm' 
                : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 font-medium'
            }`}
          >
            <Icon className="w-5 h-5" />
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
        <h1 className="text-xl font-black text-[#e3372c] tracking-tight">Moda Berliner</h1>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors active:scale-95"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar (Desktop fixed, Mobile animated drawer) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-[280px] md:w-64 bg-white border-r border-neutral-200 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-200 shrink-0">
          <h1 className="text-xl font-black text-[#e3372c] tracking-tight">Moda Berliner</h1>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <NavLinks pathname={pathname} onClose={() => setIsOpen(false)} />
        </nav>
        
        <div className="p-4 border-t border-neutral-200 shrink-0">
          <button 
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex w-full items-center gap-3 px-3 py-3 md:py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm"
          >
            <LogOut className="w-5 h-5" />
            Çıkış Yap
          </button>
        </div>
      </aside>
    </>
  );
}
