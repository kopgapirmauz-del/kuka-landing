/* =========================
   KUKA HOME — ui.js (Clean / Pro)
   - One unified chat system
   - Smooth slider support (slideTrack OR legacy slideImg)
   - Lang buttons
   - ToTop
   - Toast + Fly-to-cart
   - Safe helpers
   ========================= */

/* ---------- Helpers ---------- */
function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
function on(el, ev, fn, opts) { el && el.addEventListener(ev, fn, opts); }

function escapeHtml(s = "") {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

function safeJSONParse(v, fallback) {
  try { return JSON.parse(v); } catch { return fallback; }
}

/* ---------- Language ---------- */
function initLangButtons() {
  const btnUz = document.getElementById("langUz");
  const btnRu = document.getElementById("langRu");
  const btnEn = document.getElementById("langEn");

  // setLang global bo‘lishi kerak (i18n.js)
  on(btnUz, "click", () => window.setLang?.("uz"));
  on(btnRu, "click", () => window.setLang?.("ru"));
  on(btnEn, "click", () => window.setLang?.("en"));
}

/* ---------- To Top ---------- */
function initToTop() {
  const btn = document.getElementById("toTop");
  if (!btn) return;

  const toggle = () => {
    if (window.scrollY > 650) btn.classList.add("show");
    else btn.classList.remove("show");
  };

  on(window, "scroll", toggle, { passive: true });
  toggle();

  on(btn, "click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ---------- Toast ---------- */
window.toast = (text) => {
  let t = qs(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = text;
  t.classList.add("is-show");
  setTimeout(() => t.classList.remove("is-show"), 2200);
};

/* ---------- Fly to cart ---------- */
window.flyToCart = (imgEl) => {
  const cart = qs('[data-cart-icon]') || qs(".cart-btn") || qs(".cartPill");
  if (!imgEl || !cart) return;

  const r1 = imgEl.getBoundingClientRect();
  const r2 = cart.getBoundingClientRect();

  const clone = imgEl.cloneNode(true);
  clone.classList.add("fly-img");
  clone.style.left = `${r1.left}px`;
  clone.style.top = `${r1.top}px`;
  clone.style.width = `${Math.max(40, r1.width)}px`;
  clone.style.height = `${Math.max(40, r1.height)}px`;

  // CSS @keyframes flyToCart ishlashi uchun target offset beramiz
  const tx = (r2.left + r2.width / 2) - (r1.left + r1.width / 2);
  const ty = (r2.top + r2.height / 2) - (r1.top + r1.height / 2);
  clone.style.setProperty("--tx", `${tx}px`);
  clone.style.setProperty("--ty", `${ty}px`);

  document.body.appendChild(clone);
  setTimeout(() => clone.remove(), 850);
};

/* ---------- Slider (supports new slideTrack OR legacy slideImg) ---------- */
function initSliderPro(opts = {}) {
  // New slider (slideTrack)
  const track = document.getElementById("slideTrack");
  const dotsWrap = document.getElementById("dots");
  const prev = document.getElementById("slidePrev");
  const next = document.getElementById("slideNext");
  const legacyImg = document.getElementById("slideImg");

  // Legacy slider (only image list)
  // If your app.js calls initSlider(images), we keep legacy API too.
  const intervalMs = Number(opts.intervalMs || 5200);

  // If slideTrack exists => pro slider
  if (track && track.children.length) {
    const slides = Array.from(track.children);
    const total = slides.length;
    let i = 0;
    let timer = null;

    function syncLegacy() {
      if (!legacyImg) return;
      const img = slides[i]?.querySelector("img");
      if (img?.src) legacyImg.src = img.src;
    }

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      for (let k = 0; k < total; k++) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = (k === i) ? "active" : "";
        b.addEventListener("click", () => {
          i = k;
          go();
          restart();
        });
        dotsWrap.appendChild(b);
      }
    }

    function go() {
      track.style.transform = `translateX(${-i * 100}%)`;
      if (dotsWrap) {
        Array.from(dotsWrap.children).forEach((d, idx) => {
          d.classList.toggle("active", idx === i);
        });
      }
      syncLegacy();
    }

    function step(dir) {
      i = (i + dir + total) % total;
      go();
      restart();
    }

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => step(1), intervalMs);
    }

    on(prev, "click", () => step(-1));
    on(next, "click", () => step(1));

    renderDots();
    go();
    restart();

    // Pause on hover (desktop)
    const slider = track.closest(".slider");
    on(slider, "mouseenter", () => timer && clearInterval(timer));
    on(slider, "mouseleave", () => restart());

    return; // pro slider ended
  }

  // Fallback legacy slider (slideImg only)
  // This will be used if old markup exists
  if (legacyImg) {
    const images = opts.images || [];
    if (!images.length) return;

    let i = 0;
    const prevL = prev;
    const nextL = next;

    const render = () => {
      legacyImg.src = images[i];
      if (dotsWrap) {
        dotsWrap.innerHTML = images.map((_, idx) =>
          `<button type="button" class="${idx === i ? "active" : ""}"></button>`
        ).join("");

        // click
        Array.from(dotsWrap.children).forEach((btn, idx) => {
          btn.addEventListener("click", () => { i = idx; render(); });
        });
      }
    };
    const go = (delta) => {
      i = (i + delta + images.length) % images.length;
      render();
    };

    on(prevL, "click", () => go(-1));
    on(nextL, "click", () => go(1));

    render();
    setInterval(() => go(1), intervalMs);
  }
}

