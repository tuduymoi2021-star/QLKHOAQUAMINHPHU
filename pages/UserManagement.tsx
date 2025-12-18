import React, { useState } from 'react';
import { User, Permission } from '../types';
import { Plus, Pencil, Trash2, X, Save, UserCheck, UserPlus, ShieldAlert } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  currentUser: User | null;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  users, 
  currentUser, 
  onAddUser, 
  onUpdateUser, 
  onDeleteUser 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  
  // Temporary password field for the form (not stored in User type for frontend safety in this demo)
  const [tempPassword, setTempPassword] = useState(''); 

  // Reset form state
  const openModal = (user?: User) => {
    if (user) {
      setEditingUser({ ...user });
      setTempPassword(''); // Leave blank if not changing
    } else {
      setEditingUser({
        username: '',
        fullName: '',
        role: 'staff',
        permissions: ['view']
      });
      setTempPassword('123'); // Default for new users
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setTempPassword('');
  };

  const handlePermissionChange = (perm: Permission) => {
    if (!editingUser || !editingUser.permissions) return;
    
    const currentPerms = editingUser.permissions;
    if (currentPerms.includes(perm)) {
      setEditingUser({
        ...editingUser,
        permissions: currentPerms.filter(p => p !== perm)
      });
    } else {
      setEditingUser({
        ...editingUser,
        permissions: [...currentPerms, perm]
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (editingUser.id) {
      // Update
      onUpdateUser(editingUser as User);
    } else {
      // Add New
      // Check if username exists
      if (users.some(u => u.username === editingUser.username)) {
        alert("Tên đăng nhập đã tồn tại!");
        return;
      }
      onAddUser(editingUser as User);
    }
    closeModal();
  };

  const handleDelete = (user: User) => {
    if (user.id === currentUser?.id) {
      alert("Bạn không thể xóa chính mình!");
      return;
    }
    if (window.confirm(`Bạn có chắc muốn xóa nhân viên ${user.fullName}?`)) {
      onDeleteUser(user.id);
    }
  };

  // Permission badge helper
  const renderPermissionBadges = (perms: Permission[]) => {
    return (
      <div className="flex gap-1 flex-wrap">
        {perms.map(p => {
          let color = 'bg-slate-100 text-slate-600';
          let label = 'Xem';
          if (p === 'stock_in') { color = 'bg-green-100 text-green-700'; label = 'Nhập kho'; }
          if (p === 'stock_out') { color = 'bg-amber-100 text-amber-700'; label = 'Xuất kho'; }
          
          return (
            <span key={p} className={`text-xs px-2 py-0.5 rounded-full border border-slate-200 ${color}`}>
              {label}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Quản trị người dùng</h2>
           <p className="text-slate-500 text-sm">Quản lý tài khoản, vai trò và quyền truy cập hệ thống.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-sky-600 transition-colors shadow-sm shadow-sky-200"
        >
          <UserPlus size={20} />
          <span>Thêm nhân viên</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">Người dùng</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Tên đăng nhập</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Vai trò</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Quyền hạn</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white ${user.role === 'admin' ? 'bg-primary' : 'bg-slate-400'}`}>
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-800">{user.fullName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 font-mono text-sm">{user.username}</td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1 w-fit px-2 py-1 rounded-md text-sm font-medium ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                    {user.role === 'admin' ? <ShieldAlert size={14}/> : <UserCheck size={14}/>}
                    {user.role === 'admin' ? 'Admin' : 'Nhân viên'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {renderPermissionBadges(user.permissions)}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => openModal(user)}
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 rounded-lg"
                      title="Sửa"
                    >
                      <Pencil size={18} />
                    </button>
                    {user.id !== currentUser?.id && (
                      <button 
                        onClick={() => handleDelete(user)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors bg-slate-50 rounded-lg"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD/EDIT MODAL */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
             <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {editingUser.id ? <Pencil size={20} className="text-primary"/> : <Plus size={20} className="text-primary"/>}
                {editingUser.id ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên *</label>
                  <input 
                    type="text" required
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-slate-900"
                    value={editingUser.fullName}
                    onChange={e => setEditingUser({...editingUser, fullName: e.target.value})}
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tên đăng nhập *</label>
                    <input 
                      type="text" required
                      disabled={!!editingUser.id} // Cannot change username
                      className={`w-full p-2 border rounded-lg text-slate-900 ${editingUser.id ? 'bg-slate-100 text-slate-500' : 'focus:ring-2 focus:ring-primary/20 outline-none'}`}
                      value={editingUser.username}
                      onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {editingUser.id ? 'Đổi mật khẩu' : 'Mật khẩu *'}
                    </label>
                    <input 
                      type="text" 
                      required={!editingUser.id}
                      placeholder={editingUser.id ? "Giữ nguyên nếu trống" : "VD: 123"}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-slate-900"
                      value={tempPassword}
                      onChange={e => setTempPassword(e.target.value)}
                    />
                  </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Vai trò</label>
                 <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg flex-1 hover:bg-slate-50">
                       <input 
                        type="radio" 
                        name="role" 
                        checked={editingUser.role === 'staff'} 
                        onChange={() => setEditingUser({...editingUser, role: 'staff'})}
                        className="text-primary focus:ring-primary"
                       />
                       <div>
                         <span className="block font-medium text-slate-800">Nhân viên</span>
                         <span className="text-xs text-slate-500">Giới hạn theo quyền</span>
                       </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg flex-1 hover:bg-slate-50">
                       <input 
                        type="radio" 
                        name="role" 
                        checked={editingUser.role === 'admin'} 
                        onChange={() => setEditingUser({...editingUser, role: 'admin', permissions: ['view', 'stock_in', 'stock_out']})} // Auto full perm for admin
                        className="text-primary focus:ring-primary"
                       />
                       <div>
                         <span className="block font-medium text-slate-800">Quản trị viên</span>
                         <span className="text-xs text-slate-500">Toàn quyền hệ thống</span>
                       </div>
                    </label>
                 </div>
               </div>

              {/* Only show permissions config if Staff */}
               {editingUser.role === 'staff' && (
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-3">Phân quyền chức năng</label>
                    <div className="space-y-2">
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editingUser.permissions?.includes('view')}
                            onChange={() => handlePermissionChange('view')}
                            className="rounded text-primary focus:ring-primary"
                          />
                          <span className="text-slate-700">Xem danh sách & Báo cáo</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editingUser.permissions?.includes('stock_in')}
                            onChange={() => handlePermissionChange('stock_in')}
                            className="rounded text-primary focus:ring-primary"
                          />
                          <span className="text-slate-700">Nhập kho (Tạo vật tư mới)</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editingUser.permissions?.includes('stock_out')}
                            onChange={() => handlePermissionChange('stock_out')}
                            className="rounded text-primary focus:ring-primary"
                          />
                          <span className="text-slate-700">Xuất kho</span>
                       </label>
                    </div>
                 </div>
               )}

               <div className="flex justify-end gap-3 pt-2">
                 <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">
                   Hủy
                 </button>
                 <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-sky-600 flex items-center gap-2">
                    <Save size={18} />
                    Lưu
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;