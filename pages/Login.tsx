import React, { useState } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon, AlertCircle, ArrowRight, Shield, PackagePlus, PackageMinus, Eye } from 'lucide-react';
import { apiService } from '../services/backendApi';

interface LoginProps {
  onLogin: (user: User) => void;
  usersList?: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const user = await apiService.login(username, password);
        if (user) {
            onLogin(user);
        } else {
            setError('Đăng nhập thất bại');
        }
    } catch (err: any) {
        setError(err.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
    } finally {
        setLoading(false);
    }
  };

  const fillCredential = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col md:flex-row">
        
        {/* Login Form */}
        <div className="w-full p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
              <span className="font-bold text-white text-3xl">S</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">ShrimpVet Inventory</h1>
            <p className="text-slate-500 mt-2">Đăng nhập để quản lý kho</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên đăng nhập</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-slate-900 placeholder:text-slate-400"
                  placeholder="Nhập username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-slate-900 placeholder:text-slate-400"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-primary text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-slate-900/20 hover:shadow-primary/30 flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {loading ? (
                'Đang kiểm tra...'
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* DEMO ACCOUNTS SECTION */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">
                Tài khoản Demo (Click để điền)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillCredential('admin', '123')}
                  className="flex flex-col items-center p-2 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-lg transition-all"
                >
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs mb-1">
                    <Shield size={12} className="text-blue-600" /> Admin
                  </div>
                  <div className="text-[10px] text-slate-500">
                    admin / 123
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredential('staff_in', '123')}
                  className="flex flex-col items-center p-2 bg-slate-50 hover:bg-green-50 hover:border-green-200 border border-slate-200 rounded-lg transition-all"
                >
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs mb-1">
                    <PackagePlus size={12} className="text-green-600" /> NV Nhập
                  </div>
                  <div className="text-[10px] text-slate-500">
                    staff_in / 123
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredential('staff_out', '123')}
                  className="flex flex-col items-center p-2 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-200 rounded-lg transition-all"
                >
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs mb-1">
                    <PackageMinus size={12} className="text-amber-600" /> NV Xuất
                  </div>
                  <div className="text-[10px] text-slate-500">
                    staff_out / 123
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredential('manager', '123')}
                  className="flex flex-col items-center p-2 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 rounded-lg transition-all"
                >
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs mb-1">
                    <Eye size={12} className="text-purple-600" /> Giám sát
                  </div>
                  <div className="text-[10px] text-slate-500">
                    manager / 123
                  </div>
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;