import { Item, Transaction, User } from '../types';
import { INITIAL_ITEMS, INITIAL_TRANSACTIONS, MOCK_USERS } from '../constants';

// Key lưu trữ trong LocalStorage - Đổi sang v2 để reset dữ liệu mẫu
const DB_KEY = 'shrimpvet_demo_db_v2';

// Giả lập độ trễ mạng (500ms) cho giống thật
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Hàm khởi tạo hoặc lấy dữ liệu từ LocalStorage
const getDatabase = () => {
  const existingData = localStorage.getItem(DB_KEY);
  if (existingData) {
    return JSON.parse(existingData);
  }

  // Dữ liệu mặc định ban đầu (Seed data)
  const initialData = {
    items: INITIAL_ITEMS,
    transactions: INITIAL_TRANSACTIONS,
    users: MOCK_USERS
  };
  
  localStorage.setItem(DB_KEY, JSON.stringify(initialData));
  return initialData;
};

// Hàm lưu dữ liệu xuống LocalStorage
const saveDatabase = (data: any) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

export const apiService = {
  // Đăng nhập (Mock)
  login: async (username: string, password: string): Promise<User | null> => {
    await delay(600);
    const db = getDatabase();
    
    // Logic đơn giản: User tồn tại và pass là 123
    const user = db.users.find((u: User) => u.username === username);
    
    if (user && password === '123') {
      return user;
    }
    
    if (!user) throw new Error('Tài khoản không tồn tại');
    if (password !== '123') throw new Error('Mật khẩu không đúng (Mặc định: 123)');
    
    return null;
  },

  // Lấy dữ liệu ban đầu
  getInitialData: async (): Promise<{ items: Item[], transactions: Transaction[], users: User[] }> => {
    await delay(400);
    const db = getDatabase();
    return { 
      items: db.items, 
      transactions: db.transactions,
      users: db.users 
    };
  },

  // Thực hiện giao dịch (Nhập/Xuất) - Đã cập nhật để nhận 'date' trong transactionData
  processTransaction: async (transactionData: Omit<Transaction, 'id'>, newItem?: Item): Promise<boolean> => {
    await delay(500);
    try {
      const db = getDatabase();
      // Sử dụng ngày người dùng chọn hoặc mặc định là hiện tại nếu thiếu
      const transactionDate = transactionData.date || new Date().toISOString(); 
      const now = new Date().toISOString(); // Thời gian hệ thống thực tế (cho updatedAt)

      // 1. Tạo Transaction Record
      const newTransaction: Transaction = {
        ...transactionData,
        id: 'trans_' + Date.now(),
        date: transactionDate
      };
      // Sắp xếp lại transactions theo ngày giảm dần sau khi thêm mới (để log hiển thị đúng thứ tự thời gian)
      db.transactions.push(newTransaction);
      db.transactions.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // 2. Cập nhật kho (Items)
      if (newItem) {
        // Trường hợp nhập hàng mới hoàn toàn
        db.items.push(newItem);
      } else {
        // Trường hợp cập nhật hàng có sẵn
        const itemIndex = db.items.findIndex((i: Item) => i.id === transactionData.itemId);
        if (itemIndex > -1) {
          const item = db.items[itemIndex];
          if (transactionData.type === 'IN') {
             item.quantity += transactionData.quantity;
          } else {
             item.quantity -= transactionData.quantity;
          }
          item.updatedAt = now; // Cập nhật thời gian sửa đổi là NOW
          db.items[itemIndex] = item;
        }
      }

      saveDatabase(db);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  // Cập nhật thông tin vật tư
  updateItem: async (updatedItem: Item, reason?: string): Promise<boolean> => {
    await delay(400);
    try {
      const db = getDatabase();
      const index = db.items.findIndex((i: Item) => i.id === updatedItem.id);
      
      if (index > -1) {
        // Nếu số lượng thay đổi, ghi log transaction điều chỉnh
        const oldItem = db.items[index];
        if (oldItem.quantity !== updatedItem.quantity && reason) {
           const diff = updatedItem.quantity - oldItem.quantity;
           const adjustmentTrans: Transaction = {
             id: 'adj_' + Date.now(),
             itemId: updatedItem.id,
             itemName: updatedItem.name,
             type: diff > 0 ? 'IN' : 'OUT',
             quantity: Math.abs(diff),
             date: new Date().toISOString(),
             user: 'System (Điều chỉnh)',
             notes: `Điều chỉnh: ${reason}`
           };
           db.transactions.unshift(adjustmentTrans);
        }

        updatedItem.updatedAt = new Date().toISOString();
        db.items[index] = updatedItem;
        saveDatabase(db);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  // Nhập hàng loạt từ Excel (CSV)
  importItems: async (importedItems: Partial<Item>[], user: User): Promise<{ success: boolean, count: number, errors: string[] }> => {
    await delay(800);
    try {
      const db = getDatabase();
      let count = 0;
      const errors: string[] = [];
      const now = new Date().toISOString();

      importedItems.forEach((newItem, index) => {
        if (!newItem.code || !newItem.name) {
          errors.push(`Dòng ${index + 1}: Thiếu mã hoặc tên vật tư.`);
          return;
        }

        // Tìm xem item đã tồn tại chưa dựa theo Mã (Code)
        const existingIndex = db.items.findIndex((i: Item) => i.code === newItem.code);

        if (existingIndex > -1) {
          // Cập nhật item cũ
          const oldItem = db.items[existingIndex];
          
          // Logic: Nếu file import có số lượng, ta cộng dồn hay ghi đè? 
          // Ở đây chọn logic: CẬP NHẬT thông tin, và CỘNG DỒN số lượng nếu có.
          const addedQty = Number(newItem.quantity) || 0;
          
          if (addedQty > 0) {
             // Ghi log nhập kho
             db.transactions.unshift({
                id: 'import_' + Date.now() + '_' + index,
                itemId: oldItem.id,
                itemName: oldItem.name,
                type: 'IN',
                quantity: addedQty,
                date: now,
                user: user.fullName,
                notes: 'Nhập hàng loạt từ Excel'
             });
          }

          db.items[existingIndex] = {
            ...oldItem,
            ...newItem, // Ghi đè các trường thông tin khác (Category, Unit...)
            quantity: oldItem.quantity + addedQty, // Cộng dồn số lượng
            updatedAt: now
          };
        } else {
          // Tạo item mới
          const id = 'item_' + Date.now() + '_' + index;
          const finalItem: Item = {
             id: id,
             code: newItem.code,
             name: newItem.name,
             category: newItem.category || 'Chưa phân loại',
             unit: newItem.unit || 'Cái',
             quantity: Number(newItem.quantity) || 0,
             minLevel: Number(newItem.minLevel) || 0,
             location: newItem.location || 'Kho chung',
             updatedAt: now,
             createdBy: user.username,
             expiryDate: newItem.expiryDate
          };
          db.items.push(finalItem);

          // Ghi log nhập kho ban đầu
          if (finalItem.quantity > 0) {
            db.transactions.unshift({
              id: 'import_new_' + Date.now() + '_' + index,
              itemId: id,
              itemName: finalItem.name,
              type: 'IN',
              quantity: finalItem.quantity,
              date: now,
              user: user.fullName,
              notes: 'Nhập mới từ Excel'
            });
          }
        }
        count++;
      });

      // Sort lại transaction sau khi import hàng loạt
      db.transactions.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime());

      saveDatabase(db);
      return { success: true, count, errors };
    } catch (e) {
      console.error(e);
      return { success: false, count: 0, errors: ['Lỗi hệ thống khi nhập liệu'] };
    }
  },

  // Quản lý User
  manageUser: async (action: 'add' | 'update' | 'delete', userData?: User, userId?: string): Promise<boolean> => {
     await delay(400);
     try {
       const db = getDatabase();
       
       if (action === 'add' && userData) {
         const newUser = { ...userData, id: 'u_' + Date.now() };
         db.users.push(newUser);
       } else if (action === 'update' && userData) {
         const index = db.users.findIndex((u: User) => u.id === userData.id);
         if (index > -1) db.users[index] = userData;
       } else if (action === 'delete' && userId) {
         db.users = db.users.filter((u: User) => u.id !== userId);
       }

       saveDatabase(db);
       return true;
     } catch(error) {
       return false;
     }
  }
};