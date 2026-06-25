'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Users, Store, Key } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

const adminNav = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/admin/users', label: 'Users', icon: <Users className="w-4 h-4" /> },
  { href: '/admin/stores', label: 'Stores', icon: <Store className="w-4 h-4" /> },
  { href: '/change-password', label: 'Change Password', icon: <Key className="w-4 h-4" /> },
];
const userNav = [
  { href: '/stores', label: 'Browse Stores', icon: <Store className="w-4 h-4" /> },
  { href: '/change-password', label: 'Change Password', icon: <Key className="w-4 h-4" /> },
];
const ownerNav = [
  { href: '/owner/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/change-password', label: 'Change Password', icon: <Key className="w-4 h-4" /> },
];

export default function ChangePasswordLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const nav = user?.role === 'admin' ? adminNav : user?.role === 'owner' ? ownerNav : userNav;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar navItems={nav} />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
