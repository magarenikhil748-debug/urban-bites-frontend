"use client";
import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";
import SearchBar from "./SearchBar";
import { useCartStore } from "@/store/cartStore";

interface MenuNavbarProps {
  tableId: string;
  search: string;
  onSearchChange: (val: string) => void;
}

export default function MenuNavbar({ tableId, search, onSearchChange }: MenuNavbarProps) {
  const { totalItems, toggleCart } = useCartStore();
  const count = totalItems();

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/60"
    >
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <UtensilsCrossed className="w-4.5 h-4.5 text-black" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-bold text-sm leading-none">Urban Bites</p>
              <p className="text-amber-500 text-[10px] font-medium tracking-wider uppercase">
                Table {tableId}
              </p>
            </div>
          </div>

          {/* Table badge on mobile */}
          <div className="sm:hidden">
            <span className="bg-zinc-800 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-zinc-700">
              Table #{tableId}
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 flex justify-end">
            <SearchBar value={search} onChange={onSearchChange} />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
