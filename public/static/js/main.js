/**
 * Indra Net — JavaScript Principal (Español)
 */
const CART_KEY = 'indra_net_cart';
function getCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartUI(); }
function addToCart(product) {
  const cart = getCart(); const existing = cart.find(i => i.id === product.id);
  if (existing) { existing.quantity += 1; } else { cart.push({ id: product.id, name: product.name, price: product.price, image_url: product.image_url || '', quantity: 1 }); }
  saveCart(cart);
}
function removeFromCart(pid) { saveCart(getCart().filter(i => i.id !== pid)); }
function updateCartQty(pid, qty) { if (qty <= 0) { removeFromCart(pid); return; } const cart = getCart(); const item = cart.find(i => i.id === pid); if (item) { item.quantity = qty; saveCart(cart); } }
function clearCart() { localStorage.removeItem(CART_KEY); updateCartUI(); }

function updateCartUI() {
  const cart = getCart();
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const countEl = document.getElementById('navCartCount');
  if (countEl) { countEl.textContent = totalItems; countEl.classList.toggle('empty', totalItems === 0); }
  const itemsEl = document.getElementById('cartItems');
  if (itemsEl) {
    if (!cart.length) { itemsEl.innerHTML = '<div class="cart-empty">Tu carrito está vacío</div>'; }
    else {
      itemsEl.innerHTML = cart.map(item => `
        <div class="cart-item">
          <div class="cart-item-thumb">${item.image_url ? `<img src="${item.image_url}" alt="${item.name}">` : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">$${formatPrice(item.price)}</div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="updateCartQty(${item.id}, ${item.quantity - 1})">−</button>
              <span style="min-width:24px;text-align:center;font-size:.85rem;font-weight:600">${item.quantity}</span>
              <button class="qty-btn" onclick="updateCartQty(${item.id}, ${item.quantity + 1})">+</button>
            </div>
          </div>
          <button class="cart-item-remove" onclick="removeFromCart(${item.id})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>`).join('');
    }
  }
  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = '$' + formatPrice(totalPrice);
}

function toggleCart() {
  const o = document.getElementById('cartOverlay'), s = document.getElementById('cartSidebar');
  const isOpen = s.classList.contains('open');
  o.classList.toggle('open', !isOpen); s.classList.toggle('open', !isOpen);
  document.body.style.overflow = !isOpen ? 'hidden' : '';
}

function showToast(message, type = 'success') {
  const c = document.getElementById('toastContainer'); if (!c) return;
  const t = document.createElement('div'); t.className = `toast ${type}`;
  t.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${type === 'success' ? 'var(--success)' : 'var(--danger)'}" stroke-width="2">${type === 'success' ? '<path d="M20 6L9 17l-5-5"/>' : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}</svg> ${message}`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(10px)'; t.style.transition = 'all 300ms'; setTimeout(() => t.remove(), 300); }, 3000);
}

function formatPrice(n) { return Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function generateProductSVG(id) {
  const s = id * 2654435761 & 0xFFFFFFFF, r = n => ((s * (n + 1) * 16807) % 2147483647) / 2147483647;
  const h = Math.floor(r(1) * 60) + 220, h2 = (h + 40 + Math.floor(r(2) * 30)) % 360;
  const nodes = []; const c = 5 + Math.floor(r(3) * 5);
  for (let i = 0; i < c; i++) nodes.push({ x: 40 + r(i * 10 + 4) * 220, y: 30 + r(i * 10 + 5) * 160, ra: 1.5 + r(i * 10 + 6) * 3, op: .3 + r(i * 10 + 7) * .7 });
  let lines = '';
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) { const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y); if (d < 120 && r(i * 100 + j) > .4) lines += `<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[j].x}" y2="${nodes[j].y}" stroke="hsl(${h},60%,65%)" stroke-width="0.5" opacity="0.2"/>`; }
  const circles = nodes.map(n => `<circle cx="${n.x}" cy="${n.y}" r="${n.ra}" fill="hsl(${h2},55%,60%)" opacity="${n.op.toFixed(2)}"/>`).join('');
  return `<svg viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%"><defs><radialGradient id="g${id}" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="hsl(${h},70%,55%)" stop-opacity="0.15"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><rect width="300" height="220" fill="transparent"/><circle cx="150" cy="110" r="80" fill="url(#g${id})"/>${lines}${circles}<circle cx="150" cy="110" r="4" fill="hsl(${h},70%,70%)" opacity="0.6"/></svg>`;
}

function initCardSpotlights() {
  document.querySelectorAll('.product-card').forEach(card => {
    const sl = card.querySelector('.card-spotlight'); if (!sl) return;
    card.addEventListener('mousemove', e => { const r = card.getBoundingClientRect(); sl.style.background = `radial-gradient(400px circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgba(94,106,210,0.10), transparent 50%)`; });
  });
}
document.addEventListener('DOMContentLoaded', () => { updateCartUI(); });
