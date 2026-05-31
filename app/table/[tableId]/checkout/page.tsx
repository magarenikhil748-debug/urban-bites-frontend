export default function CheckoutPage() {
  const items = [
    {
      id: 1,
      name: "Smoky Chicken Burger",
      qty: 2,
      price: 299,
    },
    {
      id: 2,
      name: "Cold Coffee",
      qty: 1,
      price: 199,
    },
  ];

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const gst = subtotal * 0.05;
  const total = subtotal + gst;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <h1 className="text-4xl font-bold mb-2">
          Complete Your Order
        </h1>

        <p className="text-zinc-400 mb-8">
          Table 5 • Urban Bites Cafe
        </p>

        {/* Order Summary */}
        <div className="bg-zinc-950 border border-white/5 rounded-[28px] p-5 mb-5">
          <h2 className="text-xl font-semibold mb-5">
            Order Summary
          </h2>

          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between mb-4"
            >
              <div>
                {item.name} x {item.qty}
              </div>

              <div>
                ₹{item.price * item.qty}
              </div>
            </div>
          ))}

          <hr className="border-zinc-800 my-5" />

          <div className="flex justify-between text-zinc-400 mb-2">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="flex justify-between text-zinc-400 mb-4">
            <span>GST (5%)</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-2xl font-bold text-amber-400">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Order Type */}
        <div className="bg-zinc-950 border border-white/5 rounded-[28px] p-5 mb-5">
          <h2 className="text-xl font-semibold mb-4">
            Order Type
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button className="border border-amber-500 bg-amber-500/10 rounded-2xl p-4">
              <div className="text-3xl mb-2">
                🍽️
              </div>

              <div className="font-semibold">
                Dine In
              </div>

              <div className="text-xs text-zinc-400 mt-1">
                Served to your table
              </div>
            </button>

            <button className="border border-zinc-700 rounded-2xl p-4">
              <div className="text-3xl mb-2">
                🥡
              </div>

              <div className="font-semibold">
                Takeaway
              </div>

              <div className="text-xs text-zinc-400 mt-1">
                Pick up from counter
              </div>
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-zinc-950 border border-white/5 rounded-[28px] p-5 mb-32">
          <h2 className="text-xl font-semibold mb-4">
            Payment Method
          </h2>

          <div className="space-y-3">
            <button className="w-full text-left border border-amber-500 bg-amber-500/10 rounded-2xl p-4">
              💵 Cash
            </button>

            <button className="w-full text-left border border-zinc-700 rounded-2xl p-4">
              📱 UPI
            </button>

            <button className="w-full text-left border border-zinc-700 rounded-2xl p-4">
              💳 Card
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-5 left-4 right-4">
        <div className="max-w-md mx-auto">
          <button className="w-full bg-amber-500 text-black font-bold text-xl py-5 rounded-[24px]">
            Place Order • ₹{total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}