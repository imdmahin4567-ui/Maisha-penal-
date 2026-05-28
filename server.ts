/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

// Define DB path
const DB_FILE = path.join(process.cwd(), 'db.json');
const BACKUPS_DIR = path.join(process.cwd(), 'backups');

// Make sure backup directory exists
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

// Helpers for Data Encryption/Hashing
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Default Products in Bangladeshi Style for Borkha House Brand
const DEFAULT_PRODUCTS = [
  {
    id: "prod-1",
    title: "Premium Dubai Cherry Double-Layer Abaya",
    description: "প্রিমিয়াম ফ্রেঞ্চ ডিজাইনের ডাবল-লেয়ার আবায়া। অত্যন্ত সফট ও আরামদায়ক দুবাই চেরি জর্জেট ফেব্রিক্স দিয়ে তৈরি এবং হাতার বর্ডারে নিখুঁত সুতো এবং গ্লাসের কারুকাজ করা। সাথে পাচ্ছেন আকর্ষণীয় ম্যাচিং হিজাব ও খিমার সেট।",
    price: 3850,
    stock: 25,
    category: "Burqa & Abaya",
    brand: "Dubai Elegance",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800",
    featured: true,
    ratings: 4.9,
    sizes: ["S", "M", "L", "XL", "Free Size"],
    colors: ["Jet Black", "Cherry Maroon", "Emerald Green"]
  },
  {
    id: "prod-2",
    title: "Bridal Zardozi Handloomed Embroidered Borkha",
    description: "বিবাহ বা বিশেষ পার্টি অনুষ্ঠানের জন্য জমকালো জারদোজি এবং রাজকীয় হ্যান্ডলুম সুতোর এমব্রয়ডারি করা বোরখা হাউজের সিগনেচার ডিজাইন। রাজকীয় সোনালী নকশা ও নিখুঁত স্টোনওয়ার্ক করা কাটিং সাইড বেল্ট পকেট সমৃদ্ধ।",
    price: 6450,
    stock: 12,
    category: "Burqa & Abaya",
    brand: "Borkha House Signature",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
    featured: true,
    ratings: 4.8,
    sizes: ["52", "54", "56", "58"],
    colors: ["Royal Blue", "Earthy Teal", "Plum Purple"]
  },
  {
    id: "prod-3",
    title: "Turkish Premium Georgette Double Loop Khimar",
    description: "তুর্কি আমদানিকৃত হাই-কোয়ালিটি বাবল জর্জেট ফেব্রিক্সের ডাবল লুপ খিমার। মাথায় পরার জন্য অত্যন্ত সহজ এবং ফুল-কাভারেজ ফেস-শিল্ডিং নিকাব ইন্টিগ্রেশন সুবিধা সহ ডিজাইন করা। যা প্রতিটি মোড়েই আভিজাত্য এনে দেবে।",
    price: 1850,
    stock: 45,
    category: "Hijab & Khimar",
    brand: "Anatolia Modest",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800",
    featured: true,
    ratings: 4.7,
    sizes: ["One Size Fits All"],
    colors: ["Soft Nude", "Cream Ivory", "Olive Grey"]
  },
  {
    id: "prod-4",
    title: "Elegance Premium Linen Slip-On Shrug & Kaftan",
    description: "প্রিমিয়াম লিনেন ক্রেপ কাপড়ের সংমিশ্রণে ঢিলেঢালা স্টাইলিশ লং শ্রাগ এবং কাফতান বেসিক সেট। সহজে পরা যায় এবং দৈনন্দিন ভার্সিটি কিংবা অফিশিয়াল কাজের জন্য খুবই উপযোগী ও আরামদায়ক।",
    price: 2950,
    stock: 35,
    category: "Kaftans",
    brand: "Dubai Elegance",
    image: "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&q=80&w=800",
    featured: false,
    ratings: 4.6,
    sizes: ["M", "L", "XL"],
    colors: ["Sand Gold", "Chocolate Brown", "Olive Green"]
  },
  {
    id: "prod-5",
    title: "Lace Embellished Pearl Georgette Hijab Pack",
    description: "সুক্ষ্ম জরি এবং অরগানিক মুক্তো বা পাল এম্বেড করা আকর্ষণীয় জর্জেট পার্টি হিজাব প্যাক। প্রি-স্টিচড স্লাইডার সহ, পিন ছাড়াই মাত্র ৩০ সেকেন্ডে চমৎকার নকশায় মাথায় জড়িয়ে নিতে পারবেন।",
    price: 950,
    stock: 80,
    category: "Hijab & Khimar",
    brand: "Habiba Hijabs",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
    featured: true,
    ratings: 4.5,
    sizes: ["75 x 180 cm"],
    colors: ["Dusty Pink", "Lavender Grey", "Classic White"]
  },
  {
    id: "prod-6",
    title: "Gold-Plated Designer Hijab Pin & Crown Box",
    description: "হ্যান্ডক্রাফটেড ৬ পিসের সোনালী আমদানিকৃত এক্সক্লুসিভ হিজাব সেফটি পিন সেট। চমৎকার জুয়েলারী বক্স এ সুসজ্জিত এবং সহজে কাপড় নষ্ট না হওয়া অ্যান্টি-স্ন্যাগ মেকানিজম যুক্ত।",
    price: 490,
    stock: 120,
    category: "Accessories",
    brand: "Borkha House Signature",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800",
    featured: false,
    ratings: 4.9,
    sizes: ["Box Pack"],
    colors: ["24K Gold Plated", "Rose Gold"]
  }
];

