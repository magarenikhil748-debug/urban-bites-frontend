"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, Flame, Leaf, Award } from "lucide-react";
import { MenuItem } from "@/data/menu";
import { useCartStore } from "@/store/cartStore";
import QuantitySelector from "./QuantitySelector";

interface MenuCardProps {
  item: MenuItem;
  index: number;
}

export default function MenuCard({ item, index }: MenuCardProps) {
  const { items, addItem, updateQuantity } = useCartStore();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addFlash, setAddFlash] = useState(false);

  const cartItem = items.find((ci) => ci.item.id === item.id);
  const quantity = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    addItem(item);
    setAddFlash(true);
    setTimeout(() => setAddFlash(false), 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className="group relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-amber-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-zinc-800">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800" />
        )}
        <img
          src={item.image}
          alt={item.name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {item.isBestseller && (
            <span className="flex items-center gap-1 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              <Award className="w-2.5 h-2.5" />
              Bestseller
            </span>
          )}
          {item.isSpicy && (
            <span className="flex items-center gap-1 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              <Flame className="w-2.5 h-2.5" />
              Spicy
            </span>
          )}
        </div>

        {/* Veg/Non-veg indicator */}
        <div className="absolute top-3 right-3">
          <div
            className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center ${
              item.isVeg
                ? "border-green-500 bg-green-500/20"
                : "border-red-500 bg-red-500/20"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                item.isVeg ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>
        </div>

        {/* Rating on image */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-white text-xs font-semibold">{item.rating}</span>
          <span className="text-zinc-400 text-[10px]">({item.reviewCount})</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-bold text-white text-[15px] leading-tight line-clamp-1 flex-1">
            {item.name}
          </h3>
          {item.prepTime && (
            <div className="flex items-center gap-1 text-zinc-500 shrink-0">
              <Clock className="w-3 h-3" />
              <span className="text-[10px]">{item.prepTime}</span>
            </div>
          )}
        </div>

        <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 mb-3">
          {item.description}
        </p>

        {/* Price + Add button */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 font-medium">PRICE</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-amber-400 text-xs font-semibold">₹</span>
              <span className="text-white text-lg font-bold">{item.price}</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              <motion.button
                key="add"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleAdd}
                className={`relative px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                  addFlash
                    ? "bg-green-500 text-white"
                    : "bg-amber-500 hover:bg-amber-400 text-black"
                }`}
              >
                <AnimatePresence mode="popLayout">
                  {addFlash ? (
                    <motion.span
                      key="check"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1"
                    >
                      ✓ Added
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add-text"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      + Add
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ) : (
              <motion.div
                key="qty"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <QuantitySelector
                  quantity={quantity}
                  onIncrease={() => updateQuantity(item.id, quantity + 1)}
                  onDecrease={() => updateQuantity(item.id, quantity - 1)}
                  size="md"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
