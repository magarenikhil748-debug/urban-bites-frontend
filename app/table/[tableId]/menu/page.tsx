"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";
import { menuItems, categories, Category } from "@/data/menu";
import MenuNavbar from "@/components/menu/MenuNavbar";
import CategoryTabs from "@/components/menu/CategoryTabs";
import MenuCard from "@/components/menu/MenuCard";
import FloatingCartButton from "@/components/menu/FloatingCartButton";
import CartDrawer from "@/components/menu/CartDrawer";
import MenuSkeleton from "@/components/menu/MenuSkeleton";

interface PageProps {
  params: { tableId: string };
}

export default function MenuPage({ params }: PageProps) {
  const { tableId } = params;
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const categoryCounts = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] =
        cat.id === "all"
          ? menuItems.length
          : menuItems.filter((i) => i.category === cat.id).length;
      return acc;
    }, {} as Record<Category, number>);
  }, []);

  const filtered = useMemo(() => {
    let result = menuItems;
    if (activeCategory !== "all") {
      result = result.filter((i) => i.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeCategory, search]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="relative z-10">
        {/* Navbar */}
        <MenuNavbar
          tableId={tableId}
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            if (val) setActiveCategory("all");
          }}
        />

        {/* Hero strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-4 pt-4 pb-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                What&apos;re you{" "}
                <span className="text-amber-400">craving?</span>
              </h1>
              <p className="text-zinc-500 text-sm mt-0.5">
                Fresh made to order · Table #{tableId}
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 text-xs font-semibold">Kitchen Open</span>
            </div>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <CategoryTabs
            active={activeCategory}
            onChange={(cat) => {
              setActiveCategory(cat);
              setSearch("");
            }}
            counts={categoryCounts}
          />
        </motion.div>

        {/* Content */}
        <div className="pb-32">
          {loading ? (
            <MenuSkeleton />
          ) : (
            <AnimatePresence mode="wait">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-24 gap-4"
                >
                  <div className="text-6xl">🔍</div>
                  <p className="text-zinc-400 text-center">
                    No dishes found for{" "}
                    <span className="text-amber-400">&quot;{search}&quot;</span>
                  </p>
                  <button
                    onClick={() => setSearch("")}
                    className="text-sm text-amber-500 underline"
                  >
                    Clear search
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={`${activeCategory}-${search}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 pt-2"
                >
                  {filtered.map((item, idx) => (
                    <MenuCard key={item.id} item={item} index={idx} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Floating Cart */}
      <FloatingCartButton />

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
