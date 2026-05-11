// ==================== YOUR BRAND – FINAL APP.JS ====================
const WHATSAPP_NUMBER = '918055698328';
let authUser = null;

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true });
  loadNavbar();
  loadFooter();
  checkAuth().then(() => setupPage());
});

// ---------- AUTH ----------
async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      authUser = data.user;
      updateNavAuthUI();
    }
  } catch (e) {}
}

// ---------- NAVBAR ----------
function loadNavbar() {
  const container = document.getElementById('navbar-placeholder');
  if (!container) return;
  container.innerHTML = `
    <nav class="nav-blur px-4 py-3">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <a href="index.html" class="flex items-center gap-2">
          <div class="w-10 h-10 bg-gradient-to-br from-neon to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg">YB</div>
          <span class="text-xl font-bold font-display text-white">Your<span class="text-neon">Brand</span></span>
        </a>
        <div class="hidden lg:flex items-center gap-8">
          <a href="index.html" class="text-sm text-gray-300 hover:text-white">Home</a>
          <a href="products.html" class="text-sm text-gray-300 hover:text-white">Products</a>
          <a href="bulk-order.html" class="text-sm text-gray-300 hover:text-white">Bulk Orders</a>
          <a href="custom-designer.html" class="text-sm text-gray-300 hover:text-white">Designer</a>
          <a href="contact.html" class="text-sm text-gray-300 hover:text-white">Contact</a>
        </div>
        <div class="flex items-center gap-3" id="authButtons"></div>
        <button id="mobileMenuBtn" class="lg:hidden w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-white">
          <i class="fas fa-bars"></i>
        </button>
      </div>
      <div id="mobileMenu" class="lg:hidden hidden mt-3 pb-3 border-t border-white/5 pt-3">
        <div class="flex flex-col gap-2">
          <a href="index.html" class="px-4 py-2 hover:bg-white/5">Home</a>
          <a href="products.html" class="px-4 py-2 hover:bg-white/5">Products</a>
          <a href="bulk-order.html" class="px-4 py-2 hover:bg-white/5">Bulk Orders</a>
          <a href="custom-designer.html" class="px-4 py-2 hover:bg-white/5">Designer</a>
          <a href="contact.html" class="px-4 py-2 hover:bg-white/5">Contact</a>
        </div>
      </div>
    </nav>
  `;
  document.getElementById('mobileMenuBtn').addEventListener('click', () => {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
    const icon = document.getElementById('mobileMenuBtn').querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
  });
  updateNavAuthUI();
}

function updateNavAuthUI() {
  const container = document.getElementById('authButtons');
  if (!container) return;
  if (authUser) {
    const dashLink = authUser.role === 'admin' ? 'admin.html' : 'dashboard.html';
    const dashLabel = authUser.role === 'admin' ? 'Admin Panel' : 'Dashboard';
    container.innerHTML = `
      <a href="${dashLink}" class="text-sm text-neon font-medium">${dashLabel}</a>
      <button onclick="logoutUser()" class="text-sm bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1 rounded-full">Logout</button>
      <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" class="w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center text-green-400"><i class="fab fa-whatsapp"></i></a>
    `;
  } else {
    container.innerHTML = `
      <a href="login.html" class="btn-outline text-sm py-2 px-5 hidden sm:inline-block">Login</a>
      <a href="register.html" class="btn-primary text-sm py-2 px-5 hidden sm:inline-block">Get Started</a>
      <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" class="w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center text-green-400"><i class="fab fa-whatsapp"></i></a>
    `;
  }
}

