'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { DashboardSkeleton, EmptyState } from '@/components/dashboard/States';

export default function CustomerDashboard() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data;
    },
  });

  const completedOrders = orders.filter((order: any) => order.status === 'COMPLETED').length;
  const totalSpent = orders.reduce(
    (sum: number, order: any) => sum + Number(order.totalAmount || 0),
    0,
  );

  const statusClass = (status: string) => {
    if (status === 'COMPLETED') return 'bg-emerald-950/40 text-emerald-300 border border-emerald-700/40';
    if (status === 'PAID') return 'bg-sky-950/40 text-sky-300 border border-sky-700/40';
    if (status === 'IN_PROGRESS') return 'bg-amber-950/40 text-amber-300 border border-amber-700/40';
    if (status === 'CANCELLED') return 'bg-rose-950/40 text-rose-300 border border-rose-700/40';
    return 'bg-zinc-900 text-zinc-200 border border-zinc-700';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 rounded-2xl border border-[#4a3a22] bg-[radial-gradient(circle_at_top_right,_rgba(214,181,124,0.16),_rgba(18,14,9,0.92)_52%)] p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#b99b67]">Customer Dashboard</p>
        <h1
          className="mt-2 text-3xl uppercase tracking-[0.08em] text-[#f4eadf] md:text-4xl"
          style={{ fontFamily: 'Didot, Garamond, "Times New Roman", serif' }}
        >
          My Orders
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[#cdbca3]">
          Track your event orders, payment progress, and fulfillment status in one place.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#4a3a22] bg-[#151008] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#9f8961]">Total Orders</p>
          <p className="mt-2 text-3xl font-semibold text-[#f4eadf]">{orders.length}</p>
        </div>
        <div className="rounded-xl border border-[#4a3a22] bg-[#151008] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#9f8961]">Completed</p>
          <p className="mt-2 text-3xl font-semibold text-[#d6b57c]">{completedOrders}</p>
        </div>
        <div className="rounded-xl border border-[#4a3a22] bg-[#151008] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#9f8961]">Total Spent</p>
          <p className="mt-2 text-3xl font-semibold text-[#f4eadf]">₦{totalSpent.toLocaleString()}</p>
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton rows={4} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No Orders Yet"
          description="You have not placed any orders yet. Start by browsing curated vendors for your event."
          action={
            <Link
              href="/"
              className="inline-flex rounded-full border border-[#d6b57c] bg-[#d6b57c] px-5 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#171108] transition hover:bg-[#ebcf9f]"
            >
              Browse Vendors
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="rounded-2xl border border-[#4a3a22] bg-[#151008] p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <h3 className="text-lg font-semibold text-[#f4eadf]">
                    Order #{order.id.slice(0, 8)}
                  </h3>
                  <p className="text-sm text-[#cdbca3]">
                    Event: {order.event?.title || 'Untitled Event'}
                  </p>
                  <p className="text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-2xl font-semibold text-[#f4eadf]">
                    ₦{order.totalAmount.toLocaleString()}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusClass(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="mt-4 border-t border-[#302515] pt-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                  Items: {order.items?.length || 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
