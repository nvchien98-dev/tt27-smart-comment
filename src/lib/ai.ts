import { GoogleGenAI } from '@google/genai';

// Initialize the SDK. It automatically picks up GEMINI_API_KEY from environment.
// Using a singleton pattern or initializing inside the function.
export async function generateCommentsBatch({
  students,
  subject,
  revisionPrompt
}: {
  students: { id: string, name: string, score?: number, level?: string }[];
  subject: string;
  revisionPrompt?: string;
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Bạn là một giáo viên tiểu học tại Việt Nam, rất am hiểu Thông tư 27/2020/TT-BGDĐT.
Nhiệm vụ của bạn là viết nhận xét môn học cuối năm cho danh sách học sinh sau đây.

Môn học: ${subject}
Danh sách học sinh:
${students.map(s => `- ID: ${s.id} | Họ tên: ${s.name} ${s.score !== undefined ? `| Điểm: ${s.score}` : ''} ${s.level ? `| Mức: ${s.level}` : ''}`).join('\n')}

Yêu cầu theo Thông tư 27:
- Nếu điểm cao (9-10) hoặc mức Tốt: Khen ngợi năng lực nổi bật, tư duy tốt.
- Nếu điểm khá (7-8) hoặc mức Đạt: Động viên, ghi nhận sự tiến bộ.
- Nếu điểm TB/thấp (dưới 7) hoặc Cần cố gắng: Nhận xét nhẹ nhàng, không tiêu cực, định hướng giải pháp.

Quy tắc viết:
- Văn phong chuẩn giáo viên tiểu học Việt Nam.
- Không lặp lại y hệt các cấu trúc câu giữa các học sinh.
- Mỗi nhận xét dài 1-2 câu ngắn gọn.
- TUYỆT ĐỐI KHÔNG nhắc đến tên học sinh trong câu nhận xét (Ví dụ: thay vì viết "Em Hùng làm bài tốt", chỉ viết "Làm bài tốt", "Hoàn thành tốt bài tập", "Em tiếp thu bài tốt").
${revisionPrompt ? `\nYÊU CẦU BỔ SUNG TỪ GIÁO VIÊN (Rất quan trọng, bắt buộc tuân theo):\n"${revisionPrompt}"` : ''}

QUAN TRỌNG: 
Trả về kết quả DƯỚI DẠNG CHUỖI JSON ARRAY (Không có markdown \`\`\`json).
Ví dụ định dạng trả về:
[
  { "id": "1", "comment": "Em hoàn thành tốt bài tập Toán..." },
  { "id": "2", "comment": "Em cần cố gắng hơn..." }
]
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let text = response.text || "[]";
    // Clean up potential markdown formatting
    if (text.includes('\`\`\`json')) {
       text = text.split('\`\`\`json')[1].split('\`\`\`')[0].trim();
    } else if (text.includes('\`\`\`')) {
       text = text.split('\`\`\`')[1].split('\`\`\`')[0].trim();
    }
    
    return JSON.parse(text);
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    if (error.status === 429) {
       throw new Error('API Rate Limit (Lỗi 429: Quá tải yêu cầu, vui lòng thử lại sau ít phút)');
    }
    throw new Error('Failed to generate comment: ' + (error.message || 'Unknown error'));
  }
}

export async function generateCompetencyComment({
  studentName,
  type,
  data,
  history = []
}: {
  studentName: string;
  type: 'chung' | 'dacthu' | 'phamchat' | 'hocba';
  data: any;
  history?: string[];
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable');
  }

  const ai = new GoogleGenAI({ apiKey });
  
  let typeDescription = '';
  if (type === 'chung') typeDescription = 'Năng lực chung (Tự chủ tự học, Giao tiếp hợp tác, Giải quyết vấn đề)';
  if (type === 'dacthu') typeDescription = 'Năng lực đặc thù (Ngôn ngữ, Tính toán, Khoa học, Công nghệ, Tin học, Thẩm mỹ, Thể chất)';
  if (type === 'phamchat') typeDescription = 'Phẩm chất chủ yếu (Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm)';
  if (type === 'hocba') typeDescription = 'Đánh giá học bạ cuối năm (Tổng hợp toàn diện)';

  const prompt = `
Bạn là một giáo viên tiểu học tại Việt Nam, rất am hiểu Thông tư 27/2020/TT-BGDĐT.
Nhiệm vụ của bạn là viết một lời nhận xét về ${typeDescription} cho học sinh.

Thông tin học sinh:
- Họ và tên: ${studentName}
- Dữ liệu đánh giá: ${JSON.stringify(data)}

Quy tắc viết:
- Dựa vào các tiêu chí được đánh giá Tốt/Đạt/Cần cố gắng để viết thành đoạn văn logic.
- Văn phong chuẩn giáo dục tiểu học, tự nhiên, có cảm xúc sư phạm.
- Nếu có tiêu chí Cần cố gắng, hãy dùng lời lẽ động viên, nhẹ nhàng định hướng.
- Độ dài: 2-3 câu ngắn gọn.
- Không lặp lại y hệt các nhận xét sau đây (nếu có): ${history.join(' | ')}
- Trả về CHỈ nội dung nhận xét, không thêm lời chào hay giải thích gì khác.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate comment');
  }
}