// ---------- FOOTER ----------
function loadFooter() {
  const container = document.getElementById('footer-placeholder');
  if (!container) return;
  container.innerHTML = `
    <footer class="border-t border-white/5 pt-16 pb-8">
      <div class="max-w-7xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        <div>
          <div class="flex items-center gap-2 mb-4"><div class="w-10 h-10 bg-gradient-to-br from-neon to-blue-700 rounded-xl flex items-center justify-center text-white font-bold">YB</div><span class="text-xl font-bold font-display text-white">Your<span class="text-neon">Brand</span></span></div>
          <p class="text-sm text-gray-500">Premium custom printing solutions for businesses, schools, and events.</p>
        </div>
        <div><h4 class="font-semibold text-white mb-4">Quick Links</h4><div class="space-y-2 text-sm text-gray-400"><a href="products.html">Products</a><a href="bulk-order.html">Bulk Orders</a><a href="custom-designer.html">Designer</a></div></div>
        <div><h4 class="font-semibold text-white mb-4">Services</h4><div class="space-y-2 text-sm text-gray-400"><a href="#">School Uniforms</a><a href="#">Sports Jerseys</a><a href="#">Corporate Printing</a></div></div>
        <div><h4 class="font-semibold text-white mb-4">Contact</h4><div class="space-y-2 text-sm text-gray-400"><p><i class="fas fa-phone text-neon mr-2"></i> +91 8055698328</p><p><i class="fas fa-envelope text-neon mr-2"></i> hello@yourbrand.com</p></div></div>
      </div>
      <div class="border-t border-white/5 pt-6 text-center text-sm text-gray-600"><p>&copy; 2026 Your Brand. All rights reserved.</p></div>
    </footer>
  `;
}

