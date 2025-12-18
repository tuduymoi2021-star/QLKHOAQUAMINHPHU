import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowRightLeft, 
  BarChart3, 
  Bot, 
  LogOut,
  X,
  Users
} from 'lucide-react';
import { AppRoute, User } from '../types';

interface SidebarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  currentUser: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentRoute, 
  onNavigate, 
  isMobileOpen, 
  setIsMobileOpen, 
  currentUser,
  onLogout
}) => {
  // Define all possible items
  const allNavItems = [
    { 
      id: AppRoute.DASHBOARD, 
      label: 'Tổng quan', 
      icon: LayoutDashboard,
      requiredPerm: 'view' 
    },
    { 
      id: AppRoute.INVENTORY, 
      label: 'Kho vật tư', 
      icon: Package,
      requiredPerm: 'view'
    },
    { 
      id: AppRoute.STOCK_IN, 
      label: 'Nhập kho', 
      icon: ArrowRightLeft, 
      rotate: 90,
      requiredPerm: 'stock_in'
    },
    { 
      id: AppRoute.STOCK_OUT, 
      label: 'Xuất kho', 
      icon: ArrowRightLeft,
      requiredPerm: 'stock_out'
    },
    { 
      id: AppRoute.REPORTS, 
      label: 'Báo cáo', 
      icon: BarChart3,
      requiredPerm: 'view'
    },
    { 
      id: AppRoute.AI_ASSISTANT, 
      label: 'Trợ lý AI', 
      icon: Bot,
      requiredPerm: 'view'
    },
    // Admin only route
    {
      id: AppRoute.USERS,
      label: 'Người dùng',
      icon: Users,
      adminOnly: true,
      requiredPerm: 'view'
    }
  ];

  // Filter based on permissions
  const navItems = allNavItems.filter(item => {
    if (!currentUser) return false;
    
    // Admin has access to everything
    if (currentUser.role === 'admin') return true;
    
    // Non-admin cannot see adminOnly items
    if (item.adminOnly) return false;

    // Check permission array
    return currentUser.permissions.includes(item.requiredPerm as any);
  });

  const handleNav = (route: AppRoute) => {
    onNavigate(route);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out
        bg-white border-r border-slate-200 text-slate-700
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 flex flex-col h-screen shadow-xl md:shadow-none
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <span className="font-bold text-white text-lg">S</span>
            </div>
            <span className="text-xl font-bold tracking-wide text-slate-800">ShrimpVet</span>
          </div>
          <button className="md:hidden text-slate-500 hover:text-slate-700" onClick={() => setIsMobileOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = currentRoute === item.id;
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNav(item.id)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-sky-50 text-primary font-semibold shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    <Icon size={20} className={`${item.rotate ? 'rotate-90' : ''} ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile / Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-primary font-bold">
              {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-slate-800">
                {currentUser?.fullName || 'Người dùng'}
              </p>
              <div className="flex gap-1 text-xs text-slate-500 truncate capitalize">
                 {currentUser?.role === 'admin' ? 'Quản trị' : 'Nhân viên'}
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
          {/* Permissions badge */}
          <div className="mt-3 flex flex-wrap gap-1">
            {currentUser?.permissions.map(p => (
              <span key={p} className="text-[10px] px-2 py-0.5 bg-white rounded-full text-slate-500 border border-slate-200 font-medium shadow-sm">
                {p === 'view' ? 'Xem' : p === 'stock_in' ? 'Nhập' : 'Xuất'}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;