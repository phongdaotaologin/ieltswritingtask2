/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { 
  AnalysisMCQ, 
  Feedback, 
  Correction, 
  MCQOption, 
  GuidedMaterial, 
  BodyStepData,
  EssayType
} from "../types";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const ieltsTutorService = {
  async getTaskAnalysis(prompt: string): Promise<AnalysisMCQ> {
    const systemPrompt = `Bạn là chuyên gia IELTS. Hãy phân tích đề bài sau và tạo 2 bộ câu hỏi trắc nghiệm bằng TIẾNG VIỆT để kiểm tra sự hiểu đề của học sinh.
    
    1. Câu hỏi về Dạng Bài (essayType): Xác định xem đề thuộc loại nào trong 5 loại:
       - Opinion (Agree/Disagree)
       - Discussion (Discuss both views)
       - Problem - Solution
       - Advantages - Disadvantages
       - Two-part question
    2. Câu hỏi về Yêu Cầu Đề Bài (requirements): Những gì học sinh BẮT BUỘC phải làm.

    Yêu cầu:
    - Mỗi bộ câu hỏi có 3 lựa chọn (1 đúng, 2 sai).
    - Có giải thích (explanation) tại sao đúng/sai.
    - Nếu đúng, cung cấp thêm phần mở rộng (extension) để học sinh hiểu sâu hơn.

    Đề bài: ${prompt}

    Trả về JSON:
    {
      "essayType": [{"text": "...", "isCorrect": true, "explanation": "...", "extension": "..." }, ...],
      "requirements": [{"text": "...", "isCorrect": true, "explanation": "...", "extension": "..." }, ...]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: systemPrompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  },

  async getApproachOptions(prompt: string, essayType: EssayType): Promise<MCQOption[]> {
    const systemPrompt = `Dựa trên đề bài và dạng bài (${essayType}), hãy gợi ý các hướng tiếp cận/quan điểm (stance/approach) phù hợp.
    
    Ví dụ: 
    - Opinion: Agree / Disagree / Partly Agree
    - Discussion: View 1 / View 2 / Balanced view
    - Problem-Solution: Focus on most critical problem & solution
    - Advantages-Disadvantages: Advantages outweigh / Disadvantages outweigh / Equal
    
    Yêu cầu:
    - Ngôn ngữ: TIẾNG VIỆT.
    - Giải thích rõ tại sao nên chọn hướng này.
    
    Đề bài: ${prompt}

    Trả về JSON:
    {
      "options": [{"text": "...", "isCorrect": true, "explanation": "..." }, ...]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: systemPrompt,
      config: { responseMimeType: "application/json" }
    });
    const parsed = JSON.parse(response.text || "{}");
    return parsed.options || [];
  },

  async getBodyStepData(prompt: string, essayType: EssayType, stage: 4 | 5, selections: any): Promise<BodyStepData> {
    const systemPrompt = `Bạn là chuyên gia IELTS. Hãy chuẩn bị dữ liệu hướng dẫn cho đoạn thân bài ${stage === 4 ? '1' : '2'} (Body ${stage - 3}).
    
    HƯỚNG DẪN TƯ DUY (LINEAR THINKING):
    1. Topic Sentence Guidance (BẮT BUỘC):
       - Phải dựa trực tiếp trên hướng giải quyết đã chọn: ${selections.approach}
       - vietnamese: Câu gợi ý Tiếng Việt hoàn chỉnh (có **bold** từ vựng).
       - vocab: 3-5 từ vựng (Việt -> Anh).
       - structures: ĐÚNG 1 cấu trúc duy nhất (____ skeleton) phù hợp với nghĩa câu Tiếng Việt.
       - sample: 1 câu mẫu Tiếng Anh chuẩn xác, bám sát cấu trúc và nghĩa.
    2. Potential Ideas: Cung cấp 4 ý tưởng chính. Mỗi ý tưởng gồm:
       - id, core (Tiếng Việt).
       - development: 3 câu hỏi MCQ (Main Idea -> Why -> Result/Example) để xây dựng logic Linear.
    
    Đề bài: ${prompt}
    Dữ liệu đã chọn: ${JSON.stringify(selections)}

    Trả về JSON:
    {
      "role": "Mô tả vai trò đoạn văn",
      "topicSentenceGuidance": {
        "vietnamese": "...",
        "vocab": [{"vi": "...", "en": "..."}],
        "structures": [{"skeleton": "...", "sample": "...", "explanation": "..."}],
        "sample": "..."
      },
      "potentialIdeas": [
        {
          "id": "...", "core": "...",
          "development": [
            { "question": "...", "options": [{"text": "...", "isCorrect": true, "explanation": "..." }, ...] }
          ]
        }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: systemPrompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  },

  async getGuidedMaterial(prompt: string, selections: any, part: string): Promise<GuidedMaterial> {
    const systemPrompt = `Tạo tài liệu hướng dẫn viết cho phần (${part}) của bài IELTS Task 2.
    
    QUY TẮC THIẾT KẾ ĐOẠN VĂN (1-1 MAPPING):
    1. vietnamese: Cung cấp đoạn văn gợi ý Tiếng Việt hoàn chỉnh. Dùng **cụm từ** để highlight các từ vựng quan trọng.
    2. structures: 
       - MỖI câu trong đoạn Tiếng Việt phải có ĐÚNG 1 cấu trúc (____) tương ứng.
       - Cấu trúc phải theo trình tự logic của đoạn Tiếng Việt.
       - 1 câu = 1 cấu trúc. Không quá tải.
    3. vocab: Danh sách từ vựng đồng bộ 100% với đoạn văn và cấu trúc. Bám sát ý nghĩa 1-1.
    4. HIGHLIGHT: Trong phần "sample" của từng structure, phải dùng dấu ** ** để highlight các từ vựng/cụm từ đắt giá đã liệt kê trong phần vocab.

    Đề bài: ${prompt}
    Selections: ${JSON.stringify(selections)}

    Trả về JSON:
    {
      "vietnamese": "...",
      "vocab": [{"vi": "...", "en": "..."}],
      "structures": [{"skeleton": "...", "sample": "...", "explanation": "..."}]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: systemPrompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  },

  async correctParagraph(paragraph: string, context: string, suggestedMaterial?: any): Promise<{ corrections: Correction[]; feedback: string; revisedParagraph: string }> {
    const systemPrompt = `Phân tích và sửa bài viết IELTS. 
    Bối cảnh: ${context}
    Bài viết: ${paragraph}
    Tài liệu gợi ý: ${JSON.stringify(suggestedMaterial)}

    QUY TẮC PHẢN HỒI:
    1. Feedback: Trình bày theo BULLET POINTS (dùng dấu *), mỗi tiêu chí một dòng.
       * Task Response: [Điểm mạnh/Yếu]
       * Coherence & Cohesion: [Điểm mạnh/Yếu]
       * Lexical Resource: [Điểm mạnh/Yếu]
       * Grammatical Range: [Điểm mạnh/Yếu]
       * Strengths (+): [Những gì bạn đã làm tốt]
    2. Corrections: 
       - CHỈ highlight và chỉ ra các cụm từ/câu cần cải thiện. 
       - KHÔNG viết lại toàn bộ đoạn văn.
       - Giải thích rõ tại sao cần sửa.
       - Criterion: TR, CC, LR, GRA, SE (Spelling Error).
    3. Revised Paragraph: Cung cấp 1 đoạn văn đã được sửa lỗi hoàn chỉnh (revisedParagraph).
    4. KHÔNG ĐƯỢC mâu thuẫn với tài liệu gợi ý. Nếu học sinh dùng đúng từ vựng/cấu trúc đã gợi ý, phải công nhận tính chính xác (đưa vào phần Strengths).
    5. Ngôn ngữ: TIẾNG VIỆT.

    Trả về JSON:
    {
      "feedback": "...",
      "corrections": [{"original": "...", "fixed": "...", "explanation": "...", "criterion": "..."}],
      "revisedParagraph": "..."
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: systemPrompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  },

  async getPersonalizedSample(prompt: string, selections: any): Promise<Feedback> {
    const systemPrompt = `Chấm điểm và tạo bài mẫu IELTS Task 2 dựa trên logic của học sinh.
    
    YÊU CẦU:
    1. Overall Score & Criteria: LÀM TRÒN XUỐNG (ví dụ 6.8 -> 6).
    2. Sample Essay: Viết lại bài hoàn chỉnh. In đậm **các cụm từ đắt giá**.
    3. highValuePhrases: Danh sách cụm từ đã in đậm trong bài mẫu, kèm nghĩa Tiếng Việt. Phải đồng nhất với danh sách Vocab đã gợi ý ở các bước trước.

    Đề bài: ${prompt}
    Dữ liệu: ${JSON.stringify(selections)}

    Trả về JSON:
    {
      "score": "...",
      "criteria": {
        "tr": { "score": "...", "comment": "..." },
        "cc": { "score": "...", "comment": "..." },
        "lr": { "score": "...", "comment": "..." },
        "gra": { "score": "...", "comment": "..." }
      },
      "sample": "...",
      "highValuePhrases": [{"phrase": "...", "meaning": "..."}]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: systemPrompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  }
};
