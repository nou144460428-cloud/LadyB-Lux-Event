'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/store/cart';

type GrillSubcategory = {
  id: string;
  name: string;
  description: string;
  pricePerGuest: number;
  minGuests: number;
  features: string[];
  addOns: string[];
};

type GrillServiceSubcategoriesProps = {
  items: GrillSubcategory[];
};

export default function GrillServiceSubcategories({
  items,
}: GrillServiceSubcategoriesProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const defaultDeliveryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const handleBook = (item: GrillSubcategory) => {
    addItem({
      id: `grill-service-${item.id}`,
      productId: `grill-service-${item.id}`,
      productName: `${item.name} Service`,
      quantity: 1,
      price: item.pricePerGuest * item.minGuests,
      vendorId: 'grill-service-vendor',
      vendorName: 'Grills & Live Stations',
      productType: 'FOOD',
      deliveryDate: defaultDeliveryDate,
    });

    router.push('/checkout');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#4b3b24] bg-[#171109] p-4 text-[#efe7dc]">
          <p className="text-xs uppercase tracking-[0.12em] text-[#9f8961]">Live Experience</p>
          <p className="mt-2 text-sm text-[#d8c9b1]">
            On-site grill masters with interactive serving stations.
          </p>
        </div>
        <div className="rounded-xl border border-[#4b3b24] bg-[#171109] p-4 text-[#efe7dc]">
          <p className="text-xs uppercase tracking-[0.12em] text-[#9f8961]">Hygiene Standards</p>
          <p className="mt-2 text-sm text-[#d8c9b1]">
            Food-safe prep process, heat-controlled handling, and clean service.
          </p>
        </div>
        <div className="rounded-xl border border-[#4b3b24] bg-[#171109] p-4 text-[#efe7dc]">
          <p className="text-xs uppercase tracking-[0.12em] text-[#9f8961]">Flexible Add-ons</p>
          <p className="mt-2 text-sm text-[#d8c9b1]">
            Pair grills with drinks counters, chops, and premium presentation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-[#4b3b24] bg-[#171109] p-6 text-[#efe7dc]"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-[#b99b67]">Grill Subcategory</p>
            <h3 className="mt-2 text-2xl text-[#f8f1e8]">{item.name}</h3>
            <p className="mt-2 text-sm text-[#cdbca3]">{item.description}</p>

            <p className="mt-4 text-xs uppercase tracking-[0.12em] text-[#9f8961]">
              Minimum Guests: {item.minGuests}
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#f8f1e8]">
              ₦{(item.pricePerGuest * item.minGuests).toLocaleString()}
            </p>

            <ul className="mt-4 space-y-2 text-sm text-[#d8c9b1]">
              {item.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>

            <div className="mt-4 border-t border-[#302515] pt-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[#9f8961]">Popular Add-ons</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.addOns.map((addOn) => (
                  <span
                    key={addOn}
                    className="rounded-full border border-[#5a4528] px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-[#d8c9b1]"
                  >
                    {addOn}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleBook(item)}
              className="mt-6 w-full rounded-full border border-[#d3b37b] bg-[#d3b37b] px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#1a140d] transition hover:bg-[#e1c795]"
            >
              Book {item.name}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
