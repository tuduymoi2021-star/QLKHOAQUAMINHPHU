export type Permission = 'view' | 'stock_in' | 'stock_out';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'staff'; // Giữ lại để phân loại chung
  permissions: Permission[]; // Phân quyền chi tiết
}

export interface Item {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minLevel: number;
  location: string;
  imageUrl?: string;
  updatedAt: string;
  createdBy: string; // User tạo ra item này
  expiryDate?: string;
  importUnit?: string;
  conversionRate?: number;
}

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  user: string;
  notes?: string;
}

export interface ReportData {
  name: string;
  value: number;
}

export enum AppRoute {
  LOGIN = 'login',
  DASHBOARD = 'dashboard',
  INVENTORY = 'inventory',
  STOCK_IN = 'stock-in',
  STOCK_OUT = 'stock-out',
  REPORTS = 'reports',
  AI_ASSISTANT = 'ai-assistant',
  USERS = 'users'
}