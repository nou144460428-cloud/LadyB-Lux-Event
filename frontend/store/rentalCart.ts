import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RentalCartItem {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  price: number;
  cautionFee: number;
  unit: string;
  location: string;
  imageUrl: string;
  vendorName: string;
  rentalStartAt?: string;
  rentalEndAt?: string;
}

interface RentalCartStore {
  items: RentalCartItem[];
  addItem: (item: RentalCartItem) => void;
  removeItem: (materialId: string) => void;
  updateQuantity: (materialId: string, quantity: number) => void;
  updateRentalPeriod: (
    materialId: string,
    rentalStartAt?: string,
    rentalEndAt?: string,
  ) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getCautionTotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useRentalCart = create<RentalCartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.materialId === item.materialId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.materialId === item.materialId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }

          return { items: [...state.items, item] };
        }),

      removeItem: (materialId) =>
        set((state) => ({
          items: state.items.filter((i) => i.materialId !== materialId),
        })),

      updateQuantity: (materialId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.materialId === materialId ? { ...i, quantity } : i,
          ),
        })),

      updateRentalPeriod: (materialId, rentalStartAt, rentalEndAt) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.materialId === materialId
              ? { ...i, rentalStartAt, rentalEndAt }
              : i,
          ),
        })),

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getCautionTotal: () => {
        const state = get();
        return state.items.reduce(
          (sum, item) => sum + (item.cautionFee ?? 0) * item.quantity,
          0,
        );
      },

      getTotal: () => {
        const state = get();
        return (
          state.items.reduce((sum, item) => sum + item.price * item.quantity, 0) +
          state.items.reduce(
            (sum, item) => sum + (item.cautionFee ?? 0) * item.quantity,
            0,
          )
        );
      },

      getItemCount: () => {
        const state = get();
        return state.items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'rental-cart-storage',
    },
  ),
);