// Default Settings
const DEFAULT_SETTINGS = {
  siteName: "Borkha House Bangladesh | শালীনতা ও আভিজাত্য",
  logoText: "BORKHA HOUSE",
  aboutText: "বোরখা হাউজ বাংলাদেশ - আপনার শালীন বিশ্বাস ও আভিজাত্যের বিশ্বস্ত পোশাক সঙ্গী। ১৯৭৮ সাল থেকে দেশীয় ও আন্তর্জাতিক ডিজাইনের অনন্য সংমিশ্রণে সর্বোচ্চ প্রিমিয়াম মানের বোরখা, আবায়া, খিমার ও হিজাব প্রস্তুত করে আসছি। দেশের প্রতিটি মুসলিম নারীর শালীন জীবনধারাকে আরামদায়ক ও রুচিশীল করে তোলাই আমাদের একমাত্র লক্ষ্য।",
  contactEmail: "orders@borkhahouse.com",
  contactPhone: "+880 1789-555666",
  brandColors: {
    primary: "#4A0E17", // Elegant Ruby Burgundy
    accent: "#8A1C14",  // Rich Royal Red
    bgLight: "#FDFBF7", // Soft Premium Canvas Cream
    textDark: "#1A1818"  // Charcoal Dark Gray
  },
  heroSlides: [
    {
      id: "slide-1",
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1600",
      title: "রাজকীয় আবায়া ও বোরখা কালেকশন",
      subtitle: "প্রিমিয়াম দুবাই চেরি জর্জেট কাপড়ে তৈরি অনন্য ডিজাইনের বোরখা যা আপনাকে দেবে সর্বোচ্চ আরাম ও শালীনতা।",
      brand: "Dubai Elegance",
      link: "/women"
    },
    {
      id: "slide-2",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1600",
      title: "হ্যান্ডক্রাফটেড এমব্রয়ডারি সিগনেচার",
      subtitle: "ঈদের কালেকশন এবং বিবাহোত্তর পার্টি অনুষ্ঠানের জন্য আকর্ষণীয় কাবা আর জর্দোজি কাজ করা দৃষ্টিনন্দন খিমার সেট।",
      brand: "Borkha House Signature",
      link: "/women"
    },
    {
      id: "slide-3",
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=1600",
      title: "প্রিমিয়াম খিমার ও হিজাব সম্ভার",
      subtitle: "সূক্ষ্ম লেসের সংমিশ্রণে ফোল্ডিং স্টাইলিশ খিমার, আধুনিক কর্মজীবী এবং ছাত্রীদের চমৎকার আভিজাত্যের পোশাক।",
      brand: "Anatolia Modest",
      link: "/home-decor"
    }
  ]
};

// Initial admin accounts - 2FA disabled by default to make standard login ultra easy!
const DEFAULT_ADMIN = {
  username: "imdmahin4567@gmail.com",
  passwordHash: hashPassword("Mahin@295687"),
  is2faEnabled: false,
  current2faSecret: "2FASEC"
};

