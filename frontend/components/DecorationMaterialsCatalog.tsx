'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useRentalCart } from '@/store/rentalCart';
import { getAuthUser, isDecoratorAccount } from '@/lib/auth';

type DecorationMaterial = {
  id: string | number;
  name: string;
  description: string;
  unit: string;
  price: string | number;
  cautionFeeRate?: number;
  location: string;
  image: string;
  vendorName?: string;
};

type DecorationMaterialsCatalogProps = {
  items: DecorationMaterial[];
  defaultCautionFeeRate?: number;
};

function parsePrice(value: string): number {
  const numeric = Number(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
}

const DEFAULT_CAUTION_FEE_RATE = 0.2;

function calculateCautionFee(price: number, cautionFeeRate?: number): number {
  // Material-specific caution fee rate (falls back to default).
  const rate = cautionFeeRate ?? DEFAULT_CAUTION_FEE_RATE;
  return Math.round(price * Math.max(0, rate));
}

export default function DecorationMaterialsCatalog({
  items,
  defaultCautionFeeRate,
}: DecorationMaterialsCatalogProps) {
  const router = useRouter();
  const { addItem } = useRentalCart();
  const [backendItems, setBackendItems] = useState<DecorationMaterial[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadBackendProducts = async () => {
      try {
        const res = await api.get<any[]>(
          '/search/products?type=RENTAL&category=DECORATION',
        );
        if (cancelled) return;

        const mapped = (res.data || []).map((product) => ({
          id: String(product.id),
          name: product.name,
          description: product.description || 'Rental material',
          unit: 'per unit',
          price: Number(product.price || 0),
          location: product.vendor?.location || 'Nigeria',
          image: product.imageUrl || 'https://placehold.co/600x400?text=Material',
          vendorName: product.vendor?.businessName || 'Decoration Vendor',
        }));

        setBackendItems(mapped);
      } catch {
        // Fallback to curated local mock items when API is unavailable.
      }
    };

    loadBackendProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const effectiveItems = useMemo(
    () => (backendItems.length > 0 ? backendItems : items),
    [backendItems, items],
  );
  const usingBackendCatalog = backendItems.length > 0;

  const handleOrderMaterial = (item: DecorationMaterial) => {
    const user = getAuthUser();
    if (!isDecoratorAccount(user)) {
      router.push('/vendors/event-planners');
      return;
    }

    if (!usingBackendCatalog) {
      return;
    }

    const rentalPrice =
      typeof item.price === 'number' ? item.price : parsePrice(item.price);
    const effectiveCautionFeeRate =
      item.cautionFeeRate ?? defaultCautionFeeRate ?? DEFAULT_CAUTION_FEE_RATE;

    addItem({
      id: String(item.id),
      materialId: String(item.id),
      materialName: item.name,
      quantity: 1,
      price: rentalPrice,
      cautionFee: calculateCautionFee(rentalPrice, effectiveCautionFeeRate),
      vendorName: item.vendorName || 'Event Decoration Material Rentals',
      unit: item.unit,
      location: item.location,
      imageUrl: item.image,
    });

    router.push('/rentals/cart');
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {!usingBackendCatalog && (
        <div className="md:col-span-2 lg:col-span-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Live rental products are not available right now. Please check back when stock keeper admin publishes rental inventory.
        </div>
      )}
      {effectiveItems.map((item) => {
        const effectiveCautionFeeRate =
          item.cautionFeeRate ?? defaultCautionFeeRate ?? DEFAULT_CAUTION_FEE_RATE;
        const displayPrice =
          typeof item.price === 'number'
            ? `₦${item.price.toLocaleString()}`
            : item.price;

        return (
        <article
          key={item.id}
          className="overflow-hidden rounded-xl border border-[#4b3b24] bg-white shadow-sm transition hover:shadow-md"
        >
          <div className="h-44 bg-gray-100">
            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
          </div>
          <div className="p-5">
            <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
            <p className="mt-2 text-sm text-gray-600">{item.description}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.08em] text-gray-500">
              {item.location} · {item.unit}
            </p>
            <p className="mt-2 text-xl font-semibold text-gray-900">{displayPrice}</p>
            <p className="mt-1 text-xs text-gray-500">
              Caution Fee: {Math.round(effectiveCautionFeeRate * 100)}%
            </p>
            <button
              onClick={() => handleOrderMaterial(item)}
              disabled={!usingBackendCatalog}
              className="mt-4 w-full rounded bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {usingBackendCatalog ? 'Add to Rental Cart' : 'Unavailable for Checkout'}
            </button>
          </div>
        </article>
        );
      })}
    </div>
  );
}
