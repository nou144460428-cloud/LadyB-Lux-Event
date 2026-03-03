'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { DashboardSkeleton, EmptyState } from '@/components/dashboard/States';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    'orders' | 'vendors' | 'payouts' | 'materials' | 'media' | 'accounts' | 'whatsapp'
  >('orders');
  const [materialForm, setMaterialForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    size: '',
    colour: '',
    options: '',
    quantity: '1',
    unit: 'piece',
    price: '0',
    category: 'DECORATION_RENTAL',
  });
  const [mediaForm, setMediaForm] = useState({
    title: '',
    type: 'PHOTO',
    src: '',
    note: '',
    location: '',
    poster: '',
  });
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    accountType: 'STOCK_KEEPER_ADMIN' as 'STOCK_KEEPER_ADMIN' | 'STAFF',
  });
  const [whatsAppChatForm, setWhatsAppChatForm] = useState({
    to: '',
    message: '',
    channel: 'WHATSAPP_BUSINESS',
  });
  const [whatsAppBroadcastForm, setWhatsAppBroadcastForm] = useState({
    recipients: '',
    message: '',
    channel: 'WHATSAPP_BUSINESS',
  });
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await api.get('/admin/orders?limit=100');
      return res.data;
    },
  });

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const res = await api.get('/vendors');
      return res.data;
    },
  });

  const { data: payouts = [], isLoading: payoutsLoading } = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: async () => {
      const res = await api.get('/admin/commissions/pending-summary');
      return res.data;
    },
  });

  const { data: materials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ['admin-materials'],
    queryFn: async () => {
      const res = await api.get('/admin/materials');
      return res.data;
    },
  });

  const { data: media = [], isLoading: mediaLoading } = useQuery({
    queryKey: ['admin-media'],
    queryFn: async () => {
      const res = await api.get('/event-media');
      return res.data;
    },
  });

  const { data: whatsappChannels = [] } = useQuery({
    queryKey: ['whatsapp-channels'],
    queryFn: async () => {
      const res = await api.get('/whatsapp/channels');
      return res.data;
    },
  });

  const verifyVendor = useMutation({
    mutationFn: async (vendorId: string) => api.post(`/vendors/${vendorId}/verify`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });

  const payoutVendor = useMutation({
    mutationFn: async (vendorId: string) =>
      api.post(`/admin/commissions/payout/${vendorId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
    },
  });

  const createMaterial = useMutation({
    mutationFn: async () => {
      const decorationVendorId =
        vendors.find((vendor: any) => vendor.category === 'DECORATION')?.id ||
        vendors[0]?.id;
      if (!decorationVendorId) {
        throw new Error('No vendor profile found to attach this material.');
      }

      return api.post('/admin/materials', {
        vendorId: decorationVendorId,
        name: materialForm.name,
        description: materialForm.description.trim() || undefined,
        imageUrl: materialForm.imageUrl.trim() || undefined,
        size: materialForm.size.trim() || undefined,
        colour: materialForm.colour.trim() || undefined,
        options: materialForm.options.trim() || undefined,
        quantity: Number(materialForm.quantity),
        unit: materialForm.unit,
        price: Number(materialForm.price),
        category: materialForm.category,
      });
    },
    onSuccess: async () => {
      setMaterialForm({
        name: '',
        description: '',
        imageUrl: '',
        size: '',
        colour: '',
        options: '',
        quantity: '1',
        unit: 'piece',
        price: '0',
        category: 'DECORATION_RENTAL',
      });
      await queryClient.invalidateQueries({ queryKey: ['admin-materials'] });
    },
  });

  const createMedia = useMutation({
    mutationFn: async () => api.post('/event-media/admin', mediaForm),
    onSuccess: async () => {
      setMediaForm({
        title: '',
        type: 'PHOTO',
        src: '',
        note: '',
        location: '',
        poster: '',
      });
      await queryClient.invalidateQueries({ queryKey: ['admin-media'] });
    },
  });

  const createStaffAccount = useMutation({
    mutationFn: async () =>
      api.post('/admin/staff-accounts', {
        name: staffForm.name,
        email: staffForm.email,
        password: staffForm.password,
        accountType: staffForm.accountType,
      }),
    onSuccess: async () => {
      setStaffForm({
        name: '',
        email: '',
        password: '',
        accountType: 'STOCK_KEEPER_ADMIN',
      });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const reconcilePayments = useMutation({
    mutationFn: async () => api.post('/admin/payments/reconcile'),
  });

  const sendWhatsappChat = useMutation({
    mutationFn: async () =>
      api.post('/whatsapp/chat', {
        to: whatsAppChatForm.to,
        message: whatsAppChatForm.message,
        channel: whatsAppChatForm.channel,
      }),
  });

  const sendWhatsappBroadcast = useMutation({
    mutationFn: async () =>
      api.post('/whatsapp/broadcast', {
        recipients: whatsAppBroadcastForm.recipients
          .split(/[\n,]/)
          .map((r) => r.trim())
          .filter(Boolean),
        message: whatsAppBroadcastForm.message,
        channel: whatsAppBroadcastForm.channel,
      }),
  });

  const totalRevenue = orders.reduce(
    (sum: number, order: any) => sum + Number(order.totalAmount || 0),
    0,
  );
  const completedOrders = orders.filter((o: any) => o.status === 'COMPLETED').length;
  const pendingPayoutTotal = payouts.reduce(
    (sum: number, row: any) => sum + Number(row.payoutAmount || 0),
    0,
  );
  const autoMaterialVendor =
    vendors.find((vendor: any) => vendor.category === 'DECORATION') || vendors[0];

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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#b99b67]">Admin Dashboard</p>
            <h1
              className="mt-2 text-3xl uppercase tracking-[0.08em] text-[#f4eadf] md:text-4xl"
              style={{ fontFamily: 'Didot, Garamond, "Times New Roman", serif' }}
            >
              Platform Control
            </h1>
          </div>
          <Link
            href="/event/create"
            className="rounded-full border border-[#d6b57c] bg-[#d6b57c] px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#171108] transition hover:bg-[#ebcf9f]"
          >
            Post New Event
          </Link>
          <button
            onClick={() => reconcilePayments.mutate()}
            disabled={reconcilePayments.isPending}
            className="rounded-full border border-[#8f7650] px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#f4eadf] transition hover:border-[#d6b57c] hover:text-[#d6b57c] disabled:opacity-60"
          >
            {reconcilePayments.isPending ? 'Reconciling...' : 'Reconcile Payments'}
          </button>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-[#cdbca3]">
          Monitor marketplace operations, verify vendors, and process vendor payouts.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="rounded-xl border border-[#4a3a22] bg-[#151008] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#9f8961]">Orders</p>
          <p className="mt-2 text-3xl font-semibold text-[#f4eadf]">{orders.length}</p>
        </div>
        <div className="rounded-xl border border-[#4a3a22] bg-[#151008] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#9f8961]">Completed</p>
          <p className="mt-2 text-3xl font-semibold text-[#d6b57c]">{completedOrders}</p>
        </div>
        <div className="rounded-xl border border-[#4a3a22] bg-[#151008] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#9f8961]">Vendors</p>
          <p className="mt-2 text-3xl font-semibold text-[#f4eadf]">{vendors.length}</p>
        </div>
        <div className="rounded-xl border border-[#4a3a22] bg-[#151008] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#9f8961]">Gross Revenue</p>
          <p className="mt-2 text-3xl font-semibold text-[#f4eadf]">
            ₦{totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-[#4a3a22] bg-[#151008] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#9f8961]">Pending Payouts</p>
          <p className="mt-2 text-3xl font-semibold text-[#f4eadf]">
            ₦{pendingPayoutTotal.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-6 border-b border-[#302515]">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2 px-4 text-xs uppercase tracking-[0.14em] ${
              activeTab === 'orders'
                ? 'border-b-2 border-[#d6b57c] text-[#d6b57c]'
                : 'text-[#9f8961]'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`pb-2 px-4 text-xs uppercase tracking-[0.14em] ${
              activeTab === 'vendors'
                ? 'border-b-2 border-[#d6b57c] text-[#d6b57c]'
                : 'text-[#9f8961]'
            }`}
          >
            Vendors ({vendors.length})
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`pb-2 px-4 text-xs uppercase tracking-[0.14em] ${
              activeTab === 'payouts'
                ? 'border-b-2 border-[#d6b57c] text-[#d6b57c]'
                : 'text-[#9f8961]'
            }`}
          >
            Payouts ({payouts.length})
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`pb-2 px-4 text-xs uppercase tracking-[0.14em] ${
              activeTab === 'materials'
                ? 'border-b-2 border-[#d6b57c] text-[#d6b57c]'
                : 'text-[#9f8961]'
            }`}
          >
            Restock Rentals ({materials.length})
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`pb-2 px-4 text-xs uppercase tracking-[0.14em] ${
              activeTab === 'media'
                ? 'border-b-2 border-[#d6b57c] text-[#d6b57c]'
                : 'text-[#9f8961]'
            }`}
          >
            Media ({media.length})
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`pb-2 px-4 text-xs uppercase tracking-[0.14em] ${
              activeTab === 'accounts'
                ? 'border-b-2 border-[#d6b57c] text-[#d6b57c]'
                : 'text-[#9f8961]'
            }`}
          >
            Staff Accounts
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`pb-2 px-4 text-xs uppercase tracking-[0.14em] ${
              activeTab === 'whatsapp'
                ? 'border-b-2 border-[#d6b57c] text-[#d6b57c]'
                : 'text-[#9f8961]'
            }`}
          >
            WhatsApp
          </button>
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="rounded-2xl border border-[#4a3a22] bg-[#151008] p-6">
          <h2 className="mb-4 text-xl font-semibold text-[#f4eadf]">All Orders</h2>

          {ordersLoading ? (
            <DashboardSkeleton rows={4} />
          ) : orders.length === 0 ? (
            <EmptyState
              title="No Orders Yet"
              description="Orders will appear here once customers complete checkout."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px]">
                <thead className="border-b border-[#302515] text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                  <tr>
                    <th className="text-left py-3">Order ID</th>
                    <th className="text-left py-3">Customer</th>
                    <th className="text-left py-3">Event</th>
                    <th className="text-left py-3">Amount</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-left py-3">Platform Fee (15%)</th>
                    <th className="text-left py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any) => (
                    <tr key={order.id} className="border-b border-[#241b10] text-sm text-[#e8dccb]">
                      <td className="py-3 font-medium">#{order.id.slice(0, 8)}</td>
                      <td className="py-3">{order.user?.name || 'Customer'}</td>
                      <td className="py-3">{order.event?.title || 'Event'}</td>
                      <td className="py-3">₦{Number(order.totalAmount || 0).toLocaleString()}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-[#d6b57c]">
                        ₦{Math.round(Number(order.totalAmount || 0) * 0.15).toLocaleString()}
                      </td>
                      <td className="py-3 text-xs uppercase tracking-[0.1em] text-[#9f8961]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'vendors' && (
        <div className="rounded-2xl border border-[#4a3a22] bg-[#151008] p-6">
          <h2 className="mb-4 text-xl font-semibold text-[#f4eadf]">Vendor Management</h2>

          {vendorsLoading ? (
            <DashboardSkeleton rows={3} />
          ) : vendors.length === 0 ? (
            <EmptyState
              title="No Vendors Yet"
              description="Registered vendor profiles will be listed here for review and approval."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead className="border-b border-[#302515] text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                  <tr>
                    <th className="text-left py-3">Business Name</th>
                    <th className="text-left py-3">Category</th>
                    <th className="text-left py-3">Location</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-left py-3">Joined</th>
                    <th className="text-left py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor: any) => (
                    <tr key={vendor.id} className="border-b border-[#241b10] text-sm text-[#e8dccb]">
                      <td className="py-3 font-semibold">{vendor.businessName}</td>
                      <td className="py-3">{vendor.category}</td>
                      <td className="py-3">{vendor.location}</td>
                      <td className="py-3">
                        {vendor.verified ? (
                          <span className="rounded-full border border-emerald-700/40 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-300">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="rounded-full border border-amber-700/40 bg-amber-950/40 px-3 py-1 text-xs font-semibold text-amber-300">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-xs uppercase tracking-[0.1em] text-[#9f8961]">
                        {new Date(vendor.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        {!vendor.verified && (
                          <button
                            onClick={() => verifyVendor.mutate(vendor.id)}
                            disabled={verifyVendor.isPending}
                            className="rounded-full border border-[#d6b57c] bg-[#d6b57c] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#171108] transition hover:bg-[#ebcf9f] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Approve
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
      )}

      {activeTab === 'payouts' && (
        <div className="rounded-2xl border border-[#4a3a22] bg-[#151008] p-6">
          <h2 className="mb-4 text-xl font-semibold text-[#f4eadf]">Pending Vendor Payouts</h2>

          {payoutsLoading ? (
            <DashboardSkeleton rows={3} />
          ) : payouts.length === 0 ? (
            <EmptyState
              title="No Pending Payouts"
              description="All vendor commission payouts are currently up to date."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px]">
                <thead className="border-b border-[#302515] text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                  <tr>
                    <th className="py-3 text-left">Vendor</th>
                    <th className="py-3 text-left">Orders</th>
                    <th className="py-3 text-left">Gross</th>
                    <th className="py-3 text-left">Commission</th>
                    <th className="py-3 text-left">Payout</th>
                    <th className="py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((row: any) => (
                    <tr key={row.vendorId} className="border-b border-[#241b10] text-sm text-[#e8dccb]">
                      <td className="py-3 font-semibold">{row.businessName}</td>
                      <td className="py-3">{row.pendingOrders}</td>
                      <td className="py-3">₦{Number(row.grossTotal || 0).toLocaleString()}</td>
                      <td className="py-3 text-[#d6b57c]">
                        ₦{Number(row.commissionTotal || 0).toLocaleString()}
                      </td>
                      <td className="py-3">₦{Number(row.payoutAmount || 0).toLocaleString()}</td>
                      <td className="py-3">
                        <button
                          onClick={() => payoutVendor.mutate(row.vendorId)}
                          disabled={payoutVendor.isPending}
                          className="rounded-full border border-[#d6b57c] bg-[#d6b57c] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#171108] transition hover:bg-[#ebcf9f] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark Paid
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#4a3a22] bg-[#151008] p-6">
            <h2 className="mb-4 text-xl font-semibold text-[#f4eadf]">
              Restock Decoration Rental Materials
            </h2>
            <p className="mb-4 text-sm text-[#cdbca3]">
              Add stock here for decoration materials available for rent. Materials are
              automatically assigned to{' '}
              {autoMaterialVendor?.businessName || 'the first available vendor profile'}.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                  Material Name
                </label>
                <input
                  value={materialForm.name}
                  onChange={(e) =>
                    setMaterialForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="input bg-[#efe7dc]"
                  placeholder="e.g. Gold Chiavari Chair"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                  Material Image URL
                </label>
                <input
                  value={materialForm.imageUrl}
                  onChange={(e) =>
                    setMaterialForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                  }
                  className="input bg-[#efe7dc]"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                  Size
                </label>
                <input
                  value={materialForm.size}
                  onChange={(e) =>
                    setMaterialForm((prev) => ({ ...prev, size: e.target.value }))
                  }
                  className="input bg-[#efe7dc]"
                  placeholder="e.g. 6ft x 4ft, Large, 45cm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                  Colour
                </label>
                <input
                  value={materialForm.colour}
                  onChange={(e) =>
                    setMaterialForm((prev) => ({ ...prev, colour: e.target.value }))
                  }
                  className="input bg-[#efe7dc]"
                  placeholder="e.g. Gold, White, Blush Pink"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                  Quantity
                </label>
                <input
                  type="number"
                  min={0}
                  value={materialForm.quantity}
                  onChange={(e) =>
                    setMaterialForm((prev) => ({ ...prev, quantity: e.target.value }))
                  }
                  className="input bg-[#efe7dc]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                  Unit
                </label>
                <input
                  value={materialForm.unit}
                  onChange={(e) =>
                    setMaterialForm((prev) => ({ ...prev, unit: e.target.value }))
                  }
                  className="input bg-[#efe7dc]"
                  placeholder="piece, set, bundle"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                  Price
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={materialForm.price}
                  onChange={(e) =>
                    setMaterialForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                  className="input bg-[#efe7dc]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                  Category
                </label>
                <input
                  value={materialForm.category}
                  onChange={(e) =>
                    setMaterialForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="input bg-[#efe7dc]"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                Options
              </label>
              <input
                value={materialForm.options}
                onChange={(e) =>
                  setMaterialForm((prev) => ({ ...prev, options: e.target.value }))
                }
                className="input bg-[#efe7dc]"
                placeholder="e.g. white/gold legs, velvet/linen finish"
              />
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                Description
              </label>
              <textarea
                value={materialForm.description}
                onChange={(e) =>
                  setMaterialForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="input min-h-24 bg-[#efe7dc]"
              />
            </div>
            {materialForm.imageUrl.trim() && (
              <div className="mt-4 rounded-xl border border-[#4a3a22] bg-[#120d07] p-3">
                <p className="mb-2 text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                  Image Preview
                </p>
                <img
                  src={materialForm.imageUrl}
                  alt={materialForm.name || 'Material preview'}
                  className="h-40 w-full rounded-lg object-cover md:w-64"
                />
              </div>
            )}

            <button
              onClick={() => createMaterial.mutate()}
              disabled={
                createMaterial.isPending ||
                !autoMaterialVendor ||
                !materialForm.name.trim()
              }
              className="mt-5 rounded-full border border-[#d6b57c] bg-[#d6b57c] px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#171108] transition hover:bg-[#ebcf9f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createMaterial.isPending ? 'Restocking...' : 'Restock Material'}
            </button>
          </div>

          <div className="rounded-2xl border border-[#4a3a22] bg-[#151008] p-6">
            <h2 className="mb-4 text-xl font-semibold text-[#f4eadf]">Existing Materials</h2>

            {materialsLoading ? (
              <DashboardSkeleton rows={3} />
            ) : materials.length === 0 ? (
              <EmptyState
                title="No Materials Yet"
                description="Add your first decoration material using the form above."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1120px]">
                  <thead className="border-b border-[#302515] text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                    <tr>
                      <th className="py-3 text-left">Image</th>
                      <th className="py-3 text-left">Material</th>
                      <th className="py-3 text-left">Colour</th>
                      <th className="py-3 text-left">Size</th>
                      <th className="py-3 text-left">Options</th>
                      <th className="py-3 text-left">Category</th>
                      <th className="py-3 text-left">Stock</th>
                      <th className="py-3 text-left">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((material: any) => (
                      <tr
                        key={material.id}
                        className="border-b border-[#241b10] text-sm text-[#e8dccb]"
                      >
                        <td className="py-3">
                          {material.imageUrl ? (
                            <img
                              src={material.imageUrl}
                              alt={material.name}
                              className="h-10 w-16 rounded-md object-cover"
                            />
                          ) : (
                            <span className="text-xs text-[#9f8961]">No image</span>
                          )}
                        </td>
                        <td className="py-3 font-semibold">{material.name}</td>
                        <td className="py-3">{material.colour || '-'}</td>
                        <td className="py-3">{material.size || '-'}</td>
                        <td className="py-3">{material.options || '-'}</td>
                        <td className="py-3">{material.category}</td>
                        <td className="py-3">
                          {Number(material.quantity || 0).toLocaleString()} {material.unit}
                        </td>
                        <td className="py-3">₦{Number(material.price || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#4a3a22] bg-[#151008] p-6">
            <h2 className="mb-4 text-xl font-semibold text-[#f4eadf]">
              Add Event Media
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                value={mediaForm.title}
                onChange={(e) =>
                  setMediaForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="input bg-[#efe7dc]"
                placeholder="Title"
              />
              <select
                value={mediaForm.type}
                onChange={(e) =>
                  setMediaForm((prev) => ({ ...prev, type: e.target.value }))
                }
                className="input bg-[#efe7dc]"
              >
                <option value="PHOTO">Photo</option>
                <option value="VIDEO">Video</option>
              </select>
              <input
                value={mediaForm.src}
                onChange={(e) =>
                  setMediaForm((prev) => ({ ...prev, src: e.target.value }))
                }
                className="input bg-[#efe7dc] md:col-span-2"
                placeholder="Media URL"
              />
              <input
                value={mediaForm.location}
                onChange={(e) =>
                  setMediaForm((prev) => ({ ...prev, location: e.target.value }))
                }
                className="input bg-[#efe7dc]"
                placeholder="Location (optional)"
              />
              <input
                value={mediaForm.poster}
                onChange={(e) =>
                  setMediaForm((prev) => ({ ...prev, poster: e.target.value }))
                }
                className="input bg-[#efe7dc]"
                placeholder="Poster URL (optional for videos)"
              />
              <textarea
                value={mediaForm.note}
                onChange={(e) =>
                  setMediaForm((prev) => ({ ...prev, note: e.target.value }))
                }
                className="input min-h-24 bg-[#efe7dc] md:col-span-2"
                placeholder="Description/note"
              />
            </div>
            <button
              onClick={() => createMedia.mutate()}
              disabled={
                createMedia.isPending ||
                !mediaForm.title.trim() ||
                !mediaForm.src.trim()
              }
              className="mt-5 rounded-full border border-[#d6b57c] bg-[#d6b57c] px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#171108] transition hover:bg-[#ebcf9f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createMedia.isPending ? 'Publishing...' : 'Publish Media'}
            </button>
          </div>

          <div className="rounded-2xl border border-[#4a3a22] bg-[#151008] p-6">
            <h2 className="mb-4 text-xl font-semibold text-[#f4eadf]">Published Media</h2>
            {mediaLoading ? (
              <DashboardSkeleton rows={3} />
            ) : media.length === 0 ? (
              <EmptyState
                title="No Media Yet"
                description="Add photos and videos that customers can browse for inspiration."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px]">
                  <thead className="border-b border-[#302515] text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                    <tr>
                      <th className="py-3 text-left">Title</th>
                      <th className="py-3 text-left">Type</th>
                      <th className="py-3 text-left">Location</th>
                      <th className="py-3 text-left">URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {media.map((item: any) => (
                      <tr key={item.id || item.src} className="border-b border-[#241b10] text-sm text-[#e8dccb]">
                        <td className="py-3 font-semibold">{item.title}</td>
                        <td className="py-3">{item.type || 'PHOTO'}</td>
                        <td className="py-3">{item.location || '-'}</td>
                        <td className="py-3">
                          <a className="text-[#d6b57c] underline" href={item.src} target="_blank" rel="noreferrer">
                            Open
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="rounded-2xl border border-[#4a3a22] bg-[#151008] p-6">
          <h2 className="mb-4 text-xl font-semibold text-[#f4eadf]">
            Create Staff Accounts
          </h2>
          <p className="mb-4 text-sm text-[#cdbca3]">
            Create internal accounts for stock keeper admin and other staff.
            `STOCK_KEEPER_ADMIN` gets admin access, while `STAFF` gets controlled operations access.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              value={staffForm.name}
              onChange={(e) =>
                setStaffForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="input bg-[#efe7dc]"
              placeholder="Full name"
            />
            <input
              type="email"
              value={staffForm.email}
              onChange={(e) =>
                setStaffForm((prev) => ({ ...prev, email: e.target.value }))
              }
              className="input bg-[#efe7dc]"
              placeholder="Email"
            />
            <input
              type="password"
              value={staffForm.password}
              onChange={(e) =>
                setStaffForm((prev) => ({ ...prev, password: e.target.value }))
              }
              className="input bg-[#efe7dc]"
              placeholder="Temporary password"
            />
            <select
              value={staffForm.accountType}
              onChange={(e) =>
                setStaffForm((prev) => ({
                  ...prev,
                  accountType: e.target.value as 'STOCK_KEEPER_ADMIN' | 'STAFF',
                }))
              }
              className="input bg-[#efe7dc]"
            >
              <option value="STOCK_KEEPER_ADMIN">Stock Keeper Admin</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>

          {createStaffAccount.isError && (
            <p className="mt-4 text-sm text-rose-400">
              Failed to create account. Check if the email already exists.
            </p>
          )}
          {createStaffAccount.isSuccess && (
            <p className="mt-4 text-sm text-emerald-400">
              Staff account created successfully.
            </p>
          )}

          <button
            onClick={() => createStaffAccount.mutate()}
            disabled={
              createStaffAccount.isPending ||
              !staffForm.name.trim() ||
              !staffForm.email.trim() ||
              staffForm.password.length < 6
            }
            className="mt-5 rounded-full border border-[#d6b57c] bg-[#d6b57c] px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#171108] transition hover:bg-[#ebcf9f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createStaffAccount.isPending
              ? 'Creating...'
              : `Create ${staffForm.accountType === 'STOCK_KEEPER_ADMIN' ? 'Stock Keeper Admin' : 'Staff'} Account`}
          </button>
        </div>
      )}

      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#4a3a22] bg-[#151008] p-6">
            <h2 className="mb-4 text-xl font-semibold text-[#f4eadf]">
              WhatsApp Business Channel
            </h2>
            <p className="mb-3 text-sm text-[#cdbca3]">
              Available channels:
              {' '}
              {whatsappChannels.length === 0
                ? 'None configured'
                : whatsappChannels
                    .map((channel: any) =>
                      `${channel.name}${channel.enabled ? '' : ' (disabled)'}`,
                    )
                    .join(', ')}
            </p>
          </div>

          <div className="rounded-2xl border border-[#4a3a22] bg-[#151008] p-6">
            <h3 className="mb-4 text-lg font-semibold text-[#f4eadf]">Chat Message</h3>
            <div className="space-y-3">
              <input
                value={whatsAppChatForm.to}
                onChange={(e) =>
                  setWhatsAppChatForm((prev) => ({ ...prev, to: e.target.value }))
                }
                className="input bg-[#efe7dc]"
                placeholder="Recipient phone in international format"
              />
              <textarea
                value={whatsAppChatForm.message}
                onChange={(e) =>
                  setWhatsAppChatForm((prev) => ({ ...prev, message: e.target.value }))
                }
                className="input min-h-24 bg-[#efe7dc]"
                placeholder="Message text"
              />
              <button
                onClick={() => sendWhatsappChat.mutate()}
                disabled={
                  sendWhatsappChat.isPending ||
                  !whatsAppChatForm.to.trim() ||
                  !whatsAppChatForm.message.trim()
                }
                className="rounded-full border border-[#d6b57c] bg-[#d6b57c] px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#171108] transition hover:bg-[#ebcf9f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendWhatsappChat.isPending ? 'Sending...' : 'Send WhatsApp Chat'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#4a3a22] bg-[#151008] p-6">
            <h3 className="mb-4 text-lg font-semibold text-[#f4eadf]">Broadcast</h3>
            <div className="space-y-3">
              <textarea
                value={whatsAppBroadcastForm.recipients}
                onChange={(e) =>
                  setWhatsAppBroadcastForm((prev) => ({
                    ...prev,
                    recipients: e.target.value,
                  }))
                }
                className="input min-h-24 bg-[#efe7dc]"
                placeholder="Recipients: comma-separated or one per line"
              />
              <textarea
                value={whatsAppBroadcastForm.message}
                onChange={(e) =>
                  setWhatsAppBroadcastForm((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                className="input min-h-24 bg-[#efe7dc]"
                placeholder="Broadcast message"
              />
              <button
                onClick={() => sendWhatsappBroadcast.mutate()}
                disabled={
                  sendWhatsappBroadcast.isPending ||
                  !whatsAppBroadcastForm.recipients.trim() ||
                  !whatsAppBroadcastForm.message.trim()
                }
                className="rounded-full border border-[#d6b57c] bg-[#d6b57c] px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#171108] transition hover:bg-[#ebcf9f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendWhatsappBroadcast.isPending ? 'Broadcasting...' : 'Send Broadcast'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