/* Legacy API (compat): initSlider(images) */
function initSlider(images) {
  initSliderPro({ images, intervalMs: 5000 });
}
window.initSlider = initSlider;

/* ---------- Unified Chat (works with BOTH markups) ---------- */
/**
 * Supported markups:
 * A) New modal ids:
 *  - #chatOpen, #modalOverlay, #chatModal, #chatClose
 *  - #chatPhone, #chatMsg, #chatSend
 *
 * B) Widget markup:
 *  - [data-chat-open], [data-chat-modal], [data-chat-close]
 *  - [data-chat-form], [data-chat-input], [data-chat-list]
 */
function initChatUnified() {
  // Prefer widget markup if exists (more complete UX)
  const widgetBtn = qs('[data-chat-open]');
  const widgetModal = qs('[data-chat-modal]');

  const idOpenBtn = qs("#chatOpen");
  const idOverlay = qs("#modalOverlay");
  const idModal = qs("#chatModal");
  const idCloseBtn = qs("#chatClose");

  const hasWidget = !!(widgetBtn && widgetModal);
  const hasIdModal = !!(idOpenBtn && idModal);

  // If both exist, we will ONLY use widget to avoid double-open conflicts.
  if (hasWidget) {
    // ---- Widget chat ----
    const closeBtn = qs('[data-chat-close]', widgetModal);
    const form = qs('[data-chat-form]', widgetModal);
    const input = qs('[data-chat-input]', widgetModal);
    const list = qs('[data-chat-list]', widgetModal);

    if (!form || !input || !list) return;

    const KEY = "kuka_chat_messages_v2";
    const saved = safeJSONParse(localStorage.getItem(KEY) || "[]", []);

    const greet = () => ({
      me: false,
      text: "Assalomu alaykum! KUKA HOME. Sizga qanday yordam bera olamiz?"
    });

    function render() {
      list.innerHTML = saved.map(m => `
        <div class="msg ${m.me ? "me" : "bot"}">
          <div class="bubble">${escapeHtml(m.text)}</div>
        </div>
      `).join("");
      list.scrollTop = list.scrollHeight;
      localStorage.setItem(KEY, JSON.stringify(saved));
    }

    function open() {
      widgetModal.classList.add("is-open");
      document.body.style.overflow = "hidden";
      if (!saved.length) saved.push(greet());
      render();
      setTimeout(() => input.focus(), 60);
    }

    function close() {
      widgetModal.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    on(widgetBtn, "click", open);
    on(closeBtn, "click", close);
    on(widgetModal, "click", (e) => { if (e.target === widgetModal) close(); });

    on(form, "submit", async (e) => {
      e.preventDefault();
      const text = (input.value || "").trim();
      if (!text) return;

      saved.push({ me: true, text });
      input.value = "";
      render();

      // Optional: send to Sheets if function exists
      // (sheets.js -> sendChatToSheets)
      if (typeof window.sendChatToSheets === "function") {
        try {
          const payload = {
            phone: "",
            message: text,
            page: location.href,
            ts: new Date().toISOString()
          };
          await window.sendChatToSheets(payload);
        } catch (err) {
          // no hard fail — user chat still works
        }
      }

      // Minimal auto-reply (UX), you can remove if you don’t want
      setTimeout(() => {
        saved.push({ me: false, text: "Rahmat! Operatorimiz tez orada javob beradi ✅" });
        render();
      }, 650);
    });

    return;
  }

  if (!hasIdModal) return;

  // ---- ID-based modal chat ----
  const phone = qs("#chatPhone");
  const msg = qs("#chatMsg");
  const send = qs("#chatSend");

  function open() {
    idOverlay?.classList.add("show");
    idModal?.classList.add("show");
    document.body.style.overflow = "hidden";
    setTimeout(() => msg?.focus(), 60);
  }
  function close() {
    idOverlay?.classList.remove("show");
    idModal?.classList.remove("show");
    document.body.style.overflow = "";
  }

  on(idOpenBtn, "click", open);
  on(idOverlay, "click", close);
  on(idCloseBtn, "click", close);

  on(send, "click", async () => {
    const payload = {
      phone: (phone?.value || "").trim(),
      message: (msg?.value || "").trim(),
      page: location.href,
      ts: new Date().toISOString()
    };
    if (!payload.message) return alert("Xabar yozing.");

    if (typeof window.sendChatToSheets !== "function") {
      alert("Xatolik: sendChatToSheets topilmadi. sheets.js ni tekshiring.");
      return;
    }

    try {
      const r = await window.sendChatToSheets(payload);
      if (r && r.ok !== false) {
        msg.value = "";
        window.toast?.("Yuborildi ✅");
        close();
      } else {
        alert("Xatolik. Endpoint tekshiring.");
      }
    } catch (e) {
      alert("Xatolik. Internet/endpoint tekshiring.");
    }
  });
}

/* ---------- Product Cards: hook helpers (optional use in app.js) ---------- */
window.ui = window.ui || {};
window.ui.bindAddToCartEffects = function bindAddToCartEffects(root = document) {
  // Expected:
  //  - button has [data-add-to-cart]
  //  - card image has [data-card-img]
  qsa("[data-add-to-cart]", root).forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".card") || btn.closest("[data-card]");
      const img = qs("[data-card-img]", card) || qs("img", card);
      if (img) window.flyToCart(img);
      window.toast?.("Savatga qo‘shildi ✅");
    }, { passive: true });
  });
};

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initLangButtons();
  initToTop();
  initChatUnified();

  // Slider init (pro) - if slideTrack exists it will use it automatically
  initSliderPro({ intervalMs: 5200 });
});
