
import { GoogleGenAI } from "@google/genai";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIAdvice = async (prompt: string, currentContext: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are the VoxelVerse Oracle, a wise guide in a voxel survival game. 
      The player asks: "${prompt}".
      Context: ${currentContext}.
      Keep your answer concise, helpful, and immersive. If they ask about crafting, suggest imaginative recipes using blocks like wood, gold, and stone.`,
    });
    // The .text property directly returns the string output; do not call it as a method.
    return response.text || "The Oracle is silent today...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The winds of the VoxelVerse are too chaotic to hear the Oracle right now.";
  }
};
