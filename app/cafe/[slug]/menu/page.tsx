"use client";

import { useEffect, useMemo, useState } from "react";

type Cafe = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  currency: string;
};

type MenuItem = {
  id: string;
  branchId: string | null;
  name: string;
  description: string | null;
  priceInPaise: number;
  foodType: string;
};

type MenuCategory = {
  id: string;
  branchId: string | null;
  name: string;
  items: MenuItem[];
};

type CafeTable = {
  id: string;
  tableNumber: string;
  tableLabel: string | null;
  branch: {
    id: string;
    name: string;
  };
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

const formatPrice = (priceInPaise: number, currency: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(priceInPaise / 100);

export default function CafeMenuPage({
  params,
}: {
  params: { slug: string };
}) {
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [tables, setTables] = useState<CafeTable[]>([]);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [specialInstruction, setSpecialInstruction] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    const loadCafe = async () => {
      try {
        setLoading(true);
        const [menuResponse, tablesResponse] = await Promise.all([
          fetch(
            `${apiBaseUrl}/api/v1/public/cafes/${encodeURIComponent(params.slug)}/menu`,
          ),
          fetch(
            `${apiBaseUrl}/api/v1/public/cafes/${encodeURIComponent(params.slug)}/tables`,
          ),
        ]);

        if (!menuResponse.ok || !tablesResponse.ok) {
          throw new Error("This cafe is unavailable right now.");
        }

        const menuBody =
          (await menuResponse.json()) as ApiEnvelope<{
            cafe: Cafe;
            categories: MenuCategory[];
          }>;
        const tablesBody =
          (await tablesResponse.json()) as ApiEnvelope<{
            tables: CafeTable[];
          }>;

        setCafe(menuBody.data.cafe);
        setCategories(menuBody.data.categories);
        setTables(tablesBody.data.tables);
        setSelectedTableId(tablesBody.data.tables[0]?.id ?? "");
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load the cafe.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadCafe();
  }, [params.slug]);

  const selectedTable = tables.find((table) => table.id === selectedTableId);
  const visibleCategories = useMemo(() => {
    if (!selectedTable) {
      return categories;
    }

    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.branchId === null || item.branchId === selectedTable.branch.id,
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [categories, selectedTable]);

  const selectedItems = visibleCategories
    .flatMap((category) => category.items)
    .filter((item) => (quantities[item.id] ?? 0) > 0);

  const subtotalInPaise = selectedItems.reduce(
    (total, item) => total + item.priceInPaise * (quantities[item.id] ?? 0),
    0,
  );

  const changeQuantity = (itemId: string, amount: number) => {
    setQuantities((current) => ({
      ...current,
      [itemId]: Math.max(0, Math.min(99, (current[itemId] ?? 0) + amount)),
    }));
  };

  const placeOrder = async () => {
    if (!selectedTable || selectedItems.length === 0) {
      setError("Choose a table and at least one menu item.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const response = await fetch(
        `${apiBaseUrl}/api/v1/public/cafes/${encodeURIComponent(params.slug)}/orders`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tableNumber: selectedTable.tableNumber,
            customerName: customerName.trim() || undefined,
            customerPhone: customerPhone.trim() || undefined,
            specialInstruction: specialInstruction.trim() || undefined,
            items: selectedItems.map((item) => ({
              menuItemId: item.id,
              quantity: quantities[item.id],
            })),
          }),
        },
      );
      const body = (await response.json()) as ApiEnvelope<{
        order: { orderNumber: string };
      }>;

      if (!response.ok) {
        throw new Error(body.message || "Unable to place the order.");
      }

      setOrderNumber(body.data.order.orderNumber);
      setQuantities({});
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to place the order.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 p-6 text-white">
        Loading cafe menu…
      </main>
    );
  }

  if (error && !cafe) {
    return (
      <main className="min-h-screen bg-zinc-950 p-6 text-white">{error}</main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
            Scan · Select table · Order
          </p>
          <h1 className="mt-2 text-4xl font-black">{cafe?.name}</h1>
          {cafe?.description && (
            <p className="mt-3 text-zinc-400">{cafe.description}</p>
          )}
        </header>

        <section className="mb-8 rounded-3xl border border-white/10 bg-zinc-900 p-5">
          <label className="mb-2 block font-semibold" htmlFor="table">
            Your table
          </label>
          <select
            id="table"
            value={selectedTableId}
            onChange={(event) => setSelectedTableId(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3"
          >
            {tables.map((table) => (
              <option key={table.id} value={table.id}>
                {table.tableLabel ?? `Table ${table.tableNumber}`} ·{" "}
                {table.branch.name}
              </option>
            ))}
          </select>
          {tables.length === 0 && (
            <p className="mt-2 text-sm text-red-400">
              No active tables are currently available.
            </p>
          )}
        </section>

        <div className="space-y-8">
          {visibleCategories.map((category) => (
            <section key={category.id}>
              <h2 className="mb-3 text-2xl font-bold">{category.name}</h2>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <article
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-4"
                  >
                    <div>
                      <h3 className="font-bold">{item.name}</h3>
                      {item.description && (
                        <p className="mt-1 text-sm text-zinc-400">
                          {item.description}
                        </p>
                      )}
                      <p className="mt-2 font-semibold text-amber-400">
                        {formatPrice(
                          item.priceInPaise,
                          cafe?.currency ?? "INR",
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => changeQuantity(item.id, -1)}
                        className="h-10 w-10 rounded-full bg-zinc-800 text-xl"
                      >
                        −
                      </button>
                      <span className="w-6 text-center">
                        {quantities[item.id] ?? 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQuantity(item.id, 1)}
                        className="h-10 w-10 rounded-full bg-amber-500 text-xl font-bold text-black"
                      >
                        +
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-10 space-y-3 rounded-3xl border border-white/10 bg-zinc-900 p-5">
          <input
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Name (optional)"
            className="w-full rounded-xl bg-zinc-950 px-4 py-3"
          />
          <input
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            placeholder="Phone (optional)"
            className="w-full rounded-xl bg-zinc-950 px-4 py-3"
          />
          <textarea
            value={specialInstruction}
            onChange={(event) => setSpecialInstruction(event.target.value)}
            placeholder="Special instruction (optional)"
            className="w-full rounded-xl bg-zinc-950 px-4 py-3"
            rows={3}
          />

          {error && <p className="text-sm text-red-400">{error}</p>}
          {orderNumber && (
            <p className="rounded-xl bg-green-500/10 p-3 text-green-400">
              Order {orderNumber} was placed successfully.
            </p>
          )}

          <button
            type="button"
            disabled={submitting || tables.length === 0}
            onClick={() => void placeOrder()}
            className="w-full rounded-xl bg-amber-500 px-5 py-4 text-lg font-black text-black disabled:opacity-50"
          >
            {submitting
              ? "Placing order…"
              : `Place order · ${formatPrice(
                  subtotalInPaise,
                  cafe?.currency ?? "INR",
                )}`}
          </button>
          <p className="text-center text-xs text-zinc-500">
            Final taxes and total are calculated securely by the cafe server.
          </p>
        </section>
      </div>
    </main>
  );
}
