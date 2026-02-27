// ====== 1) SHUNI TO‘LDIRASIZ ======
const SHEET_ID = "1ovlBBjoZpGRHkl5KLMpKqIOMR0PDOtX-tu6cVZ79HGs";

// tabs (sheet name) mapping
const SHEETS = {
  divan: "divan",
  kreslo: "kreslo",
  stol: "stol",
  yotoq: "yotoq",
  yangi: "yangi",
  tavsiya: "tavsiya",
};

// Apps Script endpoints (Web App)
const ORDER_ENDPOINT = "PASTE_YOUR_ORDER_APPS_SCRIPT_URL_HERE";
const CHAT_ENDPOINT  = "PASTE_YOUR_CHAT_APPS_SCRIPT_URL_HERE";

// ====== 2) READ SHEET ======
function sheetJsonUrl(sheetName){
  const base = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`;
  const q = encodeURIComponent("select *");
  return `${base}?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&tq=${q}`;
}

async function fetchSheetRows(sheetName){
  const res = await fetch(sheetJsonUrl(sheetName));
  const text = await res.text();
  // Google returns: google.visualization.Query.setResponse({...});
  const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));
  const table = json.table;

  const cols = table.cols.map(c => (c.label || "").trim());
  const rows = (table.rows || []).map(r=>{
    const obj = {};
    r.c.forEach((cell, i)=>{
      obj[cols[i] || `col${i}`] = cell ? (cell.v ?? "") : "";
    });
    return obj;
  });

  // normalize: create product objects
  return rows.map((r, idx)=>({
    id: (r.id || `${sheetName}-${idx+1}`).toString(),
    category: sheetName,
    model: (r.model || "").toString(),
    desc: (r.desc || "").toString(),
    image: (r.image1 || "").toString(),
    images: [r.image1, r.image2, r.image3, r.image4, r.image5].filter(Boolean).map(String),
    price_old: (r.price_old || "").toString(),
    price_new: (r.price_new || "").toString(),
  })).filter(p=>p.model);
}

// ====== 3) SEND TO APPS SCRIPT ======
async function postToEndpoint(url, payload){
  if(!url || url.includes("PASTE_YOUR")) {
    alert("Apps Script URL hali qo‘yilmagan. Keyin endpoint qo‘ysangiz ishlaydi.");
    return { ok:false };
  }
  const res = await fetch(url, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(payload)
  });
  return res.json().catch(()=>({ok:res.ok}));
}

async function sendOrderToSheets(orderPayload){
  return postToEndpoint(ORDER_ENDPOINT, orderPayload);
}
async function sendChatToSheets(chatPayload){
  return postToEndpoint(CHAT_ENDPOINT, chatPayload);
}