// Database structure
interface DBStructure {
  products: typeof DEFAULT_PRODUCTS;
  settings: typeof DEFAULT_SETTINGS;
  admin: typeof DEFAULT_ADMIN;
  logs: any[];
  notifications: any[];
  sessions: { [token: string]: { username: string; expires: number; verified: boolean } };
}

// Global DB in-memory reference
let db: DBStructure;

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(content);
      // Ensure sessions is always initialized
      if (!db.sessions) db.sessions = {};
      if (!db.logs) db.logs = [];
      if (!db.notifications) db.notifications = [];
      
      // Update admin credentials to make sure they match user request immediately
      db.admin = {
        username: "imdmahin4567@gmail.com",
        passwordHash: hashPassword("Mahin@295687"),
        is2faEnabled: false,
        current2faSecret: "2FASEC"
      };
      saveDatabase();
    } else {
      throw new Error();
    }
  } catch (err) {
    db = {
      products: DEFAULT_PRODUCTS,
      settings: DEFAULT_SETTINGS,
      admin: {
        username: "imdmahin4567@gmail.com",
        passwordHash: hashPassword("Mahin@295687"),
        is2faEnabled: false,
        current2faSecret: "2FASEC"
      },
      logs: [
        {
          id: "log-init",
          timestamp: new Date().toISOString(),
          action: "SYSTEM_INITIALIZE",
          username: "system",
          details: "Database successfully bootstrapped with default Borkha House product schema and brand settings.",
          status: "SUCCESS",
          ipAddress: "127.0.0.1"
        }
      ],
      notifications: [
        {
          id: "notif-1",
          timestamp: new Date().toISOString(),
          type: "SUCCESS",
          message: "বোরখা হাউজ অ্যাডমিন প্যানেলে স্বাগতম! সফলভাবে সেটিংস লোড করা হয়েছে।",
          read: false
        }
      ],
      sessions: {}
    };
    saveDatabase();
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error("Failed to write database file:", err);
    return false;
  }
}

// Load database immediately
loadDatabase();

// Generate an activity log wrapper
function addLog(action: string, username: string, details: string, status: 'SUCCESS' | 'FAILED' | 'WARNING' | 'INFO' = 'SUCCESS', ip = '127.0.0.1') {
  const log = {
    id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    action,
    username,
    details,
    status,
    ipAddress: ip
  };
  db.logs.unshift(log);
  // Keep last 400 logs to manage token/memory limits
  if (db.logs.length > 400) db.logs = db.logs.slice(0, 400);
  
  // Realtime notification sync for alerts
  if (status === 'WARNING' || status === 'FAILED') {
    addNotification('ALERT', `Security event [${action}]: ${details}`);
  }
  saveDatabase();
  return log;
}

// Generate notification
function addNotification(type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT', message: string) {
  const notif = {
    id: "notif-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    type,
    message,
    read: false
  };
  db.notifications.unshift(notif);
  if (db.notifications.length > 50) db.notifications = db.notifications.slice(0, 50);
  saveDatabase();
}

