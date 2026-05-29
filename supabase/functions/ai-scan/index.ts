import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY = Deno.env.get('SB_SERVICE_KEY')!;

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

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

function parseDob(dobStr: string) {
  if (!dobStr) return null;
  const parts = dobStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { file_url, scan_type, file_info, specialty } = await req.json();

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
  "dob": "Ngày tháng năm sinh (định dạng DD/MM/YYYY, nếu không có để trống)",
  "doc_type": "xet_nghiem/don_thuoc/khac",
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

    // 3. Database Operations (if file_info is provided)
    let isNewPatient = false;
    let matchedBnCode = null;
    let dbError = null;

    if (file_info && resultJson.extracted_name) {
      const pName = resultJson.extracted_name;
      const { data: patients } = await sb.from('patients')
        .select('bn_code, name')
        .ilike('name', `%${pName}%`)
        .limit(1);

      if (patients && patients.length > 0) {
        matchedBnCode = patients[0].bn_code;
      } else {
        // Tự động tạo hồ sơ mới
        matchedBnCode = 'BN_' + Math.floor(100000 + Math.random() * 900000).toString();
        isNewPatient = true;
        const dbDob = parseDob(resultJson.dob);

        const { error: pErr } = await sb.from('patients').insert({
          bn_code: matchedBnCode,
          name: pName,
          dob: dbDob,
          specialty: specialty || 'gy' // Phân loại chuyên khoa từ Lễ tân truyền lên
        });
        if (pErr) {
          console.error("Lỗi tạo bệnh nhân:", pErr);
          dbError = "Lỗi tạo bệnh nhân";
        }
      }

      if (matchedBnCode && !dbError) {
        const { error: aErr } = await sb.from('attachments').insert({
          bn_code: matchedBnCode,
          file_name: file_info.file_name,
          storage_path: file_info.storage_path,
          file_size: file_info.file_size,
          mime_type: file_info.mime_type,
          doctype: resultJson.doc_type || 'khac',
          scan_type: resultJson.doc_type || 'khac',
          status: 'ai_processed',
          is_saved_to_emr: true,
          ai_extracted: {
            result: resultJson.summary,
            parsed: resultJson,
            type: resultJson.doc_type,
            is_abnormal: resultJson.is_abnormal,
            public_url: file_url
          }
        });
        if (aErr) {
          console.error("Lỗi tạo attachment:", aErr);
          dbError = "Lỗi lưu file vào DB";
        }
      }
    }

    return new Response(JSON.stringify({ 
      ...resultJson, 
      isNewPatient, 
      matchedBnCode, 
      dbError 
    }), {
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
