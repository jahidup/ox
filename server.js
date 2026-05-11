// ==================== YOUR BRAND – FINAL SERVER.JS ====================
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

// ======== CRITICAL: Trust proxy for Vercel / reverse proxies ========
app.set('trust proxy', 1);

// ---------- SECURITY MIDDLEWARE ----------
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------- RATE LIMITER (after trust proxy) ----------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false } // disable built‑in proxy validation
});
app.use('/api', limiter);

// ---------- STATIC FILES (frontend) ----------
app.use(express.static(path.join(__dirname, 'public')));

// ---------- DATABASE CONNECTION ----------
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

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
  otpAttempts: { type: Number, default: 0 },
  otpRequestedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
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
  status: {
    type: String,
    enum: ['New Lead','Contacted','Negotiation','Design Approval','Printing','Dispatch','Delivered'],
    default: 'New Lead'
  },
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
  try {
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
          description: 'Our best‑selling tee made from 100% ring‑spun cotton for ultra‑soft comfort. Pre‑shrunk and bio‑washed.',
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
          description: 'Classic polo with a modern tailored fit. Breathable pique fabric perfect for corporate uniforms.',
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
          description: 'Boxy oversized fit for streetwear. Double‑needle stitching ensures long‑lasting durability.',
          images: [
            'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600',
            'https://images.unsplash.com/photo-1603344217258-9b1d02f02c62?w=600',
            'https://images.unsplash.com/photo-1581655353564-df123a1e8204?w=600',
            'https://images.unsplash.com/photo-1618354691229-88ca30e3b25e?w=600',
            'https://images.unsplash.com/photo-1608236415053-4087f2a46f3a?w=600'
          ]
        },
        {
          name: 'Pullover Hoodie',
          category: 'Hoodies',
          price: 799,
          badge: 'Hot',
          colors: ['Black','Gray','Navy','Olive'],
          sizes: ['S','M','L','XL','2XL'],
          fabric: 'Fleece‑lined 320 GSM',
          printingMethods: ['DTG','Embroidery'],
          description: 'Ultra‑warm fleece‑lined hoodie with a modern fit. Perfect for winter gifts or team merchandise.',
          images: [
            'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600',
            'https://images.unsplash.com/photo-1578681994506-b8f4636509b3?w=600',
            'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=600',
            'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600',
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'
          ]
        },
        {
          name: 'Sports Performance Jersey',
          category: 'Jerseys',
          price: 549,
          badge: 'New',
          colors: ['Red','Blue','Green','Black','White'],
          sizes: ['XS','S','M','L','XL','2XL'],
          fabric: 'Moisture‑Wicking Polyester',
          printingMethods: ['Sublimation','Screen Print'],
          description: 'Lightweight jersey designed for peak performance. Full‑color sublimation printing that never fades.',
          images: [
            'https://images.unsplash.com/photo-1580087256394-dbc0e7a62060?w=600',
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
            'https://images.unsplash.com/photo-1544256718-7b28c0d03fc2?w=600',
            'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600',
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'
          ]
        },
        {
          name: 'Corporate Uniform Shirt',
          category: 'Corporate',
          price: 649,
          badge: 'Bulk Deal',
          colors: ['White','Light Blue','Pink'],
          sizes: ['XS','S','M','L','XL','2XL','3XL'],
          fabric: 'Cotton‑Polyester Blend',
          printingMethods: ['Embroidery','DTG'],
          description: 'Professional full‑sleeve shirt for corporate uniforms. Wrinkle‑resistant fabric with a comfortable regular fit.',
          images: [
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
            'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600',
            'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600',
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
            'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600'
          ]
        }
      ]);
      console.log('Products seeded successfully');
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
      console.log(`Default admin created: ${adminEmail} / [env password]`);
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}
seedData();

// ===================== EMAIL SERVICE =====================
let transporter = null;
if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    pool: true,
    maxConnections: 3,
    maxMessages: Infinity,
    tls: {
      rejectUnauthorized: false
    }
  });
  transporter.verify((error, success) => {
    if (error) {
      console.log('Email transporter verification failed:', error.message);
    } else {
      console.log('Email server ready');
    }
  });
} else {
  console.log('Email not configured. OTP will be logged to console.');
}

async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    console.log(`\n=== EMAIL (not sent) ===`);
    console.log(`To: ${to}\nSubject: ${subject}\nBody: ${html.replace(/<[^>]*>/g, '')}`);
    console.log(`========================\n`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Your Brand" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err.message);
  }
}

