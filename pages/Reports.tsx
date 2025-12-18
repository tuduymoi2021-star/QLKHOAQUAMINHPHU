import React from 'react';
import { Item, Transaction } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface ReportsProps {
  items: Item[];
  transactions: Transaction[];
}

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports: React.FC<ReportsProps> = ({ items, transactions }) => {
  
  // Data for Category Distribution
  const categoryData = items.reduce((acc, item) => {
    const existing = acc.find(x => x.name === item.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: item.category, value: 1 });
    }
    return acc;
  }, [] as {name: string, value: number}[]);

  // Data for Low Stock
  const lowStockData = items
    .filter(i => i.quantity <= i.minLevel + 5) // Show items near min level
    .map(i => ({
      name: i.name.length > 15 ? i.name.substring(0, 15) + '...' : i.name,
      Tồn: i.quantity,
      Min: i.minLevel
    }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Báo cáo & Thống kê</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-6">Phân bố danh mục vật tư</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-6">Vật tư có số lượng thấp</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={lowStockData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Tồn" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Min" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
         <h3 className="font-semibold text-slate-700 mb-4">Lịch sử xuất nhập chi tiết</h3>
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 text-slate-600 font-medium">
                  <tr>
                     <th className="px-4 py-3">Thời gian</th>
                     <th className="px-4 py-3">Loại</th>
                     <th className="px-4 py-3">Vật tư</th>
                     <th className="px-4 py-3 text-right">Số lượng</th>
                     <th className="px-4 py-3">Người dùng</th>
                     <th className="px-4 py-3">Ghi chú</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {transactions.slice(0, 20).map(t => (
                     <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-500">{new Date(t.date).toLocaleString('vi-VN')}</td>
                        <td className="px-4 py-3">
                           <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {t.type === 'IN' ? 'NHẬP' : 'XUẤT'}
                           </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">{t.itemName}</td>
                        <td className="px-4 py-3 text-right font-mono">{t.quantity}</td>
                        <td className="px-4 py-3 text-slate-600">{t.user}</td>
                        <td className="px-4 py-3 text-slate-500 italic truncate max-w-xs">{t.notes}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default Reports;