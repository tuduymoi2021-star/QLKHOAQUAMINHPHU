import React, { useState, useRef } from 'react';
import { Search, Plus, QrCode, MapPin, Download, FileSpreadsheet, Save, X, Filter, Upload, FileUp } from 'lucide-react';
import { Item, AppRoute, User, Transaction } from '../types';
import { CATEGORIES, LOCATIONS } from '../constants';
import VoiceInputButton from '../components/VoiceInputButton';

interface InventoryProps {
  items: Item[];
  transactions: Transaction[];
  currentUser: User | null;
  onNavigate: (route: AppRoute) => void;
  onUpdateItem: (updatedItem: Item, reason?: string) => void;
  onImportItems?: (items: Partial<Item>[]) => void;
}

const Inventory: React.FC<InventoryProps> = ({ items, transactions, currentUser, onNavigate, onUpdateItem, onImportItems }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedItemQR, setSelectedItemQR] = useState<Item | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Excel Mode States
  const [editingCell, setEditingCell] = useState<{ id: string, field: keyof Item } | null>(null);
  const [tempValue, setTempValue] = useState<string | number>('');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getQRUrl = (code: string) => `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${code}`;

  // Export to CSV function
  const exportToCSV = () => {
    const headers = ["Mã Vật Tư", "Tên Vật Tư", "Danh Mục", "Số Lượng", "Đơn Vị", "Tồn Tối Thiểu", "Vị Trí", "Hạn Sử Dụng", "Ngày Cập Nhật"];
    const rows = filteredItems.map(item => [
      item.code,
      `"${item.name}"`, // Quote name to handle commas
      item.category,
      item.quantity,
      item.unit,
      item.minLevel,
      item.location,
      item.expiryDate ? item.expiryDate.split('T')[0] : '',
      item.updatedAt ? new Date(item.updatedAt).toLocaleString('vi-VN') : ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shrimpvet_inventory_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import CSV function
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!currentUser || (!currentUser.permissions.includes('stock_in') && currentUser.role !== 'admin')) {
      alert("Bạn không có quyền nhập dữ liệu.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const rows = text.split('\n').map(row => row.trim()).filter(row => row.length > 0);
        if (rows.length < 2) {
          alert("File không có dữ liệu!");
          return;
        }

        // Simple CSV Parser (Assumes standard format from Export)
        // Header Mapping: "Mã Vật Tư", "Tên Vật Tư", "Danh Mục", "Số Lượng", "Đơn Vị", "Tồn Tối Thiểu", "Vị Trí", "Hạn Sử Dụng"
        
        const parsedItems: Partial<Item>[] = [];
        
        // Skip header row (index 0)
        for (let i = 1; i < rows.length; i++) {
          // Handle quoted strings (e.g. "Tên, có phẩy") simple regex
          // This is a basic parser. For production, use a library like PapaParse.
          // Here we split by comma but respect quotes is hard without lib. 
          // We will assume simple CSV for this demo or split by comma directly.
          
          const cols = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Split by comma not inside quotes
          
          if (cols.length < 2) continue; // Skip invalid rows

          const clean = (str: string) => str ? str.replace(/^"|"$/g, '').trim() : '';

          const item: Partial<Item> = {
            code: clean(cols[0]),
            name: clean(cols[1]),
            category: clean(cols[2]) || 'Chưa phân loại',
            quantity: Number(clean(cols[3])) || 0,
            unit: clean(cols[4]) || 'Cái',
            minLevel: Number(clean(cols[5])) || 0,
            location: clean(cols[6]) || 'Kho chung',
            expiryDate: clean(cols[7]) || undefined,
          };

          if (item.code && item.name) {
            parsedItems.push(item);
          }
        }

        if (parsedItems.length > 0 && onImportItems) {
           if(window.confirm(`Tìm thấy ${parsedItems.length} vật tư hợp lệ. Bạn có muốn nhập không? \n(Lưu ý: Mã trùng sẽ được cập nhật số lượng)`)) {
              onImportItems(parsedItems);
           }
        } else {
           alert("Không tìm thấy dữ liệu hợp lệ. Vui lòng kiểm tra định dạng file (CSV).");
        }

      } catch (err) {
        alert("Lỗi đọc file. Vui lòng đảm bảo file là CSV chuẩn UTF-8.");
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
  };

  const triggerFileInput = () => {
     fileInputRef.current?.click();
  };

  // --- Inline Editing Logic ---

  const startEditing = (item: Item, field: keyof Item) => {
    // Permission check: Admin or Creator only
    if (!currentUser) return;
    const canEdit = currentUser.role === 'admin' || (currentUser.permissions.includes('stock_in') && item.createdBy === currentUser.username);
    
    if (canEdit) {
      setEditingCell({ id: item.id, field });
      setTempValue(item[field] as string | number || '');
    }
  };

  const saveEdit = (item: Item) => {
    if (!editingCell) return;

    const newValue = tempValue;
    const originalValue = item[editingCell.field];

    // Only update if value changed
    if (newValue !== originalValue) {
      let updatedItem = { ...item, [editingCell.field]: newValue };
      
      // Special validation for numbers
      if (editingCell.field === 'quantity' || editingCell.field === 'minLevel') {
         updatedItem = { ...item, [editingCell.field]: Number(newValue) };
      }

      // If updating quantity directly, auto-generate reason
      let reason = undefined;
      if (editingCell.field === 'quantity' && updatedItem.quantity !== item.quantity) {
         reason = "Cập nhật trực tiếp trên bảng (Excel Mode)";
      }

      onUpdateItem(updatedItem, reason);
    }

    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, item: Item) => {
    if (e.key === 'Enter') {
      saveEdit(item);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Render a cell that might be editable
  const renderCell = (item: Item, field: keyof Item, type: 'text' | 'number' | 'select' = 'text', options: string[] = []) => {
    const isEditing = editingCell?.id === item.id && editingCell?.field === field;

    if (isEditing) {
      if (type === 'select') {
        return (
          <select
            autoFocus
            className="w-full h-full p-1 bg-blue-50 outline-none border border-blue-400 text-sm"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={() => saveEdit(item)}
            onKeyDown={(e) => handleKeyDown(e, item)}
          >
             {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      }
      return (
        <input
          autoFocus
          type={type}
          className="w-full h-full p-1 bg-blue-50 outline-none border border-blue-400 text-sm"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => saveEdit(item)}
          onKeyDown={(e) => handleKeyDown(e, item)}
        />
      );
    }

    // Display mode
    let displayValue = item[field];
    let className = "px-2 py-1.5 cursor-pointer hover:bg-slate-50 truncate h-full flex items-center";
    
    // Conditional styling for specific fields
    if (field === 'quantity') {
       const qty = item.quantity;
       const min = item.minLevel;
       className += qty <= min ? " text-red-600 font-bold bg-red-50" : " text-slate-700";
    }

    return (
      <div 
        className={className}
        onDoubleClick={() => startEditing(item, field)}
        title="Nhấp đúp để sửa"
      >
        {displayValue}
      </div>
    );
  };

  return (
    <div className="space-y-4 h-[calc(100vh-6rem)] flex flex-col">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between gap-4 flex-shrink-0">
        <div className="relative flex-1 max-w-lg flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm kiếm nhanh..."
              className="w-full pl-9 pr-10 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 text-sm shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
               <VoiceInputButton onTranscript={setSearchTerm} className="p-0.5 w-6 h-6" />
            </div>
          </div>
          
          <div className="relative">
             <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500" size={14} />
             <select 
              className="pl-7 pr-8 py-2 bg-white border border-slate-300 rounded focus:outline-none text-slate-700 text-sm shadow-sm appearance-none"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">Tất cả danh mục</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
           {/* Hidden File Input */}
           <input 
             type="file" 
             accept=".csv" 
             ref={fileInputRef} 
             className="hidden" 
             onChange={handleFileUpload}
           />

           {/* Import Button */}
           {(currentUser?.role === 'admin' || currentUser?.permissions.includes('stock_in')) && (
             <button 
                onClick={triggerFileInput}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors shadow-sm text-sm font-medium"
                title="Nhập dữ liệu từ file CSV"
              >
                <FileUp size={16} />
                <span className="hidden sm:inline">Nhập Excel</span>
              </button>
           )}

          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors shadow-sm text-sm font-medium"
            title="Xuất file Excel/CSV"
          >
            <FileSpreadsheet size={16} />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
          
          {currentUser?.permissions.includes('stock_in') && (
            <button 
              onClick={() => onNavigate(AppRoute.STOCK_IN)}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded hover:bg-sky-600 transition-colors shadow-sm text-sm font-medium"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Thêm mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Excel-like Grid View */}
      <div className="flex-1 bg-white border border-slate-300 overflow-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="border border-slate-300 px-2 py-2 text-xs font-bold text-slate-600 w-12 text-center bg-slate-100">STT</th>
              <th className="border border-slate-300 px-2 py-2 text-xs font-bold text-slate-600 w-32 bg-slate-100">Mã Vật Tư</th>
              <th className="border border-slate-300 px-2 py-2 text-xs font-bold text-slate-600 min-w-[200px] bg-slate-100">Tên Vật Tư</th>
              <th className="border border-slate-300 px-2 py-2 text-xs font-bold text-slate-600 w-32 bg-slate-100">Danh Mục</th>
              <th className="border border-slate-300 px-2 py-2 text-xs font-bold text-slate-600 w-24 text-center bg-slate-100">Tồn Kho</th>
              <th className="border border-slate-300 px-2 py-2 text-xs font-bold text-slate-600 w-20 text-center bg-slate-100">Đơn Vị</th>
              <th className="border border-slate-300 px-2 py-2 text-xs font-bold text-slate-600 w-24 text-center bg-slate-100">Tồn Min</th>
              <th className="border border-slate-300 px-2 py-2 text-xs font-bold text-slate-600 w-32 bg-slate-100">Vị Trí</th>
              <th className="border border-slate-300 px-2 py-2 text-xs font-bold text-slate-600 w-32 bg-slate-100">Ngày Cập Nhật</th>
              <th className="border border-slate-300 px-2 py-2 text-xs font-bold text-slate-600 w-16 text-center bg-slate-100">QR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredItems.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors text-sm group">
                {/* STT */}
                <td className="border border-slate-300 text-center text-slate-500 bg-slate-50/50">
                  {index + 1}
                </td>
                
                {/* Code */}
                <td className="border border-slate-300">
                  {renderCell(item, 'code', 'text')}
                </td>
                
                {/* Name */}
                <td className="border border-slate-300 font-medium">
                  {renderCell(item, 'name', 'text')}
                </td>

                {/* Category */}
                <td className="border border-slate-300">
                  {renderCell(item, 'category', 'select', CATEGORIES)}
                </td>

                {/* Quantity */}
                <td className="border border-slate-300 text-center font-mono">
                  {renderCell(item, 'quantity', 'number')}
                </td>

                {/* Unit */}
                <td className="border border-slate-300 text-center">
                  {renderCell(item, 'unit', 'text')}
                </td>

                {/* Min Level */}
                <td className="border border-slate-300 text-center text-slate-500">
                  {renderCell(item, 'minLevel', 'number')}
                </td>

                {/* Location */}
                <td className="border border-slate-300">
                   {renderCell(item, 'location', 'select', LOCATIONS)}
                </td>

                {/* Date */}
                <td className="border border-slate-300 text-slate-600 text-xs px-2">
                   {new Date(item.updatedAt).toLocaleString('vi-VN')}
                </td>

                {/* Actions */}
                <td className="border border-slate-300 text-center py-1">
                  <button 
                    onClick={() => setSelectedItemQR(item)}
                    className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                    title="Xem mã QR"
                  >
                    <QrCode size={16} />
                  </button>
                </td>
              </tr>
            ))}
            
            {/* Empty Rows Filler (Visual only) */}
            {Array.from({ length: Math.max(0, 15 - filteredItems.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className="h-8">
                <td className="border border-slate-300 bg-slate-50/30"></td>
                <td className="border border-slate-300"></td>
                <td className="border border-slate-300"></td>
                <td className="border border-slate-300"></td>
                <td className="border border-slate-300"></td>
                <td className="border border-slate-300"></td>
                <td className="border border-slate-300"></td>
                <td className="border border-slate-300"></td>
                <td className="border border-slate-300"></td>
                <td className="border border-slate-300"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-500 italic flex justify-between items-center px-1">
        <span>* Gợi ý: Hãy nhấn "Xuất Excel" để lấy file mẫu, nhập dữ liệu vào file đó rồi nhấn "Nhập Excel".</span>
        <span>Tổng số: {filteredItems.length} vật tư</span>
      </div>

      {/* QR Modal */}
      {selectedItemQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200 shadow-2xl">
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 mb-1">{selectedItemQR.name}</h3>
              <p className="text-sm text-slate-500 mb-6 font-mono">{selectedItemQR.code}</p>
              
              <div className="flex justify-center mb-6">
                <img 
                  src={getQRUrl(selectedItemQR.code)} 
                  alt="QR Code" 
                  className="w-48 h-48 border border-slate-200 rounded-lg p-2"
                />
              </div>

              <button 
                onClick={() => setSelectedItemQR(null)}
                className="w-full py-2 bg-slate-100 text-slate-700 font-medium rounded hover:bg-slate-200 transition-colors text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;