// ---------- UTILITIES ----------
window.showToast = function (message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-24 right-4 bg-neon text-white px-5 py-3 rounded-xl shadow-2xl z-50 transition-all duration-500 transform translate-x-full`;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.transform = 'translateX(0)'; }, 100);
  setTimeout(() => { toast.style.transform = 'translateX(120%)'; setTimeout(() => toast.remove(), 500); }, 3000);
};

async function handleInquiry(productName, price) {
  const guestName = authUser ? authUser.fullName : (prompt('Your name:') || 'Guest');
  const guestPhone = authUser ? authUser.phone : (prompt('Your phone:') || '');
  const res = await fetch('/api/leads/product-inquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productName, estimatedBudget: price, guestName, guestPhone })
  });
  const data = await res.json();
  if (data.waLink) window.open(data.waLink, '_blank');
  showToast('Inquiry submitted! Opening WhatsApp...');
}

function addToWishlist(productId) {
  let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    showToast('Added to wishlist! ❤️');
  } else {
    showToast('Already in wishlist');
  }
}

async function logoutUser() {
  await fetch('/api/auth/logout', { method: 'POST' });
  authUser = null;
  window.location.href = 'index.html';
}

// ---------- AUTH FUNCTIONS ----------
async function registerUser(formData) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  const data = await res.json();
  if (data.success) {
    const otp = prompt('Enter OTP sent to your email:');
    if (otp) {
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });
      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        authUser = verifyData.user;
        updateNavAuthUI();
        window.location.href = 'dashboard.html';
      } else {
        showToast(verifyData.err || 'OTP verification failed', 'error');
      }
    }
  } else {
    showToast(data.err || 'Registration failed', 'error');
  }
}

async function loginUser(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (data.success) {
    authUser = data.user;
    updateNavAuthUI();
    window.location.href = data.user.role === 'admin' ? 'admin.html' : 'dashboard.html';
  } else {
    showToast(data.err || 'Login failed', 'error');
  }
}

async function forgotPassword(email) {
  showToast(`Password reset link sent to ${email} (simulated).`);
}

// ---------- PAGE SETUP ----------
function setupPage() {
  const path = window.location.pathname;
  if (path.includes('index.html') || path === '/' || path === '') setupHomePage();
  if (path.includes('products.html') && !path.includes('product-detail')) setupProductsPage();
  if (path.includes('product-detail.html')) setupProductDetailPage();
  if (path.includes('bulk-order.html')) setupBulkOrderPage();
  if (path.includes('custom-designer.html')) setupCustomDesignerPage();
  if (path.includes('contact.html')) setupContactPage();
  if (path.includes('login.html')) setupLoginPage();
  if (path.includes('register.html')) setupRegisterPage();
  if (path.includes('forgot-password.html')) setupForgotPasswordPage();
  if (path.includes('dashboard.html') && authUser) setupDashboardPage();
  else if (path.includes('dashboard.html')) window.location.href = 'login.html';
  if (path.includes('admin.html') && authUser && authUser.role === 'admin') setupAdminPage();
  else if (path.includes('admin.html')) window.location.href = 'login.html';
}

// ---------- HOME ----------
function setupHomePage() {
  fetch('/api/products').then(r => r.json()).then(products => {
    const grid = document.getElementById('homeProductGrid');
    if (!grid) return;
    grid.innerHTML = products.slice(0, 8).map(p => `
      <div class="glass-card p-5 group">
        <img src="${p.images[0]}" class="h-52 w-full object-cover rounded-xl mb-3" alt="${p.name}">
        <p class="text-xs text-neon">${p.category}</p>
        <h3 class="font-semibold text-white">${p.name}</h3>
        <p class="text-sm text-gray-400">₹${p.price} · ${p.colors.length} colors</p>
        <a href="product-detail.html?id=${p._id}" class="btn-outline text-xs py-2 px-4 mt-3 block text-center">View Details</a>
      </div>
    `).join('');
  });

  // FAQ toggle
  document.querySelectorAll('.faq-toggle').forEach(btn => {
    btn.addEventListener('click', function () {
      const answer = this.nextElementSibling;
      const icon = this.querySelector('i');
      document.querySelectorAll('.faq-answer').forEach(a => a.classList.add('hidden'));
      document.querySelectorAll('.faq-toggle i').forEach(i => { i.classList.remove('fa-minus'); i.classList.add('fa-plus'); });
      answer.classList.toggle('hidden');
      if (!answer.classList.contains('hidden')) { icon.classList.replace('fa-plus', 'fa-minus'); }
    });
  });

  // Swiper reviews (if element exists)
  if (document.querySelector('.reviewsSwiper') && typeof Swiper !== 'undefined') {
    new Swiper('.reviewsSwiper', {
      slidesPerView: 1,
      spaceBetween: 16,
      loop: true,
      autoplay: { delay: 3000 },
      pagination: { el: '.swiper-pagination', clickable: true },
      breakpoints: { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
    });
  }
}

// ---------- PRODUCTS LIST ----------
function setupProductsPage() {
  fetch('/api/products').then(r => r.json()).then(products => {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = products.map(p => `
      <div class="glass-card p-5 group">
        <img src="${p.images[0]}" class="h-52 w-full object-cover rounded-xl mb-3" alt="${p.name}">
        <p class="text-xs text-neon">${p.category}</p>
        <h3 class="font-semibold text-white">${p.name}</h3>
        <p class="text-sm text-gray-400">₹${p.price} · ${p.colors.length} colors</p>
        <a href="product-detail.html?id=${p._id}" class="btn-outline text-xs py-2 px-4 mt-3 block text-center">View Details</a>
      </div>
    `).join('');
  });
}

// ---------- PRODUCT DETAIL ----------
function setupProductDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  fetch(`/api/products/${id}`).then(r => r.json()).then(product => {
    if (product.err) {
      document.getElementById('productDetailContainer').innerHTML = `<div class="text-center py-20"><h2 class="text-3xl text-white">Product Not Found</h2><a href="products.html" class="btn-primary mt-4">Back to Products</a></div>`;
      return;
    }
    renderProductDetail(product);
  });
}

function renderProductDetail(product) {
  const container = document.getElementById('productDetailContainer');
  container.innerHTML = `
    <div class="glass-card-premium p-6 sm:p-10 grid lg:grid-cols-2 gap-10">
      <div class="slider-container" id="productSlider">
        <div class="slider-track" id="sliderTrack">
          ${product.images.map(img => `<img src="${img}" alt="${product.name}" class="slider-slide">`).join('')}
        </div>
        <button class="slider-arrow left" id="prevBtn"><i class="fas fa-chevron-left"></i></button>
        <button class="slider-arrow right" id="nextBtn"><i class="fas fa-chevron-right"></i></button>
      </div>
      <div class="space-y-6">
        <span class="inline-block bg-neon/20 text-neon text-xs px-4 py-2 rounded-full">${product.badge || ''}</span>
        <h1 class="text-3xl sm:text-4xl font-bold font-display text-white mt-3">${product.name}</h1>
        <p class="text-2xl font-bold text-white">₹${product.price} <span class="text-sm text-gray-400">/ piece</span></p>
        <p class="text-gray-400 mt-4 leading-relaxed">${product.description}</p>
        <div>
          <h4 class="text-sm font-medium text-gray-400 mb-2">Color: <span id="selectedColorText" class="text-white font-semibold">${product.colors[0]}</span></h4>
          <div class="flex flex-wrap gap-2">${product.colors.map(c => `<button class="color-box ${c===product.colors[0]?'selected-color':''}" data-color="${c}">${c}</button>`).join('')}</div>
        </div>
        <div>
          <h4 class="text-sm font-medium text-gray-400 mb-2">Size: <span id="selectedSizeText" class="text-white font-semibold">${product.sizes[0]}</span></h4>
          <div class="flex flex-wrap gap-2">${product.sizes.map(s => `<button class="size-box ${s===product.sizes[0]?'selected-size':''}" data-size="${s}">${s}</button>`).join('')}</div>
        </div>
        <div class="grid grid-cols-2 gap-4 text-sm text-gray-400">
          <div><i class="fas fa-tshirt text-neon mr-2"></i> Fabric: <span class="text-white font-medium">${product.fabric}</span></div>
          <div><i class="fas fa-print text-neon mr-2"></i> Printing: <span class="text-white font-medium">${product.printingMethods.join(', ')}</span></div>
        </div>
        <div class="flex gap-4 pt-4">
          <button onclick="inquireNow('${product.name}', ${product.price})" class="btn-primary flex-1 text-base py-4"><i class="fab fa-whatsapp text-lg"></i> Inquire Now</button>
          <button onclick="addToWishlist('${product._id}')" class="btn-outline flex-1 text-base py-4"><i class="far fa-heart"></i> Wishlist</button>
        </div>
      </div>
    </div>
  `;

  // Slider
  const track = document.getElementById('sliderTrack');
  const slides = document.querySelectorAll('.slider-slide');
  let idx = 0;
  function updateSlider() { track.style.transform = `translateX(-${idx * 100}%)`; }
  document.getElementById('prevBtn').addEventListener('click', () => { idx = idx === 0 ? slides.length - 1 : idx - 1; updateSlider(); });
  document.getElementById('nextBtn').addEventListener('click', () => { idx = idx === slides.length - 1 ? 0 : idx + 1; updateSlider(); });

  // Color/size selection
  document.querySelectorAll('.color-box').forEach(b => b.addEventListener('click', function () {
    document.querySelectorAll('.color-box').forEach(c => c.classList.remove('selected-color'));
    this.classList.add('selected-color');
    document.getElementById('selectedColorText').textContent = this.dataset.color;
  }));
  document.querySelectorAll('.size-box').forEach(b => b.addEventListener('click', function () {
    document.querySelectorAll('.size-box').forEach(s => s.classList.remove('selected-size'));
    this.classList.add('selected-size');
    document.getElementById('selectedSizeText').textContent = this.dataset.size;
  }));
}

window.inquireNow = function (name, price) {
  const color = document.querySelector('.selected-color')?.dataset.color || '';
  const size = document.querySelector('.selected-size')?.dataset.size || '';
  const msg = `🛍️ *Product Inquiry*\n📦 ${name}\n💰 ₹${price}\n🎨 ${color}\n📏 ${size}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
};

