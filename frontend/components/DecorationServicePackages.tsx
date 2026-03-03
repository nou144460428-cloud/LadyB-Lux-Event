'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/store/cart';

type DecorationPackage = {
  id: string;
  name: string;
  description: string;
  price: number;
  turnaround: string;
  features: string[];
};

type DecorationServicePackagesProps = {
  packages: DecorationPackage[];
};

export default function DecorationServicePackages({
  packages,
}: DecorationServicePackagesProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const handleBook = (pkg: DecorationPackage) => {
    addItem({
      id: `decor-service-${pkg.id}`,
      productId: `decor-service-${pkg.id}`,
      productName: pkg.name,
      quantity: 1,
      price: pkg.price,
      vendorId: 'decor-full-service-vendor',
      vendorName: 'Full Decoration Services',
      productType: 'SERVICE',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
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
          <p className="text-xs uppercase tracking-[0.14em] text-[#b99b67]">Decoration Package</p>
          <h3 className="mt-2 text-2xl text-[#f8f1e8]">{pkg.name}</h3>
          <p className="mt-2 text-sm text-[#cdbca3]">{pkg.description}</p>

          <div className="mt-4 flex items-end justify-between border-t border-[#302515] pt-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#9f8961]">
              {pkg.turnaround}
            </p>
            <p className="text-2xl font-semibold text-[#f8f1e8]">
              ₦{pkg.price.toLocaleString()}
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
            Book Full Decoration
          </button>
        </article>
      ))}
    </div>
  );
}
