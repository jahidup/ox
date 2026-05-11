// ==================== YOUR BRAND – BACKEND SERVER ====================
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();

// ---------- SECURITY & MIDDLEWARE ----------
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// ---------- STATIC FILES ----------
app.use(express.static(path.join(__dirname, 'public')));

// ---------- DATABASE CONNECTION ----------
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('DB error:', err));

// ===================== MODELS =====================
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: String,
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'admin', 'staff'], default: 'customer' },
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpire: Date,
  createdAt: { type: Date, default: Date.now }
});
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.matchPassword = async function(pwd) { return bcrypt.compare(pwd, this.password); };
userSchema.methods.getToken = function() {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};
const User = mongoose.model('User', userSchema);

const leadSchema = new mongoose.Schema({
  inquiryId: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.ObjectId, ref: 'User' },
  guestName: String,
  guestEmail: String,
  guestPhone: String,
  productName: String,
  color: String,
  size: String,
  quantity: Number,
  printingType: String,
  customDesign: String,
  deliveryAddress: String,
  message: String,
  estimatedBudget: String,
  status: { type: String, enum: ['New Lead','Contacted','Negotiation','Design Approval','Printing','Dispatch','Delivered'], default: 'New Lead' },
  notes: String,
  isBulk: { type: Boolean, default: false },
  bulkDetails: {
    instituteName: String,
    deadline: Date,
    budget: String
  },
  createdAt: { type: Date, default: Date.now }
});
const Lead = mongoose.model('Lead', leadSchema);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  price: Number,
  badge: String,
  colors: [String],
  sizes: [String],
  fabric: String,
  printingMethods: [String],
  description: String,
  images: [String],
  createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);

// ===================== SEED DATA =====================
async function seedData() {
  if (await Product.countDocuments() === 0) {
    await Product.insertMany([
      {
        name: 'Classic Cotton T‑Shirt',
        category: 'T‑Shirts',
        price: 299,
        badge: 'Best Seller',
        colors: ['White','Black','Navy','Red','Gray'],
        sizes: ['XS','S','M','L','XL','2XL'],
        fabric: '180 GSM Combed Cotton',
        printingMethods: ['DTG','Screen Print','Embroidery'],
        description: 'Our best‑selling tee made from 100% ring‑spun cotton for ultra‑soft comfort.',
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600',
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600',
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'
        ]
      },
      {
        name: 'Premium Polo T‑Shirt',
        category: 'Polo',
        price: 449,
        badge: 'Premium',
        colors: ['Black','White','Navy','Burgundy'],
        sizes: ['S','M','L','XL'],
        fabric: '220 GSM Pique Cotton',
        printingMethods: ['Embroidery','DTG'],
        description: 'Classic polo with a modern tailored fit. Breathable pique fabric.',
        images: [
          'https://images.unsplash.com/photo-1620012253295-c1cc7f5e6f8b?w=600',
          'https://images.unsplash.com/photo-1589365275-6f4c3d44a9f9?w=600',
          'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600',
          'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600',
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600'
        ]
      },
      {
        name: 'Oversized Drop‑Shoulder Tee',
        category: 'Oversized',
        price: 399,
        badge: 'Trending',
        colors: ['Washed Black','Gray','White'],
        sizes: ['M','L','XL','2XL'],
        fabric: '240 GSM Heavy Cotton',
        printingMethods: ['DTG','Screen Print'],
        description: 'Boxy oversized fit for streetwear. Double‑needle stitching.',
        images: [
          'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600',
          'https://images.unsplash.com/photo-1603344217258-9b1d02f02c62?w=600',
          'https://images.unsplash.com/photo-1581655353564-df123a1e8204?w=600',
          'https://images.unsplash.com/photo-1618354691229-88ca30e3b25e?w=600',
          'https://images.unsplash.com/photo-1608236415053-4087f2a46f3a?w=600'
        ]
      }
    ]);
    console.log('Products seeded');
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@yourbrand.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  if (await User.countDocuments({ role: 'admin' }) === 0) {
    await User.create({
      fullName: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isVerified: true
    });
    console.log('Default admin created');
  }
}
seedData();

// ===================== EMAIL SETUP =====================
let transporter = null;
if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}
async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    console.log(`Email not configured – would send to ${to}: ${subject}`);
    return;
  }
  await transporter.sendMail({ from: `"Your Brand" <${process.env.EMAIL_USER}>`, to, subject, html });
}

// ===================== MIDDLEWARE =====================
const protect = async (req, res, next) => {
  let token = req.cookies.token;
  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ err: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({ err: 'Token invalid' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) return next();
  return res.status(403).json({ err: 'Admin access only' });
};

// ===================== AUTH ROUTES =====================
function generateOTP() { return Math.floor(100000 + Math.random() * 900000).toString(); }

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ err: 'Email already registered' });
    const otp = generateOTP();
    const user = await User.create({
      fullName, email, phone, password,
      otp, otpExpire: Date.now() + 10 * 60 * 1000
    });
    await sendEmail({ to: email, subject: 'Your OTP', html: `<h1>OTP: ${otp}</h1>` }).catch(() => {});
    res.json({ success: true, msg: 'OTP sent to your email' });
  } catch (err) { res.status(500).json({ err: err.message }); }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otp, otpExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ err: 'Invalid or expired OTP' });
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();
    sendTokenResponse(user, res);
  } catch (err) { res.status(500).json({ err: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ err: 'Invalid credentials' });
    if (!user.isVerified) return res.status(401).json({ err: 'Please verify your email first' });
    sendTokenResponse(user, res);
  } catch (err) { res.status(500).json({ err: err.message }); }
});