// ---------- BULK ORDER ----------
function setupBulkOrderPage() {
  document.getElementById('bulkOrderForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    const msg = `📦 *Bulk Inquiry*\n🏢 ${data.instituteName}\n👤 ${data.contactPerson}\n📞 ${data.phone}\n📧 ${data.email}\n📦 ${data.productType}\n🔢 ${data.quantity} pcs\n📏 ${data.sizes}\n📅 ${data.deadline}\n💰 ${data.budget}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    showToast('Bulk inquiry sent!');
  });
}

// ---------- CUSTOM DESIGNER ----------
function setupCustomDesignerPage() {
  const canvas = document.getElementById('tshirtCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function drawTshirt(color = '#ffffff') {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(100, 80); ctx.lineTo(300, 80); ctx.lineTo(280, 150); ctx.lineTo(350, 180);
    ctx.lineTo(350, 380); ctx.lineTo(50, 380); ctx.lineTo(50, 180); ctx.lineTo(120, 150);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.stroke();
  }
  drawTshirt();
  document.getElementById('tshirtColor')?.addEventListener('change', e => {
    drawTshirt(e.target.value);
    document.getElementById('designText')?.dispatchEvent(new Event('input'));
  });
  document.getElementById('imageUpload')?.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 150, 200, 100, 100);
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
  document.getElementById('designText')?.addEventListener('input', function () {
    drawTshirt(document.getElementById('tshirtColor')?.value || '#ffffff');
    const text = this.value;
    if (text) {
      ctx.fillStyle = document.getElementById('textColor')?.value || '#ffffff';
      ctx.font = 'bold 24px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(text, 200, 180);
    }
  });
  document.getElementById('textColor')?.addEventListener('input', function () {
    document.getElementById('designText')?.dispatchEvent(new Event('input'));
  });

  window.submitDesign = function () {
    const msg = '🎨 *Custom Design Enquiry* – I have created a design and would like a quote.';
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };
}

