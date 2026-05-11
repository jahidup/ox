// ==================== YOUR BRAND – COMPLETE FRONTEND LOGIC ====================
// This file connects to the backend API and handles all page functionalities.

// ---------- GLOBAL STATE ----------
const WHATSAPP_NUMBER = '918055698328';
let authUser = null;

// ---------- INITIALIZATION ----------
document.addEventListener('DOMContentLoaded', () => {
  if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true, offset: 80 });
  loadNavbar();
  loadFooter();
  checkAuth();
  setupPage();
});

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

// ---------- NAVBAR (loaded into #navbar-placeholder) ----------
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
        <div class="hidden lg:flex items-center gap-8" id="desktopNavLinks">
          <a href="index.html" class="text-sm text-gray-300 hover:text-white transition-colors">Home</a>
          <a href="products.html" class="text-sm text-gray-300 hover:text-white transition-colors">Products</a>
          <a href="bulk-order.html" class="text-sm text-gray-300 hover:text-white transition-colors">Bulk Orders</a>
          <a href="custom-designer.html" class="text-sm text-gray-300 hover:text-white transition-colors">Designer</a>
          <a href="contact.html" class="text-sm text-gray-300 hover:text-white transition-colors">Contact</a>
        </div>
        <div class="flex items-center gap-3" id="authButtons">
          <!-- will be updated by updateNavAuthUI() -->
        </div>
        <button id="mobileMenuBtn" class="lg:hidden w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-white hover:border-neon/50">
          <i class="fas fa-bars"></i>
        </button>
      </div>
      <div id="mobileMenu" class="lg:hidden hidden mt-3 pb-3 border-t border-white/5 pt-3">
        <a href="index.html" class="block px-4 py-2 hover:bg-white/5">Home</a>
        <a href="products.html" class="block px-4 py-2 hover:bg-white/5">Products</a>
        <a href="bulk-order.html" class="block px-4 py-2 hover:bg-white/5">Bulk Orders</a>
        <a href="custom-designer.html" class="block px-4 py-2 hover:bg-white/5">Designer</a>
        <a href="contact.html" class="block px-4 py-2 hover:bg-white/5">Contact</a>
        <div class="flex gap-3 px-4 pt-2" id="mobileAuth"></div>
      </div>
    </nav>
  `;

  updateNavAuthUI();

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      const icon = mobileMenuBtn.querySelector('i');
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    });
  }
}

function updateNavAuthUI() {
  const authContainer = document.getElementById('authButtons');
  const mobileAuthContainer = document.getElementById('mobileAuth');
  if (!authContainer || !mobileAuthContainer) return;
  const loginHTML = `
    <a href="login.html" class="btn-outline text-sm py-2 px-5 hidden sm:inline-block">Login</a>
    <a href="register.html" class="btn-primary text-sm py-2 px-5 hidden sm:inline-block">Get Started</a>
    <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" class="w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center text-green-400 hover:bg-green-500/30 transition"><i class="fab fa-whatsapp"></i></a>
  `;
  if (authUser) {
    const dashboardLink = authUser.role === 'admin' ? 'admin.html' : 'dashboard.html';
    const dashboardLabel = authUser.role === 'admin' ? 'Admin Panel' : 'Dashboard';
    authContainer.innerHTML = `
      <a href="${dashboardLink}" class="text-sm text-neon font-medium">${dashboardLabel}</a>
      <button onclick="logoutUser()" class="text-sm bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1 rounded-full">Logout</button>
      <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" class="w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center text-green-400"><i class="fab fa-whatsapp"></i></a>
    `;
    mobileAuthContainer.innerHTML = `
      <a href="${dashboardLink}" class="btn-outline text-sm py-2 px-5 flex-1 text-center">${dashboardLabel}</a>
      <button onclick="logoutUser()" class="btn-primary text-sm py-2 px-5 flex-1 text-center bg-red-600 hover:bg-red-700">Logout</button>
    `;
  } else {
    authContainer.innerHTML = loginHTML;
    mobileAuthContainer.innerHTML = `
      <a href="login.html" class="btn-outline text-sm py-2 px-5 flex-1 text-center">Login</a>
      <a href="register.html" class="btn-primary text-sm py-2 px-5 flex-1 text-center">Register</a>
    `;
  }
}

// ---------- FOOTER ----------
function loadFooter() {
  const container = document.getElementById('footer-placeholder');
  if (!container) return;
  container.innerHTML = `
    <footer class="border-t border-white/5 pt-16 pb-8">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div class="flex items-center gap-2 mb-4"><div class="w-10 h-10 bg-gradient-to-br from-neon to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg">YB</div><span class="text-xl font-bold font-display text-white">Your<span class="text-neon">Brand</span></span></div>
            <p class="text-sm text-gray-500">Premium custom printing solutions.</p>
          </div>
          <div><h4 class="font-semibold text-white mb-4">Quick Links</h4><div class="space-y-2 text-sm text-gray-400"><a href="products.html">Products</a><a href="bulk-order.html">Bulk Orders</a><a href="custom-designer.html">Designer</a></div></div>
          <div><h4 class="font-semibold text-white mb-4">Services</h4><div class="space-y-2 text-sm text-gray-400"><a href="#">School Uniforms</a><a href="#">Sports Jerseys</a><a href="#">Corporate Printing</a></div></div>
          <div><h4 class="font-semibold text-white mb-4">Contact</h4><div class="space-y-2 text-sm text-gray-400"><p><i class="fas fa-phone text-neon mr-2"></i> +91 ${WHATSAPP_NUMBER.slice(2)}</p><p><i class="fas fa-envelope text-neon mr-2"></i> hello@yourbrand.com</p></div></div>
        </div>
        <div class="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600"><p>&copy; 2026 Your Brand</p><div class="flex gap-6"><a href="#">Privacy</a><a href="#">Terms</a></div></div>
      </div>
    </footer>
  `;
}

async function logoutUser() {
  await fetch('/api/auth/logout', { method: 'POST' });
  authUser = null;
  window.location.href = 'index.html';
}

// ---------- UTILITY ----------
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-24 right-4 bg-neon text-white px-5 py-3 rounded-xl shadow-2xl z-50 transition-all duration-500 transform translate-x-full`;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.transform = 'translateX(0)'; }, 100);
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function getProductById(id) {
  // Fallback: use a local productDatabase if API not available. But we prioritize API.
  // We'll fetch product detail from API in product-detail page.
  return null; // actual logic will be in page-specific scripts
}

