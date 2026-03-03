'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/store/cart';

type CateringPackage = {
  id: string;
  name: string;
  description: string;
  pricePerGuest: number;
  minGuests: number;
  maxGuests: number;
  features: string[];
};

type CateringServicePackagesProps = {
  packages: CateringPackage[];
};

export default function CateringServicePackages({
  packages,
}: CateringServicePackagesProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const defaultDeliveryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const handleBook = (pkg: CateringPackage) => {
    const estimatedTotal = pkg.pricePerGuest * pkg.minGuests;

    addItem({
      id: `catering-service-${pkg.id}`,
      productId: `catering-service-${pkg.id}`,
      productName: `${pkg.name} Catering Package`,
      quantity: 1,
      price: estimatedTotal,
      vendorId: 'catering-service-vendor',
      vendorName: 'Premium Catering Services',
      productType: 'FOOD',
      deliveryDate: defaultDeliveryDate,
    });

    router.push('/checkout');
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {packages.map((pkg) => (
        <article
          key={pkg.id}
          className="rounded-2xl border border-[#4b3b24] bg-[#171109] p-6 text-[#efe7dc]"
        >
          <p className="text-xs uppercase tracking-[0.14em] text-[#b99b67]">
            Catering Package
          </p>
          <h3 className="mt-2 text-2xl text-[#f8f1e8]">{pkg.name}</h3>
          <p className="mt-2 text-sm text-[#cdbca3]">{pkg.description}</p>

          <div className="mt-4 border-t border-[#302515] pt-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#9f8961]">
              Guest Range
            </p>
            <p className="mt-1 text-sm text-[#d8c9b1]">
              {pkg.minGuests} - {pkg.maxGuests} guests
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[#9f8961]">
              Starting From
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#f8f1e8]">
              ₦{(pkg.pricePerGuest * pkg.minGuests).toLocaleString()}
            </p>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-[#d8c9b1]">
            {pkg.features.map((feature) => (
              <li key={feature}>• {feature}</li>
            ))}
          </ul>

          <button
            onClick={() => handleBook(pkg)}
            className="mt-6 w-full rounded-full border border-[#d3b37b] bg-[#d3b37b] px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#1a140d] transition hover:bg-[#e1c795]"
          >
            Book Catering
          </button>
        </article>
      ))}
    </div>
  );
}
