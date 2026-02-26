// year
document.getElementById("year").textContent = new Date().getFullYear();

// Elements
const categoryBtn = document.getElementById("categoryBtn");
const categoryMenu = document.getElementById("categoryMenu");
const tabs = document.querySelectorAll(".tab");
const catItems = document.querySelectorAll(".cat-item");
const products = Array.from(document.querySelectorAll(".product"));
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");

const favCountEl = document.getElementById("favCount");
const cartCountEl = document.getElementById("cartCount");
let favCount = 0;
let cartCount = 0;

let activeFilter = "all";
let searchTerm = "";

// Category dropdown
if (categoryBtn && categoryMenu) {
  categoryBtn.addEventListener("click", () => {
    const open = categoryMenu.classList.toggle("open");
    categoryBtn.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (e) => {
    const inside = categoryMenu.contains(e.target) || categoryBtn.contains(e.target);
    if (!inside) {
      categoryMenu.classList.remove("open");
      categoryBtn.setAttribute("aria-expanded", "false");
    }
  });
}

// Filtering
function applyFilters() {
  const term = searchTerm.trim().toLowerCase();
  let visible = 0;

  products.forEach((p) => {
    const type = p.dataset.type;
    const name = (p.dataset.name || "").toLowerCase();
    const matchFilter = (activeFilter === "all") || (type === activeFilter);
    const matchSearch = !term || name.includes(term);
    const ok = matchFilter && matchSearch;

    p.style.display = ok ? "block" : "none";
    if (ok) visible++;
  });

  emptyState.hidden = visible !== 0;
}

function setActiveButtons(filter) {
  // tabs
  tabs.forEach(t => t.classList.toggle("active", t.dataset.filter === filter));
  // category items (both header dropdown and drawer)
  catItems.forEach(c => c.classList.toggle("active", c.dataset.filter === filter));
}

// Tab click
tabs.forEach((t) => {
  t.addEventListener("click", () => {
    activeFilter = t.dataset.filter;
    setActiveButtons(activeFilter);
    applyFilters();
  });
});

// Category click
catItems.forEach((c) => {
  c.addEventListener("click", () => {
    activeFilter = c.dataset.filter;
    setActiveButtons(activeFilter);
    applyFilters();

    // close dropdown if open
    if (categoryMenu?.classList.contains("open")) {
      categoryMenu.classList.remove("open");
      categoryBtn?.setAttribute("aria-expanded", "false");
    }

    // close drawer if open
    drawerClose();
  });
});

// Search
function setSearch(v) {
  searchTerm = v || "";
  applyFilters();
}

if (searchInput) {
  searchInput.addEventListener("input", (e) => setSearch(e.target.value));
}

// Product actions
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  if (action === "fav") {
    favCount++;
    favCountEl.textContent = favCount;
    btn.classList.add("pulse");
    setTimeout(() => btn.classList.remove("pulse"), 220);
  }

  if (action === "cart") {
    cartCount++;
    cartCountEl.textContent = cartCount;
    btn.classList.add("pulse");
    setTimeout(() => btn.classList.remove("pulse"), 220);
  }
});

// Mobile drawer
const burger = document.getElementById("burger");
const drawer = document.getElementById("drawer");
const drawerCloseBtn = document.getElementById("drawerClose");

function drawerOpen() {
  if (!drawer) return;
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
}
function drawerClose() {
  if (!drawer) return;
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
}
if (burger) burger.addEventListener("click", drawerOpen);
if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", drawerClose);
if (drawer) {
  drawer.addEventListener("click", (e) => {
    // click outside panel closes (we used full overlay; blocks are inside overlay)
    // close when click on overlay background only
    if (e.target === drawer) drawerClose();
  });
}

// initial
applyFilters();
