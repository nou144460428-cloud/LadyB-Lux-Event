'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useRentalCart } from '@/store/rentalCart';
import { getAuthUser, isDecoratorAccount } from '@/lib/auth';

export default function RentalCheckoutPage() {
  const { items, clearCart, getSubtotal, getCautionTotal, getTotal } = useRentalCart();
  const router = useRouter();
  const [contactPhone, setContactPhone] = useState('');
  const [note, setNote] = useState('');
  const [provider, setProvider] = useState<'paystack' | 'monnify' | 'cash_pickup'>('paystack');
  const [confirmCashPickup, setConfirmCashPickup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState('');
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = getAuthUser();
    const canRent = isDecoratorAccount(user);
    setAllowed(canRent);
    if (!canRent) {
      router.push('/vendors/event-planners');
    }
  }, [router]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (provider === 'cash_pickup' && !confirmCashPickup) {
      setError(
        'You must confirm that cash will be paid at pickup before submitting the rental request.',
      );
      return;
    }

    setLoading(true);

    try {
      const generatedRequestId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `rental-${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const orderResponse = await api.post('/orders', {
        idempotencyKey:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `ord-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        items: items.map((item) => ({
          productId: item.materialId,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      const orderId = orderResponse.data.id;

      const payload = {
        requestId: generatedRequestId,
        orderId,
        contactPhone,
        note,
        totalAmount: getTotal(),
        items: items.map((item) => ({
          ...item,
          rentalStartAt: null,
          rentalEndAt: null,
          rentalPeriodStatus: 'PENDING_STOCK_KEEPER_ADMIN',
          rentalPeriodSetBy: 'STOCK_KEEPER_ADMIN',
          penaltyStartsAt: null,
          penaltyGraceMinutes: 0,
        })),
        submittedAt: new Date().toISOString(),
      };

      const historyRaw = localStorage.getItem('rental-request-history');
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      localStorage.setItem('rental-request-history', JSON.stringify([payload, ...history]));

      const paymentResponse = await api.post('/payments/initiate', {
        orderId,
        provider,
      });

      const authorizationUrl = paymentResponse.data?.data?.authorization_url;
      if (provider === 'cash_pickup') {
        clearCart();
        setRequestId(generatedRequestId);
        return;
      }

      if (!authorizationUrl) {
        throw new Error('Unable to initialize payment URL');
      }

      localStorage.setItem('pending-rental-payment', '1');
      localStorage.setItem('pending-rental-request-id', generatedRequestId);
      window.location.href = authorizationUrl;
      return;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to submit rental request');
    } finally {
      setLoading(false);
    }
  };

  if (!allowed) {
    return null;
  }

  if (items.length === 0 && !requestId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold">Rental Checkout</h1>
        <div className="card py-12 text-center">
          <p className="mb-4 text-[#6f5633]">Your rentals cart is empty.</p>
          <Link
            href="/vendors/decorations-rentals"
            className="inline-block rounded-full border border-[#b88d4a] bg-[#b88d4a] px-5 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#171108] transition hover:bg-[#d1a762]"
          >
            Add Rental Materials
          </Link>
        </div>
      </div>
    );
  }

  if (requestId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="card border border-[#d9c19a] bg-[#fff9f0] p-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[#8f6b35]">Rental Request Submitted</p>
          <h1 className="mt-2 text-3xl font-bold text-[#3a2b17]">Request Received</h1>
          <p className="mt-3 text-sm text-[#6f5633]">
            Your decoration material rentals request has been created with ID:
          </p>
          <p className="mt-2 rounded-md bg-[#f3e5ce] px-3 py-2 font-mono text-sm text-[#3a2b17]">
            {requestId}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/vendors/decorations-rentals"
              className="rounded-full border border-[#b88d4a] bg-[#b88d4a] px-5 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#171108] transition hover:bg-[#d1a762]"
            >
              Continue Browsing
            </Link>
            <Link
              href="/dashboard/customer"
              className="rounded-full border border-[#c9ad82] px-5 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#6f5633] transition hover:border-[#b88d4a] hover:text-[#8f6b35]"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Rental Checkout</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card">
            <h2 className="mb-4 text-xl font-semibold">Rental Items</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg border border-[#e8dbc8] bg-[#fff9f0] p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#3a2b17]">{item.materialName}</p>
                    <p className="text-sm font-semibold text-[#8f6b35]">
                      ₦{((item.price + (item.cautionFee ?? 0)) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-[#6f5633]">
                    {item.quantity} × {item.unit} · {item.location}
                  </p>
                  <p className="mt-1 text-xs text-[#6f5633]">
                    Rental Period: To be assigned by stock keeper admin
                  </p>
                  <p className="mt-1 text-xs text-[#6f5633]">
                    Return Time: To be assigned by stock keeper admin
                  </p>
                  <p className="mt-1 text-xs text-[#6f5633]">
                    Penalty starts immediately after the admin-set return time lapses.
                  </p>
                  <p className="mt-1 text-xs text-[#6f5633]">
                    Rental: ₦{(item.price * item.quantity).toLocaleString()} + Caution Fee: ₦
                    {((item.cautionFee ?? 0) * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="mb-4 text-xl font-semibold">Rental Request Details</h2>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              {error && (
                <div className="rounded border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-[#8f6b35]">Contact Phone</label>
                <input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="input"
                  placeholder="e.g. +2348012345678"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#8f6b35]">Notes (Optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="input min-h-24"
                  placeholder="Any setup instructions, access notes, or special preferences"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#8f6b35]">Payment Provider</label>
                <select
                  value={provider}
                  onChange={(e) =>
                    setProvider(
                      e.target.value as 'paystack' | 'monnify' | 'cash_pickup',
                    )
                  }
                  className="input"
                  required
                >
                  <option value="paystack">Paystack</option>
                  <option value="monnify">Monnify</option>
                  <option value="cash_pickup">Pay with cash at pickup</option>
                </select>
              </div>

              {provider === 'cash_pickup' && (
                <label className="flex items-start gap-2 rounded border border-[#e8dbc8] bg-[#fff9f0] px-3 py-2 text-sm text-[#6f5633]">
                  <input
                    type="checkbox"
                    checked={confirmCashPickup}
                    onChange={(e) => setConfirmCashPickup(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    I confirm I will pay cash at pickup. Materials will only be released after payment.
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full border border-[#b88d4a] bg-[#b88d4a] px-6 py-2 font-semibold text-[#171108] transition hover:bg-[#d1a762]"
              >
                {loading
                  ? 'Processing...'
                  : provider === 'cash_pickup'
                    ? 'Submit Request for Cash at Pickup'
                    : `Pay & Submit Request with ${provider === 'monnify' ? 'Monnify' : 'Paystack'}`}
              </button>
            </form>
          </div>
        </div>

        <div className="card h-fit lg:sticky lg:top-20">
          <h2 className="mb-4 text-xl font-semibold">Estimated Total</h2>
          <div className="space-y-2 text-sm text-[#6f5633]">
            <div className="flex items-center justify-between">
              <p>Rental Subtotal</p>
              <p className="font-semibold">₦{getSubtotal().toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between">
              <p>Caution Fee</p>
              <p className="font-semibold">₦{getCautionTotal().toLocaleString()}</p>
            </div>
          </div>
          <p className="mb-3 mt-3 text-3xl font-bold text-[#8f6b35]">₦{getTotal().toLocaleString()}</p>
          <p className="text-sm text-[#6f5633]">
            This is a dedicated rentals checkout for decoration materials only.
          </p>
          <p className="mt-2 text-sm text-[#6f5633]">
            Rental and return schedule will be assigned by stock keeper admin.
          </p>
          <p className="mt-2 text-sm text-[#6f5633]">
            Late-return penalty starts immediately after the admin-set return date/time.
          </p>
          <Link
            href="/rentals/cart"
            className="mt-4 inline-block text-sm font-semibold text-[#8f6b35] hover:text-[#b88d4a] hover:underline"
          >
            Edit Rental Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
