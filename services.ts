
import { GoogleGenAI } from "@google/genai";
import { Language, InvitationData } from "./types";

// --- Gemini Service ---
// Declare process to avoid TypeScript errors if @types/node is missing.
declare const process: { env: { API_KEY: string } };

const createClient = () => {
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

// --- Storage Service (JSONBin.io) ---
const BASE_URL = "https://api.jsonbin.io/v3/b";

export const fetchInvitationData = async (binId: string): Promise<InvitationData | null> => {
  try {
    const response = await fetch(`${BASE_URL}/${binId}/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const json = await response.json();
    return json.record as InvitationData;
  } catch (error) {
    console.error("Error fetching invitation data:", error);
    return null;
  }
};

export const saveInvitationData = async (binId: string, apiKey: string, data: InvitationData): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey,
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to save data: ${err}`);
    }

    return true;
  } catch (error) {
    console.error("Error saving invitation data:", error);
    alert("保存失败 (Save Failed): " + (error as Error).message);
    return false;
  }
};
