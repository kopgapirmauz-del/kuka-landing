function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }

function initLangButtons(){
  const btnUz = document.getElementById("langUz");
  const btnRu = document.getElementById("langRu");
  const btnEn = document.getElementById("langEn");
  btnUz && (btnUz.onclick = ()=> setLang("uz"));
  btnRu && (btnRu.onclick = ()=> setLang("ru"));
  btnEn && (btnEn.onclick = ()=> setLang("en"));
}

function initToTop(){
  const btn = document.getElementById("toTop");
  if(!btn) return;
  window.addEventListener("scroll", ()=>{
    if(window.scrollY > 600) btn.classList.add("show");
    else btn.classList.remove("show");
  });
  btn.addEventListener("click", ()=> window.scrollTo({top:0, behavior:"smooth"}));
}

function initChat(){
  const openBtn = document.getElementById("chatOpen");
  const overlay = document.getElementById("modalOverlay");
  const modal = document.getElementById("chatModal");
  const closeBtn = document.getElementById("chatClose");

  const phone = document.getElementById("chatPhone");
  const msg = document.getElementById("chatMsg");
  const send = document.getElementById("chatSend");

  function open(){
    overlay.classList.add("show");
    modal.classList.add("show");
  }
  function close(){
    overlay.classList.remove("show");
    modal.classList.remove("show");
  }

  openBtn && openBtn.addEventListener("click", open);
  overlay && overlay.addEventListener("click", close);
  closeBtn && closeBtn.addEventListener("click", close);

  send && send.addEventListener("click", async ()=>{
    const payload = {
      phone: (phone?.value || "").trim(),
      message: (msg?.value || "").trim(),
      page: location.href,
      ts: new Date().toISOString()
    };
    if(!payload.message) return alert("Xabar yozing.");
    const r = await sendChatToSheets(payload);
    if(r && r.ok !== false){
      msg.value = "";
      alert("Yuborildi ✅");
      close();
    }else{
      alert("Xatolik. Endpoint tekshiring.");
    }
  });
}

function initSlider(images){
  const imgEl = document.getElementById("slideImg");
  const prev = document.getElementById("slidePrev");
  const next = document.getElementById("slideNext");
  const dots = document.getElementById("dots");
  if(!imgEl || !images?.length) return;

  let i = 0;
  function render(){
    imgEl.src = images[i];
    if(dots){
      dots.innerHTML = images.map((_,idx)=>`<span class="${idx===i?'active':''}"></span>`).join("");
    }
  }
  function go(delta){
    i = (i + delta + images.length) % images.length;
    render();
  }
  prev && prev.addEventListener("click", ()=>go(-1));
  next && next.addEventListener("click", ()=>go(1));

  render();
  setInterval(()=>go(1), 5000);
}

// ========= Chat Widget =========
function initChatWidget() {
  const btn = document.querySelector('[data-chat-open]');
  const modal = document.querySelector('[data-chat-modal]');
  if (!btn || !modal) return;

  const closeBtn = modal.querySelector('[data-chat-close]');
  const form = modal.querySelector('[data-chat-form]');
  const input = modal.querySelector('[data-chat-input]');
  const list = modal.querySelector('[data-chat-list]');

  const KEY = 'kuka_chat_messages_v1';
  const saved = JSON.parse(localStorage.getItem(KEY) || '[]');

  function render() {
    list.innerHTML = saved.map(m => `
      <div class="msg ${m.me ? 'me' : 'bot'}">
        <div class="bubble">${escapeHtml(m.text)}</div>
      </div>
    `).join('');
    list.scrollTop = list.scrollHeight;
  }

  function open() {
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (!saved.length) {
      saved.push({ me:false, text:"Assalomu alaykum! KUKA HOME. Sizga qanday yordam bera olamiz?" });
    }
    render();
    setTimeout(()=>input.focus(), 50);
  }
  function close() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  modal.addEventListener('click', (e)=>{ if(e.target === modal) close(); });

  form?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const text = (input.value || '').trim();
    if(!text) return;
    saved.push({ me:true, text });
    // TODO: shu yerga Telegram/Botga yuborish qo‘shamiz
    localStorage.setItem(KEY, JSON.stringify(saved));
    input.value = '';
    render();
  });

  function escapeHtml(s){
    return s.replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[c]));
  }
}
document.addEventListener('DOMContentLoaded', initChatWidget);


// ===== Toast + Fly to cart =====
window.toast = (text) => {
  let t = document.querySelector('.toast');
  if(!t){
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = text;
  t.classList.add('is-show');
  setTimeout(()=>t.classList.remove('is-show'), 2200);
};

window.flyToCart = (imgEl) => {
  const cart = document.querySelector('[data-cart-icon]');
  if(!imgEl || !cart) return;

  const r1 = imgEl.getBoundingClientRect();
  const r2 = cart.getBoundingClientRect();

  const clone = imgEl.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.left = r1.left+'px';
  clone.style.top = r1.top+'px';
  clone.style.width = r1.width+'px';
  clone.style.height = r1.height+'px';
  clone.style.objectFit = 'cover';
  clone.style.borderRadius = '14px';
  clone.style.zIndex = 9999;
  clone.style.transition = 'all .7s cubic-bezier(.2,.8,.2,1)';
  document.body.appendChild(clone);

  requestAnimationFrame(()=>{
    clone.style.left = (r2.left + r2.width/2 - 18) + 'px';
    clone.style.top = (r2.top + r2.height/2 - 18) + 'px';
    clone.style.width = '36px';
    clone.style.height = '36px';
    clone.style.opacity = '0.2';
    clone.style.transform = 'scale(0.6)';
  });

  clone.addEventListener('transitionend', ()=>clone.remove(), { once:true });
};
