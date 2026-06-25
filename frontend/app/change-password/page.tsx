'use client';

import { useState } from 'react';
import { Key, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

function validate(current: string, newPwd: string): { current?: string; newPwd?: string } {
  const errs: { current?: string; newPwd?: string } = {};
  if (!current) errs.current = 'Current password is required';
  if (newPwd.length < 8 || newPwd.length > 16) errs.newPwd = 'Password must be 8–16 characters';
  else if (!/[A-Z]/.test(newPwd)) errs.newPwd = 'Must contain at least one uppercase letter';
  else if (!/[^A-Za-z0-9]/.test(newPwd)) errs.newPwd = 'Must contain at least one special character';
  return errs;
}

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [show, setShow] = useState({ current: false, new: false });
  const [errors, setErrors] = useState<{ current?: string; newPwd?: string }>({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form.currentPassword, form.newPassword);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setServerError('');
    setLoading(true);
    try {
      await api.patch('/auth/password', form);
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-xl">
            <Key className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Change Password</h1>
            <p className="text-sm text-slate-500">Update your account password</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {success ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-900">Password updated!</p>
              <p className="text-sm text-slate-500 mt-1">Your password has been changed successfully.</p>
            </div>
            <Button variant="secondary" onClick={() => setSuccess(false)} id="change-pwd-again-btn">
              Change again
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Input
                id="current-password"
                label="Current password"
                type={show.current ? 'text' : 'password'}
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                error={errors.current}
                placeholder="Your current password"
              />
              <button type="button" onClick={() => setShow({ ...show, current: !show.current })}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600">
                {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Input
                id="new-password"
                label="New password"
                type={show.new ? 'text' : 'password'}
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                error={errors.newPwd}
                placeholder="8–16 chars, 1 uppercase, 1 special"
                hint="8–16 characters with at least 1 uppercase letter and 1 special character"
              />
              <button type="button" onClick={() => setShow({ ...show, new: !show.new })}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600">
                {show.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {serverError}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" id="change-pwd-submit-btn">
              Update password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