// ---------- CONTACT ----------
function setupContactPage() {
  document.getElementById('contactForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    showToast('Message sent (demo).');
    this.reset();
  });
}

// ---------- LOGIN / REGISTER / FORGOT ----------
function setupLoginPage() {
  document.getElementById('loginForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    loginUser(e.target.email.value, e.target.password.value);
  });
}
function setupRegisterPage() {
  document.getElementById('registerForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    if (data.password !== data.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    registerUser({ fullName: data.fullName, email: data.email, phone: data.phone, password: data.password });
  });
}
function setupForgotPasswordPage() {
  document.getElementById('forgotForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    forgotPassword(e.target.email.value);
  });
}

// ---------- DASHBOARD ----------
async function setupDashboardPage() {
  const [leadsRes] = await Promise.all([fetch('/api/user/leads')]);
  const leads = await leadsRes.json();

  // Stats
  const total = leads.length;
  const active = leads.filter(l => ['New Lead', 'Contacted', 'Negotiation', 'Design Approval', 'Printing'].includes(l.status)).length;
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]').length;
  document.getElementById('totalInq').textContent = total;
  document.getElementById('activeOrd').textContent = active;
  document.getElementById('wishCount').textContent = wishlist;

  // Inquiries table
  const tbody = document.querySelector('#inquiriesTable tbody');
  if (tbody) {
    tbody.innerHTML = leads.length ? leads.map(l => `
      <tr class="border-b border-white/5 hover:bg-white/5">
        <td class="px-4 py-3 font-mono text-neon">${l.inquiryId}</td>
        <td class="px-4 py-3">${l.productName || 'N/A'}</td>
        <td class="px-4 py-3">${new Date(l.createdAt).toLocaleDateString()}</td>
        <td class="px-4 py-3"><span class="px-2 py-1 text-xs rounded-full bg-neon/20 text-neon">${l.status}</span></td>
        <td class="px-4 py-3"><button onclick="window.open('https://wa.me/${WHATSAPP_NUMBER}?text=Follow up inquiry ${l.inquiryId}','_blank')" class="text-green-400 hover:text-green-300"><i class="fab fa-whatsapp"></i></button></td>
      </tr>
    `).join('') : '<tr><td colspan="5" class="py-4 text-center text-gray-500">No inquiries yet</td></tr>';
  }

  // Dashboard bulk form
  document.getElementById('dashboardBulkForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    if (!authUser) return;
    const res = await fetch('/api/leads/bulk-inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (data.waLink) window.open(data.waLink, '_blank');
    showToast('Bulk inquiry submitted!');
    setTimeout(() => location.reload(), 500);
  });
}

