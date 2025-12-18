import { GoogleGenAI } from "@google/genai";
import { Item, Transaction } from '../types';

export const getInventoryInsights = async (
  query: string, 
  items: Item[], 
  transactions: Transaction[]
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "Vui lòng cấu hình API Key để sử dụng tính năng này.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Prepare context
    const itemsContext = JSON.stringify(items.map(i => ({ 
      name: i.name, 
      qty: i.quantity, 
      unit: i.unit, 
      loc: i.location,
      cat: i.category 
    })));
    
    const recentTransContext = JSON.stringify(transactions.slice(0, 10).map(t => ({
      name: t.itemName,
      type: t.type,
      qty: t.quantity,
      date: t.date
    })));

    const systemInstruction = `
      Bạn là trợ lý ảo quản lý kho thông minh cho công ty ShrimpVet (chuyên về tôm và thủy sản).
      Bạn có quyền truy cập vào dữ liệu tồn kho và giao dịch gần đây.
      Nhiệm vụ của bạn là:
      1. Trả lời các câu hỏi về vị trí, số lượng vật tư.
      2. Đưa ra lời khuyên về bảo quản hóa chất/thuốc (ví dụ: formal, kháng sinh).
      3. Cảnh báo các vật tư sắp hết hoặc thừa thãi.
      4. Trả lời ngắn gọn, súc tích bằng tiếng Việt.
      
      Dữ liệu tồn kho hiện tại: ${itemsContext}
      Giao dịch gần đây: ${recentTransContext}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text || "Không thể tạo câu trả lời.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Đã xảy ra lỗi khi kết nối với trợ lý ảo. Vui lòng thử lại sau.";
  }
};