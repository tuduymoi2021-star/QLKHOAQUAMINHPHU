import React, { useState } from 'react';
import { Item, Transaction, AppRoute, User } from '../types';
import { CATEGORIES, LOCATIONS } from '../constants';
import { CheckCircle, AlertCircle, User as UserIcon, Lock, Calendar, Clock } from 'lucide-react';
import VoiceInputButton from '../components/VoiceInputButton';

interface StockOperationProps {
  type: 'IN' | 'OUT';
  items: Item[];
  currentUser: User | null;
  onSubmit: (transaction: Omit<Transaction, 'id'>, newItem?: Item) => void;
  onNavigate: (route: AppRoute) => void;
}

const StockOperation: React.FC<StockOperationProps> = ({ type, items, currentUser, onSubmit, onNavigate }) => {
  const isStockIn = type === 'IN';
  
  // Permission Guard
  const requiredPerm = isStockIn ? 'stock_in' : 'stock_out';
  const hasPermission = currentUser?.role === 'admin' || currentUser?.permissions.includes(requiredPerm as any);

  if (!hasPermission) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow border border-red-100 text-center">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={24} />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">Truy cập bị từ chối</h2>
        <p className="text-slate-500 mb-6">Bạn không có quyền thực hiện chức năng {isStockIn ? 'Nhập kho' : 'Xuất kho'}.</p>
        <button 
          onClick={() => onNavigate(AppRoute.DASHBOARD)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
        >
          Quay lại Trang chủ
        </button>
      </div>
    );
  }

  // Helper to get current datetime-local string
  const getCurrentDateTime = () => {
    const now = new Date();
    // Adjust to local ISO string format (YYYY-MM-DDTHH:mm)
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };
  
  // States
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>(isStockIn ? 'existing' : 'existing');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [transactionDate, setTransactionDate] = useState<string>(getCurrentDateTime());
  
  // Conversion State
  const [useImportUnit, setUseImportUnit] = useState(false); // Toggle between Base Unit and Import Unit

  // New Item States
  const [newItemData, setNewItemData] = useState({
    code: '', name: '', category: CATEGORIES[0], unit: 'Cái', minLevel: 0, location: LOCATIONS[0],
    expiryDate: '',
    importUnit: '', conversionRate: 1
  });

  const selectedItem = items.find(i => i.id === selectedItemId);

  // Calculate actual quantity based on unit selection
  const finalQuantity = useImportUnit && selectedItem?.conversionRate 
    ? quantity * selectedItem.conversionRate 
    : quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fallback user if null (shouldn't happen in protected route)
    const userName = currentUser?.fullName || 'Unknown User';
    
    // Convert local time to ISO string for storage
    const isoDate = new Date(transactionDate).toISOString();

    if (activeTab === 'existing') {
      if (!selectedItem) return;
      
      const qtyToProcess = isStockIn && useImportUnit && selectedItem.conversionRate 
        ? quantity * selectedItem.conversionRate 
        : quantity;

      if (!isStockIn && qtyToProcess > selectedItem.quantity) {
        alert("Số lượng xuất kho vượt quá tồn kho!");
        return;
      }
      
      const noteSuffix = useImportUnit && isStockIn 
        ? ` (Nhập ${quantity} ${selectedItem.importUnit})` 
        : '';

      onSubmit({
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        type: type,
        quantity: Number(qtyToProcess),
        user: userName,
        notes: notes + noteSuffix,
        date: isoDate // Pass selected date
      });
    } else {
      // Create new item first
      const newItem: Item = {
        id: Math.random().toString(36).substr(2, 9),
        ...newItemData,
        quantity: Number(quantity * newItemData.conversionRate), // Initial qty is also affected by rate
        updatedAt: isoDate,
        createdBy: currentUser?.username || 'unknown',
        expiryDate: newItemData.expiryDate || undefined,
        importUnit: newItemData.importUnit || undefined,
        conversionRate: newItemData.conversionRate > 1 ? newItemData.conversionRate : undefined
      };
      
      onSubmit({
        itemId: newItem.id,
        itemName: newItem.name,
        type: type,
        quantity: Number(newItem.quantity),
        user: userName,
        notes: `Nhập mới: ${notes}`,
        date: isoDate // Pass selected date
      }, newItem);
    }
    
    // Reset form or navigate back
    onNavigate(AppRoute.DASHBOARD);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
        <div className={`p-6 border-b ${isStockIn ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isStockIn ? 'text-green-800' : 'text-amber-800'}`}>
            {isStockIn ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            {isStockIn ? 'Phiếu Nhập Kho' : 'Phiếu Xuất Kho'}
          </h2>
          <p className={`mt-1 text-sm ${isStockIn ? 'text-green-600' : 'text-amber-600'}`}>
            {isStockIn ? 'Thêm hàng vào kho hoặc tạo vật tư mới.' : 'Xuất vật tư ra khỏi kho để sử dụng.'}
          </p>
        </div>

        <div className="p-6">
          {/* Tabs for Stock In */}
          {isStockIn && (
            <div className="flex gap-4 mb-6 border-b border-slate-100">
              <button 
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'existing' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveTab('existing')}
              >
                Vật tư có sẵn
              </button>
              <button 
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'new' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveTab('new')}
              >
                + Tạo mới vật tư
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* EXISTING ITEM SELECTION */}
            {activeTab === 'existing' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chọn vật tư</label>
                  <select 
                    required
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-slate-900 shadow-sm"
                    value={selectedItemId}
                    onChange={(e) => {
                      setSelectedItemId(e.target.value);
                      setUseImportUnit(false); // Reset unit toggle
                    }}
                  >
                    <option value="">-- Chọn vật tư --</option>
                    {items.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.code} - {item.name} (Tồn: {item.quantity} {item.unit})
                      </option>
                    ))}
                  </select>
                </div>
                {selectedItem && (
                   <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700 flex flex-col gap-1 border border-blue-100">
                      <div className="flex justify-between font-medium">
                        <span>Vị trí: {selectedItem.location}</span>
                        <span>Tồn kho: {selectedItem.quantity} {selectedItem.unit}</span>
                      </div>
                      {selectedItem.importUnit && selectedItem.conversionRate && (
                        <div className="text-xs opacity-80 border-t border-blue-200 pt-1 mt-1">
                           Quy đổi: 1 {selectedItem.importUnit} = {selectedItem.conversionRate} {selectedItem.unit}
                        </div>
                      )}
                      {selectedItem.expiryDate && (
                        <div className="text-xs text-red-600 font-medium">
                           Hạn sử dụng: {new Date(selectedItem.expiryDate).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                   </div>
                )}
              </div>
            )}

            {/* NEW ITEM FORM */}
            {activeTab === 'new' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã vật tư *</label>
                  <input type="text" required className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white shadow-sm" value={newItemData.code} onChange={e => setNewItemData({...newItemData, code: e.target.value})} placeholder="VD: CHEM-001" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-slate-700">Tên vật tư *</label>
                    <VoiceInputButton onTranscript={(txt) => setNewItemData(prev => ({...prev, name: txt}))} className="w-6 h-6 p-1" />
                  </div>
                  <input type="text" required className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white shadow-sm" value={newItemData.name} onChange={e => setNewItemData({...newItemData, name: e.target.value})} placeholder="VD: Kháng sinh A" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục</label>
                  <select className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white shadow-sm" value={newItemData.category} onChange={e => setNewItemData({...newItemData, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Vị trí lưu trữ</label>
                   <select className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white shadow-sm" value={newItemData.location} onChange={e => setNewItemData({...newItemData, location: e.target.value})}>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                   </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Đơn vị tính cơ bản (Kg, Lít...)</label>
                  <input type="text" required className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white shadow-sm" value={newItemData.unit} onChange={e => setNewItemData({...newItemData, unit: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mức tồn tối thiểu</label>
                  <input type="number" className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white shadow-sm" value={newItemData.minLevel} onChange={e => setNewItemData({...newItemData, minLevel: Number(e.target.value)})} />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hạn sử dụng</label>
                  <input 
                    type="date" 
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white shadow-sm" 
                    value={newItemData.expiryDate} 
                    onChange={e => setNewItemData({...newItemData, expiryDate: e.target.value})} 
                  />
                </div>
                
                {/* New Item Conversion Config */}
                <div className="col-span-1 md:col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                   <h4 className="font-medium text-sm text-slate-800 mb-2">Cấu hình quy đổi nhập hàng (Tùy chọn)</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs text-slate-500 mb-1">Đơn vị nhập (Bao, Thùng...)</label>
                         <input type="text" className="w-full p-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white shadow-sm" placeholder="VD: Bao" value={newItemData.importUnit} onChange={e => setNewItemData({...newItemData, importUnit: e.target.value})} />
                      </div>
                      <div>
                         <label className="block text-xs text-slate-500 mb-1">Tỷ lệ (1 ĐV Nhập = ? ĐV Cơ bản)</label>
                         <input type="number" min="1" className="w-full p-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white shadow-sm" placeholder="VD: 50" value={newItemData.conversionRate} onChange={e => setNewItemData({...newItemData, conversionRate: Number(e.target.value)})} />
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                   <label className="block text-sm font-medium text-slate-700">
                     Số lượng {isStockIn ? 'nhập' : 'xuất'} *
                   </label>
                   <VoiceInputButton 
                     onTranscript={(txt) => {
                       // Try to parse number from speech
                       const num = parseInt(txt.replace(/\D/g, ''));
                       if (!isNaN(num)) setQuantity(num);
                     }} 
                     className="w-6 h-6 p-1" 
                   />
                </div>
                
                <div className="flex gap-2">
                   <input 
                    type="number" 
                    required 
                    min="1"
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none font-bold text-lg text-slate-900 shadow-sm"
                    value={quantity || ''}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                  {/* Unit Toggle for Stock In */}
                  {isStockIn && (activeTab === 'new' ? newItemData.importUnit : selectedItem?.importUnit) && (
                    <button
                      type="button"
                      onClick={() => setUseImportUnit(!useImportUnit)}
                      className={`px-3 rounded-lg border text-sm font-medium whitespace-nowrap shadow-sm ${
                        useImportUnit 
                          ? 'bg-blue-50 border-blue-200 text-blue-700' 
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                       Đơn vị: {useImportUnit 
                          ? (activeTab === 'new' ? newItemData.importUnit : selectedItem?.importUnit) 
                          : (activeTab === 'new' ? newItemData.unit : selectedItem?.unit)}
                    </button>
                  )}
                </div>
                {/* Display calculated base quantity if using conversion */}
                {isStockIn && useImportUnit && (
                   <p className="text-xs text-blue-600 mt-1 font-medium">
                     = {(quantity * (activeTab === 'new' ? newItemData.conversionRate : (selectedItem?.conversionRate || 1))).toLocaleString()} {(activeTab === 'new' ? newItemData.unit : selectedItem?.unit)}
                   </p>
                )}
              </div>

              {/* DATE & USER GROUP */}
              <div className="space-y-4">
                 {/* DATE PICKER */}
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian giao dịch</label>
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Clock size={18} className="text-slate-400" />
                       </div>
                       <input 
                         type="datetime-local" 
                         className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 shadow-sm focus:ring-2 focus:ring-primary/50 outline-none"
                         value={transactionDate}
                         onChange={(e) => setTransactionDate(e.target.value)}
                       />
                    </div>
                 </div>

                 {/* USER INFO */}
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Người thực hiện</label>
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <UserIcon size={18} className="text-slate-400" />
                       </div>
                       <input 
                         type="text" 
                         disabled
                         className="w-full pl-10 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                         value={currentUser?.fullName || ''}
                       />
                    </div>
                 </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Ghi chú</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 italic">Nhấn để nói</span>
                  <VoiceInputButton onTranscript={(txt) => setNotes(prev => prev ? prev + ' ' + txt : txt)} />
                </div>
              </div>
              <textarea 
                className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none h-24 resize-none text-slate-900 shadow-sm"
                placeholder={isStockIn ? "VD: Nhập hàng từ nhà cung cấp X" : "VD: Xuất cho phòng thí nghiệm vi sinh"}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button 
                type="button" 
                onClick={() => onNavigate(AppRoute.DASHBOARD)}
                className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit"
                className={`px-8 py-2.5 text-white font-bold rounded-lg shadow-lg transition-transform hover:-translate-y-0.5 ${
                  isStockIn ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                }`}
              >
                {isStockIn ? 'Xác nhận Nhập kho' : 'Xác nhận Xuất kho'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default StockOperation;