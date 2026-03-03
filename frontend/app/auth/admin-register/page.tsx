'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { setAuthData } from '@/lib/auth';

export default function AdminRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/admin/register', {
        name,
        email,
        password,
        adminSecret,
      });

      const { user, access_token } = response.data;
      setAuthData(user, access_token);
      router.push('/dashboard/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Admin registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="card">
        <h1 className="mb-6 text-2xl font-bold text-[#b88d4a]">Admin Registration</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#8f6b35]">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              required
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium mb-1 text-[#8f6b35]">
              Admin Registration Secret
            </label>
            <input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              className="input"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-full border border-[#b88d4a] bg-[#b88d4a] px-6 py-2 font-semibold text-[#171108] transition hover:bg-[#d1a762] disabled:opacity-60">
            {loading ? 'Creating admin...' : 'Create Admin Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[#6f5633]">
          <Link
            href="/auth/admin-login"
            className="inline-block rounded-full border border-[#c9ad82] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#8f6b35] transition hover:border-[#b88d4a] hover:text-[#b88d4a]"
          >
            Go to admin login
          </Link>
        </p>
      </div>
    </div>
  );
}
