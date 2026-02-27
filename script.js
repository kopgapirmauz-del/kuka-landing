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

// ========= Premium Slider =========
function initSlider() {
  const root = document.querySelector('[data-slider]');
  if (!root) return;

  const track = root.querySelector('.slider-track');
  const slides = Array.from(root.querySelectorAll('.slide'));
  const prev = root.querySelector('[data-prev]');
  const next = root.querySelector('[data-next]');
  const dots = root.querySelector('.slider-dots');

  let index = 0;
  let timer = null;

  // dots
  dots.innerHTML = slides.map((_, i) => `<button class="dot ${i===0?'is-active':''}" data-dot="${i}" aria-label="slide ${i+1}"></button>`).join('');

  function setActiveDot(i){
    dots.querySelectorAll('.dot').forEach(d=>d.classList.remove('is-active'));
    const el = dots.querySelector(`[data-dot="${i}"]`);
    if (el) el.classList.add('is-active');
  }

  function go(i){
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    setActiveDot(index);
  }

  function play(){
    stop();
    timer = setInterval(()=>go(index+1), 4500);
  }
  function stop(){ if(timer) clearInterval(timer); timer=null; }

  prev?.addEventListener('click', ()=>{ go(index-1); play(); });
  next?.addEventListener('click', ()=>{ go(index+1); play(); });
  dots?.addEventListener('click', (e)=>{
    const b = e.target.closest('[data-dot]');
    if(!b) return;
    go(Number(b.dataset.dot));
    play();
  });

  // swipe
  let startX=0, dx=0, isDown=false;
  root.addEventListener('pointerdown', (e)=>{
    isDown = true;
    startX = e.clientX;
    dx = 0;
    track.style.transition = 'none';
    stop();
  });
  root.addEventListener('pointermove', (e)=>{
    if(!isDown) return;
    dx = e.clientX - startX;
    track.style.transform = `translateX(calc(-${index*100}% + ${dx}px))`;
  });
  root.addEventListener('pointerup', ()=>{
    if(!isDown) return;
    isDown=false;
    track.style.transition = '';
    if (Math.abs(dx) > 60) go(index + (dx<0?1:-1));
    else go(index);
    play();
  });

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', play);

  go(0);
  play();
}
document.addEventListener('DOMContentLoaded', initSlider);