// ---------- INQUIRY ----------
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
  showToast('Inquiry submitted! Redirecting to WhatsApp...');
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
    const otp = prompt('Enter the OTP sent to your email:');
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
        showToast(verifyData.err, 'error');
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
  // The backend doesn't implement password reset yet, but we show a simulation
  showToast(`Password reset link sent to ${email} (simulated)`);
}

// ---------- WISHLIST ----------
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

// ---------- PAGE SETUP (run on each page) ----------
function setupPage() {
  const path = window.location.pathname;

  // Home page
  if (path.includes('index.html') || path === '/' || path === '') {
    setupHomePage();
  }
  // Products listing
  if (path.includes('products.html') && !path.includes('product-detail')) {
    setupProductsPage();
  }
  // Product detail
  if (path.includes('product-detail.html')) {
    setupProductDetailPage();
  }
  // Bulk order page (public)
  if (path.includes('bulk-order.html')) {
    setupBulkOrderPage();
  }
  // Custom designer
  if (path.includes('custom-designer.html')) {
    setupCustomDesigner();
  }
  // Contact
  if (path.includes('contact.html')) {
    setupContactPage();
  }
  // Auth pages
  if (path.includes('login.html')) {
    setupLoginPage();
  }
  if (path.includes('register.html')) {
    setupRegisterPage();
  }
  if (path.includes('forgot-password.html')) {
    setupForgotPasswordPage();
  }
  // Dashboard (protected)
  if (path.includes('dashboard.html')) {
    if (!authUser) { window.location.href = 'login.html'; return; }
    setupDashboardPage();
  }
  // Admin (protected)
  if (path.includes('admin.html')) {
    if (!authUser || authUser.role !== 'admin') { window.location.href = 'login.html'; return; }
    setupAdminPage();
  }
}

// ---------- PAGE‑SPECIFIC IMPLEMENTATIONS ----------

