import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MenuItem } from "@/data/menu";

export interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
  gst: () => number;
  total: () => number;
}

const GST_RATE = 0.05;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item: MenuItem) => {
        const existing = get().items.find((ci) => ci.item.id === item.id);
        if (existing) {
          set((state) => ({
            items: state.items.map((ci) =>
              ci.item.id === item.id
                ? { ...ci, quantity: ci.quantity + 1 }
                : ci
            ),
          }));
        } else {
          set((state) => ({
            items: [...state.items, { item, quantity: 1, notes: "" }],
          }));
        }
      },

      removeItem: (itemId: string) => {
        set((state) => ({
          items: state.items.filter((ci) => ci.item.id !== itemId),
        }));
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((ci) =>
            ci.item.id === itemId ? { ...ci, quantity } : ci
          ),
        }));
      },

      updateNotes: (itemId: string, notes: string) => {
        set((state) => ({
          items: state.items.map((ci) =>
            ci.item.id === itemId ? { ...ci, notes } : ci
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () =>
        get().items.reduce((sum, ci) => sum + ci.quantity, 0),

      subtotal: () =>
        get().items.reduce(
          (sum, ci) => sum + ci.item.price * ci.quantity,
          0
        ),

      gst: () => get().subtotal() * GST_RATE,

      total: () => get().subtotal() + get().gst(),
    }),
    { name: "urban-bites-cart" }
  )
);
