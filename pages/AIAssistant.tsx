import React, { useState } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { Item, Transaction } from '../types';
import { getInventoryInsights } from '../services/geminiService';
import VoiceInputButton from '../components/VoiceInputButton';

interface AssistantProps {
  items: Item[];
  transactions: Transaction[];
}

const AIAssistant: React.FC<AssistantProps> = ({ items, transactions }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse('');
    
    const result = await getInventoryInsights(query, items, transactions);
    
    setResponse(result);
    setLoading(false);
  };

  const suggestions = [
    "Vật tư nào đang sắp hết?",
    "Tổng kết hoạt động nhập xuất tuần này",
    "Cách bảo quản Formaldehyde?",
    "Liệt kê các loại thuốc kháng sinh đang có"
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bot className="text-primary" size={24} />
        </div>
        <div>
          <h2 className="font-bold text-slate-800">ShrimpVet AI Assistant</h2>
          <p className="text-xs text-slate-500">Hỗ trợ tra cứu thông tin vật tư và quy trình</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {response === '' && !loading && (
          <div className="text-center mt-12">
            <Bot size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">Xin chào! Tôi có thể giúp gì cho bạn?</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Tôi có thể phân tích dữ liệu tồn kho hiện tại hoặc trả lời các câu hỏi về kỹ thuật bảo quản.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
              {suggestions.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => setQuery(s)}
                  className="p-3 text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User Query Display (if needed history, currently just prompt/response) */}
        
        {loading && (
          <div className="flex items-start gap-3 animate-pulse">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <Bot size={16} className="text-primary" />
            </div>
            <div className="bg-slate-100 p-4 rounded-r-xl rounded-bl-xl w-3/4">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </div>
          </div>
        )}

        {response && (
          <div className="space-y-4">
             {/* User Question Echo */}
             <div className="flex justify-end">
                <div className="bg-primary text-white p-3 rounded-l-xl rounded-br-xl max-w-[80%]">
                   {query}
                </div>
             </div>

             {/* AI Response */}
             <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                   <Bot size={16} className="text-primary" />
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-r-xl rounded-bl-xl text-slate-800 leading-relaxed whitespace-pre-wrap shadow-sm">
                   {response}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <form onSubmit={handleAsk} className="relative flex gap-2">
          <div className="relative flex-1">
             <input
              type="text"
              className="w-full p-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 placeholder:text-slate-400"
              placeholder="Hỏi về tồn kho, vị trí hoặc quy trình..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="absolute right-2 top-2">
              <VoiceInputButton onTranscript={(txt) => setQuery(txt)} />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading || !query.trim()}
            className="p-3 bg-primary text-white rounded-xl hover:bg-sky-600 disabled:opacity-50 disabled:hover:bg-primary transition-colors flex items-center justify-center"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;