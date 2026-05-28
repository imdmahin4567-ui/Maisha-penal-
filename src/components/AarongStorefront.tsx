/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, ShoppingBag, ChevronRight, ChevronLeft, 
  Filter, X, Sparkles, Check, ArrowRight, Star, AlertTriangle, ShieldCheck,
  MapPin, Phone, Mail, Clock, HelpCircle, ShieldAlert, Award, FileText, Send,
  Scissors, Hammer, Truck, CheckCircle2, ShoppingCart, Info, Lock, Heart, Ruler
} from 'lucide-react';
import { Product, AppSettings } from '../types';

interface OrderRecord {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  items: {
    title: string;
    qty: number;
    price: number;
    customization: {
      height: string;
      pleats: string;
      sleeves: string;
      hijab: string;
      notes: string;
    };
  }[];
  shipping: number;
  discount: number;
  total: number;
  status: string;
  orderDate: string;
}

interface StorefrontProps {
  products: Product[];
  settings: AppSettings;
  onOpenAdmin: () => void;
  cart: { product: Product; quantity: number }[];
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onUpdateCartQty: (productId: string, qty: number) => void;
}

export default function AarongStorefront({
  products,
  settings,
  onOpenAdmin,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onUpdateCartQty
}: StorefrontProps) {
  // Page Navigation Routing State (Home by default)
  const [activePage, setActivePage] = useState<'home' | 'shop' | 'details' | 'cart' | 'checkout' | 'tracking' | 'about' | 'contact' | 'privacy' | 'return'>('home');

  // Filter & catalog state
  const [selectedBrand, setSelectedBrand] = useState<'All' | 'Dubai Elegance' | 'Borkha House Signature' | 'Anatolia Modest' | 'Habiba Hijabs'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<number>(25000);
  
  // Slide carousel index
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Single product detail page pointer
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  
  // Product custom tailor configurations
  const [customHeight, setCustomHeight] = useState<string>('54'); // 50, 52, 54, 56, 58, 60
  const [customPleats, setCustomPleats] = useState<string>('কুচি সহ সিগনেচার (Pleated Gher)');
  const [customSleeves, setCustomSleeves] = useState<string>('Cozy ইলাস্টিক হাতা (Elastic Wudu-friendly)');
  const [customHijab, setCustomHijab] = useState<string>('None'); // None, +350, +450
  const [customNotes, setCustomNotes] = useState<string>('');

  // Local state directory of product customizations
  const [cartCustomizations, setCartCustomizations] = useState<Record<string, {
    height: string;
    pleats: string;
    sleeves: string;
    hijab: string;
    notes: string;
  }>>({});

  // Order history array stored locally inside client memory for persistent tracking
  const [localOrders, setLocalOrders] = useState<OrderRecord[]>(() => {
    const saved = localStorage.getItem('borkha_orders_db');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    // Seed initial demo orders so lookup is immediately interactive and rewarding for the user
    const demoOrders = [
      {
        id: 'BH-1001',
        email: 'imdmahin4567@gmail.com',
        name: 'Mahin Chowdhury',
        phone: '01712345678',
        address: 'House 45, Road 11, Banani',
        city: 'Dhaka local',
        items: [
          {
            title: 'Dubai Premium Jet-Black Classic Abaya',
            qty: 1,
            price: 6800,
            customization: {
              height: '56',
              pleats: 'কুচি সহ সিগনেচার (Pleated Gher)',
              sleeves: 'Cozy ইলাস্টিক হাতা (Elastic Wudu-friendly)',
              hijab: 'ম্যাচিং ডাবল পার্ট খিমার (+৳৪৫০)',
              notes: 'বুকের সাইজ ৪২ ইঞ্চি স্লিম সেলাই চাই।'
            }
          }
        ],
        shipping: 80,
        discount: 680,
        total: 6650,
        status: 'Tailoring & Custom Stitching (শালীন মাপ অনুযায়ী দর্জিঘরে তৈরি হচ্ছে)',
        orderDate: '২৮/০৫/২০২৬'
      },
      {
        id: 'BH-1002',
        email: 'customer@gmail.com',
        name: 'Anika Rahman',
        phone: '01888777666',
        address: 'Zindabazar, Nabiganj Road',
        city: 'Out of District Courier',
        items: [
          {
            title: 'Anatolia Royal Georgette Khimar Set',
            qty: 1,
            price: 4500,
            customization: {
              height: '54',
              pleats: 'বুটন-আপ বেল্ট স্টাইল (Slim Fit Belted)',
              sleeves: 'Dubai Tulip বেল হাতা (Elegant Bell Sleeves)',
              hijab: 'None',
              notes: 'কোন বাড়তি ঢোলা রাখবেন না দয়া করে।'
            }
          }
        ],
        shipping: 150,
        discount: 0,
        total: 4650,
        status: 'Quality Check & Ironing (মান নিয়ন্ত্রণ ও প্রিমিয়াম প্যাকিং কাজ চলছে)',
        orderDate: '২৭/০৫/২০২৬'
      }
    ];
    localStorage.setItem('borkha_orders_db', JSON.stringify(demoOrders));
    return demoOrders;
  });

  // Tracking query & search output
  const [trackQueryId, setTrackQueryId] = useState<string>('');
  const [searchedTrackedOrder, setSearchedTrackedOrder] = useState<OrderRecord | null>(null);
  const [hasSearchedTracking, setHasSearchedTracking] = useState<boolean>(false);

  // Checkout inputs
  const [checkoutName, setCheckoutName] = useState<string>('');
  const [checkoutPhone, setCheckoutPhone] = useState<string>('');
  const [checkoutCity, setCheckoutCity] = useState<string>('Dhaka local');
  const [checkoutAddress, setCheckoutAddress] = useState<string>('');
  const [checkoutCoupon, setCheckoutCoupon] = useState<string>('');
  const [couponFeedback, setCouponFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const [couponDiscountPercent, setCouponDiscountPercent] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'cod' | 'bkash'>('cod');
  const [bkashNumber, setBkashNumber] = useState<string>('');
  const [bkashTxnid, setBkashTxnid] = useState<string>('');
  const [checkoutSuccessMsg, setCheckoutSuccessMsg] = useState<{ orderId: string; total: number } | null>(null);

  // Customer contact feedback form inputs
  const [contactName, setContactName] = useState('');
  const [contactEmailMsg, setContactEmailMsg] = useState('');
  const [contactSubject, setContactSubject] = useState('Product Customization Help');
  const [contactBody, setContactBody] = useState('');
  const [contactSentSuccess, setContactSentSuccess] = useState(false);
  
  // Cart panel state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Auto scroll slider
  useEffect(() => {
    if (!settings.heroSlides || settings.heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % settings.heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [settings.heroSlides]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % settings.heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + settings.heroSlides.length) % settings.heroSlides.length);
  };

  // Safe category list extraction from current dynamic products
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Filtering criteria applied dynamically
  const filteredProducts = products.filter(p => {
    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesPrice = p.price <= priceRange;
    const matchesQuery = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesCategory && matchesPrice && matchesQuery;
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Customer Authentication state
  const [customerEmail, setCustomerEmail] = useState<string | null>(() => {
    return localStorage.getItem('borkha_customer_email');
  });
  const [showCustomerLoginModal, setShowCustomerLoginModal] = useState(false);
  const [tempCustomerEmail, setTempCustomerEmail] = useState('');
  const [customerLoginError, setCustomerLoginError] = useState('');

  const handleCustomerLogout = () => {
    localStorage.removeItem('borkha_customer_email');
    setCustomerEmail(null);
  };

  const handleCustomerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempCustomerEmail || !tempCustomerEmail.includes('@')) {
      setCustomerLoginError('দয়া করে একটি সঠিক জিমেইল/ইমেইল এড্রেস লিখুন।');
      return;
    }
    localStorage.setItem('borkha_customer_email', tempCustomerEmail);
    setCustomerEmail(tempCustomerEmail);
    setShowCustomerLoginModal(false);
    setCustomerLoginError('');
    setTempCustomerEmail('');
    
    // Redirect to Checkout page directly for a superior user flow
    setActivePage('checkout');
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (!customerEmail) {
      setShowCustomerLoginModal(true);
      return;
    }
    setActivePage('checkout');
  };

  // 1. HOME PAGE RENDER ENGINE
  const renderHomePage = () => {
    const featuredList = products.filter(p => p.featured).slice(0, 3);
    const displayFeatured = featuredList.length > 0 ? featuredList : products.slice(0, 3);

    return (
      <div className="space-y-12 animate-fade-in pb-16">
        {/* HERO CAROUSEL BLOCK */}
        {settings.heroSlides && settings.heroSlides.length > 0 && (
          <div className="relative w-full h-[320px] md:h-[500px] bg-stone-100 overflow-hidden shadow-xs">
            <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
              <img 
                src={settings.heroSlides[currentSlide]?.image} 
                alt={settings.heroSlides[currentSlide]?.title} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent flex items-center px-6 md:px-16 text-white">
                <div className="max-w-xl space-y-3 md:space-y-4">
                  <span className="text-xs md:text-sm font-semibold tracking-widest text-amber-400 font-mono block uppercase">
                    {settings.heroSlides[currentSlide]?.brand || 'Dubai Elegance'} Autumn Collection
                  </span>
                  <h1 className="text-3xl md:text-5xl font-serif font-extrabold leading-tight text-stone-50 drop-shadow-md">
                    {settings.heroSlides[currentSlide]?.title}
                  </h1>
                  <p className="text-xs md:text-sm text-stone-200 font-light leading-relaxed max-w-md line-clamp-3">
                    {settings.heroSlides[currentSlide]?.subtitle}
                  </p>
                  <div className="pt-2">
                    <button 
                      onClick={() => {
                        setSelectedCategory('All');
                        setSelectedBrand((settings.heroSlides[currentSlide]?.brand as any) || 'All');
                        setActivePage('shop');
                      }}
                      className="bg-amber-400 hover:bg-[#8A1C14] text-neutral-900 hover:text-white px-5 py-3 text-xs font-bold tracking-widest uppercase rounded-xs transition-all cursor-pointer flex items-center gap-2 shadow-md"
                    >
                      কালেকশন অন্বেষণ করুন (Explore Collection)
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Slider Controls */}
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-neutral-900 text-white p-2 rounded-full backdrop-blur-xs transition-all cursor-pointer shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-neutral-900 text-white p-2 rounded-full backdrop-blur-xs transition-all cursor-pointer shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* CORE PROMOTIONAL FEATURES */}
        <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-md border border-stone-200 shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-red-900/5 text-[#8A1C14] rounded-full">
              <Scissors className="w-6 h-6 text-[#8A1C14]" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-neutral-900 text-sm">১০০% ফ্রি কাস্টমাইজেশন</h4>
              <p className="text-xs text-stone-500 mt-1">আপনার শরীরের নিখুঁত মাপ অনুযায়ী বোরখা লম্বা ঝুল ও হাতা প্রস্তুত করে দেওয়া হয় সম্পূর্ণ ফ্রিতে।</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-md border border-stone-200 shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-red-900/5 text-[#8A1C14] rounded-full">
              <Truck className="w-6 h-6 text-[#8A1C14]" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-neutral-900 text-sm">ক্যাশ অন ডেলিভারি (COD)</h4>
              <p className="text-xs text-stone-500 mt-1">পুরো বাংলাদেশে বিশ্বস্ততার সাথে কুরিয়ারে প্রোডাক্ট হাতে পেয়ে দেখে মূল্য পরিশোধের সুবিধা।</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-md border border-stone-200 shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-red-900/5 text-[#8A1C14] rounded-full">
              <Award className="w-6 h-6 text-[#8A1C14]" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-neutral-900 text-sm">৭ দিনের রিটার্ন নিশ্চয়তা</h4>
              <p className="text-xs text-stone-500 mt-1">সাইজ বা ফিটিংসে কোনো সমস্যা থাকলে ৭ দিনের মধ্যে সহজ পরিবর্তন ও রিটার্ন সুবিধা।</p>
            </div>
          </div>
        </section>

        {/* HOT PRODUCT CATEGORIES */}
        <section className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold tracking-widest text-[#8A1C14] uppercase font-mono block">Featured Collections</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-neutral-900">গরম ক্যাটাগরি কালেকশন (Hot Categories)</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'Abayas & Borkhas', title: 'দুবাই আবায়া ও বোরখা', desc: 'Elegant Dubai Nida & Georgette', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=400' },
              { id: 'Khimar Sets', title: 'প্রিমিয়াম খিমার কালেকশন', desc: 'Cozy Dual Layer Georgette', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400' },
              { id: 'Premium Hijabs', title: 'আভিজাত্য হিজাব সম্ভার', desc: 'Soft Breathable Cotton Chiffon', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=400' },
              { id: 'Accessories', title: 'হিজাব পিন ও জুয়েলারী', desc: '24K Gold Plated anti-snag pins', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=400' }
            ].map((cat) => (
              <div 
                key={cat.id} 
                onClick={() => {
                  setSelectedCategory(cat.id === 'Abayas & Borkhas' ? 'Abaya' : cat.id === 'Khimar Sets' ? 'Khimar' : cat.id === 'Premium Hijabs' ? 'Hijab' : 'Accessories');
                  setActivePage('shop');
                }}
                className="group relative h-48 rounded-md overflow-hidden border border-stone-200/60 shadow-xs cursor-pointer select-none"
              >
                <img src={cat.image} alt={cat.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent flex flex-col justify-end p-4 text-white">
                  <h4 className="font-serif font-bold text-sm sm:text-base leading-tight group-hover:text-amber-300 transition-colors">{cat.title}</h4>
                  <span className="text-[10px] text-stone-300 font-light mt-0.5 line-clamp-1">{cat.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HERO PROMOTIONAL BANNER */}
        <section className="bg-neutral-900 text-white relative py-12 px-6 md:px-16 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-[#8A1C14]/15 rounded-l-full blur-2xl pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
            <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-1 animate-pulse" />
            <h3 className="text-xl md:text-3xl font-serif font-bold">লঞ্চিং অফার: কুপন কোড <span className="text-amber-300 font-mono tracking-wider">BORKHA10</span> ব্যবহার করে ১০% ক্যাশব্যাক পান!</h3>
            <p className="text-xs md:text-sm text-stone-300 max-w-2xl mx-auto font-light leading-relaxed">
              আপনার প্রথম অর্ডারে কুপন বক্সে <span className="font-bold text-amber-400 font-mono">'BORKHA10'</span> অথবা <span className="font-bold text-amber-400 font-mono">'EIDMUBARAK'</span> কোডটি টাইপ করুন এবং পান আকর্ষনীয় নিশ্চিত মূল্যছাড় সুবিধা।
            </p>
            <div className="pt-2">
              <button 
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedBrand('All');
                  setActivePage('shop');
                }}
                className="bg-white hover:bg-amber-400 text-neutral-900 border border-transparent font-bold text-xs px-6 py-3 uppercase tracking-wider rounded-xs transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                পছন্দের বোরখা বা আবায়া কিনুন
                <ShoppingCart className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* WEEKLY SELECTIONS (FEATURED SEWING) */}
        <section className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="flex justify-between items-end border-b border-stone-200 pb-3">
            <div>
              <span className="text-xs font-bold text-[#8A1C14] uppercase tracking-wider block">Seasonal Hotpicks</span>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-neutral-900">সাপ্তাহিক স্পেশাল পছন্দসমূহ (Weekly Picks)</h3>
            </div>
            <button 
              onClick={() => {
                setSelectedCategory('All');
                setSelectedBrand('All');
                setActivePage('shop');
              }}
              className="text-xs text-[#8A1C14] hover:underline font-bold flex items-center gap-1"
            >
              সবগুলো দেখুন (View All)
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {displayFeatured.map(prod => (
              <div 
                key={prod.id} 
                className="bg-white border border-stone-200 rounded-md overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-4/5 w-full bg-stone-50">
                  <img src={prod.image} alt={prod.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <span className="absolute top-2.5 left-2.5 bg-neutral-900 text-white text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-xs">
                    {prod.brand}
                  </span>
                  {prod.ratings && (
                    <span className="absolute bottom-2.5 right-2.5 bg-white/90 text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded-xs flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      {prod.ratings.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-400 font-mono tracking-wider block">{prod.category}</span>
                    <h4 className="font-serif font-bold text-sm text-neutral-900 line-clamp-1">{prod.title}</h4>
                    <p className="text-xs text-stone-500 line-clamp-2 min-h-[32px]">{prod.description}</p>
                  </div>
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-rose-900">৳{prod.price.toLocaleString('en-IN')}</span>
                    <button 
                      onClick={() => {
                        setSelectedDetailProduct(prod);
                        setActivePage('details');
                      }}
                      className="bg-[#8A1C14] hover:bg-neutral-900 text-white text-[10.5px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xs transition-colors"
                    >
                      কাস্টমাইজ ও অর্ডার
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BRIGHT NEWSLETTER SECTION */}
        <section className="bg-stone-50 border-t border-stone-200 py-12 text-center max-w-4xl mx-auto rounded-md p-8 shadow-3xs">
          <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-3 animate-pulse" />
          <h2 className="text-xl md:text-2xl font-serif font-bold text-neutral-900">বোরখা হাউজ ক্লাব-এ সাবস্ক্রাইব করুন</h2>
          <p className="text-xs text-stone-500 max-w-md mx-auto mt-2 leading-relaxed">
            শালীন ফ্যাশন ট্রেন্ড, নতুন আবায়ার ডিজাইন আগমনী বার্তা এবং মেম্বার-অনলি রিডেম্পশন অফার পেতে আপনার জিমেইল সাবস্ক্রাইব করুন।
          </p>
          <div className="mt-5 max-w-md mx-auto flex gap-2">
            <input 
              type="email" 
              placeholder="আপনার ইমেইল অ্যাড্রেস..." 
              className="flex-1 bg-white border border-stone-200 rounded-xs text-xs px-3.5 py-2.5 text-stone-700 outline-none focus:border-[#8A1C14]" 
            />
            <button 
              onClick={() => alert("অসংখ্য ধন্যবাদ! বোরখা হাউজ নিউজলেটারে আপনার নাম নথিভুক্ত হয়েছে।")} 
              className="bg-neutral-900 hover:bg-[#8A1C14] text-white text-xs font-bold px-4 py-2.5 rounded-xs transition-colors uppercase tracking-widest cursor-pointer"
            >
              যুক্ত হোন
            </button>
          </div>
        </section>
      </div>
    );
  };

  // 2. SHOP CATALOG PAGE RENDER ENGINE
  const renderShopPage = () => {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in">
        
        {/* SIDE BAR FILTER PANELS */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-md p-5 shadow-xs border border-stone-200 space-y-6 sticky top-24">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-sm text-neutral-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#8A1C14]" /> ফিল্টার করুন (Filter)
              </h3>
              {(selectedCategory !== 'All' || selectedBrand !== 'All' || searchQuery !== '' || priceRange !== 25000) && (
                <button 
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedBrand('All');
                    setSearchQuery('');
                    setPriceRange(25000);
                  }}
                  className="text-[10px] text-[#8A1C14] hover:underline font-bold"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Main Category */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">ক্যাটাগরি বা সম্ভার</label>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-1.5 rounded-sm text-xs transition-all flex justify-between items-center ${selectedCategory === cat ? 'bg-[#FAF8F5] text-[#8A1C14] font-bold border-l-2 border-[#8A1C14]' : 'text-neutral-600 hover:bg-[#FAF8F5] hover:text-neutral-950'}`}
                  >
                    <span>{cat}</span>
                    <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.2 rounded-full font-mono">
                      {cat === 'All' ? products.length : products.filter(p => p.category === cat).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Collection categories selection */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">কালেকশন লেবেল</label>
              <div className="grid grid-cols-1 gap-1.5">
                {['All', 'Dubai Elegance', 'Borkha House Signature', 'Anatolia Modest', 'Habiba Hijabs'].map(br => (
                  <button
                    key={br}
                    onClick={() => setSelectedBrand(br as any)}
                    className={`px-3 py-2 rounded-xs text-[11px] border text-left font-medium transition-all ${selectedBrand === br ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-transparent text-neutral-600 border-stone-250 hover:border-neutral-400'}`}
                  >
                    {br === 'All' ? 'All Collections' : br}
                  </button>
                ))}
              </div>
            </div>

            {/* Price slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">সর্বোচ্চ বাজেট (BDT)</label>
                <span className="text-xs font-bold text-neutral-900">৳{priceRange.toLocaleString('en-IN')}</span>
              </div>
              <input 
                type="range"
                min="300"
                max="25000"
                step="200"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#8A1C14]"
              />
              <div className="flex justify-between text-[9px] text-neutral-400 font-mono">
                <span>৳৩০০</span>
                <span>৳২৫,০০০</span>
              </div>
            </div>

            <div className="bg-[#FAF8F5] rounded-xs p-3 border border-stone-150">
              <span className="text-[11px] font-medium text-stone-500 block leading-tight">
                মোট <span className="font-bold text-stone-900">{filteredProducts.length}</span> টি পোশাক পাওয়া গিয়েছে।
              </span>
            </div>
          </div>
        </div>

        {/* PRODUCTS CATALOG LIST GRID */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center border-b border-stone-200 pb-3">
            <h2 className="text-xl md:text-2xl font-serif text-neutral-900 font-bold tracking-tight">
              {selectedCategory === 'All' ? 'আমাদের সম্পূর্ণ ক্যাটালগ' : selectedCategory}
              {selectedBrand !== 'All' && <span className="text-stone-400"> • {selectedBrand}</span>}
            </h2>
            <span className="text-xs text-neutral-400 font-mono">
              মিলিত আইটেম: {filteredProducts.length} টি
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-md border border-stone-200 p-8">
              <AlertTriangle className="w-12 h-12 text-[#8A1C14]/30 mx-auto mb-4" />
              <h3 className="text-base font-bold text-neutral-800 mb-1">কোন বোরখা বা আবায়া আপনার ফিল্টারে মেলেনি</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
                অনুগ্রহ করে আপনার নির্ধারিত বাজেট বাড়ান অথবা অন্য কোনো ক্যাটাগরি সার্চ করে চেষ্টা করুন।
              </p>
              <button 
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedBrand('All');
                  setSearchQuery('');
                  setPriceRange(25000);
                }}
                className="bg-neutral-900 hover:bg-[#8A1C14] text-white text-xs px-4 py-2 font-bold tracking-wider uppercase rounded-xs transition-colors"
              >
                সব ফিল্টার মুছে ফেলুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(prod => (
                <div 
                  key={prod.id}
                  className="bg-white rounded-md overflow-hidden hover:shadow-md border border-stone-200 hover:border-stone-300 transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-4/5 w-full bg-stone-50 overflow-hidden">
                    <img 
                      src={prod.image} 
                      alt={prod.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-neutral-900 text-white text-[9px] font-bold tracking-widest px-2 py-0.5 uppercase rounded-xs">
                      {prod.brand}
                    </span>
                    {prod.stock <= 5 && prod.stock > 0 && (
                      <span className="absolute top-2.5 right-2.5 bg-amber-500 text-stone-910 font-bold text-[9px] px-1.5 py-0.5 uppercase rounded-xs">
                        মাত্র {prod.stock} টি বাঁকি!
                      </span>
                    )}
                    {prod.stock === 0 && (
                      <span className="absolute inset-0 bg-neutral-950/75 flex items-center justify-center text-white font-serif font-bold text-xs uppercase tracking-widest">
                        স্টক শেষ / Sold Out
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-stone-400 font-mono tracking-widest block">{prod.category}</span>
                      <h4 className="font-serif font-bold text-sm text-neutral-900 line-clamp-1 hover:text-[#8A1C14] transition-colors">
                        {prod.title}
                      </h4>
                      <p className="text-xs text-stone-500 line-clamp-2 min-h-[32px] font-light leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      <span className="font-serif font-bold text-base text-stone-900">
                        ৳{prod.price.toLocaleString('en-IN')}
                      </span>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => {
                            setSelectedDetailProduct(prod);
                            setActivePage('details');
                          }}
                          className="bg-stone-100 hover:bg-neutral-800 hover:text-white text-stone-800 text-[10px] font-bold px-3 py-1.5 rounded-xs border border-stone-250 transition-colors"
                        >
                          মাপ লিখুন (Tailor)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 3. PRODUCT DETAILS VIEW WITH ADVANCED TAILORING INPUTS
  const renderProductDetailsPage = () => {
    // Fallback if no specific product pointer exists
    const finalProd = selectedDetailProduct || products[0];
    if (!finalProd) {
      return (
        <div className="text-center py-24 bg-white/50 max-w-2xl mx-auto rounded-md border border-stone-200">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="font-serif font-bold text-sm">কোন প্রোডাক্ট নির্বাচিত করা হয়নি।</h3>
          <p className="text-xs text-stone-400 mt-1 mb-4">দয়া করে আমাদের সমৃদ্ধ শপ ক্যাটাগরি থেকে পোশাক নির্বাচন করুন।</p>
          <button onClick={() => setActivePage('shop')} className="bg-neutral-900 text-white text-xs px-4 py-2 font-bold uppercase tracking-widest rounded-xs">শপ-এ যান</button>
        </div>
      );
    }

    // Dynamic cost calculator based on hijab additions
    let priceBonus = 0;
    if (customHijab === 'দুই স্তরের শিফন ম্যাচিং হিজাব (+৳৩৫০)') priceBonus = 350;
    else if (customHijab === 'প্রিমিয়াম ওড়না খিমার বেল সেট (+৳৪৫০)') priceBonus = 450;
    const finalPrice = finalProd.price + priceBonus;

    return (
      <div className="max-w-5xl mx-auto px-4 py-10 animate-fade-in">
        <button 
          onClick={() => setActivePage('shop')} 
          className="text-xs text-stone-500 hover:text-[#8A1C14] font-bold flex items-center gap-1.5 mb-6 hover:underline"
        >
          <ChevronLeft className="w-4 h-4" /> শপে ফিরে যান (Back to Shop)
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-6 sm:p-10 rounded-md border border-stone-200 shadow-sm">
          {/* LEFT PICTURE ASPECT GALLERY */}
          <div className="space-y-4">
            <div className="relative aspect-4/5 w-full bg-stone-50 rounded-xs overflow-hidden border border-stone-200">
              <img src={finalProd.image} alt={finalProd.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <span className="absolute top-3 left-3 bg-neutral-900 border border-neutral-700 text-white text-[10px] font-bold tracking-widest px-3 py-1 uppercase rounded-xs">
                {finalProd.brand}
              </span>
            </div>

            <div className="bg-amber-50 rounded-xs p-4 border border-amber-200 text-amber-900 text-xs text-left leading-relaxed space-y-1">
              <div className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-amber-700" /> ১-সেকেন্ডে কাস্টম সেলাই পলিসি:
              </div>
              <p className="text-[11px] text-amber-800">
                আমাদের প্রতিটি ওড়না বোরখা বা আবায়া আপনার দেওয়া ঝুল এবং নির্দেশিত হাতার আকার অনুযায়ী দক্ষ দর্জিদের কাস্টম হাতের স্পর্শে নিখুঁত সেলাই দিয়ে প্রস্তুত করি। কোন ঝামেলা ছাড়াই বাড়িতে বসেই পান পছন্দসই শালীন পোশাক।
              </p>
            </div>
          </div>

          {/* RIGHT DETAILED CUSTOMIZATION ENGINE */}
          <div className="space-y-6 text-left">
            <div>
              <span className="text-[10px] text-stone-400 font-mono tracking-widest block uppercase mb-1">{finalProd.category} সম্ভার</span>
              <h2 className="text-2xl font-serif font-bold text-neutral-900 leading-tight">{finalProd.title}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs bg-red-900/10 text-[#8A1C14] font-bold px-2.5 py-1 rounded-sm">
                  {finalProd.brand}
                </span>
                {finalProd.ratings && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span className="text-xs font-bold text-neutral-700 font-mono">{finalProd.ratings.toFixed(1)} স্টার রেটিং</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed border-t border-b border-stone-100 py-3">
              {finalProd.description}
            </p>

            {/* TAILORING PARAMETER OPTIONS */}
            <div className="space-y-5 bg-stone-50 p-4 border border-stone-200 rounded-sm">
              <h4 className="font-bold font-serif text-sm text-[#8A1C14] flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-emerald-600" /> পোশাকের মেজারমেন্ট নিন (Tailoring Measurements)
              </h4>

              {/* HEIGHT / LENGTH (ঝুল) */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-stone-700">১. বোরখার লম্বা ঝুল (Height / Length in Inches):</span>
                  <span className="font-bold text-amber-700 font-mono">{customHeight} ইঞ্চি</span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {['50', '52', '54', '56', '58', '60'].map(len => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setCustomHeight(len)}
                      className={`py-2 text-xs font-bold border transition-all rounded-xs font-mono select-none cursor-pointer ${customHeight === len ? 'bg-[#8A1C14] text-white border-[#8A1C14] ring-1 ring-[#8A1C14]' : 'bg-white text-stone-800 border-stone-250 hover:border-neutral-800'}`}
                    >
                      {len}"
                    </button>
                  ))}
                </div>
              </div>

              {/* PLEATS STYLE (কুচি) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 block">২. কুচি ও বডি ফিটিং স্টাইল ( बॉडी फिटिंग्स ):</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'কুচি সহ সিগনেচার (Pleated Gher)',
                    'ছাতা ঘের কুচি ছাড়া সিম্পল (Simple Standard A-Line)',
                    'বুটন-আপ বেল্ট স্টাইল (Slim Fit Belted)'
                  ].map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setCustomPleats(style)}
                      className={`px-3 py-2 text-left text-xs font-medium border rounded-xs select-none cursor-pointer overflow-hidden transition-all ${customPleats === style ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-stone-700 border-stone-200 hover:border-neutral-800'}`}
                    >
                      <span className="font-bold">{style}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SLEEVES STYLE (হাতা) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 block">৩. হাতা ডিজাইন ক্লিয়ারেন্স (Sleeves Style):</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Cozy ইলাস্টিক হাতা (Elastic Wudu-friendly)',
                    'Dubai Tulip বেল হাতা (Elegant Bell Sleeves)',
                    'রিং প্লেইন বোতাম Cuff (Ring Cuff Sleeves)'
                  ].map(sleeve => (
                    <button
                      key={sleeve}
                      type="button"
                      onClick={() => setCustomSleeves(sleeve)}
                      className={`px-3 py-2 text-left text-[11px] font-medium border rounded-xs select-none cursor-pointer leading-tight transition-all ${customSleeves === sleeve ? 'bg-neutral-900 text-white border-neutral-900 col-span-2 sm:col-span-1' : 'bg-white text-stone-700 border-stone-200 hover:border-neutral-850'}`}
                    >
                      <span>{sleeve}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* MATCHING HIJAB PACKAGE ADDON */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 block">৪. ম্যাচিং হিজাব প্যাকেজ যুক্ত করুন (Add Matching Hijab?):</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { val: 'None', label: 'মহিলা হিজাব লাগবে না (-৳০)' },
                    { val: 'দুই স্তরের শিফন ম্যাচিং হিজাব (+৳৩৫০)', label: 'ম্যাচিং ডাবল পার্ট শিফন হিজাব সেট (+৳৩৫০)' },
                    { val: 'প্রিমিয়াম ওড়না খিমার বেল সেট (+৳৪৫০)', label: 'ম্যাচিং ডাবল পার্ট খিমার ও নিকাব সেট (+৳৪৫০)' }
                  ].map(hOption => (
                    <button
                      key={hOption.val}
                      type="button"
                      onClick={() => setCustomHijab(hOption.val)}
                      className={`px-3 py-2 text-left text-xs font-medium border rounded-xs select-none cursor-pointer transition-all ${customHijab === hOption.val ? 'bg-stone-900 text-amber-200 border-neutral-900 font-bold' : 'bg-white text-stone-700 border-stone-200 hover:border-neutral-400'}`}
                    >
                      <span>{hOption.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SPECIAL WAIST/BUST CUSTOM NOTES */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">৫. বিশেষ নির্দেশনাবলী বা মাপ (Special Tailor Instructions):</label>
                <textarea
                  placeholder="যেমন: বুকের মাপ ৪২ ইঞ্চি, হাতার ঝুল ২৫ ইঞ্চি দিন অথবা চওড়া কুচি বেল্ট দিন।"
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xs text-xs px-3 py-2 font-mono text-stone-700 outline-none focus:border-[#8A1C14]"
                />
              </div>
            </div>

            {/* TOTAL COST & DIRECT ADD TO BAG */}
            <div className="pt-4 border-t border-stone-150 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] text-stone-400 block font-light uppercase">মোট মূল্য (Total Calculated Cost)</span>
                <span className="font-serif text-2xl font-extrabold text-[#8A1C14]">
                  ৳{finalPrice.toLocaleString('en-IN')}
                </span>
              </div>

              {finalProd.stock > 0 ? (
                <button 
                  onClick={() => {
                    // Inject this customized block in cartCustomizations local state referencing product ID
                    setCartCustomizations(prev => ({
                      ...prev,
                      [finalProd.id]: {
                        height: customHeight,
                        pleats: customPleats,
                        sleeves: customSleeves,
                        hijab: customHijab,
                        notes: customNotes
                      }
                    }));

                    // Add to cart props
                    onAddToCart(finalProd);
                    
                    // Show confirmation notification layout
                    alert(`${finalProd.title} সফলভাবে আপনার নির্ধারিত মাপে কাস্টমাইজেশন সহ ব্যাগে যুক্ত করা হয়েছে!`);
                    setIsCartOpen(true);
                  }}
                  className="bg-[#8A1C14] hover:bg-neutral-950 text-white font-bold px-6 py-3.5 text-xs tracking-widest uppercase rounded-xs transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-300" />
                  কাস্টম ব্যাগে যুক্ত করুন
                </button>
              ) : (
                <span className="text-red-500 font-serif font-bold text-xs uppercase tracking-wider bg-red-50 border border-red-100 px-4 py-2 rounded-xs">
                  স্টক শেষ (Out of Stock)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 4. CART RECONCILIATION PAGE
  const renderCartPage = () => {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in space-y-8">
        <div className="border-b border-stone-200 pb-3 text-left">
          <h2 className="text-xl md:text-2xl font-serif font-extrabold text-neutral-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#8A1C14]" /> শপিং ব্যাগ ক্যাশ কাউন্টার (Cart Table)
          </h2>
          <p className="text-xs text-stone-400 mt-1">আপনার ব্যাগভুক্ত ড্রেসগুলোর কাস্টম মেজারমেন্ট নিখুঁতভাবে চেক করে নিন।</p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white border border-stone-200 p-8 rounded-md">
            <ShoppingBag className="w-12 h-12 text-[#8A1C14]/15 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-stone-800">আপনার শপিং ব্যাগটি একদম খালি!</h3>
            <p className="text-xs text-stone-400 mt-1 mb-4">শপে গিয়ে বিভিন্ন রাজকীয় আবায়া কিংবা প্রিমিয়াম খিমার নির্বাচন করুন।</p>
            <button onClick={() => setActivePage('shop')} className="bg-neutral-900 hover:bg-[#8A1C14] text-white text-xs px-5 py-2.5 font-bold uppercase rounded-xs transition-colors">শপ ক্যাটাগরিতে যান</button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-md overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 text-neutral-500 border-b border-stone-200 font-bold">
                    <th className="p-4">বোরখা ও কাস্টম বিবরণ (Details)</th>
                    <th className="p-4 text-center">পরিমাণ (Qty)</th>
                    <th className="p-4 text-right">একক মূল্য (Price)</th>
                    <th className="p-4 text-right">সর্বমোট (Subtotal)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150">
                  {cart.map(item => {
                    // Extract customized state params
                    const custom = cartCustomizations[item.product.id] || {
                      height: '54',
                      pleats: 'সিগনেচার কুচি ঘের (Pleated Signature Gher)',
                      sleeves: 'Cozy ইলাস্টিক হাতা (Comfort Elastic - Wudu friendly)',
                      hijab: 'None',
                      notes: 'Default measures'
                    };

                    const hijabPrice = custom.hijab === 'None' ? 0 : custom.hijab.includes('৩৫০') ? 350 : 450;
                    const singlePrice = item.product.price + hijabPrice;

                    return (
                      <tr key={item.product.id} className="hover:bg-stone-50/50 transition-all">
                        <td className="p-4 space-y-2">
                          <div className="flex gap-4 items-start">
                            <img src={item.product.image} className="w-14 h-18 object-cover border border-stone-200 rounded-xs bg-stone-50" referrerPolicy="no-referrer" />
                            <div>
                              <span className="text-[9px] bg-red-900/5 text-[#8A1C14] px-1.5 py-0.2 rounded-xs font-bold leading-none">{item.product.brand}</span>
                              <h4 className="font-bold text-neutral-950 font-serif mt-1">{item.product.title}</h4>
                              
                              {/* Personalized stitch tags overview */}
                              <div className="mt-2 text-[10px] text-stone-500 space-y-0.5 bg-[#FAF8F5] p-2 rounded-xs border border-stone-200/50">
                                <div>📏 লম্বা ঝুল: <strong className="text-neutral-900 font-mono">{custom.height} ইঞ্চি</strong></div>
                                <div>✂️ কুচি ডিজাইন: <strong className="text-neutral-900">{custom.pleats}</strong></div>
                                <div>🧥 হাতা: <strong className="text-neutral-900">{custom.sleeves}</strong></div>
                                <div>🧕 হিজাব অ্যাডন: <strong className="text-neutral-800">{custom.hijab === 'None' ? 'হিজাব ছাড়া' : custom.hijab}</strong></div>
                                {custom.notes && <div>📝 বিশেষ নোট: <span className="text-rose-950 font-mono font-medium underline">"{custom.notes}"</span></div>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center border border-stone-200 rounded bg-white text-xs mx-auto">
                            <button onClick={() => onUpdateCartQty(item.product.id, item.quantity - 1)} className="px-2 py-1 text-stone-600 font-bold hover:bg-stone-50">-</button>
                            <span className="px-3 py-1 font-mono font-bold text-stone-800 bg-stone-50/50">{item.quantity}</span>
                            <button onClick={() => onUpdateCartQty(item.product.id, item.quantity + 1)} className="px-2 py-1 text-stone-600 font-bold hover:bg-stone-50">+</button>
                          </div>
                          <button onClick={() => onRemoveFromCart(item.product.id)} className="text-[10px] text-red-600 hover:underline block mx-auto mt-2 font-bold">মুছে ফেলুন</button>
                        </td>
                        <td className="p-4 text-right font-mono font-semibold text-stone-700">৳{singlePrice.toLocaleString('en-IN')}</td>
                        <td className="p-4 text-right font-serif font-bold text-stone-900 text-sm">৳{(singlePrice * item.quantity).toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* BILL CALCULATION BLOCK */}
            <div className="bg-white p-6 rounded-md border border-stone-200 space-y-4 max-w-md ml-auto text-left text-xs">
              <h3 className="font-serif font-bold text-sm text-neutral-900 border-b border-stone-100 pb-2">হিসাবের ইনভয়েস বিবরণী</h3>
              <div className="flex justify-between">
                <span className="text-stone-500">বোরখা সাবটোটাল মূল্য:</span>
                <span className="font-bold font-mono text-neutral-900">৳{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">মেজারমেন্ট ও দর্জি সার্ভিস চার্জ:</span>
                <span className="text-emerald-700 font-bold">ফ্রি (৳০.০০)</span>
              </div>
              <div className="flex justify-between text-sm border-t border-stone-100 pt-2 font-bold select-none">
                <span className="font-serif">সর্বমোট বিল মূল্য:</span>
                <span className="text-base text-[#8A1C14] font-serif">৳{cartTotal.toLocaleString('en-IN')}</span>
              </div>

              <button 
                onClick={() => setActivePage('checkout')}
                className="w-full bg-[#8A1C14] hover:bg-neutral-900 text-white font-bold py-3 uppercase tracking-widest text-xs rounded-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                পরবর্তী চেকআউট ধাপে যান <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 5. CHECKOUT AND DISPATCH PAGE
  const renderCheckoutPage = () => {
    // If cart is completely cleared and checkout is successful, render confirmation screen
    if (checkoutSuccessMsg) {
      return (
        <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6 animate-fade-in text-neutral-900">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 animate-bounce">
            <Check className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-neutral-900">অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!</h2>
            <p className="text-semibold text-rose-800 font-mono text-xs">
              আপনার ইউনিক ট্র্যাকিং আইডি কোড: <strong className="bg-[#FAF8F5] border border-stone-200 px-2 py-1 text-sm rounded-sm text-neutral-950 font-mono select-all font-extrabold">{checkoutSuccessMsg.orderId}</strong>
            </p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed mt-2">
              আপনার শালীন কাস্টম মেজারমেন্ট নিখুঁতভাবে সংরক্ষণ করে দর্জিঘরে পাঠানো হয়েছে। দ্রুততম কুরিয়ার সার্ভিসে বোরখা ডিসপ্যাচ করতে আমাদের হেল্পলাইন প্রতিনিধি আপনার ফোন নাম্বারে যোগাযোগ করবে।
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded border border-stone-200/80 text-left text-xs space-y-1">
            <div className="font-bold text-stone-700">অর্ডার ইনভয়েস ডিটেইলস:</div>
            <div>• মোট পরিশোধযোগ্য বিল: <strong className="font-mono text-rose-950">৳{checkoutSuccessMsg.total.toLocaleString('en-IN')} BDT</strong></div>
            <div>• পেমেন্ট স্ট্যাটাস: <strong className="text-neutral-700">Cash on Delivery (হাতে পেয়ে মূল্য পরিশোধ)</strong></div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => {
                setTrackQueryId(checkoutSuccessMsg.orderId);
                // Trigger tracking search inside tracker database
                const found = localOrders.find(o => o.id === checkoutSuccessMsg.orderId);
                if (found) {
                  setSearchedTrackedOrder(found);
                }
                setHasSearchedTracking(true);
                setCheckoutSuccessMsg(null);
                setActivePage('tracking');
              }}
              className="flex-1 bg-neutral-900 hover:bg-[#8A1C14] text-white py-3 text-xs uppercase tracking-wider font-bold rounded-xs transition-colors"
            >
              আজকের অর্ডার ট্র্যাক করুন
            </button>
            <button 
              onClick={() => {
                setCheckoutSuccessMsg(null);
                setActivePage('home');
              }}
              className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-250 py-3 text-xs uppercase tracking-wider font-bold rounded-xs transition-colors"
            >
              হোম পেজে ফিরে যান
            </button>
          </div>
        </div>
      );
    }

    const shippingCharge = checkoutCity === 'Dhaka local' ? 80 : 150;
    const discountAmount = Math.floor((cartTotal * couponDiscountPercent) / 100);
    const orderGrandTotal = cartTotal + shippingCharge - discountAmount;

    const handleApplyCoupon = (e: React.FormEvent) => {
      e.preventDefault();
      const code = checkoutCoupon.trim().toUpperCase();
      if (code === 'BORKHA10') {
        setCouponDiscountPercent(10);
        setCouponFeedback({ message: 'কুপন সফল! ১০% বিশেষ মূল্যছাড় প্রযোজ্য হয়েছে।', success: true });
      } else if (code === 'EIDMUBARAK') {
        setCouponDiscountPercent(15);
        setCouponFeedback({ message: 'ঈদ মোবারক অফার সফল! ১৫% আকর্ষণীয় ডিসকাউন্টে অর্ডার প্রস্তুত হচ্ছে।', success: true });
      } else if (code === 'FREE2026') {
        // Mocking free shipping by removing shipping pricing
        setCouponDiscountPercent(0);
        setCouponFeedback({ message: 'অভিনন্দন! ফ্রি ডেলিভারি অফার একটিভ হয়েছে।', success: true });
      } else {
        setCouponDiscountPercent(0);
        setCouponFeedback({ message: 'দুঃখিত, কুপন কোডটি সঠিক নয় অথবা মেয়াদ শেষ।', success: false });
      }
    };

    const handlePlaceOrderProcess = (e: React.FormEvent) => {
      e.preventDefault();
      if (!checkoutName || !checkoutPhone || !checkoutAddress) {
        alert('অনুগ্রহ করে শিপিং ফর্মের স্টার চিহ্নিত ক্ষেত্রগুলো পূরণ করুন।');
        return;
      }

      // Generate random order ID
      const orderId = `BH-${1000 + Math.floor(Math.random() * 9000)}`;
      
      const newOrder: OrderRecord = {
        id: orderId,
        email: customerEmail || 'guest@example.com',
        name: checkoutName,
        phone: checkoutPhone,
        address: checkoutAddress,
        city: checkoutCity,
        items: cart.map(item => {
          const custom = cartCustomizations[item.product.id] || {
            height: '54',
            pleats: 'সিগনেচার কুচি ঘের (Pleated Signature Gher)',
            sleeves: 'Cozy ইলাস্টিক হাতা (Comfort Elastic - Wudu friendly)',
            hijab: 'None',
            notes: 'Default measures'
          };
          const hijabPrice = custom.hijab === 'None' ? 0 : custom.hijab.includes('৩৫০') ? 350 : 450;
          const singlePrice = item.product.price + hijabPrice;

          return {
            title: item.product.title,
            qty: item.quantity,
            price: singlePrice,
            customization: {
              height: custom.height,
              pleats: custom.pleats,
              sleeves: custom.sleeves,
              hijab: custom.hijab,
              notes: custom.notes
            }
          };
        }),
        shipping: shippingCharge,
        discount: discountAmount,
        total: orderGrandTotal,
        status: 'Order Placed & Verified (কাস্টম ট্র্যাকিং পোর্টালে যুক্ত হয়েছে)',
        orderDate: new Date().toLocaleDateString('bn-BD')
      };

      // Add to local list and save persistent
      const updatedList = [newOrder, ...localOrders];
      setLocalOrders(updatedList);
      localStorage.setItem('borkha_orders_db', JSON.stringify(updatedList));

      // Trigger success confirmation view
      setCheckoutSuccessMsg({ orderId, total: orderGrandTotal });
      
      // Empty the Cart state in App container
      onClearCart();
    };

    return (
      <div className="max-w-5xl mx-auto px-4 py-10 animate-fade-in text-neutral-950 text-left">
        <div className="border-b border-stone-200 pb-3 mb-8">
          <h2 className="text-xl md:text-2xl font-serif font-extrabold text-neutral-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" /> সুরক্ষিত নিরাপদ ক্যাশআউট গেটওয়ে
          </h2>
          <p className="text-xs text-stone-400 mt-1">আপনার নির্ভরযোগ্য ঠিকানা ও বিল সম্বলিত চালান তৈরি করুন।</p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white border border-stone-150 rounded-sm">
            <h3 className="text-sm font-bold text-stone-800">অর্ডার করার সুনির্দিষ্ট কোনো প্রোডাক্ট ব্যাহে নেই!</h3>
            <button onClick={() => setActivePage('shop')} className="mt-4 bg-neutral-900 text-white text-xs px-4 py-2 uppercase font-mono font-bold">শপে আইটেম খুঁজুন</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* LEFT SHIPPINGS OPTIONS DETAILED INPUTS FORM */}
            <form onSubmit={handlePlaceOrderProcess} className="lg:col-span-7 space-y-6">
              <div className="bg-white p-6 rounded-md border border-stone-200 space-y-4">
                <h3 className="font-serif font-bold text-sm text-[#8A1C14] border-b border-stone-100 pb-2">১. আপনার ডেলিভারি ঠিকানা (Shipping Address)</h3>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">সম্পূর্ণ নাম (Your Full Name) *</label>
                  <input 
                    type="text"
                    required
                    placeholder="যেমন: আরিশা ইসলাম অনি"
                    value={checkoutName}
                    onChange={(e) => setCheckoutName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-xs px-3.5 py-2.5 text-xs outline-none focus:border-[#8A1C14]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">মোবাইল নাম্বার (Active Mobile) *</label>
                    <input 
                      type="tel"
                      required
                      placeholder="যেমন: 017XXXXXXXX"
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-xs px-3.5 py-2.5 text-xs outline-none focus:border-[#8A1C14]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">ডেলিভারি এরিয়া / শহর *</label>
                    <select
                      value={checkoutCity}
                      onChange={(e) => setCheckoutCity(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-xs px-3 py-2.5 text-xs outline-none focus:border-[#8A1C14]"
                    >
                      <option value="Dhaka local">ঢাকা সিটির ভিতরে (ডেলিভারি চার্জ ৳৮০)</option>
                      <option value="Out of District Courier">ঢাকার বাইরে জেলা/উপজেলা শহর (চার্জ ৳১৫০)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">বিস্তারিত গ্রাম/মহল্লা, থানা ও জেলা বা রোড এড্রেস *</label>
                  <textarea 
                    required
                    placeholder="যেমন: বাসা নং- ৪৫, রোড নং- ১২, ফ্ল্যাট- ৩বি, বনানী, ঢাকা।"
                    rows={3}
                    value={checkoutAddress}
                    onChange={(e) => setCheckoutAddress(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-xs px-3.5 py-2.5 text-xs outline-none focus:border-[#8A1C14]"
                  />
                </div>
              </div>

              {/* PAYMENT OPTION INTEGRATIONS */}
              <div className="bg-white p-6 rounded-md border border-stone-200 space-y-4">
                <h3 className="font-serif font-bold text-sm text-[#8A1C14] border-b border-stone-100 pb-2">২. পেমেন্ট পদ্ধতি সিলেক্ট করুন (Payment Methods)</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-4 border rounded-sm flex items-center justify-between cursor-pointer transition-all ${paymentMode === 'cod' ? 'bg-amber-500/5 border-amber-500 text-neutral-900 font-bold' : 'bg-transparent border-stone-200'}`}>
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMode === 'cod'} 
                        onChange={() => setPaymentMode('cod')} 
                        className="accent-[#8A1C14]"
                      />
                      <div className="text-xs">
                        <div>ক্যাশ অন ডেলিভারি (COD)</div>
                        <div className="text-[10px] text-stone-400 font-normal">বোরখা হাতে পেয়ে মূল্য পরিশোধ করবেন।</div>
                      </div>
                    </div>
                  </label>

                  <label className={`p-4 border rounded-sm flex items-center justify-between cursor-pointer transition-all ${paymentMode === 'bkash' ? 'bg-indigo-50/50 border-indigo-400 text-indigo-950 font-bold' : 'bg-transparent border-stone-200'}`}>
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMode === 'bkash'} 
                        onChange={() => setPaymentMode('bkash')} 
                        className="accent-indigo-900"
                      />
                      <div className="text-xs">
                        <div className="flex items-center gap-1.5">বিকাশ পেমেন্ট (bKash Wallet)</div>
                        <div className="text-[10px] text-indigo-500 font-normal">টাকা আগে পাঠিয়ে ১% অতিরিক্ত ক্যাশব্যাক পান।</div>
                      </div>
                    </div>
                  </label>
                </div>

                {paymentMode === 'bkash' && (
                  <div className="p-4 bg-indigo-50/50 border border-indigo-150 rounded-sm space-y-3">
                    <div className="text-[11px] text-stone-600 font-serif leading-relaxed">
                      বিকাশ পার্সোনাল নাম্বারে: <strong className="text-indigo-950 font-mono">+৮৮০ ১৭৮৯-৫৫৫৬৬৬</strong> সেন্ডমানি (Send Money) করুন। নিচে আপনার যে বিকাশ নাম্বার থেকে টাকা পাঠিয়েছেন তা এবং ট্রানজেকশন কুপন কোড (TrxID) দিয়ে দিন।
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-stone-500 block">আপনার বিকাশ নাম্বার</label>
                        <input 
                          type="text" 
                          placeholder="যেমন- 017XXXXXXXX"
                          value={bkashNumber}
                          onChange={(e) => setBkashNumber(e.target.value)}
                          className="w-full bg-white border border-stone-250 rounded-xs text-xs px-3 py-2 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-stone-500 block">Transaction TrxID</label>
                        <input 
                          type="text" 
                          placeholder="যেমন- BK937424"
                          value={bkashTxnid}
                          onChange={(e) => setBkashTxnid(e.target.value)}
                          className="w-full bg-white border border-stone-250 rounded-xs text-xs px-3 py-2 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit"
                className="w-full bg-[#8A1C14] hover:bg-[#4A0E17] text-white font-serif font-bold py-4 text-sm uppercase tracking-widest rounded-md transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-amber-300" />
                অর্ডার নিশ্চিত করুন (Confirm Custom Order)
              </button>
            </form>

            {/* RIGHT SIDEBAR COUPON DEALS & INVOICES */}
            <div className="lg:col-span-5 space-y-6">
              {/* Promo validation block */}
              <div className="bg-white p-5 rounded-md border border-stone-200 space-y-3">
                <h4 className="font-serif font-bold text-xs text-stone-700">ডিউম প্রমোশনাল কুপন</h4>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="যেমন: BORKHA10"
                    value={checkoutCoupon}
                    onChange={(e) => setCheckoutCoupon(e.target.value)}
                    className="flex-1 bg-stone-50 border border-stone-200 text-stone-800 rounded-xs text-xs px-3 py-2 font-mono outline-none"
                  />
                  <button type="submit" className="bg-neutral-900 hover:bg-[#8A1C14] text-white text-xs px-4 py-2 font-bold uppercase rounded-xs transition-colors">Apply</button>
                </form>

                {couponFeedback && (
                  <div className={`p-2 rounded-xs text-xs border ${couponFeedback.success ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-red-50 text-red-850 border-red-100'}`}>
                    {couponFeedback.message}
                  </div>
                )}
              </div>

              {/* Basket list snapshot overview */}
              <div className="bg-white p-6 rounded-md border border-stone-200 space-y-4">
                <h3 className="font-serif font-bold text-sm text-[#8A1C14] border-b border-stone-100 pb-2">৩. অর্ডার রসিদ চালান (Invoice Details)</h3>
                
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {cart.map(item => {
                    const custom = cartCustomizations[item.product.id] || { height: '54', pleats: 'Standard', sleeves: 'Elastic', hijab: 'None' };
                    const hijabPrice = custom.hijab === 'None' ? 0 : custom.hijab.includes('৩৫০') ? 350 : 450;
                    return (
                      <div key={item.product.id} className="flex gap-3 justify-between text-xs py-1.5 border-b border-stone-100 last:border-none">
                        <div className="flex gap-2">
                          <img src={item.product.image} className="w-8 h-10 object-cover border border-stone-200" referrerPolicy="no-referrer" />
                          <div>
                            <span className="font-bold font-serif text-neutral-900 block leading-tight">{item.product.title}</span>
                            <span className="text-[10px] text-stone-400 font-mono">ঝুল: {custom.height}" • পরিমাণ: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-mono text-stone-700">৳{((item.product.price + hijabPrice) * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2 pt-3 border-t border-stone-150 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500">বোরখা সাবটোটাল:</span>
                    <span className="font-mono text-stone-700">৳{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">ডেলিভারি চার্জ:</span>
                    <span className="font-mono text-stone-700">৳{shippingCharge} BDT</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>কুপন ডিসকাউন্ট মূল্য:</span>
                      <span className="font-mono">-৳{discountAmount} BDT</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold border-t border-stone-100 pt-2 font-serif select-none">
                    <span>সর্বমোট প্রদেয় বিল:</span>
                    <span className="text-base text-[#8A1C14]">৳{orderGrandTotal.toLocaleString('en-IN')} BDT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 6. ORDER TRACKING PROGRESS MILESTONE TIMELINE
  const renderOrderTrackingPage = () => {
    // Dynamic look up handler
    const handleTrackSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const code = trackQueryId.trim().toUpperCase();
      if (!code) {
        alert('অনুগ্রহ করে ট্র্যাকিং রেফারেন্স আইডি বা কাস্টমার ইমেইল দিন।');
        return;
      }

      // Check order references in local database
      const match = localOrders.find(o => o.id === code || o.email.toLowerCase() === code.toLowerCase() || o.phone === code);
      if (match) {
        setSearchedTrackedOrder(match);
      } else {
        setSearchedTrackedOrder(null);
      }
      setHasSearchedTracking(true);
    };

    return (
      <div className="max-w-3xl mx-auto px-4 py-11 animate-fade-in text-neutral-950 text-left space-y-8">
        <div className="border-b border-stone-200 pb-3 text-center sm:text-left">
          <h2 className="text-xl md:text-2xl font-serif font-extrabold text-neutral-900 flex items-center justify-center sm:justify-start gap-2">
            <Truck className="w-6 h-6 text-[#8A1C14]" /> লাইভ বোরখা সেলাই ও কুডিয়ার ট্র্যাকার
          </h2>
          <p className="text-xs text-stone-400 mt-1">কাস্টম অর্ডারের লাইভ সেলাইয়ের কাজ, মান নিয়ন্ত্রণ এবং শিপিং অবস্থা ট্র্যাক করুন।</p>
        </div>

        {/* INPUT LOOKUP FORM */}
        <div className="bg-white p-6 rounded-md border border-stone-200 shadow-3xs space-y-4">
          <form onSubmit={handleTrackSubmit} className="space-y-2">
            <label className="text-xs font-bold text-stone-600 block">ট্র্যাকিং রেফারেন্স কোড / ইমেইল দিন (Order ID or Email):</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                required
                placeholder="যেমন: BH-1001 বা customer@gmail.com"
                value={trackQueryId}
                onChange={(e) => setTrackQueryId(e.target.value)}
                className="flex-1 bg-stone-50 border border-stone-200 text-stone-800 rounded-xs text-xs px-3.5 py-2.5 font-mono outline-none focus:border-[#8A1C14]"
              />
              <button type="submit" className="bg-neutral-900 hover:bg-[#8A1C14] text-white text-xs font-bold px-5 py-2.5 rounded-xs tracking-wider uppercase transition-colors">Track Order</button>
            </div>
          </form>

          <p className="text-[11px] text-stone-500 font-mono">
            * ডেমো ট্র্যাকিং পরীক্ষা করতে প্রসেস কোড <strong className="text-rose-900 bg-red-50 border border-red-100/50 px-1.5 py-0.5 rounded-sm">BH-1001</strong> অথবা <strong className="text-rose-900 bg-red-50 border border-red-100/50 px-1.5 py-0.5 rounded-sm">BH-1002</strong> ইনপুট দিয়ে সার্চ করুন।
          </p>
        </div>

        {/* SEARCHING STATUS RESULTS VIEW */}
        {hasSearchedTracking && (
          <div className="space-y-6">
            {searchedTrackedOrder ? (
              <div className="bg-white border border-stone-200 rounded-md p-6 sm:p-8 space-y-8 shadow-sm">
                
                {/* Meta details header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-stone-150 pb-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase font-mono">Order Tracking Refer</span>
                    <div className="font-bold text-slate-900 text-lg font-mono">{searchedTrackedOrder.id}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-right block uppercase text-zinc-400">Order Placed Date</span>
                    <strong className="text-neutral-700 block text-right font-mono">{searchedTrackedOrder.orderDate}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-right block uppercase text-zinc-400">ডেলিভারি কাস্টমার</span>
                    <span className="font-bold text-[#8A1C14] block text-right font-serif">{searchedTrackedOrder.name}</span>
                  </div>
                </div>

                {/* VISUAL COMPREHENSIVE TIMELINE STEPS */}
                <div className="space-y-6 relative border-l-2 border-amber-300 ml-4 pl-6 py-1 select-none text-xs">
                  {/* Step 1 */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white" />
                    <div>
                      <h4 className="font-bold text-neutral-900">অর্ডার প্রাপ্ত হয়েছে ও কাস্টম পরিমাপ নিশ্চিত (Stage 1: Placed)</h4>
                      <p className="text-stone-500 mt-1">গ্রাহকের ইমেইল ভেরিফাইড এবং কাস্টম ঝুল ও হাতার মাপ সফলভাবে যাচাইকৃত।</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white border-2 border-white ${searchedTrackedOrder.status.includes('Stitching') || searchedTrackedOrder.status.includes('Stitch') || searchedTrackedOrder.status.includes('Quality') || searchedTrackedOrder.status.includes('Dispatch') || searchedTrackedOrder.status.includes('Deliver') ? 'bg-emerald-600' : 'bg-stone-300'}`} />
                    <div>
                      <h4 className="font-bold text-neutral-900">শালীন মাপ অনুযায়ী সিগনেচার দর্জিঘরে তৈরি হচ্ছে (Stage 2: Tailoring)</h4>
                      <p className="text-stone-500 mt-1">অভিজ্ঞ কারিগরদের তত্ত্বাবধানে নিখুঁতভাবে থ্রেডকাটিং ও সেলাইয়ের কাজ প্রক্রিয়াধীন রয়েছে।</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white border-2 border-white ${searchedTrackedOrder.status.includes('Quality') || searchedTrackedOrder.status.includes('Dispatch') || searchedTrackedOrder.status.includes('Deliver') ? 'bg-emerald-600' : 'bg-stone-300'}`} />
                    <div>
                      <h4 className="font-bold text-neutral-900">মান নিয়ন্ত্রণ ও স্টিম আয়রনিং পর্যায় (Stage 3: QC & Ironing)</h4>
                      <p className="text-stone-500 mt-1">সেলাইয়ের ফিনিশিং পর্যবেক্ষণ শেষে ধুলো-বালিমুক্ত প্রিমিয়াম প্যাকিং বক্সে সুসজ্জিত করা এবং নিখুঁত করা হচ্ছে।</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white border-2 border-white ${searchedTrackedOrder.status.includes('Dispatch') || searchedTrackedOrder.status.includes('Deliver') ? 'bg-emerald-600' : 'bg-stone-300'}`} />
                    <div>
                      <h4 className="font-bold text-neutral-900">পাঠাও/রেডএক্স কুরিয়ার ডিসপ্যাচ সফল (Stage 4: Out for Delivery)</h4>
                      <p className="text-stone-500 mt-1">পোশাকটি নিরাপদে আপনার ঠিকানায় পাঠাতে স্থানীয় হোম-ডেলিভারি কুরিয়ার লোকাল এজেন্টকে হস্তান্তর করা হয়েছে।</p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white border-2 border-white ${searchedTrackedOrder.status.includes('Deliver') ? 'bg-emerald-300 bg-emerald-600' : 'bg-stone-300'}`} />
                    <div>
                      <h4 className="font-bold text-neutral-900">শালীন বোরখা সফলভাবে গ্রাহক হস্তে অর্পিত (Stage 5: Delivered)</h4>
                      <p className="text-stone-500 mt-1">পরিধেয় পোশাকটি গ্রাহক বুঝিয়া পাইয়াছেন এবং সম্পূর্ণ লেনদেন সমাপ্ত করা হইয়াছে।</p>
                    </div>
                  </div>
                </div>

                {/* Custom Item Specifications Snapshot */}
                <div className="bg-stone-50 p-4 rounded border border-stone-200 text-xs text-left space-y-3">
                  <div className="font-bold font-serif text-slate-900 flex items-center gap-1">
                    <Info className="w-4 h-4 text-[#8A1C14]" /> ড্রেসের কাস্টম পরিমাপন বিবরণী (Custom Specifications):
                  </div>
                  {searchedTrackedOrder.items.map((it, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xs border border-stone-150 space-y-1">
                      <div className="font-bold text-[#8A1C14]">{it.title} (Qty: {it.qty})</div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-stone-500 mt-1">
                        <div>📐 দৈর্ঘ্য / লম্বা ঝুল: <strong className="text-stone-900 font-mono">{it.customization.height} ইঞ্চি</strong></div>
                        <div>✂️ প্লেটস / কুচি কাটা: <strong className="text-stone-900">{it.customization.pleats}</strong></div>
                        <div>🧥 হাতার সাইজ ও স্লীভ: <strong className="text-stone-900">{it.customization.sleeves}</strong></div>
                        <div>🧕 ওড়না / হিজাব: <strong className="text-stone-800">{it.customization.hijab === 'None' ? 'হিজাব ছাড়া' : it.customization.hijab}</strong></div>
                      </div>
                      {it.customization.notes && (
                        <div className="text-[10px] text-rose-950 font-mono mt-1 pt-1 border-t border-stone-100">
                          * নির্দিষ্ট বার্তা: <span className="font-bold">"{it.customization.notes}"</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Support Hotline Info */}
                <div className="text-center pt-2 text-[11px] text-stone-400">
                  কোন সাইজ জটিলতা বা জরুরী কাস্টম পরিবর্তনের জন্য আমাদের ২৪ঘণ্টা হেল্পলাইন: <strong>{settings.contactPhone}</strong> এ যোগাযোগ করুন।
                </div>

              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 text-center rounded-md p-10 text-neutral-900 font-light">
                <ShieldAlert className="w-12 h-12 text-rose-800 mx-auto mb-3" />
                <h4 className="font-serif font-bold text-sm">দুঃখিত, ট্র্যাকিং আইডি কোডটি সঠিক নয়!</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                  আমাদের ডেটাবেসে এই ট্র্যাকিং রেফারেন্স আইডি বা কাস্টমার জিমেইল পাওয়া যায়নি। দয়া করে সঠিক কোডটি দিয়ে পুনরায় খতিয়ে দেখুন।
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // 7. ABOUT US HISTORY PAGE
  const renderAboutUsPage = () => {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in text-neutral-900 space-y-10 text-left">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <Sparkles className="w-6 h-6 text-amber-500 mx-auto animate-pulse" />
          <h2 className="text-2xl md:text-3xl font-serif font-extrabold">বোরখা হাউজ - শালীন ও মার্জিত পোশাক ঐতিহ্য</h2>
          <p className="text-xs text-stone-500 leading-relaxed font-light">আমাদের হাত ধরে বাংলাদেশে শুরু হয়েছিল শালীন পরিধেয় বুটিক আভিজাত্যের শুভযাত্রা।</p>
          <div className="w-16 h-0.5 bg-[#8A1C14] mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
          <div className="aspect-video sm:aspect-square bg-stone-100 rounded border border-stone-200 overflow-hidden relative shadow-xs">
            <img src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-x-0 bottom-0 bg-neutral-950/60 p-4 text-white text-[11px] leading-tight text-center">
              "আমাদের আধুনিক সেলাইঘর, ঢাকা ও ময়মনসিংহ কারিগর পল্লী।"
            </div>
          </div>
          <div className="space-y-4 text-xs sm:text-sm text-neutral-700 font-light leading-relaxed">
            <h3 className="font-bold text-base text-neutral-950 font-serif">মৌলিক মূল্যবোধ ও নৈতিক উৎপাদন</h3>
            <p>
              ১৯৭৮ সাল থেকে যাত্রা শুরু করে, <strong>বোরখা হাউজ বাংলাদেশ</strong> দেশের প্রতিটি মুসলিম নারীর শালীন জীবনধারাকে আরামদায়ক, রুচিশীল এবং গর্জিয়াস মুসলিম আবায়া ও বোরখায় সমৃদ্ধ করতে কাজ করে যাচ্ছে। আমরা কোনো যান্ত্রিক ফ্যাক্টরি নই; আমাদের রয়েছে নিজস্ব সুপরিকল্পিত দর্জিঘর যেখানে অত্যন্ত নিপুণভাবে সেরা চেরি, দুবাই নিদা ও ক্রেপ কাপড় কেটে শালীন দৈর্ঘ্যের বোরখা তৈরি ও সেলাই করা হয়।
            </p>
            <p>
              আমাদের প্রতিষ্ঠানে কাজ করছেন দেশের বিভিন্ন স্থান থেকে আসা ৬০+ এর বেশি সুবিধাবঞ্চিত নারী দর্জি কারিগর, যাদের আমরা নৈতিক পারিশ্রমিক ও সুরক্ষিত আবাসন সুবিধা প্রদান করতে পারছি। আপনার প্রতিটি ক্রয়ের অংশীদারিত্ব সরাসরি এই কারিগর পল্লীর মুখে হাসি ফুটাতে সাহায্য করছে।
            </p>
          </div>
        </div>

        {/* FABRIC TRANSPARENCY ASSURANCES */}
        <div className="bg-stone-50 rounded-md border border-stone-200 p-6 sm:p-8 space-y-6">
          <h3 className="font-serif font-bold text-center text-sm uppercase text-[#8A1C14] tracking-widest block mb-4">আমাদের কাপড়ের স্বচ্ছতা গাইড (Fabric Sourcing Guide)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-4 rounded border border-stone-200 space-y-1 text-center">
              <Award className="w-5 h-5 text-amber-500 mx-auto" />
              <h5 className="font-bold text-neutral-950 font-serif">দুবাই নালিন ক্রেপ নিদা</h5>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-normal">সম্পূর্ণ রিঙ্কেল ফ্রি কুঁচকানো প্রতিরোধী রাজকীয় ফ্যাব্রিক, হালকা সিল্ক ফিনিশিং সমৃদ্ধ যা গরমের দিনে শরীরে শীতল অনুভূতি দেয়।</p>
            </div>
            <div className="bg-white p-4 rounded border border-stone-200 space-y-1 text-center">
              <Award className="w-5 h-5 text-amber-500 mx-auto" />
              <h5 className="font-bold text-neutral-950 font-serif">প্রিমিয়াম কোরিয়ান চেরি জর্জেট</h5>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-normal">হালকা এবং ডাবল লেয়ার কুচিতে অত্যন্ত সুন্দর ফল দেয়। সহজে বাতাস চলাচল করে বিধায় দীর্ঘ সময় পরার জন্য আদর্শ।</p>
            </div>
            <div className="bg-white p-4 rounded border border-stone-200 space-y-1 text-center">
              <Award className="w-5 h-5 text-amber-500 mx-auto" />
              <h5 className="font-bold text-neutral-950 font-serif">তুর্কি কটন শিফন সুতা</h5>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-normal">আমাদের খিমার সম্ভারে ব্যবহৃত অত্যন্ত হালকা ও আরামদায়ক তুর্কী কাপড়ের সংমিশ্রণ যা খুব সহজে ফোল্ড রাখা যায় ও খসে পড়ে না।</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 8. CONTACT PAGE FORM INTEGRATIONS
  const renderContactPage = () => {
    const handleContactSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!contactName || !contactEmailMsg || !contactBody) {
        alert('অনুগ্রহ করে কন্টাক্ট ফর্মটি পূরণ করুন।');
        return;
      }
      setContactSentSuccess(true);
      setTimeout(() => {
        setContactSentSuccess(false);
        setContactName('');
        setContactEmailMsg('');
        setContactBody('');
      }, 5000);
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in text-neutral-900 space-y-10 text-left">
        <div className="text-center space-y-1 max-w-xl mx-auto">
          <HelpCircle className="w-6 h-6 text-emerald-600 mx-auto animate-bounce" />
          <h2 className="text-2xl font-serif font-extrabold">সহায়তা ও যোগাযোগ কেন্দ্র</h2>
          <p className="text-xs text-stone-500">বিশেষ কোনো সাইজে বোরখা সেলাই করতে কিংবা শোরুম লোকেশন জানতে যোগাযোগ করুন।</p>
          <div className="w-16 h-0.5 bg-[#8A1C14] mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
          {/* LEFT SUPPORT CONTACT DETAIL CARDS */}
          <div className="md:col-span-5 space-y-5 text-xs">
            <div className="bg-white p-5 rounded-md border border-stone-200 space-y-3 shadow-3xs">
              <h4 className="font-serif font-bold text-sm text-[#8A1C14] border-b border-stone-100 pb-1 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[#8A1C14]" /> সরাসরি যোগাযোগ
              </h4>
              <div className="space-y-2 text-stone-600 font-light">
                <p>📍 প্রধান শোরুম: লেভেল ৪, বোরখা হাউজ সেন্টার, রোড- ১২, বানানী, ঢাকা, বাংলাদেশ।</p>
                <p>📞 গ্রাহক হটলাইন: <strong className="text-rose-900 font-mono">{settings.contactPhone}</strong> (সকাল ১০ : ০০ টা - রাত ১০ : ০০ টা)</p>
                <p>✉️ ইমেইল এড্রেস: <span className="font-mono text-stone-850 underline">{settings.contactEmail}</span></p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-md border border-stone-200 space-y-3 shadow-3xs">
              <h4 className="font-serif font-bold text-sm text-[#8A1C14] border-b border-stone-100 pb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#8A1C14]" /> শোরুম খোলার সময়সূচী
              </h4>
              <p className="text-stone-600 font-light leading-relaxed">
                শনিবার থেকে বৃহস্পতিবার সকাল ১০:০০ টা থেকে রাত ৯:০০ টা পর্যন্ত আমাদের শোরুম গ্রাহকদের জন্য উন্মুক্ত থাকে। ফ্রিতে কাস্টম মেজারমেন্ট ট্রায়াল দিয়ে মাপ নির্ধারণের সুবর্ণ সুযোগ রয়েছে আমাদের ইন-হাউজ সেবা কেন্দ্রে।
              </p>
            </div>
          </div>

          {/* RIGHT EMAIL NOTIFICATION FEEDBACK WEB FORM */}
          <div className="md:col-span-7 bg-white p-6 rounded-md border border-stone-200 shadow-2xs">
            {contactSentSuccess ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto scale-110">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-serif font-bold text-base text-neutral-900">আপনার বার্তাটি সফলভাবে প্রেরণ করা হয়েছে!</h4>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  আমাদের পরিমাপ ও কাস্টম মেজারমেন্ট প্রতিনিধি ২৪ ঘণ্টার মধ্যে আপনার প্রদত্ত ইমেইল বা মোবাইলে যোগাযোগ করবেন।
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <h4 className="font-serif font-bold text-sm text-neutral-900 border-b border-stone-100 pb-2">আমাদের বার্তা পাঠান (Send Message)</h4>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">আপনার নাম (Your Name) *</label>
                  <input 
                    type="text" 
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="যেমন- আরিশা ইসলাম"
                    className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-xs px-3.5 py-2.5 text-xs outline-none focus:border-[#8A1C14] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">আপনার জিমেইল/ইमেইল *</label>
                    <input 
                      type="email" 
                      required
                      value={contactEmailMsg}
                      onChange={(e) => setContactEmailMsg(e.target.value)}
                      placeholder="customer@gmail.com"
                      className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-xs px-3.5 py-2.5 text-xs outline-none focus:border-[#8A1C14]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">জিজ্ঞাসার বিষয় *</label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-xs px-3 py-2.5 text-xs outline-none focus:border-[#8A1C14]"
                    >
                      <option value="Product Customization Help">মাপ কাস্টমাইজেশন সহায়তা</option>
                      <option value="Order Status / Missing Item">অর্ডার ডেলিভারি স্ট্যাটাস</option>
                      <option value="Showroom Trial Appointment">শোরুম ট্রায়াল বুকিং</option>
                      <option value="Bulk/Wholesale Request">পাইকারী অর্ডার জিজ্ঞাসা</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">আপনার সুনির্দিষ্ট বার্তা ও মাপসমূহ *</label>
                  <textarea 
                    required
                    rows={4}
                    value={contactBody}
                    onChange={(e) => setContactBody(e.target.value)}
                    placeholder="আপনার মাপ কিংবা কুচি ডিজাইনের বিবরণ এখানে লিখুন।"
                    className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-xs px-3.5 py-2.5 text-xs outline-none focus:border-[#8A1C14]"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-neutral-900 hover:bg-[#8A1C14] text-white font-serif font-bold py-3 text-xs uppercase tracking-widest rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  জিজ্ঞাসা সাবমিট করুন
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 9. PRIVACY POLICY
  const renderPrivacyPolicyPage = () => {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in text-neutral-900 text-left space-y-6 text-xs sm:text-sm">
        <div className="border-b border-stone-200 pb-3">
          <h2 className="text-xl md:text-2xl font-serif font-extrabold text-neutral-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#8A1C14]" /> প্রাইভেসি পলিসি ও তথ্য নিরাপত্তা
          </h2>
          <p className="text-xs text-stone-400 mt-1">বোরখা হাউজ বাংলাদেশ-এ আপনার ব্যক্তিগত ডাটা এবং তথ্যের কঠোর নিরাপত্তা বিধিমালা।</p>
        </div>

        <div className="bg-white p-6 rounded-md border border-stone-200 space-y-4 text-stone-600 font-light leading-relaxed">
          <p>
            ১. <strong>গ্রাহকের সুনির্দিষ্ট কাস্টম মেজারমেন্ট সংরক্ষণ:</strong> বোরখা হাউজ প্ল্যাটফর্মে পরিমাপ নির্ধারণের জন্য আপনার প্রদত্ত বোরখার দৈর্ঘ্য, হাতা এবং নোটে দেওয়া মাপসমূহ শুধুমাত্র শালীন সেলাই কাজের স্বার্থে আমাদের সুরক্ষিত হোস্টিং ডেটাবেসে এনক্রিপ্ট করে রেকর্ড করা হয়। কোনো তৃতীয় পক্ষের নিকট এই ব্যক্তিগত শারীরিক পরিমাপ ডাটা প্রকাশ করা হয় না।
          </p>
          <p>
            ২. <strong>যোগাযোগ ও অর্ডার নিশ্চিতকরণ:</strong> অর্ডার সফল করার জন্য আপনার প্রদত্ত মোবাইল নাম্বার ও জিমেইল এড্রেস শুধুমাত্র কুরিয়ার এজেন্ট ডিসপ্যাচ ও বিলের চালান প্রেরণে ব্যবহৃত হয়। আমরা অপ্রাসঙ্গিক কোনো বাণিজ্যিক প্রোমোশনাল মেসেজ দিয়ে কাস্টমার হয়রানি করি না।
          </p>
          <p>
            ৩. <strong>অর্থ পরিশোধের নিরাপত্তা:</strong> SSLCommerz এবং বিকাশ নিরাপদ ইন্টিগ্রেশনের মাধ্যমে আপনার অনলাইন পেমেন্ট সর্বোচ্চ লেভেলের PCI-DSS কমপ্লায়েন্ট সার্ভার মেকানিজমে প্রসেস হয়। আমরা কখনো গ্রাহকদের কার্ড ডাটা বা বিকাশ পিন সংরক্ষণ করি না।
          </p>
        </div>
      </div>
    );
  };

  // 10. RETURN AND EXCHANGE POLICY
  const renderReturnPolicyPage = () => {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in text-neutral-900 text-left space-y-6 text-xs sm:text-sm">
        <div className="border-b border-stone-200 pb-3">
          <h2 className="text-xl md:text-2xl font-serif font-extrabold text-neutral-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-[#8A1C14]" /> রিটার্ন, এক্সচেঞ্জ ও সেলাই পলিসি
          </h2>
          <p className="text-xs text-stone-400 mt-1">ঝামেলাহীন ৭ দিনের সহজ বোরখা মাপ পরিবর্তন ও এক্সচেঞ্জ নির্দেশিকা।</p>
        </div>

        <div className="bg-white p-6 rounded-md border border-stone-200 space-y-4 text-stone-600 font-light leading-relaxed">
          <p className="font-bold text-neutral-950 font-serif">আমাদের শালীন প্রোডাক্ট গুলোর রিটার্ন পাওয়ার শর্তাবলী নিম্নরূপ:</p>
          <p>
            ১. <strong>৭ দিনের কাস্টমার ক্লিয়ার রিফান্ড গ্যারান্টি:</strong> পরিধেয় বোরখা, খিমার বা হিজাব হাতে পাওয়ার ৭ দিনের মধ্যে যেকোনো মাপের অসঙ্গতি বা সেলাই ক্রুটিজনিত কারণে পণ্য সফলভাবে পরিবর্তন করে দেওয়া হবে অথবা সম্পূর্ণ অর্থ ফেরত প্রদান করা হবে।
          </p>
          <p>
            ২. <strong>রিটার্ন গ্রহণের আবশ্যিক শর্ত:</strong> পোশাকের গায়ে লাগানো অরিজিনাল প্রাইস ট্যাগ এবং ব্র্যান্ড কার্ড অক্ষত থাকতে হবে। পোশাকটি অবশ্যই অযথা ময়লা বা ধোয়া ছাড়া অবস্থায় ফেরত পাঠাতে হবে।
          </p>
          <p>
            ৩. <strong>কাস্টমাইজড মাপের ক্ষেত্রে বিশেষ নিয়ম:</strong> যদি গ্রাহক ভুল লম্বা ঝুলের মাপ প্রদান করেন, তবে নামমাত্র রেডি কোড ক্লিয়ারিং ফি তে দর্জিঘরে পোশাকটির ঝুল পুনরায় ছোট বা অল্টার করে নতুন কুরিয়ার ঠিকানায় প্রেরণ করা হবে সম্পূর্ণ ফ্রিতে।
          </p>
        </div>
      </div>
    );
  };

  // 11. CENTRAL ROUTER SWITCH DISPATCHER
  const renderPageContent = () => {
    switch (activePage) {
      case 'home':
        return renderHomePage();
      case 'shop':
        return renderShopPage();
      case 'details':
        return renderProductDetailsPage();
      case 'cart':
        return renderCartPage();
      case 'checkout':
        return renderCheckoutPage();
      case 'tracking':
        return renderOrderTrackingPage();
      case 'about':
        return renderAboutUsPage();
      case 'contact':
        return renderContactPage();
      case 'privacy':
        return renderPrivacyPolicyPage();
      case 'return':
        return renderReturnPolicyPage();
      default:
        return renderHomePage();
    }
  };

  return (
    <div className="min-h-screen font-sans flex flex-col transition-colors duration-300" style={{ backgroundColor: '#FAF8F5', color: '#231F20' }}>
      
      {/* 1. TOP BRAND SWITCHING RAIL (Borkha House elegant aesthetic) */}
      <div className="bg-neutral-900 text-white text-xs border-b border-rose-950 py-2 px-4 md:px-8 flex justify-between items-center z-10">
        <div className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-none">
          <button 
            id="brand-btn-all"
            onClick={() => setSelectedBrand('All')}
            className={`font-semibold tracking-widest transition-all pr-4 border-r border-neutral-700 uppercase ${selectedBrand === 'All' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-white'}`}
          >
            All Collections
          </button>
          <button 
            id="brand-btn-dubai"
            onClick={() => setSelectedBrand('Dubai Elegance')}
            className={`font-semibold tracking-widest transition-all pr-4 border-r border-neutral-700 uppercase ${selectedBrand === 'Dubai Elegance' ? 'text-amber-400 font-bold scale-105' : 'text-neutral-400 hover:text-white'}`}
          >
            Dubai Elegance
          </button>
          <button 
            id="brand-btn-signature"
            onClick={() => setSelectedBrand('Borkha House Signature')}
            className={`font-semibold tracking-widest transition-all pr-4 border-r border-neutral-700 uppercase ${selectedBrand === 'Borkha House Signature' ? 'text-amber-400 font-bold scale-105' : 'text-neutral-400 hover:text-white'}`}
          >
            BH Signature
          </button>
          <button 
            id="brand-btn-turkish"
            onClick={() => setSelectedBrand('Anatolia Modest')}
            className={`font-semibold tracking-widest transition-all pr-4 border-r border-neutral-700 uppercase ${selectedBrand === 'Anatolia Modest' ? 'text-amber-400 font-bold scale-105' : 'text-neutral-400 hover:text-white'}`}
          >
            Anatolia Modest
          </button>
          <button 
            id="brand-btn-hijabs"
            onClick={() => setSelectedBrand('Habiba Hijabs')}
            className={`font-semibold tracking-widest transition-all uppercase ${selectedBrand === 'Habiba Hijabs' ? 'text-amber-400 font-bold scale-105' : 'text-neutral-400 hover:text-white'}`}
          >
            Habiba Hijabs
          </button>
        </div>
        <div className="flex items-center gap-4 shrink-0 text-neutral-400">
          <span className="hidden md:inline">BANGLADESH</span>
          <button 
            id="portal-btn-admin"
            onClick={onOpenAdmin} 
            className="bg-red-800 hover:bg-neutral-800 text-white font-medium px-3 py-1 rounded-sm text-xs flex items-center gap-1.5 cursor-pointer leading-none transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            Admin Control Panel
          </button>
        </div>
      </div>

      {/* 2. CHIEF BRAND HEADER */}
      <header className="sticky top-0 bg-white shadow-xs py-4 px-4 md:px-8 flex justify-between items-center z-20 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <span 
            className="text-2xl md:text-3xl font-serif tracking-widest font-extrabold flex items-center"
            style={{ color: settings.brandColors?.accent || '#8A1C14' }}
          >
            {settings.logoImage ? (
              <img 
                src={settings.logoImage} 
                alt={settings.logoText || 'Borkha House Logo'} 
                className="h-10 md:h-12 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              settings.logoText || 'BORKHA HOUSE'
            )}
          </span>
          <span className="text-[10px] tracking-wider text-neutral-400 font-mono hidden sm:inline uppercase border-l border-stone-200 pl-3">
            Premium Muslim Modest Attire
          </span>
        </div>

        {/* Global Live Bar */}
        <div className="flex-1 max-w-md mx-6 hidden md:block relative">
          <div className="relative">
            <input 
              id="search-input-desktop"
              type="text"
              placeholder="বোরখা, দুবাই আবায়া, খিমার বা হিজাব খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 text-stone-800 text-sm pl-10 pr-4 py-2 rounded-full border border-stone-200 focus:outline-hidden focus:border-red-900 transition-colors"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            {searchQuery && (
              <button 
                id="clear-search-desktop"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-700 text-xs font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-4">
          <div className="md:hidden relative">
            {/* Mobile Search toggler */}
            <input 
              id="search-input-mobile"
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-32 sm:w-48 bg-stone-50 text-stone-800 text-xs pl-8 pr-2 py-1.5 rounded-md border border-stone-200 focus:outline-hidden focus:width-44 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Customer Login status */}
          <div className="flex items-center gap-2">
            {customerEmail ? (
              <div className="flex items-center gap-1.5 bg-orange-50/50 border border-amber-900/15 px-2.5 py-1.5 rounded-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[11px] text-stone-700 font-mono font-medium max-w-[110px] sm:max-w-[150px] truncate" title={customerEmail}>
                  {customerEmail}
                </span>
                <button
                  onClick={handleCustomerLogout}
                  className="text-[10px] text-red-800 hover:text-red-950 ml-2 hover:underline font-bold"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempCustomerEmail('');
                  setCustomerLoginError('');
                  setShowCustomerLoginModal(true);
                }}
                className="text-xs text-[#8A1C14] hover:text-white border border-[#8A1C14] hover:bg-[#8A1C14] px-3 py-1.5 rounded-sm transition-all font-medium whitespace-nowrap cursor-pointer"
              >
                কাস্টমার লগইন
              </button>
            )}
          </div>

          <button 
            id="cart-panel-toggle"
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="relative p-2 hover:bg-stone-50 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5 text-stone-800" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#f15a22] text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* SECONDARY NAVIGATION MENU LINKS BAR (HOME, SHOP, ETC) */}
      <nav className="bg-[#8A1C14] text-white py-3 px-4 md:px-8 border-b border-rose-950 flex justify-center flex-wrap gap-x-6 gap-y-2 text-xs md:text-sm shadow-md font-serif select-none transition-all">
        <button id="nav-home" onClick={() => setActivePage('home')} className={`hover:text-amber-300 transition-colors uppercase tracking-wider font-semibold cursor-pointer ${activePage === 'home' ? 'text-amber-300 font-extrabold border-b-2 border-amber-300 pb-0.5' : 'text-stone-200'}`}>
          হোম (Home)
        </button>
        <button id="nav-shop" onClick={() => setActivePage('shop')} className={`hover:text-amber-300 transition-colors uppercase tracking-wider font-semibold cursor-pointer ${activePage === 'shop' ? 'text-amber-300 font-extrabold border-b-2 border-amber-300 pb-0.5' : 'text-stone-200'}`}>
          বোরখা শপ (Shop Catalog)
        </button>
        <button id="nav-cart" onClick={() => setActivePage('cart')} className={`hover:text-amber-300 transition-colors uppercase tracking-wider font-semibold cursor-pointer ${activePage === 'cart' ? 'text-amber-300 font-extrabold border-b-2 border-amber-300 pb-0.5' : 'text-stone-200'}`}>
          শপিং ব্যাগ ({cart.reduce((sum, i) => sum + i.quantity, 0)})
        </button>
        <button id="nav-tracking" onClick={() => setActivePage('tracking')} className={`hover:text-amber-300 transition-colors uppercase tracking-wider font-semibold cursor-pointer ${activePage === 'tracking' ? 'text-amber-300 font-extrabold border-b-2 border-amber-300 pb-0.5' : 'text-stone-200'}`}>
          অর্ডার ট্র্যাকার (Track)
        </button>
        <button id="nav-about" onClick={() => setActivePage('about')} className={`hover:text-amber-300 transition-colors uppercase tracking-wider font-semibold cursor-pointer ${activePage === 'about' ? 'text-amber-300 font-extrabold border-b-2 border-amber-300 pb-0.5' : 'text-stone-200'}`}>
          আমাদের কথা (About Us)
        </button>
        <button id="nav-contact" onClick={() => setActivePage('contact')} className={`hover:text-amber-300 transition-colors uppercase tracking-wider font-semibold cursor-pointer ${activePage === 'contact' ? 'text-amber-300 font-extrabold border-b-2 border-amber-300 pb-0.5' : 'text-stone-200'}`}>
          যোগাযোগ (Contact)
        </button>
        <button id="nav-privacy" onClick={() => setActivePage('privacy')} className={`hover:text-amber-300 transition-colors uppercase tracking-wider font-semibold cursor-pointer ${activePage === 'privacy' ? 'text-amber-300 font-extrabold border-b-2 border-amber-300 pb-0.5' : 'text-stone-200'}`}>
          প্রাইভেসি পলিসি
        </button>
        <button id="nav-return" onClick={() => setActivePage('return')} className={`hover:text-amber-300 transition-colors uppercase tracking-wider font-semibold cursor-pointer ${activePage === 'return' ? 'text-amber-300 font-extrabold border-b-2 border-amber-300 pb-0.5' : 'text-stone-200'}`}>
          রিটার্ন পলিসি
        </button>
      </nav>

      {/* CENTRALIZED ROUTER PAGE SWITCH CONTENT */}
      <main className="flex-grow">
        {renderPageContent()}
      </main>

      {/* 4. CHIEF SOCIAL STATEMENT & ABOUT TEXT */}
      <section className="bg-white py-12 px-6 md:px-12 text-center border-b border-stone-100 max-w-4xl mx-auto my-6 rounded-md shadow-xs">
        <Sparkles className="w-6 h-6 text-[#f15a22] mx-auto mb-3" />
        <h2 className="text-xl md:text-3xl font-serif tracking-wide text-neutral-900 font-bold mb-4">
          Ethics, Craft & Empowerment
        </h2>
        <p className="text-sm md:text-base text-neutral-600 font-normal leading-relaxed max-w-3xl mx-auto">
          {settings.aboutText || 'Empowering over 65,000 rural artisans, ensuring fair wages, safe workplaces, and bringing native handcrafted wonders back into modern lives since 1978.'}
        </p>
      </section>

      {/* 5. PUBLIC INTEGRATED SHOPPING ENGINE */}
      <main id="shopping-catalog-section" className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDE FILTER AND REFINEMENT PANEL */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-md p-5 shadow-xs border border-stone-100 space-y-6 sticky top-24">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-neutral-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#f15a22]" /> Filter Catalog
              </h3>
              {(selectedCategory !== 'All' || selectedBrand !== 'All' || searchQuery !== '' || priceRange !== 20000) && (
                <button 
                  id="reset-all-filters-btn"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedBrand('All');
                    setSearchQuery('');
                    setPriceRange(20000);
                  }}
                  className="text-xs text-[#f15a22] hover:underline font-semibold"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Category</label>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button
                    id={`filter-cat-${cat}`}
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-1.5 rounded-sm text-sm transition-all flex justify-between items-center ${selectedCategory === cat ? 'bg-[#FAF8F5] text-[#f15a22] font-semibold border-l-2 border-[#f15a22]' : 'text-neutral-600 hover:bg-[#FAF8F5] hover:text-neutral-900'}`}
                  >
                    <span>{cat}</span>
                    <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full font-mono">
                      {cat === 'All' ? products.length : products.filter(p => p.category === cat).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand filtering */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Collection Category</label>
              <div className="grid grid-cols-1 gap-1.5">
                {['All', 'Dubai Elegance', 'Borkha House Signature', 'Anatolia Modest', 'Habiba Hijabs'].map(br => (
                  <button
                    id={`filter-brand-${br}`}
                    key={br}
                    onClick={() => setSelectedBrand(br as any)}
                    className={`px-3 py-2 rounded-xs text-xs border text-left font-medium transition-all ${selectedBrand === br ? 'bg-[#8A1C14] text-white border-[#8A1C14]' : 'bg-transparent text-neutral-600 border-neutral-200 hover:border-neutral-400'}`}
                  >
                    {br === 'All' ? 'All Collections' : br}
                  </button>
                ))}
              </div>
            </div>

            {/* Price refinement slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Max Price (BDT)</label>
                <span className="text-sm font-semibold text-neutral-900">৳{priceRange.toLocaleString('en-IN')}</span>
              </div>
              <input 
                id="price-range-slider"
                type="range"
                min="500"
                max="25000"
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#f15a22]"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1">
                <span>৳500</span>
                <span>৳25,000</span>
              </div>
            </div>

            {/* Quick status banner */}
            <div className="bg-[#FAF8F5] rounded-sm p-4 border border-stone-100">
              <span className="text-xs font-medium text-neutral-500 block leading-tight">
                Currently displaying <span className="font-bold text-neutral-900">{filteredProducts.length}</span> native craft products.
              </span>
            </div>
          </div>
        </div>

        {/* PRODUCTS GRID VIEW */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
            <h2 className="text-2xl font-serif text-neutral-900 font-bold tracking-tight">
              {selectedCategory === 'All' ? 'Complete Craft Inventory' : selectedCategory}
              {selectedBrand !== 'All' && <span className="text-amber-700"> &bull; {selectedBrand}</span>}
            </h2>
            <span className="text-xs text-neutral-400 font-mono">
              Displaying {filteredProducts.length} items
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-md border border-stone-100 p-8">
              <AlertTriangle className="w-12 h-12 text-[#f15a22]/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold font-serif text-neutral-800 mb-1">No products match your filters</h3>
              <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-4">
                Try widening your price range or clearing your query search filters.
              </p>
              <button 
                id="clear-filters-middle-btn"
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedBrand('All');
                  setSearchQuery('');
                  setPriceRange(20000);
                }}
                className="bg-neutral-900 hover:bg-[#f15a22] text-white text-xs px-4 py-2 font-semibold tracking-wider uppercase rounded-xs transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(prod => (
                <div 
                  id={`product-card-${prod.id}`}
                  key={prod.id}
                  className="bg-white rounded-md overflow-hidden shadow-xs hover:shadow-md border border-stone-100 group transition-all duration-350 flex flex-col"
                >
                  <div className="relative aspect-4/5 w-full bg-stone-50 overflow-hidden">
                    <img 
                      src={prod.image} 
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />

                    {/* Brand Badge */}
                    <span className="absolute top-3 left-3 bg-neutral-900/95 text-white text-[10px] font-bold tracking-widest px-2.5 py-1 uppercase rounded-xs">
                      {prod.brand}
                    </span>

                    {/* Rating Badge */}
                    {prod.ratings && (
                      <span className="absolute bottom-3 right-3 bg-white/90 text-stone-800 text-[11px] font-bold tracking-tight px-2 py-0.5 rounded-xs flex items-center gap-1 backdrop-blur-xs">
                        <Star className="w-3.5 h-3.5 fill-[#f15a22] text-[#f15a22]" />
                        {prod.ratings.toFixed(1)}
                      </span>
                    )}

                    {/* Low stock indicators */}
                    {prod.stock <= 5 && (
                      <span className="absolute top-3 right-3 bg-amber-500 text-neutral-900 font-bold text-[9px] px-2 py-1 tracking-wider uppercase rounded-sm">
                        Limited {prod.stock} Left!
                      </span>
                    )}
                    {prod.stock === 0 && (
                      <span className="absolute inset-0 bg-neutral-900/80 flex items-center justify-center text-white font-serif font-bold tracking-wider text-sm uppercase">
                        Stock Empty
                      </span>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs text-neutral-400 font-mono tracking-wider block mb-1">
                        {prod.category}
                      </span>
                      <h4 className="font-serif text-base text-neutral-900 group-hover:text-[#f15a22] font-semibold tracking-tight line-clamp-1 transition-colors">
                        {prod.title}
                      </h4>
                      <p className="text-xs text-neutral-500 line-clamp-2 mt-1 min-h-[32px] font-light leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-50 flex items-center justify-between">
                      <span className="font-serif text-lg font-extrabold text-[#6c122f]">
                        ৳{prod.price.toLocaleString('en-IN')}
                      </span>
                      
                      <div className="flex gap-2">
                        <button 
                          id={`action-btn-view-${prod.id}`}
                          onClick={() => {
                            setSelectedDetailProduct(prod);
                            setActivePage('details');
                          }}
                          className="bg-stone-50 hover:bg-stone-100 text-stone-700 p-2 rounded-xs border border-stone-200 transition-colors text-xs font-semibold cursor-pointer"
                        >
                          Details
                        </button>
                        {prod.stock > 0 && (
                          <button 
                            id={`action-btn-add-${prod.id}`}
                            onClick={() => onAddToCart(prod)}
                            className="bg-stone-900 hover:bg-[#f15a22] text-white px-3 py-1.5 rounded-xs text-xs font-medium cursor-pointer transition-colors"
                          >
                            Bag It
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 7. SLIDEOUT CART DRAWER */}
      {isCartOpen && (
        <div id="shopping-bag-drawer-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-end z-50">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-slide-left p-6">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center border-b border-stone-100 pb-4 mb-4">
                <h3 className="font-serif text-xl font-bold text-neutral-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#f15a22]" /> Shopping Bag
                </h3>
                <button 
                  id="close-cart-panel"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5.5 h-5.5" />
                </button>
              </div>

              {purchaseSuccess ? (
                <div className="text-center py-20 space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto scale-110 animate-bounce">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-neutral-800">Order successfully placed!</h4>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                    Traditional artisan tracking order has been dispatched. High-security checkout verified.
                  </p>
                </div>
              ) : cart.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-[#f15a22]/20 mx-auto" />
                  <h4 className="font-serif text-base font-bold text-neutral-800">Your shopping bag is empty</h4>
                  <p className="text-xs text-neutral-500">Add authentic heritage products from our catalog isles.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex gap-3 bg-stone-50 p-3 rounded-md border border-stone-100">
                      <img 
                        src={item.product.image} 
                        alt={item.product.title} 
                        className="w-16 h-20 object-cover rounded-sm border border-stone-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-stone-400 font-mono tracking-widest block uppercase">
                            {item.product.brand}
                          </span>
                          <h4 className="font-serif text-xs font-bold text-neutral-800 line-clamp-1">{item.product.title}</h4>
                          <span className="text-xs text-neutral-500 font-mono block mt-0.5">৳{item.product.price.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center border border-stone-200 rounded-xs bg-white text-xs">
                            <button 
                              id={`cart-qty-dec-${item.product.id}`}
                              onClick={() => onUpdateCartQty(item.product.id, item.quantity - 1)}
                              className="px-2 py-0.5 hover:bg-stone-100 text-stone-600 font-bold"
                            >
                              -
                            </button>
                            <span className="px-2.5 py-0.5 font-mono font-bold text-stone-800 bg-stone-50">{item.quantity}</span>
                            <button 
                              id={`cart-qty-inc-${item.product.id}`}
                              onClick={() => onUpdateCartQty(item.product.id, item.quantity + 1)}
                              className="px-2 py-0.5 hover:bg-stone-100 text-stone-600 font-bold"
                            >
                              +
                            </button>
                          </div>
                          
                          <button 
                            id={`cart-item-remove-${item.product.id}`}
                            onClick={() => onRemoveFromCart(item.product.id)}
                            className="text-[11px] text-red-500 hover:underline font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && !purchaseSuccess && (
              <div className="border-t border-stone-100 pt-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500 font-medium">BGD VAT (Dynamic inclusions)</span>
                  <span className="font-bold font-serif text-neutral-900">৳0.00</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-neutral-900 font-serif font-bold">সর্বমোট বিল (Subtotal Amount)</span>
                  <span className="font-serif text-xl font-extrabold text-[#8A1C14]">
                    ৳{cartTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-neutral-50 px-3 py-2 rounded-xs border border-neutral-100 text-[10px] text-neutral-500 font-mono flex items-center gap-1.5 leading-tight">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  পেমেন্ট গেটওয়ে সুরক্ষিত এবং এনক্রিপ্ট করা।
                </div>

                <button 
                  id="checkout-trigger-btn"
                  onClick={handleCheckout}
                  className="w-full bg-[#8A1C14] hover:bg-neutral-900 text-white font-medium py-3.5 text-xs tracking-widest uppercase rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-300" />
                  অর্ডার করতে এখানে চাপুন (Verify Gmail & Checkout)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. GENERAL BRAND FOOTER */}
      <footer className="bg-neutral-900 text-neutral-300 py-12 px-6 border-t border-neutral-800 mt-16 text-xs font-light">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            {settings.logoImage ? (
              <img 
                src={settings.logoImage} 
                alt={settings.logoText || 'Borkha House Logo'} 
                className="h-8 w-auto object-contain bg-neutral-900 p-0.5 rounded-xs block mb-2"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-lg font-serif tracking-widest text-[#8A1C14] font-semibold block">{settings.logoText || 'BORKHA HOUSE'}</span>
            )}
            <p className="leading-relaxed text-neutral-400">
              {settings.aboutText || 'বোরখা হাউজ বাংলাদেশ - আপনার শালীন বিশ্বাস ও আভিজাত্যের বিশ্বস্ত পোশাক সঙ্গী।'}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white tracking-widest uppercase mb-3">গ্রাহক সেবা</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>অর্ডার ট্র্যাকিং</li>
              <li>বোরখা সাইজ গাইড</li>
              <li>রিটার্ন ও এক্সচেঞ্জ পলিসি</li>
              <li>ডেলিভারি চার্জ ও নিয়মাবলী</li>
              <li>প্রোডাক্ট কাস্টমাইজেশন</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white tracking-widest uppercase mb-3">কালেকশন সমূহ</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>দুবাই আবায়া কালেকশন</li>
              <li>প্রিমিয়াম খিমার ও হিজাব</li>
              <li>স্টাইলিশ কাফতান সেট</li>
              <li>হ্যান্ড এমব্রয়ডারি জর্দোজি</li>
              <li>আভিজাত্য জুয়েলারি ও পিন</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-white tracking-widest uppercase mb-3">যোগাযোগ</h4>
            <p className="text-neutral-400 leading-relaxed">
              প্রধান শাখা: বোরখা হাউজ সেন্টার, ঢাকা, বাংলাদেশ।<br />
              Email: {settings.contactEmail || 'orders@borkhahouse.com'}<br />
              Helpline: {settings.contactPhone || '+880 1789-555666'}
            </p>
            <span className="text-[10px] text-neutral-500 font-mono block">
              &copy; {new Date().getFullYear()} Borkha House Bangladesh. Developed for premium modest apparel.
            </span>
          </div>
        </div>
      </footer>

      {/* CUSTOMER LOGIN MODAL */}
      {showCustomerLoginModal && (
        <div id="customer-login-modal" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-xl relative animate-fade-in text-neutral-900 text-left">
            <button 
              id="customer-login-close-btn"
              onClick={() => {
                setShowCustomerLoginModal(false);
                setCustomerLoginError('');
              }}
              className="absolute right-4 top-4 p-1 rounded-full text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5 pt-2">
              <div className="w-12 h-12 bg-red-900/10 text-[#8A1C14] rounded-full flex items-center justify-center mx-auto border border-red-900/20">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-neutral-900">
                অর্ডার করতে লগইন করুন
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                বোরখা হাউজে প্রোডাক্ট অর্ডার করতে দয়া করে আপনার জিমেইল/ইমেইল এড্রেসটি দিন। ১-সেকেন্ডেই লগইন হয়ে যাবে!
              </p>
            </div>

            {customerLoginError && (
              <div className="bg-red-50 text-red-800 text-xs px-3 py-2.5 rounded-sm border border-red-100 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                {customerLoginError}
              </div>
            )}

            <form onSubmit={handleCustomerLoginSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block text-left">আপনার জিমেইল/ইমেইল (Your Gmail/Email)</label>
                <input 
                  type="email"
                  required
                  placeholder="যেমন: customer@gmail.com"
                  value={tempCustomerEmail}
                  onChange={(e) => setTempCustomerEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-sm px-3.5 py-2.5 text-sm focus:outline-hidden focus:border-red-900 focus:ring-1 focus:ring-red-900"
                />
              </div>

              <button
                id="customer-login-submit-btn"
                type="submit"
                className="w-full bg-[#8A1C14] hover:bg-[#4A0E17] text-white font-medium py-3 text-xs tracking-widest uppercase rounded-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 text-amber-300" />
                লগইন এবং অর্ডার সম্পন্ন করুন
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