function setupHomePage() {
  // Load featured products from API
  fetch('/api/products')
    .then(r => r.json())
    .then(products => {
      const grid = document.getElementById('homeProductGrid');
      if (!grid) return;
      grid.innerHTML = products.slice(0, 8).map(p => `
        <div class="glass-card p-5 group" data-aos="fade-up">
          <div class="relative h-52 rounded-xl bg-white/5 flex items-center justify-center mb-4 overflow-hidden">
            <img src="${p.images[0]}" alt="${p.name}" class="h-full w-full object-cover group-hover:scale-110 transition duration-500">
            <span class="absolute top-3 left-3 bg-neon text-white text-xs font-bold px-3 py-1 rounded-full">${p.badge || ''}</span>
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
              <a href="product-detail.html?id=${p._id}" class="btn-primary text-xs py-2 px-5">View Details</a>
            </div>
          </div>
          <p class="text-xs text-neon mb-1">${p.category}</p>
          <h3 class="font-semibold text-white mb-1">${p.name}</h3>
          <div class="flex justify-between items-center">
            <span class="text-lg font-bold text-white">₹${p.price}<span class="text-xs text-gray-500">/piece</span></span>
            <span class="text-xs text-gray-500">${p.colors.length} colors</span>
          </div>
          <div class="flex gap-2 mt-3">
            <a href="product-detail.html?id=${p._id}" class="flex-1 btn-outline text-xs py-2 px-3 text-center">View Details</a>
            <button onclick="handleInquiry('${p.name}', ${p.price})" class="flex-1 btn-primary text-xs py-2 px-3">Get Quote</button>
          </div>
        </div>
      `).join('');
    });

  // Other home components remain static (features, reviews, FAQ) or can be fetched if needed.
  // Features grid static for now.
}

function setupProductsPage() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  fetch('/api/products')
    .then(r => r.json())
    .then(products => {
      grid.innerHTML = products.map(p => `
        <div class="glass-card p-5 group" data-aos="fade-up">
          <div class="relative h-52 rounded-xl overflow-hidden mb-4">
            <img src="${p.images[0]}" alt="${p.name}" class="h-full w-full object-cover group-hover:scale-110 transition duration-500">
            <span class="absolute top-3 left-3 bg-neon text-white text-xs font-bold px-3 py-1 rounded-full">${p.badge || ''}</span>
          </div>
          <p class="text-xs text-neon mb-1">${p.category}</p>
          <h3 class="font-semibold text-white mb-2">${p.name}</h3>
          <p class="text-sm text-gray-400 line-clamp-2">${p.description}</p>
          <div class="flex justify-between items-center mt-3">
            <span class="text-lg font-bold text-white">₹${p.price}<span class="text-xs text-gray-500">/piece</span></span>
            <a href="product-detail.html?id=${p._id}" class="btn-outline text-xs py-2 px-4">View Details</a>
          </div>
        </div>
      `).join('');
    });
}

function setupProductDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  if (!productId) return;
  fetch(`/api/products/${productId}`)  // Note: we need to add this route to server.js
    .then(r => r.json())
    .then(product => {
      if (product.err) {
        document.getElementById('productDetailContainer').innerHTML = `<div class="text-center py-20"><h2 class="text-3xl text-white mb-4">Product Not Found</h2><a href="products.html" class="btn-primary">Back to Products</a></div>`;
        return;
      }
      renderProductDetail(product);
    });
}

