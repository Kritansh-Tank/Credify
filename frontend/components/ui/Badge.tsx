'use client';

interface BadgeProps {
  role: 'admin' | 'user' | 'owner';
}

const styles = {
  admin: 'bg-purple-100 text-purple-700 border border-purple-200',
  user: 'bg-blue-100 text-blue-700 border border-blue-200',
  owner: 'bg-amber-100 text-amber-700 border border-amber-200',
};

const labels = {
  admin: 'Admin',
  user: 'User',
  owner: 'Owner',
};

export function RoleBadge({ role }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[role]}`}>
      {labels[role]}
    </span>
  );
}

interface StatusBadgeProps {
  label: string;
  color?: 'green' | 'red' | 'blue' | 'gray';
}

const statusStyles = {
  green: 'bg-green-100 text-green-700 border border-green-200',
  red: 'bg-red-100 text-red-700 border border-red-200',
  blue: 'bg-blue-100 text-blue-700 border border-blue-200',
  gray: 'bg-slate-100 text-slate-600 border border-slate-200',
};

export function StatusBadge({ label, color = 'gray' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[color]}`}>
      {label}
    </span>
  );
}
