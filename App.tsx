import React, { useState, useEffect } from 'react';
import { Menu, Loader2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import StockOperation from './pages/StockOperation';
import Reports from './pages/Reports';
import AIAssistant from './pages/AIAssistant';
import Login from './pages/Login';
import UserManagement from './pages/UserManagement';
import { AppRoute, Item, Transaction, User } from './types';
import { apiService } from './services/backendApi';

const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('shrimpvet_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.DASHBOARD);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // App State
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Fetch Data from Server on Mount or after Login
  const refreshData = async () => {
    if (!currentUser) return;
    
    setIsLoadingData(true);
    try {
      const data = await apiService.getInitialData();
      setItems(data.items);
      setTransactions(data.transactions);
      setUsers(data.users);
    } catch (error) {
      console.error("Failed to load data", error);
      alert("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser]);

  // Auth Handlers
  const handleLogin = async (user: User) => {
    // Note: The login logic is handled inside Login.tsx which calls apiService.login
    // Here we just receive the user object after success
    setCurrentUser(user);
    localStorage.setItem('shrimpvet_user', JSON.stringify(user));
    setCurrentRoute(AppRoute.DASHBOARD);
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      setCurrentUser(null);
      localStorage.removeItem('shrimpvet_user');
      setItems([]);
      setTransactions([]);
      setCurrentRoute(AppRoute.LOGIN);
    }
  };

  // User Management Handlers
  const handleAddUser = async (newUser: User) => {
    const success = await apiService.manageUser('add', newUser);
    if (success) refreshData();
    else alert("Lỗi khi thêm người dùng");
  };

  const handleUpdateUser = async (updatedUser: User) => {
    const success = await apiService.manageUser('update', updatedUser);
    if (success) {
        refreshData();
        if (currentUser && currentUser.id === updatedUser.id) {
            const updatedCurrentUser = { ...currentUser, ...updatedUser };
            setCurrentUser(updatedCurrentUser);
            localStorage.setItem('shrimpvet_user', JSON.stringify(updatedCurrentUser));
        }
    } else alert("Lỗi khi cập nhật người dùng");
  };

  const handleDeleteUser = async (userId: string) => {
    const success = await apiService.manageUser('delete', undefined, userId);
    if (success) refreshData();
    else alert("Lỗi khi xóa người dùng");
  };

  // Stock Handlers
  const handleStockTransaction = async (data: Omit<Transaction, 'id'>, newItem?: Item) => {
    setIsLoadingData(true);
    const success = await apiService.processTransaction(data, newItem);
    if (success) {
        await refreshData(); // Re-fetch absolute truth from server
        alert("Giao dịch thành công!");
    } else {
        alert("Có lỗi xảy ra khi xử lý giao dịch.");
        setIsLoadingData(false);
    }
  };

  const handleUpdateItem = async (updatedItem: Item, reason?: string) => {
    setIsLoadingData(true);
    const success = await apiService.updateItem(updatedItem, reason);
    if (success) {
        await refreshData();
        alert("Cập nhật thành công!");
    } else {
        alert("Lỗi cập nhật vật tư.");
        setIsLoadingData(false);
    }
  };

  const handleImportItems = async (importedItems: Partial<Item>[]) => {
    if (!currentUser) return;
    setIsLoadingData(true);
    const result = await apiService.importItems(importedItems, currentUser);
    setIsLoadingData(false);

    if (result.success) {
      await refreshData();
      alert(`Nhập thành công ${result.count} vật tư!`);
      if (result.errors.length > 0) {
        alert("Cảnh báo:\n" + result.errors.join("\n"));
      }
    } else {
      alert("Nhập thất bại: " + result.errors[0]);
    }
  };

  // Content Renderer
  const renderContent = () => {
    if (isLoadingData && items.length === 0) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-primary" size={48} /></div>;
    }

    switch (currentRoute) {
      case AppRoute.DASHBOARD:
        return <Dashboard items={items} transactions={transactions} />;
      case AppRoute.INVENTORY:
        return (
          <Inventory 
            items={items} 
            transactions={transactions}
            currentUser={currentUser}
            onNavigate={setCurrentRoute} 
            onUpdateItem={handleUpdateItem}
            onImportItems={handleImportItems}
          />
        );
      case AppRoute.STOCK_IN:
        return <StockOperation type="IN" items={items} currentUser={currentUser} onSubmit={handleStockTransaction} onNavigate={setCurrentRoute} />;
      case AppRoute.STOCK_OUT:
        return <StockOperation type="OUT" items={items} currentUser={currentUser} onSubmit={handleStockTransaction} onNavigate={setCurrentRoute} />;
      case AppRoute.REPORTS:
        return <Reports items={items} transactions={transactions} />;
      case AppRoute.AI_ASSISTANT:
        return <AIAssistant items={items} transactions={transactions} />;
      case AppRoute.USERS:
        return (
          <UserManagement 
            users={users} 
            currentUser={currentUser}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        );
      default:
        return <Dashboard items={items} transactions={transactions} />;
    }
  };

  // Login Guard
  if (!currentUser) {
    return (
        <Login 
            onLogin={handleLogin} 
            // We pass a login function wrapper to bridge the API call within Login component
            usersList={[]} // Login component will handle API verification now
        />
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        currentRoute={currentRoute} 
        onNavigate={setCurrentRoute} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMobileOpen(true)} className="p-2 text-slate-600">
              <Menu size={24} />
            </button>
            <span className="font-bold text-slate-800 text-lg">ShrimpVet</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
            {currentUser.fullName.charAt(0)}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {isLoadingData && (
             <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 overflow-hidden z-50">
                <div className="h-full bg-primary animate-pulse w-1/3 mx-auto"></div>
             </div>
          )}
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;