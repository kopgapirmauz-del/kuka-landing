/* =========================
   KUKA HOME — app.js (Pro)
   Home page rendering + routing
   - Uses sheets.js: fetchSheetRows, SHEETS
   - Uses i18n.js: t(), applyI18n()
   - Uses store.js: addToCart(), updateCartBadge()
   - Uses ui.js: toast(), flyToCart()
   ========================= */

/* ---------- tiny helpers (safe) ---------- */
function moneyText(x) {
  const s = (x || "").toString().trim();
  return s;
}
function asNumberMoney(x) {
  // "12 000 000 so'm" -> 12000000
  const s = moneyText(x);
  const n = Number(s.replace(/[^\d.]/g, "")) || 0;
  return n;
}
function normAvail(v) {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "no" || s === "yoq" || s === "mavjud emas" || s === "0" || s === "false") return false;
  if (s === "yes" || s === "bor" || s === "mavjud" || s === "1" || s === "true") return true;
  return true; // default
}
function escAttr(s = "") {
  return String(s).replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

/* ---------- card UI ---------- */
function productCard(p) {
  const catLabel = t(
    p.category === "yangi"
      ? "new_products"
      : (p.category === "tavsiya" ? "recommend" : p.category)
  );

  const hasNew = p.price_new && String(p.price_new).trim().length > 0;

  const priceHtml = hasNew
    ? `<div class="priceRow">
         <span class="oldPrice">${moneyText(p.price_old)}</span>
         <span class="newPrice">${moneyText(p.price_new)}</span>
       </div>`
    : `<div class="priceRow">
         <span class="onePrice">${moneyText(p.price_old) || "So‘rov bo‘yicha"}</span>
       </div>`;

  const safeImg = p.image || "assets/products/placeholder.jpg";
  const model = p.model || "";
  const desc = p.desc || "";

  const available = normAvail(p.available ?? p.exists ?? p.inStock ?? p.status);
  const buyDisabled = available ? "" : "disabled";
  const buyTitle = available ? t("add_cart") : (t("not_available") || "Mavjud emas");

  // IMPORTANT:
  // - data-add-to-cart: ui.js effects
  // - data-product-id: we catch in event delegation
  // - data-card-img: for flyToCart image
  return `
    <div class="card" data-card data-product-id="${escAttr(p.id)}">
      <img class="cardImg" data-card-img src="${escAttr(safeImg)}" alt="${escAttr(model)}">

      <div class="cardBody">
        <div class="cardTop">
          <div>
            <h3 class="cardTitle">${escAttr(model)}</h3>
          </div>
          <span class="tag">${escAttr(catLabel)}</span>
        </div>

        <div class="cardDesc">${escAttr(desc)}</div>

        ${priceHtml}

        <div class="cardActions">
          <button class="sbtn" data-add-to-cart data-product-id="${escAttr(p.id)}" title="${escAttr(buyTitle)}" ${buyDisabled}>
            🛒
          </button>

          <a class="btn ghost" href="product.html?id=${encodeURIComponent(p.id)}&cat=${encodeURIComponent(p.category)}">
            ${t("details")}
          </a>

          <button class="btn primary" data-add-to-cart data-product-id="${escAttr(p.id)}" ${buyDisabled}>
            ${t("add_cart")}
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ---------- data build ---------- */
async function loadAllForHome() {
  // Katalog qisqa (divan/kreslo/stol/yotoqdan aralash)
  const cats = ["divan", "kreslo", "stol", "yotoq"];
  const all = [];

  for (const c of cats) {
    const rows = await fetchSheetRows(SHEETS[c]);
    all.push(...rows.map(x => ({ ...x, category: c })));
  }

  // Yangi + Tavsiya
  const newRows = await fetchSheetRows(SHEETS.yangi);
  const recRows = await fetchSheetRows(SHEETS.tavsiya);

  return {
    catalogShort: all.slice(0, 8),
    newRows: newRows.map(x => ({ ...x, category: "yangi" })),
    recRows: recRows.map(x => ({ ...x, category: "tavsiya" }))
  };
}

async function renderHomeSections() {
  const { catalogShort, newRows, recRows } = await loadAllForHome();

  // Render grids
  const grid = document.getElementById("catalogGrid");
  if (grid) grid.innerHTML = catalogShort.map(productCard).join("");

  const newGrid = document.getElementById("newGrid");
  if (newGrid) newGrid.innerHTML = newRows.slice(0, 8).map(productCard).join("");

  const recGrid = document.getElementById("recGrid");
  if (recGrid) recGrid.innerHTML = recRows.slice(0, 8).map(productCard).join("");

  // Map for add-to-cart
  const idMap = new Map();
  [...catalogShort, ...newRows, ...recRows].forEach(p => idMap.set(p.id, p));

  // One event delegation for whole page
  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add-to-cart]");
    if (!btn) return;

    const id = btn.getAttribute("data-product-id");
    const p = idMap.get(id);
    if (!p) return;

    const available = normAvail(p.available ?? p.exists ?? p.inStock ?? p.status);
    if (!available) {
      window.toast?.("Mavjud emas ❌");
      return;
    }

    // Choose price priority: new -> old -> 0
    const price = asNumberMoney(p.price_new) || asNumberMoney(p.price_old) || 0;

    const res = window.addToCart?.({
      id: p.id,
      title: p.model || p.id,
      price,
      images: [
        p.image1 || "",
        p.image2 || "",
        p.image3 || "",
        p.image || ""
      ].filter(Boolean),
      available: "Yes"
    });

    // UI effects
    const card = btn.closest(".card");
    const img = card ? card.querySelector("[data-card-img]") : null;
    if (img) window.flyToCart?.(img);
    window.toast?.("Savatga qo‘shildi ✅");

    // Badge update (store.js o‘zi ham update qiladi, ammo safe)
    window.updateCartBadge?.();

    // optional: if store.js returns error
    if (res && res.ok === false && res.error === "not_available") {
      window.toast?.("Mavjud emas ❌");
    }
  }, { passive: true });

  // If you want additional binding from ui.js:
  window.ui?.bindAddToCartEffects?.(document);
}

/* ---------- home pills -> category.html ---------- */
function initCategoryPills() {
  const pills = document.getElementById("homePills");
  if (!pills) return;

  pills.addEventListener("click", (e) => {
    const b = e.target.closest(".pill");
    if (!b) return;

    qsa(".pill", pills).forEach(x => x.classList.remove("active"));
    b.classList.add("active");

    const cat = b.dataset.filter || "all";
    location.href = `category.html?cat=${encodeURIComponent(cat)}`;
  });
}

/* ---------- search -> category.html?q=... ---------- */
function initSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const q = input.value.trim();
    location.href = `category.html?cat=all&q=${encodeURIComponent(q)}`;
  });
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  // i18n
  window.applyI18n?.();

  // badge
  window.updateCartBadge?.();

  // only home-related
  initSearch();
  initCategoryPills();

  // Slider init is already handled by ui.js (pro slider).
  // Fallback (if someone removed ui.js):
  if (typeof window.initSlider === "function") {
    // safe to call – will auto-use slideTrack if exists
    window.initSlider([
      "assets/slider/1.jpg",
      "assets/slider/2.jpg",
      "assets/slider/3.jpg",
      "assets/slider/4.jpg",
      "assets/slider/5.jpg",
      "assets/slider/6.jpg",
    ]);
  }

  await renderHomeSections();
});
