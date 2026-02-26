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
