/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, LayoutDashboard, ShoppingCart, ShieldAlert, Database, 
  Settings, LogOut, PlusCircle, Trash2, Edit2, Download, RefreshCw, 
  Check, X, Eye, EyeOff, Save, Trash, Bell, AlertCircle, FileText, Globe, KeyRound,
  Upload, AlertTriangle, Image
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend, BarChart, Bar, CartesianGrid
} from 'recharts';
import { Product, AppSettings, UserActivityLog, LiveNotification, BackupItem } from '../types';

interface AdminDashboardProps {
  token: string;
  username: string;
  onLogout: () => void;
  products: Product[];
  onReloadProducts: () => void;
  settings: AppSettings;
  onSettingsSaved: (updated: AppSettings) => void;
}

export default function AdminDashboard({
  token,
  username,
  onLogout,
  products,
  onReloadProducts,
  settings,
  onSettingsSaved
}: AdminDashboardProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'settings' | 'security' | 'backups'>('dashboard');

  // Summary statistics state
  const [summary, setSummary] = useState<any>({
    productsCount: 0,
    stockWarnings: 0,
    logsCount: 0,
    readNotifications: 0,
    salesByCategory: [],
    brandShare: [],
    salesTrend: []
  });

  // Notifications
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([]);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Manage Products Sub-states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category: 'Women',
    brand: 'Aarong' as any,
    image: '',
    sizes: 'Free Size',
    colors: 'Gold',
    featured: false
  });

  // Manage Settings Editor Sub-states
  const [settingsForm, setSettingsForm] = useState<AppSettings>({ ...settings });

  // Security config state
  const [securitySettings, setSecuritySettings] = useState({
    is2faEnabled: true,
    newPassword: '',
    confirmPassword: ''
  });

  // Search/Filters in Admin Product list
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCatFilter, setAdminCatFilter] = useState('All');
  const [adminBrandFilter, setAdminBrandFilter] = useState('All');

  // Logs filters
  const [logStatusFilter, setLogStatusFilter] = useState('All');
  const [logSearch, setLogSearch] = useState('');

  // Status/Alert Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Load Dash summary metrics
  const fetchSummaryAndState = async () => {
    try {
      setIsLoading(true);
      const [sumRes, notifRes, logsRes, backupRes] = await Promise.all([
        fetch('/api/dashboard/summary', { headers: { 'Authorization': token } }),
        fetch('/api/notifications', { headers: { 'Authorization': token } }),
        fetch('/api/logs', { headers: { 'Authorization': token } }),
        fetch('/api/backups', { headers: { 'Authorization': token } })
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (notifRes.ok) setNotifications(await notifRes.json());
      if (logsRes.ok) setActivityLogs(await logsRes.json());
      if (backupRes.ok) setBackups(await backupRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryAndState();
    // Load security settings
    fetch('/api/auth/security-settings', { headers: { 'Authorization': token } })
      .then(r => r.json())
      .then(data => {
        setSecuritySettings(prev => ({
          ...prev,
          is2faEnabled: data.is2faEnabled
        }));
      });
  }, [activeTab]);

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, message: msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  // 1. Manage settings configuration updates
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(settingsForm)
      });
      if (res.ok) {
        const data = await res.json();
        onSettingsSaved(data);
        showFeedback('success', "Branding configs and background settings saved successfully!");
      } else {
        throw new Error();
      }
    } catch (err) {
      showFeedback('error', "Failed to write branding settings to backend database.");
    }
  };

  // Modify individual slides
  const handleSlideChange = (index: number, field: string, value: string) => {
    const updatedSlides = [...settingsForm.heroSlides];
    updatedSlides[index] = {
      ...updatedSlides[index],
      [field]: value
    };
    setSettingsForm(prev => ({ ...prev, heroSlides: updatedSlides }));
  };

  // 2. Manage dynamic products save/updates
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const payload = {
        title: prodForm.title,
        description: prodForm.description,
        price: parseFloat(prodForm.price),
        stock: parseInt(prodForm.stock),
        category: prodForm.category,
        brand: prodForm.brand,
        image: prodForm.image,
        sizes: prodForm.sizes.split(',').map(s => s.trim()),
        colors: prodForm.colors.split(',').map(c => c.trim()),
        featured: prodForm.featured
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showFeedback('success', editingProduct ? `Product "${prodForm.title}" modified!` : `Product "${prodForm.title}" added to inventory!`);
        setIsProductModalOpen(false);
        setEditingProduct(null);
        onReloadProducts();
        fetchSummaryAndState();
      } else {
        const err = await res.json();
        throw new Error(err.error);
      }
    } catch (e: any) {
      showFeedback('error', e.message || "Product operation validation failed.");
    }
  };

  const handleEditProductClick = (prod: Product) => {
    setEditingProduct(prod);
    setProdForm({
      title: prod.title,
      description: prod.description || '',
      price: prod.price.toString(),
      stock: prod.stock.toString(),
      category: prod.category,
      brand: prod.brand,
      image: prod.image,
      sizes: prod.sizes?.join(', ') || 'Free Size',
      colors: prod.colors?.join(', ') || 'Gold',
      featured: prod.featured || false
    });
    setIsProductModalOpen(true);
  };

  const handleDeleteProductClick = async (id: string, title: string) => {
    if (!confirm(`Are you absolutely sure you want to delete ${title}?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });
      if (res.ok) {
        showFeedback('success', `Product "${title}" removed.`);
        onReloadProducts();
        fetchSummaryAndState();
      }
    } catch (err) {
      showFeedback('error', "Deletion pipeline error.");
    }
  };

  const handleCreateProductClick = () => {
    setEditingProduct(null);
    setProdForm({
      title: '',
      description: '',
      price: '',
      stock: '',
      category: 'Women',
      brand: 'Aarong',
      image: '',
      sizes: 'S, M, L, XL',
      colors: 'Mustard, Ivory',
      featured: false
    });
    setIsProductModalOpen(true);
  };

  // 3. Security Config modifications
  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securitySettings.newPassword && securitySettings.newPassword !== securitySettings.confirmPassword) {
      showFeedback('error', "New passwords matching mismatch.");
      return;
    }

    try {
      const res = await fetch('/api/auth/security-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          is2faEnabled: securitySettings.is2faEnabled,
          newPassword: securitySettings.newPassword || undefined
        })
      });

      if (res.ok) {
        showFeedback('success', "Security policies and admin password updated.");
        setSecuritySettings(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
      }
    } catch (err) {
      showFeedback('error', "Security update rejected.");
    }
  };

  // 4. Backups trigger
  const handleTriggerBackup = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/backups/create', {
        method: 'POST',
        headers: { 'Authorization': token }
      });
      if (res.ok) {
        showFeedback('success', "Database backup dump generated successfully.");
        fetchSummaryAndState();
      }
    } catch (e) {
      showFeedback('error', "Backup stream failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear security activity logs
  const handleClearLogs = async () => {
    if (!confirm("Flush the audit trial logs database? This is an irreversible security override.")) return;
    try {
      const res = await fetch('/api/logs', {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });
      if (res.ok) {
        showFeedback('success', "Security audit logs successfully archived/cleared.");
        fetchSummaryAndState();
      }
    } catch (e) {
      showFeedback('error', "Logs flush protocol failed.");
    }
  };

  // Mark all notifications as read
  const handleMarkNotificationsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read', {
        method: 'PUT',
        headers: { 'Authorization': token }
      });
      if (res.ok) {
        fetchSummaryAndState();
      }
    } catch (e) {}
  };

  // Filter products list for admin display
  const adminFilteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(adminSearch.toLowerCase()) || p.id.toLowerCase().includes(adminSearch.toLowerCase());
    const matchesCat = adminCatFilter === 'All' || p.category === adminCatFilter;
    const matchesBrand = adminBrandFilter === 'All' || p.brand === adminBrandFilter;
    return matchesSearch && matchesCat && matchesBrand;
  });

  // Filter logs
  const filteredLogs = activityLogs.filter(l => {
    const matchesStatus = logStatusFilter === 'All' || l.status === logStatusFilter;
    const matchesSearch = l.action.toLowerCase().includes(logSearch.toLowerCase()) || 
                          l.username.toLowerCase().includes(logSearch.toLowerCase()) ||
                          l.details.toLowerCase().includes(logSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const CATEGORY_COLORS = ['#f15a22', '#6c122f', '#D97706', '#059669', '#2563EB', '#7C3AED'];
  const BRAND_COLORS = {
    'Aarong': '#f15a22',
    'Taaga': '#D97706',
    'Taaga Man': '#2563EB',
    'Herstory': '#6c122f'
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans flex text-neutral-800">
      
      {/* LEFT STATIC SYSTEM DRAWER SIDEBAR */}
      <aside className="w-64 bg-neutral-900 text-neutral-400 flex flex-col justify-between shrink-0 hidden md:flex border-r border-stone-800">
        <div>
          <div className="p-6 border-b border-stone-800 flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="text-white font-serif font-extrabold text-lg tracking-wider block">BORKHA HOUSE CONTROL</span>
              <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">Admin Operator Tunnel</span>
            </div>
          </div>

          <div className="p-4 space-y-1">
            <button 
              id="sidebar-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xs text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-[#f15a22] text-white' : 'hover:bg-stone-800 hover:text-white'}`}
            >
              <LayoutDashboard className="w-4.5 h-4.5" />
              Dynamic Terminal
            </button>
            <button 
              id="sidebar-tab-products"
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xs text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'products' ? 'bg-[#f15a22] text-white' : 'hover:bg-stone-800 hover:text-white'}`}
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              Product Catalog ({products.length})
            </button>
            <button 
              id="sidebar-tab-settings"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xs text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-[#f15a22] text-white' : 'hover:bg-stone-800 hover:text-white'}`}
            >
              <Settings className="w-4.5 h-4.5" />
              Brand Customizer
            </button>
            <button 
              id="sidebar-tab-security"
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xs text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'security' ? 'bg-[#f15a22] text-white' : 'hover:bg-stone-800 hover:text-white'}`}
            >
              <KeyRound className="w-4.5 h-4.5" />
              Security & Logs
            </button>
            <button 
              id="sidebar-tab-backups"
              onClick={() => setActiveTab('backups')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xs text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'backups' ? 'bg-[#f15a22] text-white' : 'hover:bg-stone-800 hover:text-white'}`}
            >
              <Database className="w-4.5 h-4.5" />
              Backups Storage
            </button>
          </div>
        </div>

        {/* User profile state */}
        <div className="p-4 border-t border-stone-800">
          <div className="bg-stone-850 p-3.5 rounded-sm space-y-3">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-amber-600/15 text-amber-500 font-bold flex items-center justify-center font-serif">
                {username.substring(0,2).toUpperCase()}
              </div>
              <div>
                <span className="text-white text-xs font-bold font-mono tracking-wide block">{username} (Root)</span>
                <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-1 leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Session
                </span>
              </div>
            </div>

            <button 
              id="admin-logout-btn-sidebar"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 bg-stone-800 hover:bg-rose-600 hover:text-white text-stone-300 py-2 rounded-xs text-[11px] font-bold tracking-wider uppercase transition-colors pointer-cursor cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Secure Sign-Out
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT DISPLAY TERMINAL AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOP STATUS HEADER BAR */}
        <header className="sticky top-0 bg-white border-b border-stone-200 h-16 px-6 md:px-8 flex justify-between items-center shrink-0 z-30">
          
          {/* Burger replacement/Mobile view selectors */}
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-serif text-neutral-900 font-extrabold tracking-tight capitalize">
              {activeTab} Management Portal
            </h2>
            <button 
              id="admin-dashboard-sync-btn"
              onClick={fetchSummaryAndState} 
              className="p-1.5 bg-stone-50 hover:bg-stone-100 rounded-sm hover:text-[#f15a22] transition-colors cursor-pointer"
              title="Reload dynamic metrics"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Live alerts / Simulated Notification Box */}
            <div className="relative group">
              <button 
                id="admin-notif-btn"
                onClick={handleMarkNotificationsRead}
                className="p-2 bg-stone-50 hover:bg-stone-100 rounded-full text-stone-600 hover:text-orange-600 transition-colors relative cursor-pointer"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping-soft" />
                )}
              </button>
              
              {/* Notifications Dropdown Panel (visible on hover) */}
              <div className="absolute right-0 mt-2 bg-white w-80 rounded-md shadow-2xl border border-stone-200 hidden group-hover:block p-4 space-y-3 z-40 max-h-[350px] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                  <span className="text-xs font-bold text-neutral-900 font-mono uppercase tracking-wide">Live Security Signals ({notifications.length})</span>
                  <button 
                    id="clear-notif-dropdown"
                    onClick={handleMarkNotificationsRead} 
                    className="text-[10px] text-[#f15a22] hover:underline font-bold"
                  >
                    Clear markers
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <span className="text-[11px] text-stone-400 block p-8 text-center">No alerts logged. Secure parameters.</span>
                ) : (
                  <div className="space-y-2.5">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`p-2.5 rounded-sm text-[11px] leading-relaxed border flex gap-2 ${notif.type === 'ALERT' ? 'bg-rose-50 text-rose-800 border-rose-100' : 'bg-stone-50 text-stone-700 border-stone-100'}`}>
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                        <div>
                          <p>{notif.message}</p>
                          <span className="text-[9px] text-stone-400 block mt-1 font-mono">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile layout selectors */}
            <div className="md:hidden flex gap-2">
              <select 
                id="admin-mobile-tab-selector"
                value={activeTab} 
                onChange={(e) => setActiveTab(e.target.value as any)}
                className="bg-stone-50 text-neutral-800 font-bold border border-stone-200 px-2.5 py-1 rounded-sm text-xs"
              >
                <option value="dashboard">Terminal</option>
                <option value="products">Catalog</option>
                <option value="settings">Branding</option>
                <option value="security">Security</option>
                <option value="backups">Backups</option>
              </select>
              <button 
                id="admin-logout-btn-header"
                onClick={onLogout} 
                className="bg-stone-900 text-white p-2 rounded-sm text-xs font-bold leading-none"
              >
                Out
              </button>
            </div>
          </div>
        </header>

        {/* FEEDBACK PROMPTS */}
        {feedback && (
          <div className={`m-6 p-4 rounded-xs border text-xs font-bold flex gap-2 animate-fade-in ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
            <Check className="w-4 h-4" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* CORE VIEWS CORNER (DYNAMIC BASED ON TAB) */}
        <div className="p-6 md:p-8 flex-1 space-y-8">
          
          {/* TAB 1: DASHBOARD METRICS AND CHARTS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* TOP STATS CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-white rounded-md p-5 border border-stone-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest block mb-1">Total Products</span>
                    <span className="text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">{summary.productsCount}</span>
                  </div>
                  <div className="w-11 h-11 bg-orange-500/10 text-orange-600 rounded-md flex items-center justify-center">
                    <ShoppingCart className="w-5.5 h-5.5" />
                  </div>
                </div>

                <div className="bg-white rounded-md p-5 border border-stone-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest block mb-1">Stock Warnings</span>
                    <span className="text-3xl font-extrabold text-red-600 font-mono tracking-tight">{summary.stockWarnings}</span>
                  </div>
                  <div className="w-11 h-11 bg-rose-500/10 text-rose-500 rounded-md flex items-center justify-center">
                    <ShieldAlert className="w-5.5 h-5.5" animate-pulse />
                  </div>
                </div>

                <div className="bg-white rounded-md p-5 border border-stone-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest block mb-1">Audit Trails Count</span>
                    <span className="text-3xl font-extrabold text-[#6c122f] font-mono tracking-tight">{activityLogs.length}</span>
                  </div>
                  <div className="w-11 h-11 bg-slate-500/10 text-[#6c122f] rounded-md flex items-center justify-center">
                    <FileText className="w-5.5 h-5.5" />
                  </div>
                </div>

                <div className="bg-white rounded-md p-5 border border-stone-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest block mb-1">Security 2FA</span>
                    <span className="text-sm font-extrabold tracking-wider uppercase font-mono px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block mt-2">
                      Enabled
                    </span>
                  </div>
                  <div className="w-11 h-11 bg-emerald-500/10 text-emerald-600 rounded-md flex items-center justify-center">
                    <Check className="w-5.5 h-5.5" />
                  </div>
                </div>

              </div>

              {/* RECHARTS CHIEF GRAPHS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Sale Trend spline chart */}
                <div className="bg-white rounded-md p-5 border border-stone-200 shadow-xs lg:col-span-2 space-y-4">
                  <h3 className="text-sm font-bold font-mono text-stone-500 uppercase tracking-wider">Simulated Enterprise Sales Trend &orders (BDT)</h3>
                  <div className="h-68">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={summary.salesTrend}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f15a22" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#f15a22" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                        <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} tickFormatter={(v)=>`${(v/1000)}k`} />
                        <Tooltip formatter={(v: any)=>`৳${Number(v).toLocaleString('en-IN')}`} />
                        <Area type="monotone" dataKey="amount" stroke="#f15a22" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" name="Sales Revenue" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Brands shares Pie chart */}
                <div className="bg-white rounded-md p-5 border border-stone-200 shadow-xs space-y-4 flex flex-col justify-between">
                  <h3 className="text-sm font-bold font-mono text-stone-500 uppercase tracking-wider">Dynamic Products Share by Brand</h3>
                  <div className="h-44 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={summary.brandShare}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {summary.brandShare.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={BRAND_COLORS[entry.name as keyof typeof BRAND_COLORS] || '#231F20'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold text-stone-500">
                    {summary.brandShare.map((entry: any, i: number)=>(
                      <div key={i} className="flex items-center gap-1.5 uppercase leading-none">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BRAND_COLORS[entry.name as keyof typeof BRAND_COLORS] || '#231F20' }} />
                        <span>{entry.name} ({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* SECOND ARRAYS GRAPHS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Sales distribution by category BarChart */}
                <div className="bg-white rounded-md p-5 border border-stone-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold font-mono text-stone-500 uppercase tracking-wider">Sales capital allocations by Catalog Category</h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={summary.salesByCategory}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                        <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} tickFormatter={(v)=>`৳${(v/1000)}k`} />
                        <Tooltip formatter={(v: any)=>`৳${Number(v).toLocaleString('en-IN')}`} />
                        <Bar dataKey="value" fill="#6c122f" radius={[4, 4, 0, 0]} name="Inherent Value" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Secure Action links */}
                <div className="bg-white rounded-md p-5 border border-[#6c122f]/30 shadow-xs flex flex-col justify-between space-y-4" style={{ borderLeft: '4px solid #6c122f' }}>
                  <div className="space-y-2">
                    <h3 className="font-serif font-extrabold text-base text-neutral-900">Enterprise Excel & CSV Streams Exports</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed font-light">
                      Export your entire handcrafted product catalog databases, historical activity operators log files, and stock metrics instantly in Excel-ready CSV format securely for compliance audits.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <a 
                      id="export-products-csv-link"
                      href="/api/export/csv/products" 
                      className="bg-stone-100 hover:bg-[#f15a22] hover:text-white text-stone-700 py-3 rounded-xs text-xs font-bold font-mono uppercase transition-colors tracking-wider text-center flex items-center justify-center gap-1.5 border border-stone-200"
                    >
                      <Download className="w-3.5 h-3.5" /> Items Inventory (CSV)
                    </a>
                    <a 
                      id="export-logs-csv-link"
                      href="/api/export/csv/logs" 
                      className="bg-stone-100 hover:bg-[#f15a22] hover:text-white text-stone-700 py-3 rounded-xs text-xs font-bold font-mono uppercase transition-colors tracking-wider text-center flex items-center justify-center gap-1.5 border border-stone-200"
                    >
                      <Download className="w-3.5 h-3.5" /> Security Logs (CSV)
                    </a>
                  </div>

                  <div className="bg-[#FAF8F5] rounded-xs p-3 border border-stone-100 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-[10px] text-stone-500 font-mono tracking-tighter">Backup database dump before downloading exports sheets.</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: INVENTORY PRODUCT MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-5 rounded-md border border-stone-200 shadow-xs">
                
                {/* Search elements */}
                <div className="w-full sm:w-80 relative">
                  <input 
                    id="admin-inventory-search"
                    type="text"
                    required
                    placeholder="Search product title, ID..."
                    value={adminSearch}
                    onChange={(e)=>setAdminSearch(e.target.value)}
                    className="w-full bg-stone-50 text-neutral-900 border border-stone-200 rounded-xs text-xs pl-8 pr-3 py-2.5 focus:outline-hidden focus:border-[#f15a22]"
                  />
                  <LayoutDashboard className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3.5" />
                </div>

                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
                  
                  {/* Category filters */}
                  <select 
                    id="admin-filter-cat-select"
                    value={adminCatFilter}
                    onChange={(e)=>setAdminCatFilter(e.target.value)}
                    className="bg-stone-50 text-xs text-stone-700 font-bold border border-stone-200 px-3 py-2 rounded-xs"
                  >
                    <option value="All">All Categories</option>
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Kids">Kids</option>
                    <option value="Home Decor">Home Decor</option>
                    <option value="Jewellery">Jewellery</option>
                  </select>

                  {/* Brand filters */}
                  <select 
                    id="admin-filter-brand-select"
                    value={adminBrandFilter}
                    onChange={(e)=>setAdminBrandFilter(e.target.value)}
                    className="bg-stone-50 text-xs text-stone-700 font-bold border border-stone-200 px-3 py-2 rounded-xs"
                  >
                    <option value="All">All Collections</option>
                    <option value="Dubai Elegance">Dubai Elegance</option>
                    <option value="Borkha House Signature">Borkha House Signature</option>
                    <option value="Anatolia Modest">Anatolia Modest</option>
                    <option value="Habiba Hijabs">Habiba Hijabs</option>
                  </select>

                  <button 
                    id="add-new-product-btn"
                    onClick={handleCreateProductClick}
                    className="bg-neutral-900 hover:bg-rose-900 text-white text-xs font-bold px-4 py-2 rounded-xs transition-colors select-none tracking-wider uppercase cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4 text-amber-400" /> Add Item
                  </button>

                </div>

              </div>

              {/* PRODUCTS LIST TABLE */}
              <div className="bg-white rounded-md border border-stone-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-medium">
                    <thead className="bg-[#FAF8F5] text-stone-500 font-bold border-b border-stone-200 text-[10px] uppercase tracking-wider font-mono">
                      <tr>
                        <th className="px-6 py-4">Image / Item title</th>
                        <th className="px-6 py-4">Brand</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">BDT Price</th>
                        <th className="px-6 py-4">Remaining stock</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {adminFilteredProducts.map(p=>(
                        <tr id={`admin-product-row-${p.id}`} key={p.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="px-6 py-4.5 flex items-center gap-4.5 font-sans">
                            <img 
                              src={p.image} 
                              alt={p.title} 
                              className="w-10 h-12 object-cover rounded-sm border border-stone-200 shrink-0" 
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className="font-serif font-bold text-sm text-neutral-900 block">{p.title}</span>
                              <span className="text-[10px] text-stone-400 font-mono tracking-tight font-light">{p.id} &bull; Ratings {p.ratings||4.5}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4.5 font-semibold text-[#6c122f]">{p.brand}</td>
                          <td className="px-6 py-4.5">
                            <span className="bg-stone-100 text-stone-700 font-bold px-2 py-0.5 rounded-sm text-[10px] uppercase font-mono">
                              {p.category}
                            </span>
                          </td>
                          <td className="px-6 py-4.5 font-bold font-serif text-sm">৳{p.price.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4.5">
                            <span className={`font-mono text-sm font-bold ${p.stock < 10 ? 'text-rose-500' : 'text-neutral-700'}`}>
                              {p.stock} units
                            </span>
                          </td>
                          <td className="px-6 py-4.5 text-right space-x-2 shrink-0">
                            <button 
                              id={`admin-btn-edit-${p.id}`}
                              onClick={()=>handleEditProductClick(p)}
                              className="bg-stone-55 hover:bg-neutral-900 hover:text-white text-stone-700 p-2 border border-stone-200 transition-all rounded-sm cursor-pointer"
                              title="Edit item configs"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              id={`admin-btn-delete-${p.id}`}
                              onClick={()=>handleDeleteProductClick(p.id, p.title)}
                              className="bg-stone-55 hover:bg-rose-600 hover:text-white text-stone-700 p-2 border border-stone-200 transition-all rounded-sm cursor-pointer"
                              title="Delete item permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: CUSTOM BRAND EDITORS */}
          {activeTab === 'settings' && (
            <form id="admin-settings-form" onSubmit={handleSettingsSubmit} className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-md border border-stone-200 shadow-xs p-6 space-y-6">
                <h3 className="text-lg font-serif font-bold text-neutral-900 border-b border-stone-100 pb-3">
                  Borkha House Live Customizer (ব্রব্যান্ড কাস্টমাইজেশন)
                </h3>

                {/* Company Logo PNG Upload container */}
                <div className="space-y-2 bg-stone-50 border border-dashed border-stone-250 p-4 rounded-md">
                  <label className="text-xs font-bold uppercase tracking-wider text-rose-850 block font-mono">কোম্পানির লোগো আপলোড (Upload Company Logo PNG)</label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {settingsForm.logoImage ? (
                      <div className="relative group shrink-0">
                        <img 
                          src={settingsForm.logoImage} 
                          alt="Uploaded Logo preview" 
                          className="h-16 w-32 object-contain bg-neutral-900 p-2 rounded-xs border border-stone-200" 
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setSettingsForm(prev => ({ ...prev, logoImage: '' }))}
                          className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-xs hover:scale-105 transition-all cursor-pointer"
                          title="Remove Logo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-16 w-36 bg-stone-100 border border-stone-200 rounded-xs flex items-center justify-center text-[10px] text-stone-400 font-mono text-center">
                        কোন লোগো সিলেক্ট করা নেই
                      </div>
                    )}
                    
                    <div className="flex-1 w-full text-left">
                      <label className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-rose-900 text-white text-[11px] font-bold tracking-wider uppercase px-4 py-2.5 rounded-xs transition-colors cursor-pointer select-none">
                        <Upload className="w-4 h-4 text-amber-400" />
                        PNG লোগো আপলোড করুন
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg" 
                          className="hidden" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = async () => {
                                const base64Data = reader.result as string;
                                try {
                                  const res = await fetch('/api/upload', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': token
                                    },
                                    body: JSON.stringify({ file: base64Data, filename: file.name })
                                  });
                                  if (res.ok) {
                                    const data = await res.json();
                                    setSettingsForm(prev => ({ ...prev, logoImage: data.url }));
                                    setFeedback({ type: 'success', message: 'কোম্পানি লোগো ছবি সফলভাবে সার্ভারে আপলোড হয়েছে!' });
                                  } else {
                                    const data = await res.json();
                                    alert(data.error || 'আপলোড ব্যর্থ হয়েছে।');
                                  }
                                } catch (err) {
                                  console.error(err);
                                  alert('সার্ভার যোগাযোগ ট্রাবলশুট হয়েছে।');
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <p className="text-[10px] text-neutral-400 mt-1.5 leading-relaxed font-mono">
                        সুপারিশকৃত: স্বচ্ছ ব্যাকগ্রাউন্ডসম্পন্ন PNG ফরমেট (উচ্চতা ৪০px - ৬০px)। এটি হেডার ও ফুটারে লাইভ আপডেট হবে।
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">App Browser siteTitle</label>
                    <input 
                      id="settings-sitename-input"
                      type="text"
                      required
                      value={settingsForm.siteName}
                      onChange={(e)=>setSettingsForm(prev=>({...prev, siteName: e.target.value}))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xs text-xs px-3 py-2.5"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-rose-800 block font-mono font-bold">Borkha House Header logoText</label>
                    <input 
                      id="settings-logotext-input"
                      type="text"
                      required
                      value={settingsForm.logoText}
                      onChange={(e)=>setSettingsForm(prev=>({...prev, logoText: e.target.value}))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xs text-xs px-3 py-2.5 font-semibold font-serif text-lg tracking-widest text-[#8A1C14]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Borkha House Boutique Brand About Details</label>
                    <textarea 
                      id="settings-abouttext-input"
                      rows={2}
                      required
                      value={settingsForm.aboutText}
                      onChange={(e)=>setSettingsForm(prev=>({...prev, aboutText: e.target.value}))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xs text-xs px-3 py-2.5"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Support Service Email Address</label>
                    <input 
                      id="settings-email-input"
                      type="email"
                      required
                      value={settingsForm.contactEmail}
                      onChange={(e)=>setSettingsForm(prev=>({...prev, contactEmail: e.target.value}))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xs text-xs px-3 py-2.5"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Helpline Phone Call Centre</label>
                    <input 
                      id="settings-phone-input"
                      type="text"
                      required
                      value={settingsForm.contactPhone}
                      onChange={(e)=>setSettingsForm(prev=>({...prev, contactPhone: e.target.value}))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xs text-xs px-3 py-2.5"
                    />
                  </div>

                </div>
              </div>

              {/* LIVE BRAND SLIDESHOW CUSTOMIZER */}
              <div className="bg-white rounded-md border border-stone-200 shadow-xs p-6 space-y-6">
                <h3 className="text-lg font-serif font-bold text-neutral-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                  <Database className="w-4.5 h-4.5 text-[#f15a22]" /> Live Carousel Slideshow Modals
                </h3>

                <div className="space-y-6">
                  {settingsForm.heroSlides.map((slide, sIdx)=>(
                    <div id={`slide-editor-row-${slide.id}`} key={slide.id} className="p-4 bg-stone-50 rounded-xs border border-stone-200 relative grid grid-cols-1 md:grid-cols-3 gap-4">
                      <span className="absolute -top-2.5 left-4 bg-neutral-900 text-white text-[9px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
                        Active Slide Banner {sIdx + 1}
                      </span>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block">Cover Media Url</label>
                        <input
                          type="text"
                          required
                          value={slide.image}
                          onChange={(e)=>handleSlideChange(sIdx, 'image', e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xs text-xs px-2.5 py-2"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block">Bold Display Heading</label>
                        <input
                          type="text"
                          required
                          value={slide.title}
                          onChange={(e)=>handleSlideChange(sIdx, 'title', e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xs text-xs px-2.5 py-2 font-serif font-bold text-neutral-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block">Slide Subtitle description</label>
                        <input
                          type="text"
                          required
                          value={slide.subtitle}
                          onChange={(e)=>handleSlideChange(sIdx, 'subtitle', e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xs text-xs px-2.5 py-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  id="settings-save-button"
                  type="submit"
                  className="bg-neutral-900 hover:bg-[#f15a22] text-white text-xs font-bold px-6 py-3 tracking-widest uppercase rounded-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save branding configuration
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: ENHANCED SECURITY & SYSTEM LOGS */}
          {activeTab === 'security' && (
            <div className="space-y-8 animate-fade-in">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 2FA controls dialog */}
                <form id="admin-security-settings-form" onSubmit={handleSecuritySubmit} className="bg-white rounded-md border border-stone-200 shadow-xs p-6 space-y-6">
                  <h3 className="text-lg font-serif font-bold text-neutral-900 border-b border-stone-100 pb-3 flex items-center gap-2">
                    <KeyRound className="w-4.5 h-4.5 text-[#f15a22]" /> Advanced Passkey & 2FA Enforcement
                  </h3>

                  <div className="bg-stone-50 rounded-xs p-4 border border-stone-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold block text-neutral-950">Secure Multi-stage Auth (2FA)</span>
                        <span className="text-[11px] text-stone-500 font-light block leading-relaxed max-w-xs mt-0.5">
                          Toggling 2FA forces all login cycles to verify standard 6-digit dynamic generated codes securely dispatched to local signals.
                        </span>
                      </div>
                      <button 
                        id="security-2fa-toggle-btn"
                        type="button"
                        onClick={()=>setSecuritySettings(prev=>({...prev, is2faEnabled: !prev.is2faEnabled}))}
                        className={`w-12 h-6.5 rounded-full transition-colors relative focus:outline-hidden ${securitySettings.is2faEnabled ? 'bg-emerald-600' : 'bg-neutral-300'}`}
                      >
                        <span className={`w-5 h-5 rounded-full bg-white absolute top-0.75 shadow-sm transition-all ${securitySettings.is2faEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Change Operator Access Password</label>
                      <input 
                        id="security-newpw-input"
                        type="password"
                        value={securitySettings.newPassword}
                        onChange={(e)=>setSecuritySettings(prev=>({...prev, newPassword: e.target.value}))}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xs text-xs px-3 py-2.5"
                        placeholder="Keep empty to leave password unchanged"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Confirm Password</label>
                      <input 
                        id="security-confirm-newpw-input"
                        type="password"
                        value={securitySettings.confirmPassword}
                        onChange={(e)=>setSecuritySettings(prev=>({...prev, confirmPassword: e.target.value}))}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xs text-xs px-3 py-2.5"
                        placeholder="Re-type password"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex justify-end">
                    <button 
                      id="security-settings-save-btn"
                      type="submit"
                      className="bg-neutral-900 hover:bg-[#f15a22] text-white text-xs font-bold px-4 py-2.5 tracking-wider uppercase rounded-sm transition-colors cursor-pointer"
                    >
                      Update Policies
                    </button>
                  </div>
                </form>

                {/* Secure Encryption Guidelines block */}
                <div className="bg-neutral-900 text-white rounded-md p-6 flex flex-col justify-between space-y-4 border border-stone-800">
                  <div className="space-y-3.5">
                    <span className="text-[10px] font-mono tracking-widest text-[#8A1C14] uppercase block">TLS / SHA-256 System Status</span>
                    <h3 className="font-serif font-extrabold text-xl text-stone-50">Local Full-Stack Hashing</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed font-light">
                      Borkha House's administrative vault utilizes standard Cryptographic routines:
                    </p>
                    <ul className="space-y-2.5 text-neutral-400 text-xs">
                      <li className="flex items-center gap-2 border-b border-stone-850 pb-2">
                        <Check className="w-4 h-4 text-emerald-500" /> Passwords hashed utilizing SHA-256 prior serialization.
                      </li>
                      <li className="flex items-center gap-2 border-b border-stone-850 pb-2">
                        <Check className="w-4 h-4 text-emerald-500" /> Database writes formatted using secure system JSON strings.
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500" /> Security handshakes simulated utilizing secure session cookies.
                      </li>
                    </ul>
                  </div>

                  <div className="bg-stone-850 rounded-xs p-3.5 border border-stone-800 leading-normal text-[10px] text-stone-400 font-mono flex items-center justify-between">
                    <span>SECURITY PARADIGM</span>
                    <span className="text-[#f15a22] font-semibold">AES COMMUNIQU&Eacute;</span>
                  </div>
                </div>

              </div>

              {/* AUDIT LOG OPERATORS TABLE */}
              <div className="space-y-4.5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-3">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-neutral-950">Systems Security Logs & Audit Trails</h3>
                    <p className="text-xs text-neutral-400 block mt-0.5 font-light">Comprehensive operators trial logging capturing timestamps, actions, and client indicators.</p>
                  </div>

                  <div className="flex gap-2">
                    <select 
                      id="log-status-filter-select"
                      value={logStatusFilter}
                      onChange={(e)=>setLogStatusFilter(e.target.value)}
                      className="bg-white border border-stone-200 text-xs text-stone-700 font-semibold px-2.5 py-1.5 rounded-sm"
                    >
                      <option value="All">All Status</option>
                      <option value="SUCCESS">SUCCESS</option>
                      <option value="FAILED">FAILED</option>
                      <option value="WARNING">WARNING</option>
                      <option value="INFO">INFO</option>
                    </select>

                    <button 
                      id="clear-logs-btn"
                      onClick={handleClearLogs}
                      className="bg-neutral-800 hover:bg-rose-600 text-white font-mono text-[10.5px] px-3.5 py-1.5 rounded-sm transition-all tracking-wider font-semibold cursor-pointer"
                    >
                      CLEAR AUDIT TRAILS
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-md border border-stone-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#FAF8F5] text-stone-500 font-bold border-b border-stone-200 text-[10px] uppercase font-mono">
                        <tr>
                          <th className="px-6 py-3.5">Timestamp</th>
                          <th className="px-6 py-3.5">Action Code</th>
                          <th className="px-6 py-3.5">Operator</th>
                          <th className="px-6 py-3.5">Client IP</th>
                          <th className="px-6 py-3.5">Status</th>
                          <th className="px-6 py-3.5">Trail Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-stone-600">
                        {filteredLogs.map(l => (
                          <tr id={`audit-log-row-${l.id}`} key={l.id} className="hover:bg-[#FAF8F5]/30 transition-colors">
                            <td className="px-6 py-3.5 text-stone-400 text-[11px] whitespace-nowrap">{new Date(l.timestamp).toLocaleString()}</td>
                            <td className="px-6 py-3.5 font-bold font-mono text-[11px] text-neutral-900 whitespace-nowrap">{l.action}</td>
                            <td className="px-6 py-3.5 whitespace-nowrap text-stone-700 font-semibold">{l.username}</td>
                            <td className="px-6 py-3.5 text-stone-400 whitespace-nowrap">{l.ipAddress}</td>
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider font-mono uppercase ${l.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : l.status === 'FAILED' ? 'bg-rose-100 text-rose-800' : l.status === 'WARNING' ? 'bg-rose-100 text-rose-700' : 'bg-blue-105 text-blue-900'}`}>
                                {l.status}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-[11px] pr-8 text-stone-500">{l.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: BACKUPS AND SYSTEM RECURSION */}
          {activeTab === 'backups' && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="bg-white rounded-md border border-stone-200 shadow-xs p-6 space-y-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="space-y-1">
                  <h3 className="font-serif font-extrabold text-lg text-neutral-950">Automated System Database Backups</h3>
                  <p className="text-xs text-neutral-400 max-w-lg leading-relaxed font-light">
                    Perform instant off-line storage backups. Securely archives dynamic handcrafted items, setting slides configurations, operator metadata, and audit logs.
                  </p>
                </div>

                <button 
                  id="trigger-backup-now-btn"
                  onClick={handleTriggerBackup}
                  disabled={isLoading}
                  className="bg-[#f15a22] hover:bg-neutral-900 text-white text-xs font-bold px-5 py-3 tracking-wider uppercase rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Generate System Backup
                </button>
              </div>

              {/* LIST BACKUPS DUMPS */}
              <div className="space-y-4">
                <div className="border-b border-stone-200 pb-2">
                  <h4 className="text-sm font-bold text-neutral-800 font-mono uppercase tracking-wider">Vault Backups Registry ({backups.length})</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {backups.length === 0 ? (
                    <div className="md:col-span-2 text-center py-20 bg-white border border-stone-100 text-stone-400 text-xs rounded-sm space-y-3">
                      <Database className="w-10 h-10 text-stone-300 mx-auto" />
                      <p>No system backups available. Click generating trigger button above.</p>
                    </div>
                  ) : (
                    backups.map(bkp=>(
                      <div id={`backup-registry-card-${bkp.id}`} key={bkp.id} className="bg-white rounded-md shadow-xs border border-stone-200 p-5 space-y-3.5 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-[#f15a22] font-mono tracking-widest font-bold uppercase block">SECURE DATABASE STAGE</span>
                            <span className="text-sm font-bold font-serif text-neutral-950 block mt-0.5 line-clamp-1">{bkp.filename}</span>
                            <span className="text-[10px] text-stone-400 font-mono mt-1 block">Created: {new Date(bkp.timestamp).toLocaleString()}</span>
                          </div>
                          <span className="bg-stone-100 text-neutral-800 font-bold px-2.5 py-1 rounded-sm text-[10px] font-mono border">
                            {bkp.size}
                          </span>
                        </div>

                        <div className="bg-stone-50 rounded-xs p-3.5 border border-stone-200 grid grid-cols-3 text-center text-xs font-mono">
                          <div>
                            <span className="text-stone-400 block text-[10px] uppercase font-bold">Products</span>
                            <span className="font-bold text-neutral-900">{bkp.recordsCount.products}</span>
                          </div>
                          <div className="border-x border-stone-200">
                            <span className="text-stone-400 block text-[10px] uppercase font-bold">Logs</span>
                            <span className="font-bold text-stone-900">{bkp.recordsCount.logs}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[10px] uppercase font-bold">Alerts</span>
                            <span className="font-bold text-stone-900">{bkp.recordsCount.notifications}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 text-center text-[10px] font-mono font-bold pt-2 border-t border-stone-100">
                          <span className="text-emerald-600 flex items-center gap-1 leading-none uppercase shrink-0">
                            <Check className="w-3.5 h-3.5 text-emerald-500" /> Integrity verified
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* DYNAMIC BACKDROP MODAL: ADD / EDIT PRODUCT */}
      {isProductModalOpen && (
        <div id="product-editor-modal-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
            
            <header className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-[#FAF8F5]">
              <h3 className="font-serif text-lg font-bold text-neutral-900">
                {editingProduct ? `Edit "${editingProduct.title}"` : 'Add New Handcrafted Product'}
              </h3>
              <button 
                id="close-product-editor-modal"
                onClick={() => {
                  setIsProductModalOpen(false);
                  setEditingProduct(null);
                }}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5.5 h-5.5" />
              </button>
            </header>

            <form id="product-editor-form" onSubmit={handleProductSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Item Display title</label>
                <input 
                  id="product-form-title-input"
                  type="text"
                  required
                  value={prodForm.title}
                  onChange={(e)=>setProdForm(prev=>({...prev, title: e.target.value}))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xs text-xs px-3 py-2.5"
                  placeholder="e.g. Traditional Rickshaw-Art Saree"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Brand catalog</label>
                  <select 
                    id="product-form-brand-select"
                    value={prodForm.brand}
                    onChange={(e)=>setProdForm(prev=>({...prev, brand: e.target.value as any}))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xs text-xs px-3 py-2.5"
                  >
                    <option value="Dubai Elegance">Dubai Elegance</option>
                    <option value="Borkha House Signature">Borkha House Signature</option>
                    <option value="Anatolia Modest">Anatolia Modest</option>
                    <option value="Habiba Hijabs">Habiba Hijabs</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Item Category</label>
                  <select 
                    id="product-form-cat-select"
                    value={prodForm.category}
                    onChange={(e)=>setProdForm(prev=>({...prev, category: e.target.value}))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xs text-xs px-3 py-2.5"
                  >
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Kids">Kids</option>
                    <option value="Home Decor">Home Decor</option>
                    <option value="Jewellery">Jewellery</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Price (BDT, ৳)</label>
                  <input 
                    id="product-form-price-input"
                    type="number"
                    required
                    min="1"
                    value={prodForm.price}
                    onChange={(e)=>setProdForm(prev=>({...prev, price: e.target.value}))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xs text-xs px-3 py-2.5 font-mono"
                    placeholder="e.g. 4500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Available inventory Stock UNITS</label>
                  <input 
                    id="product-form-stock-input"
                    type="number"
                    required
                    min="0"
                    value={prodForm.stock}
                    onChange={(e)=>setProdForm(prev=>({...prev, stock: e.target.value}))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xs text-xs px-3 py-2.5 font-mono"
                    placeholder="e.g. 15"
                  />
                </div>
              </div>

              <div className="space-y-2 bg-stone-50 border border-stone-200 p-4 rounded-xs">
                <div className="flex justify-between items-center pb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-rose-850 block font-mono">প্রোডাক্ট পিকচার আপলোড করুন (Direct PNG Picture Upload)</label>
                  <span className="text-[10px] text-zinc-400 font-mono">PNG / JPEG</span>
                </div>
                
                <div className="flex items-center gap-4">
                  {prodForm.image ? (
                    <div className="relative group shrink-0">
                      <img 
                        src={prodForm.image} 
                        alt="Product preview" 
                        className="h-14 w-14 rounded-xs object-cover border border-stone-250 bg-stone-100" 
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setProdForm(prev => ({ ...prev, image: '' }))}
                        className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 shadow-xs hover:scale-105 transition-all cursor-pointer"
                        title="Remove Image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-14 w-14 rounded-xs bg-stone-200 flex items-center justify-center text-[10px] text-stone-400 font-mono font-medium text-center">
                      কোন ছবি নেই
                    </div>
                  )}

                  <div className="flex-1 text-left space-y-2">
                    <div className="flex gap-2">
                      <label className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-rose-950 text-white text-[10px] sm:text-[11px] font-bold tracking-wider uppercase px-3.5 py-2 rounded-xs transition-colors cursor-pointer select-none">
                        <Upload className="w-3.5 h-3.5 text-amber-300" />
                        PNG ছবি সিলেক্ট করুন
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg" 
                          className="hidden" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = async () => {
                                const base64Data = reader.result as string;
                                try {
                                  const res = await fetch('/api/upload', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': token
                                    },
                                    body: JSON.stringify({ file: base64Data, filename: file.name })
                                  });
                                  if (res.ok) {
                                    const data = await res.json();
                                    setProdForm(prev => ({ ...prev, image: data.url }));
                                    setFeedback({ type: 'success', message: 'প্রোডাক্ট ছবি সফলভাবে আপলোড হয়েছে!' });
                                  } else {
                                    const data = await res.json();
                                    alert(data.error || 'আপলোড ব্যর্থ হয়েছে।');
                                  }
                                } catch (err) {
                                  console.error(err);
                                  alert('ছবি আপলোড করতে ত্রুটি দেখা দিয়েছে।');
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      <div className="text-stone-400 text-xs self-center">অথবা নিচে সরাসরি ইমেজ URL দিন:</div>
                    </div>
                  </div>
                </div>

                <input 
                  id="product-form-image-input"
                  type="text"
                  required
                  value={prodForm.image}
                  onChange={(e)=>setProdForm(prev=>({...prev, image: e.target.value}))}
                  className="w-full bg-white border border-stone-250 rounded-xs text-xs px-3 py-2 font-mono text-stone-700"
                  placeholder="যেমন: /uploads/image.png বা https://images.unsplash.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Sizes (Comma separated)</label>
                  <input 
                    id="product-form-sizes-input"
                    type="text"
                    required
                    value={prodForm.sizes}
                    onChange={(e)=>setProdForm(prev=>({...prev, sizes: e.target.value}))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xs text-xs px-3 py-2.5"
                    placeholder="S, M, L, XL"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Colors (Comma separated)</label>
                  <input 
                    id="product-form-colors-input"
                    type="text"
                    required
                    value={prodForm.colors}
                    onChange={(e)=>setProdForm(prev=>({...prev, colors: e.target.value}))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xs text-xs px-3 py-2.5"
                    placeholder="Ivory, Mustard Yellow"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Item Description</label>
                <textarea 
                  id="product-form-desc-input"
                  rows={3}
                  required
                  value={prodForm.description}
                  onChange={(e)=>setProdForm(prev=>({...prev, description: e.target.value}))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xs text-xs px-3 py-2.5"
                  placeholder="Details about traditional loom craftsmanship, materials and heritage details..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  id="product-form-featured-checkbox"
                  type="checkbox"
                  checked={prodForm.featured}
                  onChange={(e)=>setProdForm(prev=>({...prev, featured: e.target.checked}))}
                  className="accent-[#f15a22]"
                />
                <label className="text-xs font-semibold text-neutral-700">Display item as FEATURED HIGHLIGHT on carousel collections lists</label>
              </div>

              <div className="pt-4 border-t border-stone-100 flex gap-3">
                <button 
                  id="product-form-cancel-btn"
                  type="button"
                  onClick={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold py-3 uppercase border rounded-sm"
                >
                  Cancel
                </button>
                <button 
                  id="product-form-submit-btn"
                  type="submit"
                  className="flex-1 bg-neutral-900 hover:bg-[#f15a22] text-white text-xs font-bold py-3 uppercase rounded-sm"
                >
                  {editingProduct ? 'Save alterations' : 'Initialize product item'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