app.get('/api/auth/me', protect, (req, res) => {
  res.json({ user: { id: req.user._id, fullName: req.user.fullName, email: req.user.email, phone: req.user.phone, role: req.user.role } });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token').json({ success: true });
});

function sendTokenResponse(user, res) {
  const token = user.getToken();
  res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
    .json({ success: true, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
}

// ===================== LEAD / INQUIRY ROUTES =====================
function genId(prefix) { return prefix + '-' + Date.now().toString(36).toUpperCase(); }

app.post('/api/leads/product-inquiry', async (req, res) => {
  try {
    const inquiryId = genId('INQ');
    const data = {
      inquiryId,
      productName: req.body.productName,
      color: req.body.color,
      size: req.body.size,
      quantity: req.body.quantity || 1,
      printingType: req.body.printingType,
      customDesign: req.body.customDesign,
      deliveryAddress: req.body.deliveryAddress,
      message: req.body.message,
      estimatedBudget: req.body.estimatedBudget || 'N/A',
      guestName: req.body.guestName || (req.user ? req.user.fullName : 'Guest'),
      guestEmail: req.body.guestEmail || (req.user ? req.user.email : ''),
      guestPhone: req.body.guestPhone || (req.user ? req.user.phone : ''),
      customer: req.user ? req.user._id : undefined
    };
    await Lead.create(data);
    const waText = `🛍️ *NEW INQUIRY*\n📋 ${inquiryId}\n👤 ${data.guestName}\n📞 ${data.guestPhone}\n📧 ${data.guestEmail}\n📦 ${data.productName}\n💰 ${data.estimatedBudget}`;
    const waLink = `https://wa.me/${process.env.WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;
    if (data.guestEmail) {
      await sendEmail({ to: data.guestEmail, subject: 'Inquiry Received', html: `<p>Thank you! Inquiry ID: ${inquiryId}</p>` }).catch(() => {});
    }
    res.json({ success: true, inquiryId, waLink });
  } catch (err) { res.status(500).json({ err: err.message }); }
});

app.post('/api/leads/bulk-inquiry', protect, async (req, res) => {
  try {
    const inquiryId = genId('BLK');
    const lead = await Lead.create({
      inquiryId,
      productName: req.body.productType,
      quantity: req.body.quantity,
      size: req.body.sizes,
      estimatedBudget: req.body.budget,
      guestName: req.user.fullName,
      guestEmail: req.user.email,
      guestPhone: req.user.phone,
      customer: req.user._id,
      isBulk: true,
      bulkDetails: {
        instituteName: req.body.instituteName,
        deadline: req.body.deadline,
        budget: req.body.budget
      },
      message: `Institute: ${req.body.instituteName}, Contact: ${req.body.contactPerson}`
    });
    const waMsg = `📦 *BULK INQUIRY*\n📋 ${inquiryId}\n🏢 ${req.body.instituteName}\n👤 ${req.user.fullName}\n📞 ${req.user.phone}\n📧 ${req.user.email}\n🔢 ${req.body.quantity} pcs\n💰 ${req.body.budget}`;
    const waLink = `https://wa.me/${process.env.WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`;
    res.json({ success: true, inquiryId, waLink });
  } catch (err) { res.status(500).json({ err: err.message }); }
});

// ===================== PRODUCT ROUTES =====================
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ err: 'Product not found' });
  res.json(product);
});

// ===================== USER DASHBOARD =====================
app.get('/api/user/leads', protect, async (req, res) => {
  const leads = await Lead.find({ customer: req.user._id }).sort('-createdAt');
  res.json(leads);
});

// ===================== ADMIN ROUTES =====================
app.get('/api/admin/stats', protect, adminOnly, async (req, res) => {
  const totalLeads = await Lead.countDocuments();
  const newLeads = await Lead.countDocuments({ status: 'New Lead' });
  res.json({ totalLeads, newLeads });
});

app.get('/api/admin/leads', protect, adminOnly, async (req, res) => {
  const leads = await Lead.find().sort('-createdAt');
  res.json(leads);
});

app.put('/api/admin/leads/:id/status', protect, adminOnly, async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(lead);
});

app.delete('/api/admin/leads/:id', protect, adminOnly, async (req, res) => {
  await Lead.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ===================== FALLBACK FOR SPA / 404 =====================
app.get('*', (req, res) => {
  // Attempt to serve the 404 page
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'), err => {
    if (err) res.status(404).send('Not found');
  });
});

// ===================== START SERVER =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
