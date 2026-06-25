'use client';

import { ReactNode } from 'react';
import { LayoutDashboard, Key } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

const navItems = [
  { href: '/owner/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/change-password', label: 'Change Password', icon: <Key className="w-4 h-4" /> },
];

export default function OwnerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar navItems={navItems} />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