// ===================== MIDDLEWARE =====================
const protect = async (req, res, next) => {
  let token = req.cookies.token;
  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ err: 'Not authenticated' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) throw new Error('User not found');
    next();
  } catch (err) {
    return res.status(401).json({ err: 'Token invalid' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    return next();
  }
  return res.status(403).json({ err: 'Admin access only' });
};

// ===================== AUTH ROUTES =====================
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ err: 'Please provide all required fields' });
    }
    if (password.length < 6) {
      return res.status(400).json({ err: 'Password must be at least 6 characters' });
    }

    let user = await User.findOne({ email });
    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ err: 'Email already registered' });
      }
      // Resend OTP for unverified user (with 60s cooldown)
      if (user.otpRequestedAt && (Date.now() - user.otpRequestedAt) < 60000) {
        return res.status(429).json({ err: 'Please wait 60 seconds before requesting a new OTP' });
      }
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpire = Date.now() + 10 * 60 * 1000;
      user.otpAttempts = 0;
      user.otpRequestedAt = new Date();
      await user.save();
      await sendEmail({
        to: email,
        subject: 'Your OTP for Your Brand',
        html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#06060a;color:#e0e0e0;border-radius:12px;border:1px solid rgba(255,255,255,0.08);"><h2 style="color:#2d8eff;">Your Brand</h2><h3 style="color:#fff;">Verify Your Email</h3><p>Your OTP is:</p><div style="font-size:28px;font-weight:bold;color:#2d8eff;letter-spacing:6px;text-align:center;padding:20px;background:rgba(45,142,255,0.1);border-radius:8px;margin:16px 0;">${otp}</div><p style="color:#888;font-size:12px;">Valid for 10 minutes. Do not share this code.</p></div>`
      }).catch(() => {});
      return res.json({ success: true, msg: 'OTP resent to your email' });
    }

    // New user
    const otp = generateOTP();
    user = await User.create({
      fullName,
      email,
      phone,
      password,
      otp,
      otpExpire: Date.now() + 10 * 60 * 1000,
      otpRequestedAt: new Date()
    });
    await sendEmail({
      to: email,
      subject: 'Your OTP for Your Brand',
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#06060a;color:#e0e0e0;border-radius:12px;border:1px solid rgba(255,255,255,0.08);"><h2 style="color:#2d8eff;">Your Brand</h2><h3 style="color:#fff;">Verify Your Email</h3><p>Your OTP is:</p><div style="font-size:28px;font-weight:bold;color:#2d8eff;letter-spacing:6px;text-align:center;padding:20px;background:rgba(45,142,255,0.1);border-radius:8px;margin:16px 0;">${otp}</div><p style="color:#888;font-size:12px;">Valid for 10 minutes. Do not share this code.</p></div>`
    }).catch(() => {});
    res.json({ success: true, msg: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ err: 'Email and OTP are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ err: 'User not found' });
    if (user.isVerified) return res.status(400).json({ err: 'Account already verified' });
    if (!user.otp || !user.otpExpire || user.otpExpire < Date.now()) {
      return res.status(400).json({ err: 'OTP expired. Please request a new one.' });
    }
    if (user.otp !== otp) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      if (user.otpAttempts >= 5) {
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();
        return res.status(429).json({ err: 'Too many failed attempts. Please request a new OTP.' });
      }
      return res.status(400).json({ err: `Invalid OTP. ${5 - user.otpAttempts} attempts remaining.` });
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    user.otpAttempts = 0;
    await user.save();
    sendTokenResponse(user, res);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ err: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ err: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      return res.status(401).json({ err: 'Please verify your email first. Check your inbox for OTP.' });
    }
    sendTokenResponse(user, res);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

app.get('/api/auth/me', protect, (req, res) => {
  res.json({ user: { id: req.user._id, fullName: req.user.fullName, email: req.user.email, phone: req.user.phone, role: req.user.role } });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token').json({ success: true });
});

function sendTokenResponse(user, res) {
  const token = user.getToken();
  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }).json({ success: true, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
}

// ===================== LEAD ROUTES =====================
function genId(prefix) {
  return prefix + '-' + Date.now().toString(36).toUpperCase();
}

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
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
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
      }
    });
    const waMsg = `📦 *BULK INQUIRY*\n📋 ${inquiryId}\n🏢 ${req.body.instituteName}\n👤 ${req.user.fullName}\n📞 ${req.user.phone}\n📧 ${req.user.email}\n🔢 ${req.body.quantity} pcs\n💰 ${req.body.budget}`;
    const waLink = `https://wa.me/${process.env.WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`;
    res.json({ success: true, inquiryId, waLink });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// ===================== PRODUCT ROUTES =====================
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ err: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// ===================== USER DASHBOARD =====================
app.get('/api/user/leads', protect, async (req, res) => {
  try {
    const leads = await Lead.find({ customer: req.user._id }).sort('-createdAt');
    res.json(leads);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// ===================== ADMIN ROUTES =====================
app.get('/api/admin/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'New Lead' });
    res.json({ totalLeads, newLeads });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

app.get('/api/admin/leads', protect, adminOnly, async (req, res) => {
  try {
    const leads = await Lead.find().sort('-createdAt').populate('customer', 'fullName email');
    res.json(leads);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

app.put('/api/admin/leads/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!lead) return res.status(404).json({ err: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

app.delete('/api/admin/leads/:id', protect, adminOnly, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ err: 'Lead not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// ===================== FALLBACK (SPA) =====================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '404.html'), err => {
    if (err) {
      res.status(404).send('Not found');
    }
  });
});

// ===================== START SERVER =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
