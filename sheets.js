// ====== 1) SHEET ID (O'ZGARTIRMAYMIZ) ======
const SHEET_ID = "1ovlBBjoZpGRHkl5KLMpKqIOMR0PDOtX-tu6cVZ79HGs";

// Tabs (sheet name) mapping
// Diqqat: Google Sheets tab nomi aynan shunday bo‘lishi kerak (bo‘sh joy, harf, underscore).
const SHEETS = {
  divan: "divan",
  kreslo: "kreslo",
  stol: "stol",
  yotoq: "yotoq",
  yangi: "yangi",
  tavsiya: "tavsiya",

  // ✅ YANGI: siz aytgan 2 ta tab
  murojatlar: "murojaatlar",
  sotuv_markazi: "sotuv markazi",
};

// ====== 2) APPS SCRIPT ENDPOINTS (Web App URL) ======
// Bu yerga Apps Script -> Deploy -> Web app -> URL qo'yiladi
const ORDER_ENDPOINT = "PASTE_YOUR_ORDER_APPS_SCRIPT_URL_HERE";
const CHAT_ENDPOINT  = "PASTE_YOUR_CHAT_APPS_SCRIPT_URL_HERE";

// ====== 3) READ SHEET (GViz JSON) ======
function sheetJsonUrl(sheetName) {
  const base = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`;
  const q = encodeURIComponent("select *");
  return `${base}?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&tq=${q}`;
}

async function fetchSheetRows(sheetName) {
  const res = await fetch(sheetJsonUrl(sheetName));
  const text = await res.text();

  // Google returns: google.visualization.Query.setResponse({...});
  const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));
  const table = json.table;

  const cols = table.cols.map(c => (c.label || "").trim());
  const rows = (table.rows || []).map(r => {
    const obj = {};
    (r.c || []).forEach((cell, i) => {
      obj[cols[i] || `col${i}`] = cell ? (cell.v ?? "") : "";
    });
    return obj;
  });

  // ✅ Product normalizatsiya (divan/kreslo/stol/yotoq/yangi/tavsiya)
  // Siz sheet ustun nomlarini shular bilan mos qilsangiz ideal:
  // model | desc | spec | image1 | image2 | image3 | price_old | price_new | available
  if (
    sheetName === "divan" || sheetName === "kreslo" || sheetName === "stol" ||
    sheetName === "yotoq" || sheetName === "yangi" || sheetName === "tavsiya"
  ) {
    return rows.map((r, idx) => {
      const images = [r.image1, r.image2, r.image3, r.image4, r.image5, r.image].filter(Boolean).map(String);

      return {
        id: (r.id || r.model || `${sheetName}-${idx + 1}`).toString().trim(),
        category: sheetName,
        model: (r.model || "").toString().trim(),
        desc: (r.desc || "").toString().trim(),
        spec: (r.spec || "").toString().trim(),
        image: (images[0] || "").toString(),
        image1: (r.image1 || images[0] || "").toString(),
        image2: (r.image2 || images[1] || "").toString(),
        image3: (r.image3 || images[2] || "").toString(),
        price_old: (r.price_old || "").toString(),
        price_new: (r.price_new || "").toString(),
        available: (r.available || "Yes").toString(), // ✅ Yes/No
      };
    }).filter(p => p.model);
  }

  // default: raw rows
  return rows;
}

// ✅ Hamma mahsulotlarni bitta list qilib olish (product.html uchun juda kerak)
async function getAllProducts() {
  const tabs = ["divan", "kreslo", "stol", "yotoq", "yangi", "tavsiya"];
  const all = [];
  for (const t of tabs) {
    const rows = await fetchSheetRows(SHEETS[t]);
    rows.forEach(x => all.push({ ...x, category: t }));
  }
  return all;
}
window.getAllProducts = getAllProducts;

// ====== 4) SEND TO APPS SCRIPT ======
async function postToEndpoint(url, payload) {
  if (!url || url.includes("PASTE_YOUR")) {
    alert("Apps Script WebApp URL hali qo‘yilmagan. ORDER_ENDPOINT/CHAT_ENDPOINT ni to‘ldiring.");
    return { ok: false };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return res.json().catch(() => ({ ok: res.ok }));
}

async function sendOrderToSheets(orderPayload) {
  // orderPayload: { phone, city, payment, items, total, page, ts, ... }
  return postToEndpoint(ORDER_ENDPOINT, orderPayload);
}

async function sendChatToSheets(chatPayload) {
  // chatPayload: { phone, message, page, ts, lang? }
  return postToEndpoint(CHAT_ENDPOINT, chatPayload);
}

window.fetchSheetRows = fetchSheetRows;
window.sendOrderToSheets = sendOrderToSheets;
window.sendChatToSheets = sendChatToSheets;
window.SHEETS = SHEETS;
