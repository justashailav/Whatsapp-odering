import { useState } from "react";
import Butterchicken from "../assets/Butter-chicken.jpg";
import PannerCurry from "../assets/Paneer-curry.jpg";
import VegBiryani from "../assets/Veg-Biryani.jpeg";
import PannerCurry from "../assets/Panner-Curry.jpg";
import NonVegThali from "../assets/Non-Veg-Thali.avif";
import VegThali from "../assets/Veg-Thali.jpg";
import { useEffect } from "react";

/* ================= CONFIG ================= */
const KITCHEN_OPEN_TIME = 11;
const KITCHEN_CLOSE_TIME = 23;

const CLOSED_DAYS = ["Sunday"]; // 👈 ADD / REMOVE DAYS HERE
const PINCODE_DISTANCE = {
  110001: 2, // 0–3 km
  110002: 4, // 3–6 km
  110003: 7, // >6 km
};

const OFFER_END_HOUR = 21;
const MIN_ORDER_VALUE = 299;

/* ================= ADD-ONS ================= */
const ADDONS = [
  { id: "butter", name: "Extra Butter", price: 20 },
  { id: "raita", name: "Raita", price: 30 },
  { id: "salad", name: "Salad", price: 40 },
];

/* ================= MENU ================= */
const MENU = [
  {
    id: 1,
    name: "Butter Chicken",
    price: 220,
    type: "nonveg",
    image: Butterchicken,
    bestseller: true,
  },
  {
    id: 2,
    name: "Veg Biryani",
    price: 180,
    type: "veg",
    image: VegBiryani,
  },
  {
    id: 3,
    name: "Paneer Curry",
    price: 200,
    type: "veg",
    image: PannerCurry,
    bestseller: true,
  },
  {
    id: 4,
    name: "Veg Thali",
    price: 150,
    type: "veg",
    image: VegThali,
  },
  {
    id: 5,
    name: "Non-Veg Thali",
    price: 150,
    type: "nonveg",
    image: NonVegThali,
  },
];
const orderId = `CK-${Date.now().toString().slice(-6)}`;