function renderProductDetail(product) {
  const container = document.getElementById('productDetailContainer');
  if (!container) return;
  container.innerHTML = `
    <div class="glass-card-premium p-6 sm:p-10 grid lg:grid-cols-2 gap-10">
      <div class="slider-container">
        <div class="slider-track" id="sliderTrack">
          ${product.images.map(img => `<img src="${img}" alt="${product.name}" class="slider-slide">`).join('')}
        </div>
        <button class="slider-arrow left" id="prevBtn"><i class="fas fa-chevron-left"></i></button>
        <button class="slider-arrow right" id="nextBtn"><i class="fas fa-chevron-right"></i></button>
      </div>
      <div class="space-y-6">
        <div>
          <span class="inline-block bg-neon/20 text-neon text-xs px-4 py-2 rounded-full font-semibold">${product.badge || ''}</span>
          <h1 class="text-3xl sm:text-4xl font-bold font-display text-white mt-3">${product.name}</h1>
          <p class="text-2xl font-bold text-white mt-3">₹${product.price} <span class="text-sm text-gray-400">/ piece</span></p>
          <p class="text-gray-400 mt-4 leading-relaxed">${product.description}</p>
        </div>
        <div>
          <h4 class="text-sm text-gray-400 mb-2">Color: <span id="selectedColorText" class="text-white font-semibold">${product.colors[0]}</span></h4>
          <div class="flex flex-wrap gap-2">${product.colors.map(c => `<button class="color-box ${c===product.colors[0]?'selected-color':''}" data-color="${c}">${c}</button>`).join('')}</div>
        </div>
        <div>
          <h4 class="text-sm text-gray-400 mb-2">Size: <span id="selectedSizeText" class="text-white font-semibold">${product.sizes[0]}</span></h4>
          <div class="flex flex-wrap gap-2">${product.sizes.map(s => `<button class="size-box ${s===product.sizes[0]?'selected-size':''}" data-size="${s}">${s}</button>`).join('')}</div>
        </div>
        <div class="grid grid-cols-2 gap-4 text-sm text-gray-400">
          <div><i class="fas fa-tshirt text-neon mr-2"></i> Fabric: <span class="text-white font-medium">${product.fabric}</span></div>
          <div><i class="fas fa-print text-neon mr-2"></i> Printing: <span class="text-white font-medium">${product.printingMethods.join(', ')}</span></div>
        </div>
        <div class="flex gap-4 pt-4">
          <button onclick="handleInquiry('${product.name}', ${product.price})" class="btn-primary flex-1 text-base py-4"><i class="fab fa-whatsapp text-lg"></i> Inquire Now</button>
          <button onclick="addToWishlist('${product._id}')" class="btn-outline flex-1 text-base py-4"><i class="far fa-heart"></i> Wishlist</button>
        </div>
      </div>
    </div>
  `;
  // Slider logic
  const track = document.getElementById('sliderTrack');
  const slides = document.querySelectorAll('.slider-slide');
  let currentIndex = 0;
  function updateSlider() { track.style.transform = `translateX(-${currentIndex * 100}%)`; }
  document.getElementById('prevBtn').addEventListener('click', () => { currentIndex = (currentIndex === 0) ? slides.length - 1 : currentIndex - 1; updateSlider(); });
  document.getElementById('nextBtn').addEventListener('click', () => { currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1; updateSlider(); });
  // Color/size selectors
  document.querySelectorAll('.color-box').forEach(b => b.addEventListener('click', function() {
    document.querySelectorAll('.color-box').forEach(bb => bb.classList.remove('selected-color'));
    this.classList.add('selected-color');
    document.getElementById('selectedColorText').textContent = this.dataset.color;
  }));
  document.querySelectorAll('.size-box').forEach(b => b.addEventListener('click', function() {
    document.querySelectorAll('.size-box').forEach(bb => bb.classList.remove('selected-size'));
    this.classList.add('selected-size');
    document.getElementById('selectedSizeText').textContent = this.dataset.size;
  }));
}

function setupBulkOrderPage() {
  const form = document.getElementById('bulkOrderForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const msg = `📦 *Bulk Order Inquiry*\n🏢 ${data.instituteName}\n👤 ${data.contactPerson}\n📞 ${data.phone}\n📧 ${data.email}\n📦 ${data.productType}\n🔢 ${data.quantity} pcs\n📏 Sizes: ${data.sizes}\n📅 ${data.deadline}\n💰 ${data.budget}\n📝 ${data.message}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    showToast('Request sent!');
  });
}

function setupCustomDesigner() {
  // basic canvas logic (just for demo)
  const canvas = document.getElementById('tshirtCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function drawTshirt(color = '#ffffff') {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(100, 80); ctx.lineTo(300, 80); ctx.lineTo(280, 150); ctx.lineTo(350, 180); ctx.lineTo(350, 380); ctx.lineTo(50, 380); ctx.lineTo(50, 180); ctx.lineTo(120, 150); ctx.closePath();
    ctx.fill(); ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.stroke();
  }
  drawTshirt();
  document.getElementById('tshirtColor')?.addEventListener('change', e => drawTshirt(e.target.value));
  document.getElementById('imageUpload')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 150, 200, 100, 100);
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
  document.getElementById('designText')?.addEventListener('input', e => {
    drawTshirt(document.getElementById('tshirtColor')?.value || '#ffffff');
    if (e.target.value) {
      ctx.fillStyle = document.getElementById('textColor')?.value || '#fff';
      ctx.font = 'bold 24px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(e.target.value, 200, 180);
    }
  });
  window.submitDesign = () => {
    const msg = '🎨 *Custom Design Enquiry* – I have created a design and would like a quote.';
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };
}

