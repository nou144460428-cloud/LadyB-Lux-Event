'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { setAuthData } from '@/lib/auth';
import Link from 'next/link';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<'CUSTOMER' | 'DECORATOR' | 'VENDOR'>('CUSTOMER');
  const [phone, setPhone] = useState('');
  const [nextOfKinName, setNextOfKinName] = useState('');
  const [nextOfKinPhone, setNextOfKinPhone] = useState('');
  const [nextOfKinRelationship, setNextOfKinRelationship] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isDecorator = accountType === 'DECORATOR';
      if (isDecorator && (!phone.trim() || !nextOfKinName.trim() || !nextOfKinPhone.trim())) {
        setError('Decorator phone and next-of-kin name/phone are required.');
        setLoading(false);
        return;
      }

      const role = accountType === 'CUSTOMER' ? 'CUSTOMER' : 'VENDOR';
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        accountType,
        phone: phone.trim() || undefined,
        nextOfKinName: nextOfKinName.trim() || undefined,
        nextOfKinPhone: nextOfKinPhone.trim() || undefined,
        nextOfKinRelationship: nextOfKinRelationship.trim() || undefined,
      });

      const { user, access_token } = response.data;
      setAuthData({ ...user, accountType }, access_token);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="card">
        <h1 className="mb-6 text-2xl font-bold text-[#b88d4a]">Register</h1>

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
            <label className="block text-sm font-medium mb-1 text-[#8f6b35]">I am a:</label>
            <div className="flex gap-4">
              <label className="flex items-center text-[#8f6b35]">
                <input
                  type="radio"
                  value="CUSTOMER"
                  checked={accountType === 'CUSTOMER'}
                  onChange={(e) =>
                    setAccountType(e.target.value as 'CUSTOMER' | 'DECORATOR' | 'VENDOR')
                  }
                  className="mr-2"
                />
                Customer
              </label>
              <label className="flex items-center text-[#8f6b35]">
                <input
                  type="radio"
                  value="DECORATOR"
                  checked={accountType === 'DECORATOR'}
                  onChange={(e) =>
                    setAccountType(e.target.value as 'CUSTOMER' | 'DECORATOR' | 'VENDOR')
                  }
                  className="mr-2"
                />
                Decorator
              </label>
              <label className="flex items-center text-[#8f6b35]">
                <input
                  type="radio"
                  value="VENDOR"
                  checked={accountType === 'VENDOR'}
                  onChange={(e) =>
                    setAccountType(e.target.value as 'CUSTOMER' | 'DECORATOR' | 'VENDOR')
                  }
                  className="mr-2"
                />
                Vendor
              </label>
            </div>
          </div>

          {accountType === 'DECORATOR' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#8f6b35]">
                  Decorator Contact Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input"
                  required
                  placeholder="e.g. +2348012345678"
                />
              </div>

              <div className="rounded border border-[#e8dbc8] bg-[#fff9f0] p-3">
                <p className="mb-2 text-xs uppercase tracking-[0.08em] text-[#8f6b35]">
                  Next of Kin Details (Required)
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={nextOfKinName}
                    onChange={(e) => setNextOfKinName(e.target.value)}
                    className="input"
                    required
                    placeholder="Next of kin full name"
                  />
                  <input
                    type="tel"
                    value={nextOfKinPhone}
                    onChange={(e) => setNextOfKinPhone(e.target.value)}
                    className="input"
                    required
                    placeholder="Next of kin phone"
                  />
                  <input
                    type="text"
                    value={nextOfKinRelationship}
                    onChange={(e) => setNextOfKinRelationship(e.target.value)}
                    className="input"
                    placeholder="Relationship (optional)"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full border border-[#b88d4a] bg-[#b88d4a] px-6 py-2 font-semibold text-[#171108] transition hover:bg-[#d1a762] disabled:opacity-60"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[#6f5633]">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="inline-block rounded-full border border-[#c9ad82] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#8f6b35] transition hover:border-[#b88d4a] hover:text-[#b88d4a]"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
