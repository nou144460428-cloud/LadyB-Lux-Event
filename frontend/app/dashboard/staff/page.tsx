'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { DashboardSkeleton, EmptyState } from '@/components/dashboard/States';

export default function StaffDashboard() {
  const [materialForm, setMaterialForm] = useState({
    name: '',
    description: '',
    quantity: '1',
    unit: 'piece',
    price: '0',
    category: 'DECORATION_RENTAL',
  });
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['staff-orders'],
    queryFn: async () => {
      const res = await api.get('/admin/orders?limit=100');
      return res.data;
    },
  });

  const { data: materials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ['staff-materials'],
    queryFn: async () => {
      const res = await api.get('/admin/materials');
      return res.data;
    },
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ['staff-vendors'],
    queryFn: async () => {
      const res = await api.get('/vendors');
      return res.data;
    },
  });

  const createMaterial = useMutation({
    mutationFn: async () => {
      const decorationVendorId =
        vendors.find((vendor: any) => vendor.category === 'DECORATION')?.id ||
        vendors[0]?.id;
      if (!decorationVendorId) {
        throw new Error('No vendor profile found for restocking.');
      }

      return api.post('/admin/materials', {
        vendorId: decorationVendorId,
        name: materialForm.name,
        description: materialForm.description.trim() || undefined,
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
        quantity: '1',
        unit: 'piece',
        price: '0',
        category: 'DECORATION_RENTAL',
      });
      await queryClient.invalidateQueries({ queryKey: ['staff-materials'] });
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 rounded-2xl border border-[#4a3a22] bg-[#151008] p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#b99b67]">Staff Dashboard</p>
        <h1
          className="mt-2 text-3xl uppercase tracking-[0.08em] text-[#f4eadf] md:text-4xl"
          style={{ fontFamily: 'Didot, Garamond, \"Times New Roman\", serif' }}
        >
          Operations Console
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[#cdbca3]">
          Manage rental stock and monitor incoming orders.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#4a3a22] bg-[#151008] p-6">
          <h2 className="mb-4 text-xl font-semibold text-[#f4eadf]">Restock Materials</h2>
          <div className="space-y-3">
            <input
              value={materialForm.name}
              onChange={(e) =>
                setMaterialForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="input bg-[#efe7dc]"
              placeholder="Material name"
            />
            <textarea
              value={materialForm.description}
              onChange={(e) =>
                setMaterialForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="input min-h-20 bg-[#efe7dc]"
              placeholder="Description"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min={0}
                value={materialForm.quantity}
                onChange={(e) =>
                  setMaterialForm((prev) => ({ ...prev, quantity: e.target.value }))
                }
                className="input bg-[#efe7dc]"
                placeholder="Quantity"
              />
              <input
                value={materialForm.unit}
                onChange={(e) =>
                  setMaterialForm((prev) => ({ ...prev, unit: e.target.value }))
                }
                className="input bg-[#efe7dc]"
                placeholder="Unit"
              />
            </div>
            <input
              type="number"
              min={0}
              step="0.01"
              value={materialForm.price}
              onChange={(e) =>
                setMaterialForm((prev) => ({ ...prev, price: e.target.value }))
              }
              className="input bg-[#efe7dc]"
              placeholder="Price"
            />
            <button
              onClick={() => createMaterial.mutate()}
              disabled={createMaterial.isPending || !materialForm.name.trim()}
              className="rounded-full border border-[#d6b57c] bg-[#d6b57c] px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#171108] transition hover:bg-[#ebcf9f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createMaterial.isPending ? 'Restocking...' : 'Restock Material'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-[#4a3a22] bg-[#151008] p-6">
          <h2 className="mb-4 text-xl font-semibold text-[#f4eadf]">Recent Orders</h2>
          {ordersLoading ? (
            <DashboardSkeleton rows={4} />
          ) : orders.length === 0 ? (
            <EmptyState title="No Orders Yet" description="Orders will appear here." />
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 12).map((order: any) => (
                <div
                  key={order.id}
                  className="rounded-lg border border-[#302515] bg-[#120d07] p-3 text-sm text-[#e8dccb]"
                >
                  <p className="font-semibold">#{order.id.slice(0, 8)}</p>
                  <p>Customer: {order.user?.name || 'Customer'}</p>
                  <p>Amount: ₦{Number(order.totalAmount || 0).toLocaleString()}</p>
                  <p>Status: {order.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-[#4a3a22] bg-[#151008] p-6">
        <h2 className="mb-4 text-xl font-semibold text-[#f4eadf]">Materials in Stock</h2>
        {materialsLoading ? (
          <DashboardSkeleton rows={3} />
        ) : materials.length === 0 ? (
          <EmptyState title="No Materials Yet" description="Restocked materials will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-[#302515] text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                <tr>
                  <th className="py-3 text-left">Material</th>
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
                    <td className="py-3 font-semibold">{material.name}</td>
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
  );
}
