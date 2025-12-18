import { Item, Transaction, User } from './types';

export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    username: 'admin', 
    fullName: 'Quản trị viên', 
    role: 'admin',
    permissions: ['view', 'stock_in', 'stock_out'] 
  },
  { 
    id: 'u2', 
    username: 'staff_in', 
    fullName: 'Lê Văn Nhập', 
    role: 'staff',
    permissions: ['view', 'stock_in'] 
  },
  { 
    id: 'u3', 
    username: 'staff_out', 
    fullName: 'Nguyễn Thị Xuất', 
    role: 'staff',
    permissions: ['view', 'stock_out'] 
  },
  { 
    id: 'u4', 
    username: 'manager', 
    fullName: 'Trần Giám Sát', 
    role: 'staff',
    permissions: ['view'] 
  },
];

export const INITIAL_ITEMS: Item[] = [
  // --- HÓA CHẤT ---
  {
    id: '1',
    code: 'CHEM-001',
    name: 'Formaldehyde 37% (Formol)',
    category: 'Hóa chất',
    unit: 'Lít',
    quantity: 120,
    minLevel: 20,
    location: 'Kho Hóa Chất - Kệ 1',
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    expiryDate: '2025-12-31'
  },
  {
    id: '5',
    code: 'CHEM-002',
    name: 'BKC 80% (Benzalkonium Chloride)',
    category: 'Hóa chất',
    unit: 'Can 5L',
    quantity: 15,
    minLevel: 5,
    location: 'Kho Hóa Chất - Kệ 1',
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    expiryDate: '2025-06-30'
  },
  {
    id: '6',
    code: 'CHEM-003',
    name: 'Iodine Complex 9000',
    category: 'Hóa chất',
    unit: 'Chai 1L',
    quantity: 45,
    minLevel: 10,
    location: 'Kho Hóa Chất - Tủ A',
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    expiryDate: '2025-10-15'
  },
  {
    id: '7',
    code: 'CHEM-004',
    name: 'Yucca Schidigera (Hấp thụ khí độc)',
    category: 'Hóa chất',
    unit: 'Lít',
    quantity: 60,
    minLevel: 20,
    location: 'Kho Hóa Chất - Kệ 2',
    updatedAt: new Date().toISOString(),
    createdBy: 'staff_in'
  },
  {
    id: '8',
    code: 'CHEM-005',
    name: 'Khoáng tạt Super Mix',
    category: 'Hóa chất',
    unit: 'Bao 10kg',
    quantity: 30,
    minLevel: 10,
    location: 'Kho Lạnh',
    updatedAt: new Date().toISOString(),
    createdBy: 'admin'
  },

  // --- KIT TEST ---
  {
    id: '3',
    code: 'KIT-012',
    name: 'Bộ test pH Sera (Đức)',
    category: 'Kit Test',
    unit: 'Bộ',
    quantity: 25,
    minLevel: 5,
    location: 'Tủ C3',
    updatedAt: new Date().toISOString(),
    createdBy: 'staff_in'
  },
  {
    id: '13',
    code: 'KIT-002',
    name: 'Bộ test Kiềm (kH) Sera',
    category: 'Kit Test',
    unit: 'Bộ',
    quantity: 18,
    minLevel: 5,
    location: 'Tủ C3',
    updatedAt: new Date().toISOString(),
    createdBy: 'admin'
  },
  {
    id: '14',
    code: 'KIT-003',
    name: 'Bộ test khí độc NH3/NH4 Sera',
    category: 'Kit Test',
    unit: 'Bộ',
    quantity: 12,
    minLevel: 5,
    location: 'Tủ C3',
    updatedAt: new Date().toISOString(),
    createdBy: 'admin'
  },
  {
    id: '15',
    code: 'KIT-004',
    name: 'Bộ test NO2 Sera',
    category: 'Kit Test',
    unit: 'Bộ',
    quantity: 10,
    minLevel: 5,
    location: 'Tủ C3',
    updatedAt: new Date().toISOString(),
    createdBy: 'admin'
  },

  // --- CHẾ PHẨM SINH HỌC ---
  {
    id: '4',
    code: 'BIO-002',
    name: 'Men vi sinh xử lý đáy (AquaClean)',
    category: 'Chế phẩm sinh học',
    unit: 'Gói 500g',
    quantity: 80,
    minLevel: 20,
    location: 'Kho Lạnh',
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    expiryDate: '2024-12-01'
  },
  {
    id: '9',
    code: 'BIO-003',
    name: 'Men tiêu hóa Gut-Pro',
    category: 'Chế phẩm sinh học',
    unit: 'Lon 1kg',
    quantity: 40,
    minLevel: 10,
    location: 'Kho Lạnh',
    updatedAt: new Date().toISOString(),
    createdBy: 'staff_in'
  },
  {
    id: '10',
    code: 'BIO-004',
    name: 'Vi sinh gây màu nước (Bio-Color)',
    category: 'Chế phẩm sinh học',
    unit: 'Gói 227g',
    quantity: 50,
    minLevel: 15,
    location: 'Kho Lạnh',
    updatedAt: new Date().toISOString(),
    createdBy: 'staff_in'
  },

  // --- KHÁNG SINH (GIẢ LẬP) ---
  {
    id: '11',
    code: 'ANTI-001',
    name: 'Doxycycline 50%',
    category: 'Hóa chất',
    unit: 'Lon 1kg',
    quantity: 8,
    minLevel: 10,
    location: 'Tủ Thuốc - Kệ 1 (Có khóa)',
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    expiryDate: '2026-01-01'
  },
  {
    id: '12',
    code: 'ANTI-002',
    name: 'Florfenicol 20%',
    category: 'Hóa chất',
    unit: 'Chai 1L',
    quantity: 12,
    minLevel: 5,
    location: 'Tủ Thuốc - Kệ 1 (Có khóa)',
    updatedAt: new Date().toISOString(),
    createdBy: 'admin'
  },

  // --- DỤNG CỤ LAB ---
  {
    id: '2',
    code: 'TOOL-005',
    name: 'Đĩa Petri 90mm (Thủy tinh)',
    category: 'Dụng cụ',
    unit: 'Hộp (10 cái)',
    quantity: 15,
    minLevel: 5,
    location: 'Kho Dụng Cụ - Kệ 1',
    updatedAt: new Date().toISOString(),
    createdBy: 'admin'
  },
  {
    id: '16',
    code: 'TOOL-010',
    name: 'Ống nghiệm 10ml (Test tube)',
    category: 'Dụng cụ',
    unit: 'Hộp (100 cái)',
    quantity: 5,
    minLevel: 2,
    location: 'Kho Dụng Cụ - Kệ 1',
    updatedAt: new Date().toISOString(),
    createdBy: 'admin'
  },
  {
    id: '17',
    code: 'TOOL-011',
    name: 'Lam kính hiển vi (Microscope Slides)',
    category: 'Dụng cụ',
    unit: 'Hộp (50 cái)',
    quantity: 20,
    minLevel: 5,
    location: 'Phòng PCR',
    updatedAt: new Date().toISOString(),
    createdBy: 'staff_in'
  },
  {
    id: '18',
    code: 'TOOL-012',
    name: 'Đầu côn Pipet xanh 1000ul',
    category: 'Vật tư tiêu hao',
    unit: 'Gói (500 cái)',
    quantity: 10,
    minLevel: 3,
    location: 'Phòng PCR',
    updatedAt: new Date().toISOString(),
    createdBy: 'staff_in'
  },

  // --- THIẾT BỊ ---
  {
    id: '19',
    code: 'EQU-001',
    name: 'Bút đo pH điện tử Hana',
    category: 'Thiết bị',
    unit: 'Cái',
    quantity: 3,
    minLevel: 1,
    location: 'Tủ Thiết Bị',
    updatedAt: new Date().toISOString(),
    createdBy: 'admin'
  },
  {
    id: '20',
    code: 'EQU-002',
    name: 'Máy đo Oxy hòa tan (DO Meter)',
    category: 'Thiết bị',
    unit: 'Cái',
    quantity: 2,
    minLevel: 1,
    location: 'Tủ Thiết Bị',
    updatedAt: new Date().toISOString(),
    createdBy: 'admin'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    itemId: '1',
    itemName: 'Formaldehyde 37% (Formol)',
    type: 'IN',
    quantity: 100,
    date: new Date(Date.now() - 86400000 * 10).toISOString(),
    user: 'Quản trị viên',
    notes: 'Nhập hàng đầu vụ nuôi',
  },
  {
    id: 't2',
    itemId: '4',
    itemName: 'Men vi sinh xử lý đáy (AquaClean)',
    type: 'IN',
    quantity: 100,
    date: new Date(Date.now() - 86400000 * 8).toISOString(),
    user: 'Lê Văn Nhập',
    notes: 'Nhập kho lô hàng tháng 5',
  },
  {
    id: 't3',
    itemId: '1',
    itemName: 'Formaldehyde 37% (Formol)',
    type: 'OUT',
    quantity: 20,
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    user: 'Nguyễn Thị Xuất',
    notes: 'Xử lý ao số 3 bị đóng rong',
  },
  {
    id: 't4',
    itemId: '3',
    itemName: 'Bộ test pH Sera (Đức)',
    type: 'OUT',
    quantity: 2,
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    user: 'Nguyễn Thị Xuất',
    notes: 'Cấp cho kỹ thuật viên đi farm',
  },
  {
    id: 't5',
    itemId: '11',
    itemName: 'Doxycycline 50%',
    type: 'OUT',
    quantity: 1,
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
    user: 'Quản trị viên',
    notes: 'Phòng trị bệnh gan tụy sớm',
  },
  {
    id: 't6',
    itemId: '2',
    itemName: 'Đĩa Petri 90mm (Thủy tinh)',
    type: 'OUT',
    quantity: 1,
    date: new Date(Date.now() - 3600000 * 4).toISOString(),
    user: 'Trần Giám Sát',
    notes: 'Lấy mẫu kiểm tra vi khuẩn Vibrio',
  }
];

export const CATEGORIES = [
  'Hóa chất',
  'Dụng cụ',
  'Thiết bị',
  'Kit Test',
  'Chế phẩm sinh học',
  'Vật tư tiêu hao',
];

export const LOCATIONS = [
  'Kho Hóa Chất - Kệ 1',
  'Kho Hóa Chất - Kệ 2',
  'Kho Hóa Chất - Tủ A',
  'Kho Lạnh',
  'Tủ C3',
  'Kho Dụng Cụ - Kệ 1',
  'Phòng PCR',
  'Tủ Thuốc - Kệ 1 (Có khóa)',
  'Tủ Thiết Bị',
  'Kho Chung',
];