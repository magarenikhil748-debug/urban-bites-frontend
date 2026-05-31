"use client";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Category, categories } from "@/data/menu";

interface CategoryTabsProps {
  active: Category;
  onChange: (cat: Category) => void;
  counts: Record<Category, number>;
}

export default function CategoryTabs({ active, onChange, counts }: CategoryTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current;
      const el = activeRef.current;
      const elLeft = el.offsetLeft;
      const elWidth = el.offsetWidth;
      const containerWidth = container.clientWidth;
      container.scrollTo({
        left: elLeft - containerWidth / 2 + elWidth / 2,
        behavior: "smooth",
      });
    }
  }, [active]);

  return (
    <div
      ref={containerRef}
      className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {categories.map((cat) => {
        const isActive = active === cat.id;
        return (
          <motion.button
            key={cat.id}
            ref={isActive ? activeRef : null}
            whileTap={{ scale: 0.94 }}
            onClick={() => onChange(cat.id)}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-250 shrink-0 ${
              isActive
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                : "bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700/60"
            }`}
          >
            <span className="text-base leading-none">{cat.emoji}</span>
            <span>{cat.label}</span>
            {counts[cat.id] > 0 && !isActive && (
              <span className="text-[10px] bg-zinc-600 text-zinc-300 rounded-full px-1.5 py-0.5 leading-none font-bold">
                {counts[cat.id]}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 rounded-full bg-amber-500 -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
