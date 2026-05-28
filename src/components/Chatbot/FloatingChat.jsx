import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Sparkles } from 'lucide-react';

const MOCK_SCENARIOS = [
  {
    keywords: ['đặt lịch', 'khám', 'hẹn'],
    response: "Dạ chị muốn đặt lịch khám với BS Tuấn phải không ạ? Chị cho em xin Số Điện Thoại và Thời gian rảnh để em báo Lễ tân lên lịch ưu tiên cho mình nhé! ✨"
  },
  {
    keywords: ['đau bụng', 'ra máu', 'nguy hiểm', 'cấp cứu'],
    response: "Dạ trường hợp này cần sự tư vấn chuyên môn sâu. Em sẽ báo lại Căn phòng Lễ tân để bác sĩ gọi lại hỗ trợ chị ngay nhé. Chị cố gắng nghỉ ngơi và giữ bình tĩnh ạ 🌸"
  },
  {
    keywords: ['thai', 'ăn gì', 'dinh dưỡng', 'uống'],
    response: "Dạ để thai kỳ khoẻ mạnh, mẹ nên ưu tiên ăn chín uống sôi, bổ sung thịt bò, cá hồi, rau xanh và các loại hạt. Hạn chế đồ sống, đu đủ xanh và dứa mẹ nhé! ❤️"
  }
];

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Dạ em chào chị! Em là Trợ lý AI của Bác sĩ Tuấn. Chị cần em hỗ trợ gì ạ? ✨' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = "Dạ em ghi nhận thông tin rồi ạ. Chị cần em hỗ trợ thêm gì không? ❤️";
      
      const userMsgLower = userMsg.toLowerCase();
      for (const scenario of MOCK_SCENARIOS) {
        if (scenario.keywords.some(kw => userMsgLower.includes(kw))) {
          botResponse = scenario.response;
          break;
        }
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[350px] sm:w-[380px] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col mb-4 border border-[#F5EBE3] transition-all duration-300 origin-bottom-right">
          {/* Header */}
          <div className="bg-[#3E2A3D] px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C7A47B]/20 flex items-center justify-center border border-[#C7A47B]/50 shadow-inner">
                <Bot className="w-5 h-5 text-[#C7A47B]" />
              </div>
              <div>
                <h3 className="font-serif text-[#F5EBE3] text-lg leading-tight font-medium">Trợ lý bstuan247</h3>
                <p className="text-[#C7A47B] text-xs flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Luôn sẵn sàng hỗ trợ
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[#F5EBE3] hover:text-[#C7A47B] transition-colors p-2 -mr-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 bg-[#FDFBF9] p-4 overflow-y-auto flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-[#3E2A3D] flex-shrink-0 flex items-center justify-center mr-2 shadow-sm">
                    <Sparkles className="w-4 h-4 text-[#C7A47B]" />
                  </div>
                )}
                
                <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-[#C7A47B] text-white rounded-tr-sm' 
                    : 'bg-white border border-[#E5D5C5] text-[#4A4A4A] rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-[#3E2A3D] flex-shrink-0 flex items-center justify-center mr-2 shadow-sm">
                  <Sparkles className="w-4 h-4 text-[#C7A47B]" />
                </div>
                <div className="bg-white border border-[#E5D5C5] rounded-2xl rounded-tl-sm p-4 flex gap-1 items-center shadow-sm">
                  <div className="w-1.5 h-1.5 bg-[#C7A47B]/60 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#C7A47B]/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-[#C7A47B]/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-[#F5EBE3]">
            <div className="flex items-end gap-2 bg-[#FDFBF9] border border-[#E5D5C5] rounded-xl p-1 focus-within:ring-2 focus-within:ring-[#C7A47B]/30 transition-all">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Nhắn tin cho em nhé..."
                className="flex-1 max-h-24 bg-transparent border-none focus:ring-0 resize-none text-[15px] py-2 px-3 text-[#3E2A3D] placeholder:text-[#A09395]"
                rows="1"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 mb-1 mr-1 rounded-lg bg-[#3E2A3D] text-[#C7A47B] hover:bg-[#2E1F2D] disabled:opacity-50 disabled:hover:bg-[#3E2A3D] transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-center text-[11px] text-[#A09395] mt-2 font-medium">
              Trợ lý AI tuân thủ nguyên tắc bảo mật y tế
            </p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen ? 'bg-[#F5EBE3] text-[#3E2A3D]' : 'bg-[#3E2A3D] text-[#C7A47B]'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-bold">
            1
          </span>
        )}
      </button>
    </div>
  );
}
