const CART_KEY = "kuka_cart_v1";

function readCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch { return []; }
}
function writeCart(items){
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartBadge();
}
function addToCart(product){
  const cart = readCart();
  const found = cart.find(x => x.id === product.id);
  if(found) found.qty += 1;
  else cart.push({ ...product, qty:1 });
  writeCart(cart);
}
function removeFromCart(id){
  const cart = readCart().filter(x => x.id !== id);
  writeCart(cart);
}
function changeQty(id, delta){
  const cart = readCart();
  const item = cart.find(x=>x.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) return removeFromCart(id);
  writeCart(cart);
}
function cartCount(){
  return readCart().reduce((s,x)=>s+x.qty,0);
}
function updateCartBadge(){
  const badge = document.getElementById("cartBadge");
  if(badge) badge.textContent = String(cartCount());
}
