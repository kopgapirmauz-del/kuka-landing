// =============================
// KUKA HOME — Google Sheets API
// =============================

// ===== 1) SHEET ID (o'zgartirmaymiz)
const SHEET_ID = "1ovlBBjoZpGRHkl5KLMpKqIOMR0PDOtX-tu6cVZ79HGs";

// ===== 2) APPS SCRIPT WEBAPP (SIZ BERGAN URL)
const WEBAPP_ENDPOINT = "https://script.google.com/macros/s/AKfycby9h8bBNl2MRAgOEa5_294KI5jopzuSUy2Sg9WRTHomT1gUcF1C-O_AO4tzcjRgR4QK6w/exec";

// ===== 3) TAB NOMLARI
const SHEETS = {
  divan: "divan",
  kreslo: "kreslo",
  stol: "stol",
  yotoq: "yotoq",
  yangi: "yangi",
  tavsiya: "tavsiya",
  murojatlar: "murojaatlar",
  sotuv_markazi: "sotuv markazi",
};

// ============================================
// ===== 4) SHEETDAN MA'LUMOT O'QISH (GVIZ)
// ============================================

function sheetJsonUrl(sheetName) {
  const base = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`;
  const q = encodeURIComponent("select *");
  return `${base}?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&tq=${q}`;
}

async function fetchSheetRows(sheetName) {
  const res = await fetch(sheetJsonUrl(sheetName));
  const text = await res.text();

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

  return rows;
}

// ============================================
// ===== 5) WEBAPP GA YUBORISH (CHAT + ORDER)
// ============================================

async function postToWebApp(payload) {
  try {
    const res = await fetch(WEBAPP_ENDPOINT, {
      method: "POST",
      // 👇 MUHIM: preflight bo'lmasin
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    const text = await res.text();

    // Ba'zan JSON bo'lmay qolishi mumkin (masalan, HTML qaytsa)
    try {
      return JSON.parse(text);
    } catch {
      console.error("WebApp non-JSON response:", text);
      return { ok: false };
    }
  } catch (err) {
    console.error("Sheets error:", err);
    return { ok: false };
  }
}

// ===== 8) GLOBAL EXPORT
window.fetchSheetRows = fetchSheetRows;
window.sendOrderToSheets = sendOrderToSheets;
window.sendChatToSheets = sendChatToSheets;
window.SHEETS = SHEETS;