function setupLoginPage() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    loginUser(form.email.value, form.password.value);
  });
}

function setupRegisterPage() {
  const form = document.getElementById('registerForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(form));
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    registerUser({ fullName: formData.fullName, email: formData.email, phone: formData.phone, password: formData.password });
  });
}

function setupForgotPasswordPage() {
  const form = document.getElementById('forgotForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    forgotPassword(form.email.value);
  });
}

async function setupDashboardPage() {
  // Load user leads
  const leadsRes = await fetch('/api/user/leads');
  const leads = await leadsRes.json();
  const tableBody = document.querySelector('#inquiriesTable tbody');
  if (tableBody) {
    tableBody.innerHTML = leads.length ? leads.map(l => `
      <tr class="border-b border-white/5 hover:bg-white/5">
        <td class="px-4 py-3 font-mono text-neon">${l.inquiryId}</td>
        <td class="px-4 py-3">${l.productName || 'N/A'}</td>
        <td class="px-4 py-3">${new Date(l.createdAt).toLocaleDateString()}</td>
        <td class="px-4 py-3"><span class="px-2 py-1 text-xs rounded-full bg-neon/20 text-neon">${l.status}</span></td>
        <td class="px-4 py-3"><button onclick="window.open('https://wa.me/${WHATSAPP_NUMBER}?text=Follow up inquiry ${l.inquiryId}','_blank')"><i class="fab fa-whatsapp text-green-400"></i></button></td>
      </tr>
    `).join('') : '<tr><td colspan="5" class="py-4 text-center text-gray-500">No inquiries yet.</td></tr>';
  }
  // Bulk order form inside dashboard
  const bulkForm = document.getElementById('dashboardBulkForm');
  if (bulkForm) {
    bulkForm.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(bulkForm));
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
}

async function setupAdminPage() {
  const stats = await fetch('/api/admin/stats').then(r => r.json());
  document.getElementById('totalLeads').textContent = stats.totalLeads;
  document.getElementById('newLeads').textContent = stats.newLeads;

  const leadsRes = await fetch('/api/admin/leads');
  const leads = await leadsRes.json();
  const tbody = document.querySelector('#leadsTable tbody');
  if (tbody) {
    tbody.innerHTML = leads.map(l => `
      <tr class="border-b border-white/5 hover:bg-white/5">
        <td class="px-4 py-3 font-mono text-neon">${l.inquiryId}</td>
        <td class="px-4 py-3">${l.guestName}</td>
        <td class="px-4 py-3">${l.productName}</td>
        <td class="px-4 py-3">${new Date(l.createdAt).toLocaleDateString()}</td>
        <td class="px-4 py-3">
          <select onchange="updateLeadStatus('${l._id}', this.value)" class="bg-dark border border-white/10 rounded px-2 py-1 text-white text-xs">
            ${['New Lead','Contacted','Negotiation','Design Approval','Printing','Dispatch','Delivered'].map(s => `<option ${l.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </td>
        <td class="px-4 py-3">
          <button onclick="contactLead('${l.guestPhone}')" class="text-green-400 hover:text-green-300 mr-2"><i class="fab fa-whatsapp"></i></button>
          <button onclick="deleteLead('${l._id}')" class="text-red-400"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  }

  window.updateLeadStatus = async (id, status) => {
    await fetch(`/api/admin/leads/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    showToast('Status updated');
  };
  window.contactLead = phone => window.open(`https://wa.me/91${phone}?text=Hello from Your Brand`, '_blank');
  window.deleteLead = async id => {
    if (confirm('Delete lead?')) {
      await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' }); // you may add this route later
      showToast('Lead deleted');
      setupAdminPage(); // refresh
    }
  };
}

// ---------- EXPORT GLOBAL FUNCTIONS ----------
window.handleInquiry = handleInquiry;
window.addToWishlist = addToWishlist;
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.forgotPassword = forgotPassword;
window.showToast = showToast;
