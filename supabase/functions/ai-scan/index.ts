import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { file_url, scan_type } = await req.json();

    if (!file_url) {
      return new Response(JSON.stringify({ error: 'Missing file_url' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 1. Fetch file from URL
    const fileRes = await fetch(file_url);
    if (!fileRes.ok) throw new Error('Failed to fetch file from URL');
    
    const mimeType = fileRes.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await fileRes.arrayBuffer();
    const base64Data = arrayBufferToBase64(arrayBuffer);

    // 2. Call Gemini
    const prompt = `Bạn là một Chuyên gia Y khoa, Bác sĩ Chẩn đoán hình ảnh và xét nghiệm lâm sàng hạng ưu.
Nhiệm vụ của bạn là đọc hình ảnh y tế được cung cấp (phiếu xét nghiệm, đơn thuốc, hồ sơ bệnh án) loại: "${scan_type || 'Khác'}" và thực hiện Báo cáo Y khoa chuyên sâu.
Hãy trích xuất thông tin dưới dạng JSON THUẦN TÚY với cấu trúc sau:
{
  "extracted_name": "Tên bệnh nhân trên phiếu (nếu có, viết hoa, không có để trống)",
  "dob": "Ngày tháng năm sinh hoặc tuổi (nếu có)",
  "summary": "Tóm tắt chuyên môn: Đọc các chỉ số xét nghiệm, đánh giá kết quả, kết luận chẩn đoán. Phân tích chi tiết nhưng súc tích, giải thích ý nghĩa các chỉ số quan trọng.",
  "abnormal_items": ["Danh sách các chỉ số bất thường, triệu chứng nguy hiểm hoặc cảnh báo lâm sàng (nếu có)"],
  "is_abnormal": true/false (true nếu có bất kỳ chỉ số vượt ngưỡng hoặc phát hiện bệnh lý cần bác sĩ lưu ý gấp)
}
Tuyệt đối chỉ trả về JSON, không kèm dấu \`\`\`json hay bất kỳ văn bản nào khác.`;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: base64Data } }
          ]
        }],
        generationConfig: { temperature: 0.1 }
      })
    });

    const geminiData = await geminiRes.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Parse JSON safely
    const resultJson = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());

    return new Response(JSON.stringify(resultJson), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI Scan Error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