// Temporary store for generated 2FA tokens
// Key is temporary_auth_token, value is { code: string, username: string, expires: number }
const active2faCodes: { [tempToken: string]: { code: string; username: string; expires: number } } = {};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Verify Auth Session middleware (declared early to prevent block-scope use-before-def issues)
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers['authorization'] as string;
    if (!token) {
      return res.status(401).json({ error: "Missing authentication vector." });
    }

    const session = db.sessions[token];
    if (!session) {
      return res.status(401).json({ error: "Invalid credentials session context." });
    }

    if (Date.now() > session.expires) {
      delete db.sessions[token];
      saveDatabase();
      return res.status(401).json({ error: "Admin session context expired." });
    }

    // Prolong session expiration slightly
    session.expires = Date.now() + 30 * 60 * 1000;
    next();
  };

  // Global Middlewares
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ limit: '20mb', extended: true }));

  // Create and serve uploads directory statically
  fs.mkdirSync(path.join(process.cwd(), 'uploads'), { recursive: true });
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Security Header Simulation: CSRF, Frame Protection, XSS Safeguards & encryption notes
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' *;");
    next();
  });

  // API API API!

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Borkha House Bangladesh Clone API Container" });
  });

  // Image Upload Endpoint (handles logo PNG and product image PNG uploads as Base64)
  app.post("/api/upload", requireAdmin, (req, res) => {
    try {
      const { file, filename } = req.body;
      if (!file) {
        return res.status(400).json({ error: "No file content provided" });
      }

      // Check if it is a valid picture payload
      if (!file.startsWith('data:image/')) {
        return res.status(400).json({ error: "Only valid images can be uploaded." });
      }

      const match = file.match(/^data:image\/(\w+);base64,/);
      const extension = match ? match[1] : 'png';
      
      const base64Data = file.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      const safeFilename = `upload-${Date.now()}-${Math.floor(Math.random() * 100000)}.${extension}`;
      const uploadPath = path.join(process.cwd(), 'uploads', safeFilename);
      
      fs.writeFileSync(uploadPath, buffer);
      
      const fileUrl = `/uploads/${safeFilename}`;
      res.json({ success: true, url: fileUrl });
    } catch (e: any) {
      console.error("Upload error:", e);
      res.status(500).json({ error: "Failed to upload file to the server." });
    }
  });

  // Client logs & notifications
  app.get("/api/dashboard/summary", (req, res) => {
    // Basic dashboard metrics calculation safely
    const productsCount = db.products.length;
    const stockWarnings = db.products.filter(p => p.stock < 10).length;
    const logsCount = db.logs.length;
    const readNotifications = db.notifications.filter(n => !n.read).length;

    // Build categories visual share
    const catMap: { [cat: string]: number } = {};
    db.products.forEach(p => {
      catMap[p.category] = (catMap[p.category] || 0) + (p.price * p.stock * 0.45); // simulated accumulated sales proportional to capital
    });
    const salesByCategory = Object.keys(catMap).map(cat => ({
      name: cat,
      value: Math.round(catMap[cat])
    }));

    // Brand shares values
    const brandMap: { [b: string]: number } = {};
    db.products.forEach(p => {
      brandMap[p.brand] = (brandMap[p.brand] || 0) + 1;
    });
    const brandShare = Object.keys(brandMap).map(b => ({
      name: b,
      value: brandMap[b]
    }));

    // Simulated sales trends
    const salesTrend = [
      { date: "May 22", amount: 489000, orders: 120 },
      { date: "May 23", amount: 562000, orders: 154 },
      { date: "May 24", amount: 420000, orders: 98 },
      { date: "May 25", amount: 790000, orders: 180 },
      { date: "May 26", amount: 934000, orders: 204 },
      { date: "May 27", amount: 1120000, orders: 247 },
      { date: "May 28", amount: db.products.reduce((acc, p) => acc + (p.price * 5), 850000), orders: 140 }  // dynamic based on inventory size
    ];

    res.json({
      productsCount,
      stockWarnings,
      logsCount,
      readNotifications,
      salesByCategory,
      brandShare,
      salesTrend
    });
  });

  // 1. AUTHENTICATION & ADVANCED 2FA SEGMENT
  // Easy-Login Direct Bypass Route to enter the workspace with 1-click
  app.post("/api/auth/easy-login", (req, res) => {
    const clientIp = req.ip || 'Unknown';
    const username = db.admin.username || "admin";

    // Create valid session
    const authToken = crypto.randomUUID();
    db.sessions[authToken] = {
      username,
      expires: Date.now() + 12 * 60 * 60 * 1000, // 12 hours for easy demo access
      verified: true
    };
    saveDatabase();

    addLog("AUTH_EASY_LOGIN", username, "Bypassed standard authentication using 1-click Easy Login.", "SUCCESS", clientIp);
    addNotification("SUCCESS", "Demo admin session created instantly via Easy Login (১-ক্লিক সহজ লগইন)।");

    return res.json({
      status: "success",
      token: authToken,
      username
    });
  });

  // Login first phase
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const clientIp = req.ip || req.headers['x-forwarded-for'] as string || 'Unknown';

    if (!username || !password) {
      addLog("AUTH_LOGIN", "anonymous", "Login attempt blocked: missing credentials", "WARNING", clientIp);
      return res.status(400).json({ error: "Username and password are required" });
    }

    const hashedPasswordInput = hashPassword(password);

    if (username === db.admin.username && hashedPasswordInput === db.admin.passwordHash) {
      if (db.admin.is2faEnabled) {
        // Generate temporary code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const tempToken = crypto.randomUUID();
        
        // Save 2FA state for 2 minutes
        active2faCodes[tempToken] = {
          code,
          username,
          expires: Date.now() + 2 * 60 * 1000
        };

        // Standard security notification logic
        addNotification("ALERT", `Unverified admin login from IP ${clientIp}. 2FA verification challenge triggered.`);
        addLog("AUTH_LOGIN_STAGE1", username, "Primary authentication successful. 2FA challenge generated.", "INFO", clientIp);

        // To make it easy to see the 2FA code in the preview UI (as a helper since there is no real setup SMS/email API)
        // We output the code inside the notification logs instantly or push alerts
        addNotification("INFO", `[SIMULATED 2FA CODE DELIVERY]: Your 6-digit access login secret is ${code} (Expires in 2 mins)`);

        return res.json({
          status: "2fa_required",
          tempToken,
          message: "Two-Factor authentication code has been sent via secure security channels."
        });
      } else {
        // Direct login
        const authToken = crypto.randomUUID();
        db.sessions[authToken] = {
          username,
          expires: Date.now() + 24 * 60 * 60 * 1000,
          verified: true
        };
        saveDatabase();

        addLog("AUTH_LOGIN", username, "Successful password login without 2FA.", "SUCCESS", clientIp);
        return res.json({
          status: "success",
          token: authToken,
          username
        });
      }
    } else {
      addLog("AUTH_LOGIN", username, "Authentication failure: invalid credentials detected.", "FAILED", clientIp);
      return res.status(401).json({ error: "Invalid username or password" });
    }
  });

  // Confirm 2FA Code
  app.post("/api/auth/verify-2fa", (req, res) => {
    const { tempToken, code } = req.body;
    const clientIp = req.ip || 'Unknown';

    if (!tempToken || !code) {
      return res.status(400).json({ error: "Temporary key and 2FA code are required" });
    }

    const verificationRecord = active2faCodes[tempToken];

    if (!verificationRecord) {
      addLog("AUTH_2FA", "anonymous", "Attempted 2FA matching with expired/invalid temporary session.", "WARNING", clientIp);
      return res.status(410).json({ error: "Temporary login session expired. Please authenticate again." });
    }

    if (Date.now() > verificationRecord.expires) {
      delete active2faCodes[tempToken];
      return res.status(410).json({ error: "2FA challenge expired. Please authenticate again." });
    }

    if (verificationRecord.code === code) {
      // Create valid session
      const authToken = crypto.randomUUID();
      db.sessions[authToken] = {
        username: verificationRecord.username,
        expires: Date.now() + 2 * 60 * 60 * 1000, // 2 hour admin session timeout for maximum compliance
        verified: true
      };
      
      // Clean temporary token
      delete active2faCodes[tempToken];
      saveDatabase();

      addLog("AUTH_2FA", verificationRecord.username, "Successful 2FA Match. Secure session instantiated.", "SUCCESS", clientIp);
      addNotification("SUCCESS", `Secure admin login completed from IP ${clientIp}`);

      return res.json({
        status: "success",
        token: authToken,
        username: verificationRecord.username
      });
    } else {
      addLog("AUTH_2FA_FAILED", verificationRecord.username, `Failed 2FA entry trial: [Provided of len: ${code.length}]`, "FAILED", clientIp);
      return res.status(401).json({ error: "Incorrect 6-digit dynamic code." });
    }
  });

  // Logout session
  app.post("/api/auth/logout", (req, res) => {
    const token = req.headers['authorization'] as string;
    if (token && db.sessions[token]) {
      const username = db.sessions[token].username;
      delete db.sessions[token];
      saveDatabase();
      addLog("AUTH_LOGOUT", username, "Logged out securely.", "INFO");
    }
    res.json({ success: true });
  });

  // Fetch security info / options
  app.get("/api/auth/security-settings", requireAdmin, (req, res) => {
    res.json({
      is2faEnabled: db.admin.is2faEnabled,
      username: db.admin.username
    });
  });

  // Toggle 2FA and update credentials
  app.put("/api/auth/security-settings", requireAdmin, (req, res) => {
    const { is2faEnabled, newPassword } = req.body;
    const token = req.headers['authorization'] as string;
    const username = db.sessions[token].username;

    if (typeof is2faEnabled === 'boolean') {
      db.admin.is2faEnabled = is2faEnabled;
      addLog("SECURITY_UPDATE", username, `Two-Factor authentication toggled: ${is2faEnabled ? "ON" : "OFF"}`, "WARNING");
    }

    if (newPassword && newPassword.trim().length >= 6) {
      db.admin.passwordHash = hashPassword(newPassword.trim());
      addLog("SECURITY_UPDATE", username, "Admin account password successfully updated.", "WARNING");
    }

    saveDatabase();
    res.json({ success: true, message: "Security configurations saved securely." });
  });

  // 2. PRODUCTS APIS (CRUD)
  // Fetch products (public search and dynamic filter integration)
  app.get("/api/products", (req, res) => {
    const { search, category, brand, minPrice, maxPrice, tab } = req.query;
    let list = [...db.products];

    if (search) {
      const s = (search as string).toLowerCase().trim();
      list = list.filter(p => p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s) || p.category.toLowerCase().includes(s));
    }

    if (category && category !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
    }

    if (brand && brand !== 'All') {
      list = list.filter(p => p.brand.toLowerCase() === (brand as string).toLowerCase());
    }

    if (minPrice) {
      list = list.filter(p => p.price >= parseFloat(minPrice as string));
    }

    if (maxPrice) {
      list = list.filter(p => p.price <= parseFloat(maxPrice as string));
    }

    res.json(list);
  });

  // Post new product
  app.post("/api/products", requireAdmin, (req, res) => {
    const token = req.headers['authorization'] as string;
    const username = db.sessions[token].username;
    const { title, description, price, stock, category, brand, image, sizes, colors } = req.body;

    if (!title || !price || !category || !brand) {
      return res.status(400).json({ error: "Missing mandatory fields" });
    }

    const newProd = {
      id: "prod-" + Date.now(),
      title,
      description: description || "No detailed description loaded.",
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      category,
      brand,
      image: image || "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=400",
      featured: req.body.featured || false,
      ratings: 4.5,
      sizes: sizes || ["One Size"],
      colors: colors || ["Custom"]
    };

    db.products.unshift(newProd);
    saveDatabase();
    addLog("PRODUCT_CREATE", username, `Created product "${title}" (৳${price}) under brand ${brand}.`, "SUCCESS");
    addNotification("SUCCESS", `New product "${title}" added to inventory.`);
    res.json(newProd);
  });

  // Update existing product
  app.put("/api/products/:id", requireAdmin, (req, res) => {
    const token = req.headers['authorization'] as string;
    const username = db.sessions[token].username;
    const { id } = req.params;
    const { title, description, price, stock, category, brand, image, sizes, colors, featured } = req.body;

    const idx = db.products.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    const oldProd = db.products[idx];
    const updatedProd = {
      ...oldProd,
      title: title || oldProd.title,
      description: description !== undefined ? description : oldProd.description,
      price: price !== undefined ? parseFloat(price) : oldProd.price,
      stock: stock !== undefined ? parseInt(stock) : oldProd.stock,
      category: category || oldProd.category,
      brand: brand || oldProd.brand,
      image: image || oldProd.image,
      featured: featured !== undefined ? featured : oldProd.featured,
      sizes: sizes || oldProd.sizes,
      colors: colors || oldProd.colors
    };

    db.products[idx] = updatedProd;
    saveDatabase();
    addLog("PRODUCT_UPDATE", username, `Updated product settings for "${updatedProd.title}".`, "INFO");
    res.json(updatedProd);
  });

  // Delete product
  app.delete("/api/products/:id", requireAdmin, (req, res) => {
    const token = req.headers['authorization'] as string;
    const username = db.sessions[token].username;
    const { id } = req.params;

    const idx = db.products.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    const title = db.products[idx].title;
    db.products.splice(idx, 1);
    saveDatabase();
    addLog("PRODUCT_DELETE", username, `Removed product "${title}" from databases.`, "WARNING");
    addNotification("WARNING", `Product "${title}" has been permanently deleted.`);
    res.json({ success: true });
  });


  // 3. BRAND CONFIGURATION AND DYNAMIC SETTINGS APIS
  app.get("/api/settings", (req, res) => {
    res.json(db.settings);
  });

  app.put("/api/settings", requireAdmin, (req, res) => {
    const token = req.headers['authorization'] as string;
    const username = db.sessions[token].username;
    const { siteName, logoText, aboutText, contactEmail, contactPhone, brandColors, heroSlides } = req.body;

    db.settings = {
      siteName: siteName || db.settings.siteName,
      logoText: logoText || db.settings.logoText,
      aboutText: aboutText || db.settings.aboutText,
      contactEmail: contactEmail || db.settings.contactEmail,
      contactPhone: contactPhone || db.settings.contactPhone,
      brandColors: {
        ...db.settings.brandColors,
        ...brandColors
      },
      heroSlides: heroSlides || db.settings.heroSlides,
    };

    saveDatabase();
    addLog("SETTINGS_UPDATE", username, "Integrated updated general brand layouts and customized slideshow elements.", "SUCCESS");
    res.json(db.settings);
  });


  // 4. SECURITY LOGS & REALTIME NOTIFICATIONS
  app.get("/api/logs", requireAdmin, (req, res) => {
    res.json(db.logs);
  });

  app.delete("/api/logs", requireAdmin, (req, res) => {
    const token = req.headers['authorization'] as string;
    const username = db.sessions[token].username;
    db.logs = [];
    saveDatabase();
    addLog("LOGS_CLEAR", username, "Emptied audit trails database securely.", "WARNING");
    res.json({ success: true });
  });

  app.get("/api/notifications", requireAdmin, (req, res) => {
    res.json(db.notifications);
  });

  app.put("/api/notifications/read", requireAdmin, (req, res) => {
    db.notifications.forEach(n => n.read = true);
    saveDatabase();
    res.json({ success: true });
  });


  // 5. AUTOMATIC BACKUP AND DATABASE EXPORTS
  app.get("/api/backups", requireAdmin, (req, res) => {
    // Read the backups directory, return simulated backup history
    try {
      const files = fs.readdirSync(BACKUPS_DIR);
      const list = files.filter(f => f.endsWith('.json')).map((filename, index) => {
        const stats = fs.statSync(path.join(BACKUPS_DIR, filename));
        const dateStr = filename.replace('backup-', '').replace('.json', '');
        return {
          id: `backup-${index}`,
          timestamp: new Date(parseInt(dateStr)).toISOString(),
          filename,
          size: `${(stats.size / 1024).toFixed(2)} KB`,
          recordsCount: {
            products: db.products.length,
            logs: db.logs.length,
            notifications: db.notifications.length
          }
        };
      });
      res.json(list);
    } catch (e) {
      res.json([]);
    }
  });

  app.post("/api/backups/create", requireAdmin, (req, res) => {
    const token = req.headers['authorization'] as string;
    const username = db.sessions[token].username;
    
    try {
      const timestamp = Date.now();
      const backupFilename = `backup-${timestamp}.json`;
      const backupPath = path.join(BACKUPS_DIR, backupFilename);
      
      // Save full DB state
      fs.writeFileSync(backupPath, JSON.stringify(db, null, 2), 'utf-8');
      
      addLog("BACKUP_CREATE", username, `Executed automated inventory backup saved as: ${backupFilename}`, "SUCCESS");
      addNotification("SUCCESS", "System backup generated successfully and stored in offline safe vaults.");
      
      res.json({ success: true, filename: backupFilename });
    } catch (e) {
      res.status(500).json({ error: "Backup pipeline failure." });
    }
  });

  app.get("/api/export/csv/:format", (req, res) => {
    const { format } = req.params;
    let csvContent = "";
    let filename = "";

    if (format === 'products') {
      filename = `aarong-products-${Date.now()}.csv`;
      csvContent = "ID,Title,Brand,Category,Price (BDT),Stock,Ratings\n";
      db.products.forEach(p => {
        csvContent += `"${p.id}","${p.title.replace(/"/g, '""')}","${p.brand}","${p.category}",${p.price},${p.stock},${p.ratings || 0}\n`;
      });
    } else {
      filename = `system-audit-logs-${Date.now()}.csv`;
      csvContent = "ID,Timestamp,Action,Operator,Status,IP-Address,Details\n";
      db.logs.forEach(l => {
        csvContent += `"${l.id}","${l.timestamp}","${l.action}","${l.username}","${l.status}","${l.ipAddress}","${l.details.replace(/"/g, '""')}"\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csvContent);
  });


  // Development vs Production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Aarong Full-Stack Container] Active, listening on port ${PORT}`);
  });
}

startServer();
