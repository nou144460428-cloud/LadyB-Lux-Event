'use client';

import { useCart } from '@/store/cart';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import CartItem from '@/components/CartItem';

type EventOption = {
  id: string;
  title: string;
  eventDate: string;
  location: string;
};

export default function CheckoutPage() {
  const { items, getTotal } = useCart();
  const router = useRouter();
  const [eventId, setEventId] = useState('');
  const [provider, setProvider] = useState<'paystack' | 'monnify'>('paystack');
  const [events, setEvents] = useState<EventOption[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadEvents = async () => {
      try {
        setEventsLoading(true);
        const res = await api.get<EventOption[]>('/events');
        if (!cancelled) {
          setEvents(res.data);
          if (res.data.length === 1) {
            setEventId(res.data[0].id);
          }
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load your events. Please create an event first.');
        }
      } finally {
        if (!cancelled) {
          setEventsLoading(false);
        }
      }
    };

    loadEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) {
      setError('Please select an event');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create order
      const orderResponse = await api.post('/orders', {
        eventId,
        idempotencyKey:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `ord-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          startDate: item.startDate,
          endDate: item.endDate,
          deliveryDate: item.deliveryDate,
        })),
      });

      const orderId = orderResponse.data.id;

      // Initialize payment
      const paymentResponse = await api.post('/payments/initiate', {
        orderId,
        provider,
      });

      // Redirect to payment gateway
      if (paymentResponse.data.data?.authorization_url) {
        window.location.href = paymentResponse.data.data.authorization_url;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <button onClick={() => router.back()} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Billing Details</h2>
            <form onSubmit={handleCheckout} className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Select Event
                </label>
                <select
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="input"
                  required
                  disabled={eventsLoading}
                >
                  <option value="">
                    {eventsLoading ? 'Loading events...' : 'Choose an event...'}
                  </option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} • {new Date(event.eventDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {!eventsLoading && events.length === 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    No events found. Create one from Event Request before checkout.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Payment Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) =>
                    setProvider(e.target.value as 'paystack' | 'monnify')
                  }
                  className="input"
                  required
                >
                  <option value="paystack">Paystack</option>
                  <option value="monnify">Monnify</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Processing...' : `Pay with ${provider === 'monnify' ? 'Monnify' : 'Paystack'}`}
              </button>
            </form>
          </div>
        </div>

        <div className="card h-fit sticky top-20">
          <h2 className="text-xl font-semibold mb-4">Total Price</h2>
          <p className="text-3xl font-bold text-blue-600 mb-4">
            ₦{getTotal().toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            Secure payment powered by Paystack or Monnify
          </p>
        </div>
      </div>
    </div>
  );
}
