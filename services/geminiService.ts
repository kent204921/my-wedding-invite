import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

// Declare process to avoid TypeScript errors if @types/node is missing,
// and to comply with the guideline to use process.env.API_KEY.
declare const process: { env: { API_KEY: string } };

const createClient = () => {
  // Cloudflare/Vite requires environment variables to start with VITE_
  // However, @google/genai guidelines strictly require process.env.API_KEY.
  // We assume the environment is configured to provide this.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateStory = async (language: Language, groom: string, bride: string): Promise<string> => {
  const defaultMsg = language === 'zh' 
    ? "相遇是最美好的开始，相知是温暖的陪伴。在茫茫人海中，我们牵起了彼此的手，决定共度余生。" 
    : "It started with a glance, grew into a friendship, and blossomed into love. We are thrilled to start our forever together.";

  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing from process.env");
    return defaultMsg;
  }

  const client = createClient();

  const prompt = language === 'zh'
    ? `请为新郎"${groom || '他'}"和新娘"${bride || '她'}"写一段简短、浪漫、动人的爱情故事简介（60字以内）。`
    : `Write a short (under 50 words), romantic love story blurb for Groom "${groom || 'Him'}" and Bride "${bride || 'Her'}".`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text?.trim() || defaultMsg;
  } catch (error) {
    console.error("Error generating story:", error);
    return defaultMsg;
  }
};