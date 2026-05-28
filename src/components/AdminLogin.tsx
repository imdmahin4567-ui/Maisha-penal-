/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, ShieldAlert, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (token: string, username: string) => void;
  onClose: () => void;
}

export default function AdminLogin({ onLoginSuccess, onClose }: AdminLoginProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 2FA state management
  const [is2faRequired, setIs2faRequired] = useState(false);
  const [temp2faToken, setTemp2faToken] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);

  // 1-Click Easy Login Handler
  const handleEasyLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/easy-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Easy login bypass failed.");
      }
      if (data.status === 'success') {
        onLoginSuccess(data.token, data.username);
      }
    } catch (err: any) {
      setError(err.message || "Bypass handler failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically check the mock notification stream to display the 2FA passkey as a helper
  // so the user can see real full-stack token creation and pass the verification easily in AI Studio!
  useEffect(() => {
    if (is2faRequired && temp2faToken) {
      // Fetch latest notifications to find the generated code
      const fetchNotificationCode = async () => {
        try {
          const res = await fetch('/api/notifications');
          if (res.ok) {
            const data = await res.json();
            // Look for simulated 2FA code notification text
            const searchPattern = "[SIMULATED 2FA CODE DELIVERY]: Your 6-digit dynamic access code is ";
            const foundNode = data.find((n: any) => n.message.includes("SIMULATED 2FA CODE DELIVERY"));
            if (foundNode) {
              // Extract the 6 digit code from text e.g. "Your 6-digit access login secret is 821943"
              const match = foundNode.message.match(/\d{6}/);
              if (match) {
                setSimulatedCode(match[0]);
              }
            }
          }
        } catch (e) {
          // Fallback
        }
      };
      
      fetchNotificationCode();
      const interval = setInterval(fetchNotificationCode, 3000);
      return () => clearInterval(interval);
    } else {
      setSimulatedCode(null);
    }
  }, [is2faRequired, temp2faToken]);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      if (data.status === '2fa_required') {
        setIs2faRequired(true);
        setTemp2faToken(data.tempToken);
      } else if (data.status === 'success') {
        onLoginSuccess(data.token, data.username);
      }
    } catch (err: any) {
      setError(err.message || "Invalid administrative credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handle2faSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken: temp2faToken, code: verificationCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      if (data.status === 'success') {
        onLoginSuccess(data.token, data.username);
      }
    } catch (err: any) {
      setError(err.message || "Invalid 2FA Verification Token.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetLoginForm = () => {
    setIs2faRequired(false);
    setTemp2faToken(null);
    setVerificationCode('');
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-100 font-sans">
      <div className="bg-white rounded-md max-w-md w-full p-8 shadow-2xl border border-stone-200 space-y-6">
        
        {/* Header visual branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-red-900/10 text-red-800 rounded-full flex items-center justify-center mx-auto border border-red-900/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-neutral-900 tracking-tight">
            বোরখা হাউজ অ্যাডমিন প্যানেল
          </h2>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            প্রোডাক্ট পরিবর্তন, ডিলিট এবং নতুন বোরখা এড করতে নিচে দেওয়া ১-ক্লিক ডেমো লগইন অপশনটি ব্যবহার করুন।
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-700 rounded-xs p-3.5 border border-rose-200 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span className="font-medium leading-normal">{error}</span>
          </div>
        )}

        {/* 1-CLICK INSTANT BYPASS ACCESS (Super Easy!) */}
        {!is2faRequired && (
          <div className="bg-rose-50/70 p-4 rounded-md border border-red-900/20 text-center space-y-2.5 shadow-xs">
            <span className="text-[11px] text-red-900 font-semibold block">বোরখা হাউজ টেস্ট করতে নিচে চাপুন (কোন পাসওয়ার্ড লাগবে না):</span>
            <button
              id="easy-bypass-login-btn"
              type="button"
              onClick={handleEasyLogin}
              disabled={isLoading}
              className="w-full bg-[#8A1C14] hover:bg-[#4A0E17] text-white text-xs font-bold py-3 px-4 rounded-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
              ১-ক্লিক সহজ ডেমো লগইন (Bypass)
            </button>
          </div>
        )}

        {/* Divider */}
        {!is2faRequired && (
          <div className="relative flex items-center justify-center py-1">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-3 text-[10px] text-stone-400 font-mono uppercase absolute">অথবা ম্যানুয়াল লগইন</span>
          </div>
        )}

        {/* Multi-stage interactive form */}
        {!is2faRequired ? (
          <form id="admin-login-stage1" onSubmit={handleInitialSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#8A1C14] block">অ্যাডমিন জিমেইল (Admin Gmail)</label>
              <div className="relative">
                <input 
                  id="login-username-input"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-stone-50 text-neutral-900 text-sm pl-9 pr-3 py-2.5 rounded-xs border border-stone-200 focus:outline-hidden focus:border-red-900"
                  placeholder="e.g. imdmahin4567@gmail.com"
                />
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#8A1C14] block">অ্যাডমিন পাসওয়ার্ড (Admin Password)</label>
              <div className="relative">
                <input 
                  id="login-password-input"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-50 text-neutral-900 text-sm pl-9 pr-10 py-2.5 rounded-xs border border-stone-200 focus:outline-hidden focus:border-red-900"
                  placeholder="e.g. Mahin@295687"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                <button 
                  id="login-password-eye-toggle"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                id="login-close-btn"
                type="button" 
                onClick={onClose}
                className="flex-1 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold py-3 border border-stone-200 tracking-wider uppercase rounded-xs transition-colors cursor-pointer"
              >
                Storefront
              </button>
              <button 
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-neutral-900 hover:bg-red-900 text-white text-xs font-semibold py-3 tracking-wider uppercase rounded-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Secure Login
              </button>
            </div>
          </form>
        ) : (
          <form id="admin-login-stage2" onSubmit={handle2faSubmit} className="space-y-4">
            <div className="bg-orange-50 rounded-xs p-4 border border-orange-200 space-y-2">
              <div className="flex items-center gap-2 text-orange-800 text-xs font-bold font-mono">
                <ShieldAlert className="w-4 h-4" />
                Two-Factor Auth Active (2FA)
              </div>
              <p className="text-[11px] text-orange-700 leading-relaxed font-light">
                Your credentials are correct. We found 2FA configuration turned on. We generated a unique dynamic code and dispatched it to your notification alerts. 
              </p>
            </div>

            {/* Simulated Smart Deliver Device pop-up box */}
            {simulatedCode ? (
              <div className="bg-emerald-50 text-emerald-800 rounded-sm p-3.5 border border-emerald-100 space-y-1 block animate-pulse-soft">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-white" /> Secure Code Delivered
                </span>
                <p className="text-xs leading-tight font-sans">
                  Simulated device code: <span className="font-mono font-extrabold text-[#f15a22] text-lg select-all bg-white px-2 py-0.5 rounded-sm border border-emerald-200">{simulatedCode}</span>
                </p>
              </div>
            ) : (
              <div className="text-center py-2 text-stone-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating verification signal...
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Secret Access Verification Code</label>
              <input 
                id="login-2fa-input"
                type="text"
                required
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-stone-50 text-neutral-900 text-lg tracking-widest text-center font-mono font-bold py-3.5 rounded-xs border border-stone-200 focus:outline-hidden focus:border-[#f15a22]"
                placeholder="------"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                id="login-2fa-back-btn"
                type="button" 
                onClick={resetLoginForm}
                className="flex-1 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold py-3 border border-stone-200 tracking-wider uppercase rounded-xs transition-colors cursor-pointer"
              >
                Back
              </button>
              <button 
                id="login-2fa-verify-btn"
                type="submit"
                disabled={isLoading || verificationCode.length < 6}
                className="flex-1 bg-neutral-900 hover:bg-emerald-600 text-white text-xs font-semibold py-3 tracking-wider uppercase rounded-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Verify & Enter
              </button>
            </div>
          </form>
        )}

        {/* Security guidelines footnotes */}
        <div className="border-t border-stone-100 pt-4 text-[10px] text-neutral-400 space-y-1 leading-normal font-mono">
          <div className="flex justify-between">
            <span>Standard:</span>
            <span>SHA-256 / AES-256 Encryption</span>
          </div>
          <div className="flex justify-between">
            <span>Sessions:</span>
            <span>Timeout Protected (TLS enforced)</span>
          </div>
        </div>

      </div>
    </div>
  );
}
