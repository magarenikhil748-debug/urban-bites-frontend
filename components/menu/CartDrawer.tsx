"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, ChevronRight, FileText } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import QuantitySelector from "./QuantitySelector";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    updateNotes,
    removeItem,
    clearCart,
    subtotal,
    gst,
    total,
  } = useCartStore();

  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);

  const handleCheckout = () => {
    alert("🚀 Order placed! Your food will be ready soon.\n\nTotal: ₹" + Math.round(total()));
    clearCart();
    closeCart();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 rounded-t-3xl max-h-[88vh] flex flex-col border-t border-zinc-800"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1 bg-zinc-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <ShoppingBag className="w-4.5 h-4.5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base">Your Order</h2>
                  <p className="text-zinc-500 text-[11px]">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-zinc-500 hover:text-red-400 transition-colors text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                )}
                <button
                  onClick={closeCart}
                  className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors ml-1"
                >
                  <X className="w-4 h-4 text-zinc-300" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              <AnimatePresence initial={false}>
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-14 gap-4"
                  >
                    <div className="text-5xl">🛒</div>
                    <p className="text-zinc-500 text-sm text-center">
                      Your cart is empty.<br />Add some delicious items!
                    </p>
                  </motion.div>
                ) : (
                  items.map((ci) => (
                    <motion.div
                      key={ci.item.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25 }}
                      className="bg-zinc-900 rounded-2xl p-3 border border-zinc-800"
                    >
                      <div className="flex gap-3">
                        <img
                          src={ci.item.image}
                          alt={ci.item.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-white text-sm font-semibold leading-tight line-clamp-1">
                              {ci.item.name}
                            </h4>
                            <button
                              onClick={() => removeItem(ci.item.id)}
                              className="text-zinc-600 hover:text-red-400 transition-colors shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-amber-400 font-bold text-sm">
                              ₹{ci.item.price * ci.quantity}
                            </span>
                            <QuantitySelector
                              quantity={ci.quantity}
                              onIncrease={() => updateQuantity(ci.item.id, ci.quantity + 1)}
                              onDecrease={() => updateQuantity(ci.item.id, ci.quantity - 1)}
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Notes toggle */}
                      <div className="mt-2">
                        <button
                          onClick={() =>
                            setExpandedNotes(
                              expandedNotes === ci.item.id ? null : ci.item.id
                            )
                          }
                          className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-amber-400 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          {ci.notes ? "Edit note" : "Add note (optional)"}
                        </button>

                        <AnimatePresence>
                          {expandedNotes === ci.item.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <textarea
                                value={ci.notes ?? ""}
                                onChange={(e) => updateNotes(ci.item.id, e.target.value)}
                                placeholder="e.g. No onions, extra spicy..."
                                rows={2}
                                className="w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500/50 resize-none"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Bill summary + Checkout */}
            {items.length > 0 && (
              <div className="border-t border-zinc-800 px-5 pt-4 pb-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Subtotal</span>
                    <span className="text-white font-medium">₹{Math.round(subtotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">GST (5%)</span>
                    <span className="text-white font-medium">₹{Math.round(gst())}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-amber-400 font-bold text-xl">
                      ₹{Math.round(total())}
                    </span>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCheckout}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-xl shadow-amber-500/30"
                >
                  Place Order · ₹{Math.round(total())}
                  <ChevronRight className="w-4 h-4" />
                </motion.button>

                <p className="text-center text-[10px] text-zinc-600">
                  Taxes & charges included · Served at your table
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
