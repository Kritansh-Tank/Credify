'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { saveAuth } from '@/lib/auth';
import api from '@/lib/api';

interface FormErrors {
  name?: string;
  email?: string;
  address?: string;
  password?: string;
}

function validate(form: { name: string; email: string; address: string; password: string }): FormErrors {
  const errs: FormErrors = {};
  if (form.name.length < 20 || form.name.length > 60)
    errs.name = 'Name must be 20–60 characters';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errs.email = 'Enter a valid email address';
  if (form.address.length > 400)
    errs.address = 'Address must be at most 400 characters';
  if (form.password.length < 8 || form.password.length > 16)
    errs.password = 'Password must be 8–16 characters';
  else if (!/[A-Z]/.test(form.password))
    errs.password = 'Password must contain at least one uppercase letter';
  else if (!/[^A-Za-z0-9]/.test(form.password))
    errs.password = 'Password must contain at least one special character';
  return errs;
}

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setServerError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', form);
      saveAuth(data.token, data.user);
      document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 3600}`;
      setUser(data.user);
      router.push('/stores');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [field]: e.target.value });
    setErrors({ ...errors, [field]: undefined });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center bg-white/20 p-3 rounded-2xl mb-3">
              <Star className="w-8 h-8 text-white fill-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create account</h1>
            <p className="text-indigo-200 text-sm mt-1">Join Credify today</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            <Input
              id="signup-name"
              label="Full name"
              type="text"
              placeholder="Min. 20 characters"
              value={form.name}
              onChange={update('name')}
              error={errors.name}
              hint="20–60 characters"
              required
            />

            <Input
              id="signup-email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
              error={errors.email}
              required
              autoComplete="email"
            />

            <Textarea
              id="signup-address"
              label="Address"
              placeholder="Your address (max 400 characters)"
              value={form.address}
              onChange={update('address')}
              error={errors.address}
            />

            <div className="relative">
              <Input
                id="signup-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="8–16 chars, 1 uppercase, 1 special"
                value={form.password}
                onChange={update('password')}
                error={errors.password}
                hint="8–16 characters with at least 1 uppercase letter and 1 special character"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {serverError}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full" id="signup-submit-btn">
              Create account
            </Button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
