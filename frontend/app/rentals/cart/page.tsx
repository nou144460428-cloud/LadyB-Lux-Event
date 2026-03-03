'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RentalCartItem from '@/components/RentalCartItem';
import { useRentalCart } from '@/store/rentalCart';
import { getAuthUser, isDecoratorAccount } from '@/lib/auth';

export default function RentalCartPage() {
  const { items, getSubtotal, getCautionTotal, getTotal, clearCart } = useRentalCart();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = getAuthUser();
    const canRent = isDecoratorAccount(user);
    setAllowed(canRent);
    if (!canRent) {
      router.push('/vendors/event-planners');
    }
  }, [router]);

  if (!allowed) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold">Decoration Rentals Cart</h1>
        <div className="card py-12 text-center">
          <p className="mb-4 text-[#6f5633]">No rental materials added yet.</p>
          <Link
            href="/vendors/decorations-rentals"
            className="inline-block rounded-full border border-[#b88d4a] bg-[#b88d4a] px-5 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#171108] transition hover:bg-[#d1a762]"
          >
            Browse Materials
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Decoration Rentals Cart</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <RentalCartItem key={item.id} item={item} />
          ))}
        </div>

        <div className="card sticky top-20 h-fit">
          <h2 className="mb-4 text-xl font-semibold">Rental Summary</h2>
          <div className="space-y-3 border-t border-[#e8dbc8] pt-4">
            <div className="flex justify-between">
              <p>Subtotal</p>
              <p className="font-semibold">₦{getSubtotal().toLocaleString()}</p>
            </div>
            <div className="flex justify-between">
              <p>Caution Fee</p>
              <p className="font-semibold">₦{getCautionTotal().toLocaleString()}</p>
            </div>
            <div className="flex justify-between border-t border-[#e8dbc8] pt-4 text-lg">
              <p>Total</p>
              <p className="font-bold text-[#8f6b35]">₦{getTotal().toLocaleString()}</p>
            </div>
          </div>

          <Link
            href="/rentals/checkout"
            className="mt-6 block rounded-full border border-[#b88d4a] bg-[#b88d4a] px-5 py-2 text-center text-xs font-semibold uppercase tracking-[0.1em] text-[#171108] transition hover:bg-[#d1a762]"
          >
            Proceed to Rental Checkout
          </Link>

          <button
            onClick={() => {
              if (confirm('Clear rentals cart?')) clearCart();
            }}
            className="mt-2 w-full rounded-full border border-[#c9ad82] px-5 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#6f5633] transition hover:border-[#b88d4a] hover:text-[#8f6b35]"
          >
            Clear Rentals Cart
          </button>
        </div>
      </div>
    </div>
  );
}
