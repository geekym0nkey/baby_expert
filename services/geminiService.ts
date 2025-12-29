/**
 * @file geminiService.ts
 * @description Encapsulates the core logic for interacting with the Google Gemini API, 
 * including crying analysis, food recognition, and parenting consultation.
 */

import { GoogleGenAI, Type, Chat } from "@google/genai";
import { blobToBase64, fileToGenerativePart } from "./utils";

// Using Gemini 3 Flash for a balance of speed and reasoning capabilities
const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * System Instruction for the Parenting Consultant.
 * Defines the AI's persona and strictly enforces formatting rules to ensure a 
 * clean UI without Markdown artifacts.
 */
const PARENTING_SYSTEM_INSTRUCTION = `You are a professional pediatric consultant and parenting expert from Taiwan.
Please respond with a kind, gentle, patient, and professional tone in Traditional Chinese (using Taiwan-specific particles like 『喔』, 『囉』).

【Strict Formatting Rules】
1. Prohibit any Markdown symbols such as **, ##, ###, *, -, _, ` + '` ' + ` etc.
2. Do not use bold text in your responses.
3. Use line breaks and spaces for headings instead of symbols.
4. For lists, use plain numbers (1. 2. 3.) or bullets (・), never asterisks (*).
5. Ensure the response looks like a clean, natural, and warm text conversation.`;

/**
 * Retrieves the API Key from environment variables.
 * @returns {string} The valid API Key string.
 * @throws Error if the key is missing in the environment.
 */
const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return key;
};

/**
 * Safely parses a JSON string returned by the AI.
 * Handles cases where the AI wraps the JSON in Markdown code blocks.
 * @param {string} str - Raw string from AI response.
 */
export const safeParseJson = (str: string) => {
  if (!str) return {};
  try {
    const cleaned = str.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parsing failed:", e);
    return {};
  }
};

/**
 * Analyzes baby crying audio.
 * @param {Blob} audioBlob - Recorded audio data.
 * @returns {Promise<string>} A JSON string containing analysis results.
 */
export const analyzeCryingAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const base64Audio = await blobToBase64(audioBlob);
    const mimeType = audioBlob.type || "audio/pcm;rate=16000";

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Audio } },
          { text: "This is a recording of a baby crying. Analyze the cause and provide soothing advice. Remember: DO NOT use any Markdown symbols like ** or ## in your response." }
        ]
      },
      config: {
        systemInstruction: PARENTING_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        // Defined schema ensures consistent parsing of reason, explanation, and advice lists
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reason: { type: Type.STRING, description: "Primary reason for crying (e.g., hunger, fatigue)" },
            explanation: { type: Type.STRING, description: "Detailed explanation of the analysis" },
            advice: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Step-by-step soothing advice for parents" },
          },
          required: ["reason", "explanation", "advice"],
        }
      }
    });

    return response.text || "{}";
  } catch (error: any) {
    console.error("Crying Analysis Error:", error);
    throw error;
  }
};

/**
 * Recognizes food items and determines safety for babies.
 * @param {File} file - Image file of the food.
 * @param {number} babyAgeMonths - Current age of the baby in months.
 */
export const analyzeFoodImage = async (file: File, babyAgeMonths: number): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const imagePart = await fileToGenerativePart(file);
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          imagePart,
          { text: `Determine if this food is safe for a ${babyAgeMonths}-month-old baby. Remember: DO NOT use any Markdown symbols like ** or ## in your response.` }
        ]
      },
      config: {
        systemInstruction: PARENTING_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itemName: { type: Type.STRING, description: "Identified food item name" },
            isSafe: { type: Type.BOOLEAN, description: "Whether it is safe for the specified age" },
            riskLevel: { type: Type.STRING, description: "Risk level: Low, Medium, High" },
            summary: { type: Type.STRING, description: "One-sentence summary of the advice" },
            details: { type: Type.STRING, description: "Detailed nutritional or risk analysis" }
          },
          required: ["itemName", "isSafe", "riskLevel", "summary", "details"],
        }
      }
    });

    return response.text || "{}";
  } catch (error: any) {
    console.error("Food Lens Error:", error);
    throw error;
  }
};

/**
 * Creates a stateful chat session with the parenting consultant.
 * Allows the AI to maintain context throughout the conversation.
 */
export const createParentingChat = (): Chat => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  return ai.chats.create({
    model: MODEL_NAME,
    config: { 
      systemInstruction: PARENTING_SYSTEM_INSTRUCTION, 
      temperature: 0.8 // Slightly higher temperature for more natural, human-like responses
    },
  });
};