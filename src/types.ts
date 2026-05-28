/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand: 'Aarong' | 'Taaga' | 'Taaga Man' | 'Herstory';
  image: string;
  featured?: boolean;
  ratings?: number;
  sizes?: string[];
  colors?: string[];
}

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  brand: string;
  link: string;
}

export interface AppSettings {
  siteName: string;
  logoText: string;
  logoImage?: string;
  aboutText: string;
  contactEmail: string;
  contactPhone: string;
  brandColors: {
    primary: string; // Brand Orange
    accent: string;  // Gold/Crimson
    bgLight: string; // Canvas Cream
    textDark: string;// Charcoal Grey
  };
  heroSlides: HeroSlide[];
}

export interface UserActivityLog {
  id: string;
  timestamp: string;
  action: string;
  username: string;
  details: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING' | 'INFO';
  ipAddress: string;
}

export interface LiveNotification {
  id: string;
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  message: string;
  read: boolean;
}

export interface BackupItem {
  id: string;
  timestamp: string;
  filename: string;
  size: string;
  recordsCount: {
    products: number;
    logs: number;
    notifications: number;
  };
}

export interface AnalyticsData {
  salesByCategory: { name: string; value: number }[];
  salesTrend: { date: string; amount: number; orders: number }[];
  brandShare: { name: string; value: number }[];
  stockWarningCount: number;
  activityCount: number;
}
