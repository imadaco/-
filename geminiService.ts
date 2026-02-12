
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateProductDescription = async (productName: string, features: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `اكتب وصفًا جذابًا ومقنعًا للمنتج التالي باللغة العربية:
اسم المنتج: ${productName}
المميزات: ${features}
يجب أن يكون الوصف بأسلوب تسويقي حديث ومناسب للبيع عبر الإنترنت.`,
    });
    return response.text || "فشل في إنشاء الوصف.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.";
  }
};

export const chatWithAssistant = async (message: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: "أنت مساعد ذكي لمنصة 'متجري' للتجارة الإلكترونية. تساعد العملاء في العثور على المنتجات وتجيب على استفساراتهم حول الدفع عند الاستلام. تحدث باللهجة العربية الفصحى أو بلهجة بيضاء بسيطة.",
      }
    });
    return response.text || "آسف، لا أستطيع الرد حالياً.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "عذراً، واجهت مشكلة تقنية.";
  }
};