const Menu = () => {
  const [cart, setCart] = useState({});
  const [filter, setFilter] = useState("all");
  const [orderType, setOrderType] = useState("delivery");
  const [showCart, setShowCart] = useState(false);
  const [addons, setAddons] = useState({});
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  /* ================= DATE & TIME ================= */
  const now = new Date();
  const currentHour = now.getHours();
  const today = now.toLocaleDateString("en-US", { weekday: "long" });

  const isClosedDay = CLOSED_DAYS.includes(today);

  const isKitchenOpen =
    !isClosedDay &&
    currentHour >= KITCHEN_OPEN_TIME &&
    currentHour < KITCHEN_CLOSE_TIME;
  const estimatedTime =
    orderType === "delivery" ? "🕒 30–40 mins" : "🕒 Ready in 20 mins";

  /* ================= CART ================= */
  const addItem = (item) => {
    if (!isKitchenOpen) return;

    setCart((prev) => ({
      ...prev,
      [item.id]: {
        ...item,
        qty: (prev[item.id]?.qty || 0) + 1,
      },
    }));
  };

  const removeItem = (item) => {
    if (!isKitchenOpen) return;

    setCart((prev) => {
      if (!prev[item.id]) return prev;

      const qty = prev[item.id].qty - 1;
      if (qty <= 0) {
        const updated = { ...prev };
        delete updated[item.id];
        return updated;
      }

      return {
        ...prev,
        [item.id]: { ...prev[item.id], qty },
      };
    });
  };

  const toggleAddon = (addon) => {
    setAddons((prev) => ({
      ...prev,
      [addon.id]: prev[addon.id] ? undefined : addon,
    }));
  };

  const items = Object.values(cart);
  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const addonsTotal = Object.values(addons).reduce((s, a) => s + a.price, 0);
  const distanceKm = PINCODE_DISTANCE[pincode];
  let deliveryFee = 0;
  let deliveryBlocked = false;

  if (orderType === "delivery") {
    if (subtotal >= 499) {
      deliveryFee = 0; // 🎉 Free delivery
    } else if (distanceKm === undefined) {
      deliveryBlocked = true;
    } else if (distanceKm <= 3) {
      deliveryFee = 30;
    } else if (distanceKm <= 6) {
      deliveryFee = 50;
    } else {
      deliveryBlocked = true;
    }
  }

  /* ================= OFFERS ================= */
  let discount = 0;
  let freeRaita = false;

  if (currentHour < OFFER_END_HOUR) discount = subtotal * 0.1;
  if (subtotal >= 499) freeRaita = true;

  const total =
    orderType === "delivery"
      ? subtotal + addonsTotal + deliveryFee - discount
      : subtotal + addonsTotal - discount;

  const canOrder =
    isKitchenOpen &&
    subtotal >= MIN_ORDER_VALUE &&
    totalItems > 0 &&
    (orderType === "pickup" || (address && pincode && !deliveryBlocked));

  const filteredMenu =
    filter === "all" ? MENU : MENU.filter((i) => i.type === filter);
  useEffect(() => {
    localStorage.setItem(
      "orderData",
      JSON.stringify({
        cart,
        addons,
        orderType,
        address,
        pincode,
        phone,
        notes,
      })
    );
  }, [cart, addons, orderType, address, pincode, phone, notes]);
  useEffect(() => {
    const saved = localStorage.getItem("orderData");
    if (saved) {
      const data = JSON.parse(saved);
      setCart(data.cart || {});
      setAddons(data.addons || {});
      setOrderType(data.orderType || "delivery");
      setAddress(data.address || "");
      setPincode(data.pincode || "");
      setPhone(data.phone || "");
      setNotes(data.notes || "");
    }
  }, []);
  const whatsappMessage = [
    `🍽️ Cloud Kitchen – New Order`,
    ``,
    `🆔 Order ID: ${orderId}`,
    ``,
    `🛒 Items`,
    ...items.map((i) => `• ${i.name} × ${i.qty} = ₹${i.qty * i.price}`),
    Object.keys(addons).length
      ? `\n➕ Add-ons\n` +
        Object.values(addons)
          .map((a) => `• ${a.name} = ₹${a.price}`)
          .join("\n")
      : ``,
    freeRaita ? `\n🎁 Free Item: Raita` : ``,
    ``,
    `━━━━━━━━━━━━━━`,
    `🚚 Order Type: ${orderType === "delivery" ? "Delivery" : "Pickup"}`,
    `⏱️ ETA: ${estimatedTime}`,
    ``,
    orderType === "delivery"
      ? `📍 Address:\n${address}\n📮 Pincode: ${pincode}`
      : `🏃 Pickup Order`,
    phone ? `\n📞 Phone: ${phone}` : ``,
    notes ? `\n📝 Notes: ${notes}` : ``,
    ``,
    `━━━━━━━━━━━━━━`,
    `💰 Total Payable: ₹${Math.round(total)}`,
    ``,
    `Please confirm the order. Thank you 😊`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <section className="px-4 py-5 pb-32">
      <h2 className="text-lg font-bold mb-2">🍽️ Today’s Menu</h2>
      <button
        onClick={() => {
          const last = localStorage.getItem("lastOrder");
          if (last) {
            const data = JSON.parse(last);
            setCart(data.cart || {});
            setAddons(data.addons || {});
          }
        }}
        className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full
             bg-emerald-50 text-emerald-700 font-medium text-sm
             hover:bg-emerald-100 active:scale-95 transition"
      >
        🔁 Reorder last order
      </button>

      {/* STATUS BADGE */}
      <div className="flex flex-wrap items-center gap-6 mb-4">
        {isClosedDay ? (
          <span className="px-3 py-1 text-xs rounded-full font-semibold bg-red-100 text-red-700">
            🔴 Closed Today ({today})
          </span>
        ) : isKitchenOpen ? (
          <span className="px-3 py-1 text-xs rounded-full font-semibold bg-emerald-100 text-emerald-700">
            🟢 Open Now
          </span>
        ) : (
          <span className="px-3 py-1 text-xs rounded-full font-semibold bg-orange-100 text-orange-700">
            ⏰ Opens at {KITCHEN_OPEN_TIME}:00
          </span>
        )}
      </div>

      {/* DELIVERY / PICKUP */}
      <div className="flex gap-2 mb-4">
        {["delivery", "pickup"].map((t) => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            disabled={!isKitchenOpen}
            className={`flex-1 py-2 rounded-full text-sm font-semibold ${
              orderType === t ? "bg-gray-900 text-white" : "bg-gray-100"
            } ${!isKitchenOpen && "opacity-50 cursor-not-allowed"}`}
          >
            {t === "delivery" ? "🚚 Delivery" : "🏃 Pickup"}
          </button>
        ))}
      </div>

      {/* FILTER */}
      <div className="flex gap-2 mb-4">
        {["all", "veg", "nonveg"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold ${
              filter === t
                ? t === "veg"
                  ? "bg-green-600 text-white"
                  : t === "nonveg"
                  ? "bg-red-600 text-white"
                  : "bg-gray-900 text-white"
                : "bg-gray-100"
            }`}
          >
            {t === "veg" ? "🟢 Veg" : t === "nonveg" ? "🔴 Non-Veg" : "All"}
          </button>
        ))}
      </div>

      {/* MENU */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-12 mx-auto pb-4">
        {filteredMenu.map((item) => {
          const qty = cart[item.id]?.qty || 0;

          return (
            <div
              key={item.id}
              className="w-full  sm:w-[240px] bg-white rounded-2xl border shadow-sm flex flex-col"
            >
              <div className="relative h-36 overflow-hidden rounded-t-2xl">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />

                {item.bestseller && (
                  <span className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    ⭐ Bestseller
                  </span>
                )}

                <span
                  className={`absolute top-2 left-2 h-3 w-3 rounded-full ${
                    item.type === "veg" ? "bg-green-600" : "bg-red-600"
                  }`}
                />
              </div>

              <div className="p-3">
                <h3 className="font-semibold text-sm">{item.name}</h3>
                <p className="font-bold text-emerald-700 mt-1">₹{item.price}</p>

                <div className="flex justify-between items-center mt-3">
                  <button
                    disabled={!isKitchenOpen}
                    onClick={() => removeItem(item)}
                    className="h-8 w-8 border rounded-full disabled:opacity-40"
                  >
                    −
                  </button>
                  <span>{qty}</span>
                  <button
                    disabled={!isKitchenOpen}
                    onClick={() => addItem(item)}
                    className="h-8 w-8 bg-emerald-600 text-white rounded-full disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* VIEW CART */}
      {totalItems > 0 && (
        <button
          onClick={() => setShowCart(true)}
          disabled={!isKitchenOpen}
          className="fixed bottom-4 left-4 right-4 bg-gray-900 text-white py-3 rounded-xl font-semibold disabled:opacity-40"
        >
          View Cart • ₹{total}
        </button>
      )}

      {/* CART DRAWER */}
      {showCart && (
        <div className="fixed inset-0 bg-black/40 z-50">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-lg">Your Cart</h3>
              <button onClick={() => setShowCart(false)}>✕</button>
            </div>

            {items.map((i) => (
              <div
                key={i.id}
                className="flex justify-between items-center mb-3"
              >
                <div>
                  <p className="font-medium">{i.name}</p>
                  <p className="text-sm text-gray-500">
                    ₹{i.price} × {i.qty}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => removeItem(i)}
                    className="h-7 w-7 border rounded-full"
                  >
                    −
                  </button>
                  <span>{i.qty}</span>
                  <button
                    onClick={() => addItem(i)}
                    className="h-7 w-7 bg-emerald-600 text-white rounded-full"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            {orderPlaced && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-xl p-6 text-center max-w-sm">
                  <h3 className="text-lg font-bold mb-2">✅ Order Sent</h3>
                  <p className="text-gray-600">
                    Your order has been sent on WhatsApp.
                    <br />
                    We’ll confirm shortly 🍳
                  </p>
                  <button
                    onClick={() => setOrderPlaced(false)}
                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* ADDONS */}
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Add Extras</h4>
              {ADDONS.map((a) => (
                <label key={a.id} className="flex justify-between mb-2">
                  <span>
                    {a.name} (+₹{a.price})
                  </span>
                  <input
                    type="checkbox"
                    checked={!!addons[a.id]}
                    onChange={() => toggleAddon(a)}
                  />
                </label>
              ))}
            </div>
            {orderType === "delivery" && (
              <>
                <textarea
                  placeholder="Delivery Address"
                  className="w-full border p-2 mt-3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                {/* PHONE NUMBER */}
                <input
                  type="tel"
                  placeholder="📞 Mobile Number (optional)"
                  className="w-full border p-2 mt-2"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                {/* ORDER NOTES */}

                <input
                  placeholder="Pincode"
                  className="w-full border p-2 mt-2"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
                <textarea
                  placeholder="📝 Special instructions (Less spicy, No onion...)"
                  className="w-full border p-2 mt-2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                {deliveryBlocked && (
                  <p className="text-red-500 text-sm">
                    Delivery not available for this location.
                  </p>
                )}
              </>
            )}

            {/* OFFERS */}
            <div className="mt-2 text-sm">
              {discount > 0 && <p>🎉 10% OFF applied</p>}
              {freeRaita && <p>🥣 Free Raita included</p>}
              {deliveryFee > 0 && <p>🚚 Delivery ₹{deliveryFee}</p>}
            </div>
            {/* FREE DELIVERY NUDGE */}
            {subtotal < 499 && orderType === "delivery" && (
              <p className="text-xs text-amber-600 mt-2">
                ₹{499 - subtotal} more for free delivery 🚚
              </p>
            )}

            <p className="text-sm text-gray-600 mt-2">{estimatedTime}</p>

            {/* TOTAL */}
            <div className="border-t mt-4 pt-4 space-y-1 text-sm">
              <p>Subtotal: ₹{subtotal}</p>
              {discount > 0 && <p>Discount: −₹{Math.round(discount)}</p>}
              {deliveryFee === 0 && orderType === "delivery" ? (
                <p className="text-green-600">🚚 Free Delivery</p>
              ) : (
                deliveryFee > 0 && <p>Delivery: ₹{deliveryFee}</p>
              )}
              <p className="font-bold text-base">Total: ₹{Math.round(total)}</p>
            </div>

            {/* WHATSAPP */}
            <a
              href={
                canOrder
                  ? `https://wa.me/919015118744?text=${encodeURIComponent(
                      whatsappMessage
                    )}`
                  : undefined
              }
              onClick={(e) => {
                if (!canOrder) {
                  e.preventDefault();
                  return;
                }

                setOrderPlaced(true);

                localStorage.setItem(
                  "lastOrder",
                  JSON.stringify({
                    cart,
                    addons,
                    orderType,
                    address,
                    pincode,
                    phone,
                    notes,
                    total,
                    orderId,
                  })
                );
              }}
              className={`block mt-4 text-center py-3 rounded-xl font-semibold transition
    ${
      canOrder
        ? "bg-green-600 text-white hover:bg-green-700 active:scale-95"
        : "bg-gray-300 text-gray-500 cursor-not-allowed"
    }`}
            >
              🟢 Order on WhatsApp
            </a>
          </div>
        </div>
      )}
    </section>
  );
};

export default Menu;
