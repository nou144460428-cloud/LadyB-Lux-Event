'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardSkeleton, EmptyState } from '@/components/dashboard/States';

export default function VendorDashboard() {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['vendor-orders'],
    queryFn: async () => {
      const res = await api.get('/orders/vendor/orders');
      return res.data;
    },
  });

  const markInProgress = useMutation({
    mutationFn: async (orderId: string) => api.patch(`/orders/${orderId}/in-progress`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
    },
  });

  const inProgressCount = orders.filter((o: any) => o.status === 'IN_PROGRESS').length;
  const completedCount = orders.filter((o: any) => o.status === 'COMPLETED').length;
  const totalRevenue = orders.reduce(
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
        <p className="text-xs uppercase tracking-[0.2em] text-[#b99b67]">Vendor Dashboard</p>
        <h1
          className="mt-2 text-3xl uppercase tracking-[0.08em] text-[#f4eadf] md:text-4xl"
          style={{ fontFamily: 'Didot, Garamond, "Times New Roman", serif' }}
        >
          Order Operations
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[#cdbca3]">
          Monitor incoming orders and move paid jobs into active fulfillment.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-[#4a3a22] bg-[#151008] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#9f8961]">Total Orders</p>
          <p className="mt-2 text-3xl font-semibold text-[#f4eadf]">{orders.length}</p>
        </div>
        <div className="rounded-xl border border-[#4a3a22] bg-[#151008] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#9f8961]">In Progress</p>
          <p className="mt-2 text-3xl font-semibold text-[#d6b57c]">{inProgressCount}</p>
        </div>
        <div className="rounded-xl border border-[#4a3a22] bg-[#151008] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#9f8961]">Completed</p>
          <p className="mt-2 text-3xl font-semibold text-[#f4eadf]">{completedCount}</p>
        </div>
        <div className="rounded-xl border border-[#4a3a22] bg-[#151008] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#9f8961]">Gross Revenue</p>
          <p className="mt-2 text-3xl font-semibold text-[#f4eadf]">₦{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#4a3a22] bg-[#151008] p-6">
        <h2 className="mb-4 text-xl font-semibold text-[#f4eadf]">Orders Requiring Action</h2>

        {isLoading ? (
          <DashboardSkeleton rows={3} />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No Vendor Orders"
            description="No customer orders have been assigned to your products yet. New requests will show up here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-[#302515] text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                <tr>
                  <th className="text-left py-3">Order ID</th>
                  <th className="text-left py-3">Customer</th>
                  <th className="text-left py-3">Products</th>
                  <th className="text-left py-3">Amount</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id} className="border-b border-[#241b10] text-sm text-[#e8dccb]">
                    <td className="py-3 font-medium">#{order.id.slice(0, 8)}</td>
                    <td className="py-3">{order.user?.name || 'Customer'}</td>
                    <td className="py-3">{order.items?.length || 0} items</td>
                    <td className="py-3">₦{Number(order.totalAmount || 0).toLocaleString()}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {order.status === 'PAID' && (
                        <button
                          onClick={() => markInProgress.mutate(order.id)}
                          disabled={markInProgress.isPending}
                          className="rounded-full border border-[#d6b57c] bg-[#d6b57c] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#171108] transition hover:bg-[#ebcf9f] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark In Progress
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
