'use client';

import Link from 'next/link';
import { useCart } from '@/store/cart';
import { useRentalCart } from '@/store/rentalCart';
import {
  getAuthUser,
  clearAuthData,
  isDecoratorAccount,
  type AuthUser,
} from '@/lib/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const { getItemCount } = useCart();
  const { getItemCount: getRentalItemCount } = useRentalCart();
  const router = useRouter();

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

  const handleLogout = () => {
    clearAuthData();
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[#4a3a22] bg-[rgba(13,10,6,0.94)] text-[#f2e9dc] backdrop-blur">
      <div className="h-[2px] w-full bg-[linear-gradient(90deg,rgba(180,143,79,0)_0%,rgba(214,181,124,0.75)_50%,rgba(180,143,79,0)_100%)]" />
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="text-[#d6b57c]">✦</span>
          <Link
            href="/"
            className="text-xl uppercase tracking-[0.18em] text-[#d6b57c] md:text-2xl"
            style={{ fontFamily: 'Didot, Garamond, "Times New Roman", serif' }}
          >
            LadyB Lux Events
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm md:gap-6">
          <Link
            href="/"
            className="uppercase tracking-[0.14em] text-[#f4eadf] transition hover:text-[#d6b57c]"
          >
            Home
          </Link>
          <Link
            href="/samples"
            className="uppercase tracking-[0.14em] text-[#f4eadf] transition hover:text-[#d6b57c]"
          >
            Recent Event
          </Link>
          {user ? (
            <>
              <Link
                href="/event/create"
                className="uppercase tracking-[0.14em] text-[#f4eadf] transition hover:text-[#d6b57c]"
              >
                Create Event
              </Link>
              {user.role === 'VENDOR' ? (
                <Link
                  href="/dashboard/vendor"
                  className="uppercase tracking-[0.14em] text-[#f4eadf] transition hover:text-[#d6b57c]"
                >
                  Dashboard
                </Link>
              ) : user.role === 'STAFF' ? (
                <Link
                  href="/dashboard/staff"
                  className="uppercase tracking-[0.14em] text-[#f4eadf] transition hover:text-[#d6b57c]"
                >
                  Staff
                </Link>
              ) : user.role === 'ADMIN' ? (
                <Link
                  href="/dashboard/admin"
                  className="uppercase tracking-[0.14em] text-[#f4eadf] transition hover:text-[#d6b57c]"
                >
                  Admin
                </Link>
              ) : (
                <Link
                  href="/dashboard/customer"
                  className="uppercase tracking-[0.14em] text-[#f4eadf] transition hover:text-[#d6b57c]"
                >
                  My Orders
                </Link>
              )}
              <Link
                href="/cart"
                className="uppercase tracking-[0.14em] text-[#f4eadf] transition hover:text-[#d6b57c]"
              >
                Cart <span className="ml-1 text-[#d6b57c]">({getItemCount()})</span>
              </Link>
              {isDecoratorAccount(user) && (
                <Link
                  href="/rentals/cart"
                  className="uppercase tracking-[0.14em] text-[#f4eadf] transition hover:text-[#d6b57c]"
                >
                  Rentals <span className="ml-1 text-[#d6b57c]">({getRentalItemCount()})</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="rounded-full border border-[#7f6741] px-4 py-2 text-xs uppercase tracking-[0.12em] text-[#f4eadf] transition hover:border-[#d6b57c] hover:text-[#d6b57c]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-full border border-[#7f6741] px-4 py-2 text-xs uppercase tracking-[0.12em] text-[#f4eadf] transition hover:border-[#d6b57c] hover:text-[#d6b57c]"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="rounded-full border border-[#d6b57c] bg-[#d6b57c] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#171108] transition hover:bg-[#ebcf9f]"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
