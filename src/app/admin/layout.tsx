'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Wrench,
  Image as ImageIcon,
  Star,
  ShoppingBag,
  Boxes,
  Mail,
  ShieldAlert,
  LogOut,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { UserRole } from '@/types';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('owner');
  const [email, setEmail] = useState('owner@speederspider.com');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Avoid running on login page
    if (pathname === '/admin/login') return;

    const storedRole = (localStorage.getItem('admin_role') as UserRole) || 'owner';
    const storedEmail = localStorage.getItem('admin_email') || `${storedRole}@speederspider.com`;
    setRole(storedRole);
    setEmail(storedEmail);
  }, [pathname]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_role');
    localStorage.removeItem('admin_email');
    document.cookie = 'admin_role=; path=/; max-age=0';
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'manager', 'staff'] },
    { href: '/admin/services', label: 'Services', icon: Wrench, roles: ['owner', 'manager'] },
    { href: '/admin/portfolio', label: 'Portfolio', icon: ImageIcon, roles: ['owner', 'manager'] },
    { href: '/admin/products', label: 'Products', icon: ShoppingBag, roles: ['owner', 'manager'] },
    { href: '/admin/testimonials', label: 'Testimonials', icon: Star, roles: ['owner', 'manager'] },
    { href: '/admin/inventory', label: 'Internal Inventory', icon: Boxes, roles: ['owner', 'manager', 'staff'] },
    { href: '/admin/enquiries', label: 'Contact Enquiries', icon: Mail, roles: ['owner', 'manager', 'staff'] },
    { href: '/admin/audit-logs', label: 'Security & Audit', icon: ShieldAlert, roles: ['owner'] },
  ];

  return (
    <div className="min-h-screen bg-brand-deepNavy flex flex-col md:flex-row text-gray-200">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-brand-navy border-b border-brand-steelBlue/40">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg bg-brand-deepNavy border border-brand-cyan/40 p-0.5 overflow-hidden shrink-0">
            <Image
              src="/images/speederspider-crest-car.webp"
              alt="SpeederSpider"
              width={32}
              height={32}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-display font-bold uppercase tracking-wider text-white">
            SPEEDER<span className="text-brand-cyan">ADMIN</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-gray-300 hover:text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${mobileOpen ? 'block' : 'hidden'
          } md:block w-full md:w-64 bg-brand-navy border-r border-brand-steelBlue/30 flex flex-col justify-between p-6 shrink-0 z-30`}
      >
        <div className="space-y-6">
          {/* Brand & Portal Header */}
          <div className="hidden md:flex items-center gap-3 pb-4 border-b border-brand-steelBlue/30">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-brand-deepNavy border border-brand-cyan/40 p-1 shrink-0 overflow-hidden shadow-[0_0_10px_rgba(91,192,222,0.25)]">
              <Image
                src="/images/speederspider-crest-car.webp"
                alt="SpeederSpider Admin"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-bold uppercase font-display tracking-wider text-white">
                SPEEDER<span className="text-brand-cyan">ADMIN</span>
              </p>
              <p className="text-[10px] font-mono text-gray-400">DUBAI WORKSHOP PORTAL</p>
            </div>
          </div>

          {/* Active Profile Info */}
          <div className="p-3 bg-brand-deepNavy/80 border border-brand-steelBlue/40 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-gray-400">Current Role</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40">
                {role}
              </span>
            </div>
            <p className="text-xs font-mono text-gray-300 truncate">{email}</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const hasAccess = item.roles.includes(role);
              const isActive = pathname === item.href;
              const Icon = item.icon;

              if (!hasAccess) {
                return (
                  <div
                    key={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono text-gray-600 cursor-not-allowed opacity-50"
                    title={`Restricted to ${item.roles.join(', ')}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    <span className="ml-auto text-[10px] uppercase">Locked</span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-colors ${isActive
                      ? 'bg-brand-cyan text-brand-deepNavy font-bold shadow-[0_0_15px_rgba(91,192,222,0.3)]'
                      : 'text-gray-300 hover:bg-brand-steelBlue/30 hover:text-brand-cyan'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: View Live Website & Sign Out */}
        <div className="pt-6 border-t border-brand-steelBlue/30 space-y-2">
          <Link
            href="/en"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-mono text-gray-400 hover:text-white hover:bg-brand-deepNavy rounded-lg transition-colors"
          >
            <span>Live Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-mono text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
