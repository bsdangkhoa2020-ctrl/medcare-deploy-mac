import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ZALO_BOT_TOKEN = Deno.env.get("ZALO_BOT_TOKEN") || "DEMO_TOKEN";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "DEMO_KEY";
const DIFY_API_KEY = Deno.env.get("DIFY_API_KEY") || "DEMO_KEY";

// Hàm gửi tin nhắn lại cho Zalo Bot
async function sendZaloMessage(chatId: string, text: string) {
  console.log(`[Mock Zalo API] Gửi tin nhắn tới ${chatId}: ${text}`);
  
  if (ZALO_BOT_TOKEN === "DEMO_TOKEN") {
    // Trả về mock thay vì gọi thật để tránh sập
    return { error: 0, message: "Success" };
  }

  const url = "https://openapi.zalo.me/v3.0/oa/message/cs"; 
  const payload = {
    recipient: { user_id: chatId },
    message: { text: text }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": ZALO_BOT_TOKEN,
      },
      body: JSON.stringify(payload),
    });
    return await response.json();
  } catch (error) {
    console.error("Lỗi gửi Zalo message:", error);
  }
}

// Hàm gọi AI (Mock)
async function callDifyRAG(query: string, userId: string) {
  if (DIFY_API_KEY === "DEMO_KEY") {
    // Trả về Mock Response cực kỳ mượt mà thay vì báo lỗi bận
    return `Dạ chào chị! Dù hiện tại em đang chạy ở chế độ DEMO (chưa điền API Key), nhưng em vẫn nhận được tin nhắn "${query}" của chị rồi ạ. Chị cần em hỗ trợ đặt lịch khám hay hỏi đáp thai kỳ ạ? 🌸`;
  }

  try {
    const response = await fetch("https://api.dify.ai/v1/chat-messages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {},
        query: query,
        user: userId,
        response_mode: "blocking"
      })
    });
    
    if (!response.ok) {
       return "Dạ kết nối với Cẩm nang thai kỳ đang bị gián đoạn chút xíu, chị đợi em chút nhé! 🌸";
    }

    const data = await response.json();
    return data.answer || "Dạ em chưa tìm thấy thông tin. Chị cần em nối máy với Lễ tân không?";
  } catch (error) {
    console.error("Lỗi Dify:", error);
    return "Xin lỗi, não AI của tôi đang bận. Bạn thử lại sau nhé!";
  }
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    console.log("Nhận Webhook từ Zalo:", JSON.stringify(body));

    const message = body.message;
    if (!message) return new Response("No message", { status: 200 });

    const chatId = message.chat?.id || body.sender?.id;
    const text = message.text;

    if (text) {
      await sendZaloMessage(chatId, "💭 Bác sĩ ảo đang suy nghĩ...");
      const aiResponse = await callDifyRAG(text, String(chatId));
      await sendZaloMessage(chatId, aiResponse);
      return new Response("OK", { status: 200 });
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Lỗi Webhook:", error);
    return new Response("Lỗi hệ thống", { status: 500 });
  }
});
