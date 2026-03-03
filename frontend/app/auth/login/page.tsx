'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getAuthUser, setAuthData } from '@/lib/auth';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { user, access_token } = response.data;
      const existingUser = getAuthUser();
      const persistedAccountType =
        existingUser && existingUser.email === user.email
          ? existingUser.accountType
          : undefined;

      setAuthData(
        {
          ...user,
          accountType:
            persistedAccountType ||
            (user.role === 'CUSTOMER'
              ? 'CUSTOMER'
              : user.role === 'STAFF'
                ? 'STAFF'
                : user.role === 'ADMIN'
                  ? 'ADMIN'
                  : 'VENDOR'),
        },
        access_token,
      );
      if (user.role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else if (user.role === 'STAFF') {
        router.push('/dashboard/staff');
      } else if (user.role === 'VENDOR') {
        router.push('/dashboard/vendor');
      } else {
        router.push('/dashboard/customer');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="card">
        <h1 className="mb-6 text-2xl font-bold text-[#b88d4a]">Login</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#8f6b35]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#8f6b35]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full border border-[#b88d4a] bg-[#b88d4a] px-6 py-2 font-semibold text-[#171108] transition hover:bg-[#d1a762] disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[#6f5633]">
          Don't have an account?{' '}
          <Link
            href="/auth/register"
            className="inline-block rounded-full border border-[#c9ad82] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#8f6b35] transition hover:border-[#b88d4a] hover:text-[#b88d4a]"
          >
            Register here
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-[#6f5633]">
          <Link
            href="/auth/admin-login"
            className="inline-block rounded-full border border-[#c9ad82] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#8f6b35] transition hover:border-[#b88d4a] hover:text-[#b88d4a]"
          >
            Admin login
          </Link>
        </p>
      </div>
    </div>
  );
}
