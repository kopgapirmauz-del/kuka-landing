/* =========================
   KUKA HOME — store.js (Pro)
   Cart storage + helpers
   - resilient localStorage
   - events: cart:change
   - availability support (Yes/No)
   - totals + formatting
   ========================= */

const CART_KEY = "kuka_cart_v2"; // v1 dan v2 ga o‘tdik (xohlasangiz v1 qoldiramiz)

// ---------- utils ----------
function safeParse(json, fallback) {
  try { return JSON.parse(json); } catch { return fallback; }
}
function clampInt(n, min, max) {
  const x = Number.parseInt(n, 10);
  if (Number.isNaN(x)) return min;
  return Math.max(min, Math.min(max, x));
}
function normalizeAvailability(v) {
  // sheets: "Yes"/"No" yoki true/false
  if (typeof v === "boolean") return v;
  const s = String(v || "").trim().toLowerCase();
  if (s === "yes" || s === "y" || s === "true" || s === "1" || s === "bor" || s === "mavjud") return true;
  if (s === "no" || s === "n" || s === "false" || s === "0" || s === "yoq" || s === "mavjud emas") return false;
  // default: mavjud deb olamiz (xohlasangiz false qiling)
  return true;
}
function dispatchCartChange(detail = {}) {
  window.dispatchEvent(new CustomEvent("cart:change", { detail }));
}

// ---------- core storage ----------
function readCartRaw() {
  const raw = localStorage.getItem(CART_KEY);
  const arr = safeParse(raw || "[]", []);
  return Array.isArray(arr) ? arr : [];
}

function sanitizeItem(x) {
  // Minimal fields:
  // id, title/model, price, images, qty, available
  if (!x || typeof x !== "object") return null;
  const id = String(x.id ?? "").trim();
  if (!id) return null;

  const qty = clampInt(x.qty ?? 1, 1, 999);

  // Price: number or string -> number
  const priceNum = Number(String(x.price ?? 0).replace(/[^\d.]/g, "")) || 0;

  const images = Array.isArray(x.images) ? x.images.filter(Boolean) : (x.img ? [x.img] : []);
  const title = String(x.title ?? x.model ?? x.name ?? "Model").trim();

  const available = normalizeAvailability(x.available ?? x.inStock ?? x.exists ?? x.status);

  return {
    id,
    title,
    price: priceNum,
    images,
    qty,
    available
  };
}

function readCart() {
  // sanitize to avoid broken items
  const raw = readCartRaw();
  const clean = [];
  for (const it of raw) {
    const s = sanitizeItem(it);
    if (s) clean.push(s);
  }
  return clean;
}

function writeCart(items, reason = "write") {
  const clean = [];
  for (const it of (items || [])) {
    const s = sanitizeItem(it);
    if (s) clean.push(s);
  }
  localStorage.setItem(CART_KEY, JSON.stringify(clean));
  updateCartBadge();
  dispatchCartChange({ reason, cart: clean });
}

// ---------- public API ----------
function cartCount() {
  return readCart().reduce((sum, x) => sum + (x.qty || 0), 0);
}

function getCartItems() {
  return readCart();
}

function isInCart(id) {
  const cid = String(id ?? "");
  return readCart().some(x => x.id === cid);
}

function addToCart(product, qty = 1) {
  const p = sanitizeItem({ ...product, qty: qty });
  if (!p) return { ok: false, error: "bad_product" };

  if (!p.available) {
    // mavjud emas — qo‘shmaymiz
    return { ok: false, error: "not_available" };
  }

  const cart = readCart();
  const found = cart.find(x => x.id === p.id);
  if (found) {
    found.qty = clampInt(found.qty + p.qty, 1, 999);
  } else {
    cart.push(p);
  }
  writeCart(cart, "add");
  return { ok: true };
}

function removeFromCart(id) {
  const cid = String(id ?? "");
  const cart = readCart().filter(x => x.id !== cid);
  writeCart(cart, "remove");
}

function setQty(id, qty) {
  const cid = String(id ?? "");
  const cart = readCart();
  const item = cart.find(x => x.id === cid);
  if (!item) return;

  const q = clampInt(qty, 0, 999);
  if (q <= 0) {
    removeFromCart(cid);
    return;
  }
  item.qty = q;
  writeCart(cart, "qty");
}

function changeQty(id, delta) {
  const cid = String(id ?? "");
  const cart = readCart();
  const item = cart.find(x => x.id === cid);
  if (!item) return;

  const next = (item.qty || 0) + Number(delta || 0);
  if (next <= 0) return removeFromCart(cid);

  item.qty = clampInt(next, 1, 999);
  writeCart(cart, "qty");
}

function clearCart() {
  writeCart([], "clear");
}

function getCartTotal() {
  const cart = readCart();
  return cart.reduce((sum, x) => sum + (Number(x.price) || 0) * (Number(x.qty) || 0), 0);
}

function formatMoney(num, currency = "UZS") {
  const n = Number(num || 0);
  // Siz xohlasangiz "so'm" ko‘rinishga moslab beramiz
  try {
    return new Intl.NumberFormat("ru-RU").format(n) + " " + currency;
  } catch {
    return String(n) + " " + currency;
  }
}

function updateCartBadge() {
  const count = String(cartCount());

  // 1) index.html da: #cartBadge
  const badge = document.getElementById("cartBadge");
  if (badge) badge.textContent = count;

  // 2) boshqa sahifalarda: [data-cart-count]
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    el.textContent = count;
  });
}

// ---------- auto init ----------
document.addEventListener("DOMContentLoaded", () => {
  // old v1 cart migratsiya (agar siz xohlasangiz)
  // v1 -> v2 ko‘chirish: bir marta o‘qiydi va v2 ga yozadi
  const v1 = safeParse(localStorage.getItem("kuka_cart_v1") || "[]", []);
  const v2 = localStorage.getItem(CART_KEY);
  if (!v2 && Array.isArray(v1) && v1.length) {
    writeCart(v1, "migrate");
  } else {
    updateCartBadge();
  }
});

// ---------- expose globals (existing code compatibility) ----------
window.readCart = readCart;
window.writeCart = writeCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.changeQty = changeQty;
window.setQty = setQty;
window.clearCart = clearCart;
window.cartCount = cartCount;
window.updateCartBadge = updateCartBadge;
window.getCartItems = getCartItems;
window.getCartTotal = getCartTotal;
window.formatMoney = formatMoney;
window.isInCart = isInCart;
