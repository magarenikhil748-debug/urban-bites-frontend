"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function FloatingCartButton() {
  const { totalItems, subtotal, openCart } = useCartStore();
  const count = totalItems();

  if (count === 0) return null;

  return (
    <AnimatePresence>
      <motion.button
        key="floating-cart"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.35 }}
        onClick={openCart}
        className="fixed bottom-6 left-4 right-4 z-40 mx-auto max-w-sm"
      >
        <div className="bg-amber-500 rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-2xl shadow-amber-500/40 hover:bg-amber-400 active:scale-[0.98] transition-all duration-150">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-black" />
              <AnimatePresence>
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-black text-amber-400 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                >
                  {count}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="text-black font-bold text-sm">
              {count} {count === 1 ? "item" : "items"} in cart
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-black font-bold text-sm">
              ₹{Math.round(subtotal())}
            </span>
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="text-black font-bold"
            >
              →
            </motion.span>
          </div>
        </div>
      </motion.button>
    </AnimatePresence>
  );
}
