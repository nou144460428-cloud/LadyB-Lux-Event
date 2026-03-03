import { useRentalCart, type RentalCartItem } from '@/store/rentalCart';

interface RentalCartItemProps {
  item: RentalCartItem;
}

export default function RentalCartItemCard({ item }: RentalCartItemProps) {
  const { removeItem, updateQuantity } = useRentalCart();
  const rentalLineTotal = item.price * item.quantity;
  const cautionLineTotal = (item.cautionFee ?? 0) * item.quantity;

  return (
    <div className="card flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="flex gap-4">
        <img
          src={item.imageUrl}
          alt={item.materialName}
          className="h-20 w-28 rounded-lg object-cover"
        />
        <div>
          <h3 className="font-semibold text-[#2b2113]">{item.materialName}</h3>
          <p className="text-sm text-[#6f5633]">{item.vendorName}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[#8f6b35]">
            {item.location} · {item.unit}
          </p>

          <p className="mt-3 text-xs text-[#6f5633]">
            Rental period and return time will be assigned by stock keeper admin.
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-bold text-[#8f6b35]">
          ₦{(rentalLineTotal + cautionLineTotal).toLocaleString()}
        </p>
        <p className="text-xs text-[#6f5633]">
          Rental: ₦{rentalLineTotal.toLocaleString()} + Caution: ₦{cautionLineTotal.toLocaleString()}
        </p>
        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            onClick={() => updateQuantity(item.materialId, Math.max(1, item.quantity - 1))}
            className="btn-secondary px-2 text-xs"
          >
            -
          </button>
          <span className="px-2">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.materialId, item.quantity + 1)}
            className="btn-secondary px-2 text-xs"
          >
            +
          </button>
        </div>
        <button
          onClick={() => removeItem(item.materialId)}
          className="mt-2 text-sm text-rose-700 hover:underline"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
