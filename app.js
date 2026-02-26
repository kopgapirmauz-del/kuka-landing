function moneyText(x){
  const s = (x||"").toString().trim();
  if(!s) return "";
  return s;
}

function productCard(p){
  const catLabel = t(p.category === "yangi" ? "new_products" : (p.category === "tavsiya" ? "recommend" : p.category));
  const hasNew = p.price_new && p.price_new.trim().length > 0;

  const priceHtml = hasNew
    ? `<div class="priceRow">
         <span class="oldPrice">${moneyText(p.price_old)}</span>
         <span class="newPrice">${moneyText(p.price_new)}</span>
       </div>`
    : `<div class="priceRow"><span class="onePrice">${moneyText(p.price_old) || "So‘rov bo‘yicha"}</span></div>`;

  const safeImg = p.image || "assets/products/placeholder.jpg";

  return `
    <div class="card">
      <img class="cardImg" src="${safeImg}" alt="${(p.model||"").replaceAll('"',"")}">
      <div class="cardBody">
        <div class="cardTop">
          <div>
            <h3 class="cardTitle">${p.model || ""}</h3>
          </div>
          <span class="tag">${catLabel}</span>
        </div>
        <div class="cardDesc">${p.desc || ""}</div>
        ${priceHtml}
        <div class="cardActions">
          <button class="sbtn" data-add="${p.id}" title="${t("add_cart")}">
            🛒
          </button>
          <a class="btn ghost" href="category.html?cat=${encodeURIComponent(p.category)}#${encodeURIComponent(p.id)}">${t("details")}</a>
          <button class="btn primary" data-add="${p.id}">${t("add_cart")}</button>
        </div>
      </div>
    </div>
  `;
}

async function renderHomeSections(){
  // Katalog (qisqa) — 4 ta card (divan/kreslo/stol/yotoqdan aralash)
  const cats = ["divan","kreslo","stol","yotoq"];
  const all = [];
  for(const c of cats){
    const rows = await fetchSheetRows(SHEETS[c]);
    all.push(...rows.map(x=>({...x, category:c})));
  }
  const catalogShort = all.slice(0, 8);

  const grid = document.getElementById("catalogGrid");
  if(grid) grid.innerHTML = catalogShort.map(productCard).join("");

  // Yangi
  const newRows = await fetchSheetRows(SHEETS.yangi);
  const newGrid = document.getElementById("newGrid");
  if(newGrid) newGrid.innerHTML = newRows.slice(0,8).map(x=>productCard({...x, category:"yangi"})).join("");

  // Tavsiya
  const recRows = await fetchSheetRows(SHEETS.tavsiya);
  const recGrid = document.getElementById("recGrid");
  if(recGrid) recGrid.innerHTML = recRows.slice(0,8).map(x=>productCard({...x, category:"tavsiya"})).join("");

  // add-to-cart handlers (home)
  const idMap = new Map();
  [...catalogShort, ...newRows.map(x=>({...x,category:"yangi"})), ...recRows.map(x=>({...x,category:"tavsiya"}))].forEach(p=>idMap.set(p.id, p));

  document.body.addEventListener("click", (e)=>{
    const btn = e.target.closest("[data-add]");
    if(!btn) return;
    const id = btn.getAttribute("data-add");
    const p = idMap.get(id);
    if(!p) return;
    addToCart({
      id: p.id,
      model: p.model,
      image: p.image,
      price_old: p.price_old,
      price_new: p.price_new,
      category: p.category
    });
  });
}

function initCategoryPills(){
  const pills = document.getElementById("homePills");
  if(!pills) return;

  pills.addEventListener("click", (e)=>{
    const b = e.target.closest(".pill");
    if(!b) return;
    qsa(".pill", pills).forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    const cat = b.dataset.filter;
    location.href = `category.html?cat=${encodeURIComponent(cat)}`;
  });
}

function initSearch(){
  const input = document.getElementById("searchInput");
  if(!input) return;
  input.addEventListener("keydown", (e)=>{
    if(e.key === "Enter"){
      const q = input.value.trim();
      location.href = `category.html?cat=all&q=${encodeURIComponent(q)}`;
    }
  });
}

document.addEventListener("DOMContentLoaded", async ()=>{
  initLangButtons();
  applyI18n();
  updateCartBadge();

  initToTop();
  initChat();

  initSearch();
  initCategoryPills();

  // slider images from GitHub static path
  initSlider([
    "assets/slider/1.jpg",
    "assets/slider/2.jpg",
    "assets/slider/3.jpg",
    "assets/slider/4.jpg",
    "assets/slider/5.jpg",
    "assets/slider/6.jpg",
  ]);

  await renderHomeSections();
});
