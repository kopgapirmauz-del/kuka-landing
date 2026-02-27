/* =========================
   KUKA HOME — script.js (Pro / Safe)
   Works with:
   - store.js (cartCount, addToCart, updateCartBadge, formatMoney)
   - ui.js (toast, flyToCart)
   Notes:
   - Does NOT create another slider (ui.js handles slider)
   ========================= */

(function () {
  // ----- small helpers -----
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  const toNum = (v) => {
    const n = Number(String(v ?? "").replace(/[^\d.]/g, "")) || 0;
    return n;
  };
  const normAvail = (v) => {
    const s = String(v ?? "").trim().toLowerCase();
    if (["no", "false", "0", "yoq", "mavjud emas"].includes(s)) return false;
    if (["yes", "true", "1", "bor", "mavjud"].includes(s)) return true;
    return true; // default
  };

  // ----- Year -----
  const yearEl = qs("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ----- Elements (optional by page) -----
  const categoryBtn = qs("#categoryBtn");
  const categoryMenu = qs("#categoryMenu");
  const tabs = qsa(".tab");
  const catItems = qsa(".cat-item");
  const products = qsa(".product");
  const searchInput = qs("#searchInput");
  const emptyState = qs("#emptyState");

  const favCountEl = qs("#favCount");
  const cartCountEl = qs("#cartCount"); // agar category sahifada bo‘lsa

  let favCount = 0;
  let activeFilter = "all";
  let searchTerm = "";

  // ----- Category dropdown -----
  if (categoryBtn && categoryMenu) {
    on(categoryBtn, "click", () => {
      const open = categoryMenu.classList.toggle("open");
      categoryBtn.setAttribute("aria-expanded", String(open));
    });

    on(document, "click", (e) => {
      const inside = categoryMenu.contains(e.target) || categoryBtn.contains(e.target);
      if (!inside) {
        categoryMenu.classList.remove("open");
        categoryBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  function setActiveButtons(filter) {
    tabs.forEach(t => t.classList.toggle("active", t.dataset.filter === filter));
    catItems.forEach(c => c.classList.toggle("active", c.dataset.filter === filter));
  }

  function applyFilters() {
    if (!products.length) return;

    const term = searchTerm.trim().toLowerCase();
    let visible = 0;

    products.forEach((p) => {
      const type = (p.dataset.type || "").toLowerCase();
      const name = (p.dataset.name || "").toLowerCase();

      const matchFilter = (activeFilter === "all") || (type === activeFilter);
      const matchSearch = !term || name.includes(term);
      const ok = matchFilter && matchSearch;

      p.style.display = ok ? "block" : "none";
      if (ok) visible++;
    });

    if (emptyState) emptyState.hidden = visible !== 0;
  }

  // ----- Tabs click -----
  tabs.forEach((t) => {
    on(t, "click", () => {
      activeFilter = (t.dataset.filter || "all").toLowerCase();
      setActiveButtons(activeFilter);
      applyFilters();
    });
  });

  // ----- Category items click -----
  catItems.forEach((c) => {
    on(c, "click", () => {
      activeFilter = (c.dataset.filter || "all").toLowerCase();
      setActiveButtons(activeFilter);
      applyFilters();

      // close dropdown
      if (categoryMenu?.classList.contains("open")) {
        categoryMenu.classList.remove("open");
        categoryBtn?.setAttribute("aria-expanded", "false");
      }
    });
  });

  // ----- Search -----
  function setSearch(v) {
    searchTerm = v || "";
    applyFilters();
  }
  if (searchInput) on(searchInput, "input", (e) => setSearch(e.target.value));

  // ----- Real cart count from store.js -----
  function syncCartCount() {
    try {
      const n = window.cartCount ? window.cartCount() : 0;
      if (cartCountEl) cartCountEl.textContent = String(n);
      window.updateCartBadge?.();
    } catch {}
  }

  // store.js event (bizning yangi store.js dispatch qiladi)
  window.addEventListener("cart:change", syncCartCount);

  // initial
  document.addEventListener("DOMContentLoaded", () => {
    setActiveButtons(activeFilter);
    applyFilters();
    syncCartCount();
  });

  // ----- Product actions (fav / cart) -----
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;

    // FAVORITE (local only)
    if (action === "fav") {
      favCount++;
      if (favCountEl) favCountEl.textContent = String(favCount);
      btn.classList.add("pulse");
      setTimeout(() => btn.classList.remove("pulse"), 220);
      return;
    }

    // CART (real store.js cart)
    if (action === "cart") {
      const card = btn.closest(".product") || btn.closest(".card") || btn.closest("[data-product]");
      if (!card) return;

      // Siz category/product cardlarda shularni dataset qilib qo‘ysangiz bas:
      // data-id, data-title, data-price, data-image, data-available (Yes/No)
      const id = card.dataset.id || card.dataset.sku || card.dataset.name;
      const title = card.dataset.title || card.dataset.name || id || "Model";
      const price = toNum(card.dataset.price);
      const image = card.dataset.image || card.querySelector("img")?.src || "";
      const available = normAvail(card.dataset.available);

      if (!id) {
        window.toast?.("Xatolik: product id yo‘q");
        return;
      }

      if (!available) {
        window.toast?.("Mavjud emas ❌");
        return;
      }

      // Add to cart
      const res = window.addToCart?.({
        id: String(id),
        title: String(title),
        price: Number(price) || 0,
        images: image ? [image] : [],
        available: "Yes"
      });

      // UI effects
      const imgEl = card.querySelector("img");
      if (imgEl) window.flyToCart?.(imgEl);
      window.toast?.("Savatga qo‘shildi ✅");

      btn.classList.add("pulse");
      setTimeout(() => btn.classList.remove("pulse"), 220);

      // Sync count
      syncCartCount();

      // If store denies
      if (res && res.ok === false && res.error === "not_available") {
        window.toast?.("Mavjud emas ❌");
      }
    }
  });

})();
