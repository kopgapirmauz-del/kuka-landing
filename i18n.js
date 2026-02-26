const I18N = {
  uz: {
    about: "Biz haqimizda",
    showrooms: "Shourumlar",
    contact: "Aloqa",
    search: "Qidiruv",
    catalog: "Katalog",
    stats_title: "Xitoyning 1-raqamli premium mebellari",
    stats_a: "yil tajriba",
    stats_b: "model",
    stats_c: "shourum",
    stats_d: "mijoz",
    catalog_short: "Katalog (qisqa)",
    filter_hint: "Qidirish va kategoriya bo‘yicha tez filtr qiling.",
    all: "Hammasi",
    divan: "Divan",
    kreslo: "Kreslo",
    stol: "Stol",
    yotoq: "Yotoq",
    new_products: "Yangi mahsulotlar",
    recommend: "Tavsiya qilamiz",
    details: "Batafsil",
    add_cart: "Savatga",
    cart: "Savat",
    send: "Yuborish",
    chat_title: "Bizga yozing, biz onlaynmiz!",
    phone: "Telefon raqami",
    msg: "Xabar",
    footer_help: "Savollaringiz bormi? Yordam beramiz",
    call_time: "Call-markaz ish vaqti:",
    call_hours: "Du–Sh 09:00 dan 18:00 gacha",
    customer: "Xaridorga",
    info: "Ma'lumot",
    company: "Kompaniya",
    connect: "Biz bilan bog'lanish",
    order: "Buyurtma berish",
    confirm: "Tasdiqlash",
    soon: "Tez orada",
  },
  ru: {
    about: "О нас",
    showrooms: "Шоурумы",
    contact: "Контакты",
    search: "Поиск",
    catalog: "Каталог",
    stats_title: "Премиальная мебель №1 из Китая",
    stats_a: "лет опыта",
    stats_b: "моделей",
    stats_c: "шоурумов",
    stats_d: "клиентов",
    catalog_short: "Каталог (кратко)",
    filter_hint: "Быстрая фильтрация по поиску и категории.",
    all: "Все",
    divan: "Диваны",
    kreslo: "Кресла",
    stol: "Столы",
    yotoq: "Кровати",
    new_products: "Новинки",
    recommend: "Рекомендуем",
    details: "Подробнее",
    add_cart: "В корзину",
    cart: "Корзина",
    send: "Отправить",
    chat_title: "Напишите нам — мы онлайн!",
    phone: "Телефон",
    msg: "Сообщение",
    footer_help: "Есть вопросы? Мы поможем",
    call_time: "Часы колл-центра:",
    call_hours: "Пн–Сб 09:00–18:00",
    customer: "Покупателю",
    info: "Информация",
    company: "Компания",
    connect: "Связаться",
    order: "Оформить",
    confirm: "Подтвердить",
    soon: "Скоро",
  },
  en: {
    about: "About",
    showrooms: "Showrooms",
    contact: "Contact",
    search: "Search",
    catalog: "Catalog",
    stats_title: "China’s #1 premium furniture",
    stats_a: "years experience",
    stats_b: "models",
    stats_c: "showrooms",
    stats_d: "customers",
    catalog_short: "Catalog (short)",
    filter_hint: "Quick filter by search and category.",
    all: "All",
    divan: "Sofas",
    kreslo: "Armchairs",
    stol: "Tables",
    yotoq: "Beds",
    new_products: "New arrivals",
    recommend: "Recommended",
    details: "Details",
    add_cart: "Add to cart",
    cart: "Cart",
    send: "Send",
    chat_title: "Message us — we’re online!",
    phone: "Phone",
    msg: "Message",
    footer_help: "Questions? We can help",
    call_time: "Call center hours:",
    call_hours: "Mon–Sat 09:00–18:00",
    customer: "Customer",
    info: "Info",
    company: "Company",
    connect: "Contact us",
    order: "Place order",
    confirm: "Confirm",
    soon: "Coming soon",
  }
};

function getLang(){
  return localStorage.getItem("lang") || "uz";
}
function setLang(lang){
  localStorage.setItem("lang", lang);
  applyI18n();
}
function t(key){
  const lang = getLang();
  return (I18N[lang] && I18N[lang][key]) || I18N.uz[key] || key;
}
function applyI18n(){
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el=>{
    const key = el.getAttribute("data-i18n-ph");
    el.setAttribute("placeholder", t(key));
  });
}
