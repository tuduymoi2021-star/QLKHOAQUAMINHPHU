import React from 'react';
import { Package, AlertTriangle, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import { Item, Transaction } from '../types';

interface DashboardProps {
  items: Item[];
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ items, transactions }) => {
  const totalItems = items.length;
  const lowStockItems = items.filter(i => i.quantity <= i.minLevel).length;
  const recentIn = transactions.filter(t => t.type === 'IN').length;
  const recentOut = transactions.filter(t => t.type === 'OUT').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Tổng vật tư" 
          value={totalItems} 
          icon={Package} 
          color="blue"
          trend="Đang quản lý"
        />
        <StatCard 
          label="Cảnh báo sắp hết" 
          value={lowStockItems} 
          icon={AlertTriangle} 
          color="red"
          trend="Cần nhập hàng ngay"
        />
        <StatCard 
          label="Nhập kho (30 ngày)" 
          value={recentIn} 
          icon={ArrowDownRight} 
          color="green"
          trend="Giao dịch nhập"
        />
        <StatCard 
          label="Xuất kho (30 ngày)" 
          value={recentOut} 
          icon={ArrowUpRight} 
          color="amber"
          trend="Giao dịch xuất"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              Cần nhập hàng
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {items.filter(i => i.quantity <= i.minLevel).length === 0 ? (
              <p className="p-5 text-slate-500 text-sm">Tất cả vật tư đều đủ số lượng an toàn.</p>
            ) : (
              items.filter(i => i.quantity <= i.minLevel).map(item => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500">Mã: {item.code} | Vị trí: {item.location}</p>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-red-600">{item.quantity} {item.unit}</span>
                    <span className="text-xs text-slate-400">Min: {item.minLevel}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Clock size={18} className="text-blue-500" />
              Giao dịch gần đây
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {transactions.slice(0, 5).map(t => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    {t.type === 'IN' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{t.itemName}</p>
                    <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString('vi-VN')} • {t.user}</p>
                  </div>
                </div>
                <div className="font-semibold text-slate-700">
                  {t.type === 'IN' ? '+' : '-'}{t.quantity}
                </div>
              </div>
            ))}
            {transactions.length === 0 && <p className="p-5 text-slate-500">Chưa có giao dịch nào.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;