// ---------- ADMIN ----------
async function setupAdminPage() {
  const [statsRes, leadsRes] = await Promise.all([fetch('/api/admin/stats'), fetch('/api/admin/leads')]);
  const stats = await statsRes.json();
  const leads = await leadsRes.json();

  document.getElementById('totalLeads').textContent = stats.totalLeads;
  document.getElementById('newLeads').textContent = stats.newLeads;
  // dispatched & delivered can be counted from leads
  const dispatched = leads.filter(l => l.status === 'Dispatch').length;
  const delivered = leads.filter(l => l.status === 'Delivered').length;
  document.getElementById('dispatched').textContent = dispatched;
  document.getElementById('delivered').textContent = delivered;

  function renderLeads(filteredLeads) {
    const tbody = document.querySelector('#leadsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = filteredLeads.length ? filteredLeads.map(l => `
      <tr class="border-b border-white/5 hover:bg-white/5">
        <td class="px-4 py-3 font-mono text-neon">${l.inquiryId}</td>
        <td class="px-4 py-3">${l.guestName || 'N/A'}</td>
        <td class="px-4 py-3">${l.productName || 'N/A'}</td>
        <td class="px-4 py-3">${new Date(l.createdAt).toLocaleDateString()}</td>
        <td class="px-4 py-3">
          <select onchange="updateLeadStatus('${l._id}', this.value)" class="bg-dark border border-white/10 rounded px-2 py-1 text-white text-xs">
            ${['New Lead','Contacted','Negotiation','Design Approval','Printing','Dispatch','Delivered'].map(s => `<option ${l.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </td>
        <td class="px-4 py-3">
          <button onclick="contactLead('${l.guestPhone}')" class="text-green-400 hover:text-green-300 mr-2"><i class="fab fa-whatsapp"></i></button>
          <button onclick="deleteLead('${l._id}')" class="text-red-400 hover:text-red-300"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="6" class="py-4 text-center text-gray-500">No leads found</td></tr>';
  }
  renderLeads(leads);

  // Search
  document.getElementById('searchLead')?.addEventListener('input', function () {
    const term = this.value.toLowerCase();
    const filtered = leads.filter(l => (l.inquiryId && l.inquiryId.toLowerCase().includes(term)) || (l.guestName && l.guestName.toLowerCase().includes(term)));
    renderLeads(filtered);
  });

  // Update status
  window.updateLeadStatus = async function (id, status) {
    await fetch(`/api/admin/leads/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    showToast('Status updated');
    // Refresh stats (partial)
    const newLeadsRes = await fetch('/api/admin/leads');
    const newLeads = await newLeadsRes.json();
    renderLeads(newLeads);
    document.getElementById('newLeads').textContent = newLeads.filter(l => l.status === 'New Lead').length;
    document.getElementById('dispatched').textContent = newLeads.filter(l => l.status === 'Dispatch').length;
    document.getElementById('delivered').textContent = newLeads.filter(l => l.status === 'Delivered').length;
  };

  window.contactLead = function (phone) {
    if (!phone) phone = '';
    window.open(`https://wa.me/91${phone}?text=Hello from Your Brand`, '_blank');
  };

  window.deleteLead = async function (id) {
    if (!confirm('Delete this lead?')) return;
    await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
    showToast('Lead deleted');
    const newLeadsRes = await fetch('/api/admin/leads');
    const newLeads = await newLeadsRes.json();
    renderLeads(newLeads);
    document.getElementById('totalLeads').textContent = newLeads.length;
  };

  window.exportLeads = function () {
    const csv = ['ID,Product,Customer,Date,Status'].concat(
      leads.map(l => `${l.inquiryId},${l.productName || ''},${l.guestName || ''},${new Date(l.createdAt).toLocaleDateString()},${l.status}`)
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
}

// ---------- GLOBAL EXPOSURE ----------
window.handleInquiry = handleInquiry;
window.addToWishlist = addToWishlist;
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.forgotPassword = forgotPassword;
window.showToast = showToast;
