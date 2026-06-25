'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  color?: 'indigo' | 'emerald' | 'amber';
}

const colorStyles = {
  indigo: { bg: 'bg-indigo-50', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', text: 'text-indigo-600' },
  emerald: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', text: 'text-emerald-600' },
  amber: { bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', text: 'text-amber-600' },
};

export function StatCard({ label, value, icon, color = 'indigo' }: StatCardProps) {
  const styles = colorStyles[color];
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow`}>
      <div className={`${styles.iconBg} p-3.5 rounded-xl ${styles.iconColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
