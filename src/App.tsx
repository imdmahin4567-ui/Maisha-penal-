/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import AarongStorefront from './components/AarongStorefront';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { Product, AppSettings } from './types';
import { RefreshCw, ShieldCheck } from 'lucide-react';

const DEFAULT_SETTINGS: AppSettings = {
  siteName: "Borkha House Bangladesh | শালীনতা ও আভিজাত্য",
  logoText: "BORKHA HOUSE",
  aboutText: "বোরখা  হাউজ বাংলাদেশ - আপনার শালীন পোশাক ও আভিজাত্যের বিশ্বস্ত পোশাক সঙ্গী।",
  contactEmail: "orders@borkhahouse.com",
  contactPhone: "+880 1789-555666",
  brandColors: {
    primary: "#4A0E17",
    accent: "#8A1C14",
    bgLight: "#FDFBF7",
    textDark: "#1A1818"
  },
  heroSlides: []
};

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  // App routing and sessions
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminMode, setAdminMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Cart Management
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);

  // Initial loading indicators
  const [appIsBooting, setAppIsBooting] = useState(true);

  // Fetch initial storefront content from backend APIs
  const loadStoreContent = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/settings')
      ]);

      if (pRes.ok) setProducts(await pRes.ok ? await pRes.json() : []);
      if (sRes.ok) setSettings(await sRes.ok ? await sRes.json() : DEFAULT_SETTINGS);
    } catch (e) {
      console.error("Failed loading backend content:", e);
    } finally {
      setAppIsBooting(false);
    }
  };

  useEffect(() => {
    loadStoreContent();
    
    // Check local session validation if stored
    const storedToken = sessionStorage.getItem('aarong_admin_token');
    const storedUser = sessionStorage.getItem('aarong_admin_user');
    
    if (storedToken && storedUser) {
      setAuthToken(storedToken);
      setAdminUsername(storedUser);
      setIsAuthenticated(true);
      setAdminMode(true); // default to logged-in workspace for ease of control
    }

    // Load persistent checkout items
    const savedCart = localStorage.getItem('aarong_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {}
    }
  }, []);

  // Save cart modifications to localStorage
  useEffect(() => {
    localStorage.setItem('aarong_cart', JSON.stringify(cart));
  }, [cart]);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Auth Operations
  const handleLoginSuccess = (token: string, username: string) => {
    setAuthToken(token);
    setAdminUsername(username);
    setIsAuthenticated(true);
    setShowLoginModal(false);
    setAdminMode(true);

    // Save dynamic session
    sessionStorage.setItem('aarong_admin_token', token);
    sessionStorage.setItem('aarong_admin_user', username);
  };

  const handleLogout = async () => {
    if (authToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': authToken }
        });
      } catch (e) {}
    }

    // Clear session state
    setAuthToken(null);
    setAdminUsername('');
    setIsAuthenticated(false);
    setAdminMode(false);
    sessionStorage.removeItem('aarong_admin_token');
    sessionStorage.removeItem('aarong_admin_user');
  };

  if (appIsBooting) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center font-sans space-y-4">
        <div className="w-12 h-12 border-4 border-[#8A1C14]/25 border-t-[#8A1C14] rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <span className="font-serif font-extrabold text-[#4A0E17] text-2xl tracking-widest block">BORKHA HOUSE</span>
          <span className="text-[10px] text-stone-400 font-mono tracking-widest uppercase">শালীনতা ও প্রিমিয়াম আভিজাত্য লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {adminMode && isAuthenticated && authToken ? (
        /* Render full administrative workspace */
        <AdminDashboard 
          token={authToken}
          username={adminUsername}
          onLogout={handleLogout}
          products={products}
          onReloadProducts={loadStoreContent}
          settings={settings}
          onSettingsSaved={(updated) => setSettings(updated)}
        />
      ) : (
        /* Render public storefront clone of aarong-bgd */
        <AarongStorefront 
          products={products}
          settings={settings}
          onOpenAdmin={() => {
            if (isAuthenticated) {
              setAdminMode(true);
            } else {
              setShowLoginModal(true);
            }
          }}
          cart={cart}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onUpdateCartQty={handleUpdateCartQty}
        />
      )}

      {/* LOGIN MODAL OVERLAY */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <AdminLogin 
            onLoginSuccess={handleLoginSuccess}
            onClose={() => setShowLoginModal(false)}
          />
        </div>
      )}
    </div>
  );
}
