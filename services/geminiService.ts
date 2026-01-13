import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize the client conditionally to handle cases where key is missing gracefully in UI
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateCostumeIdeas = async (prompt: string): Promise<string> => {
  if (!ai) {
    throw new Error("API Key not configured");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a creative party planner for a themed party called 'Rodetes Party'. 
      The user wants costume advice based on this input: "${prompt}". 
      Provide 3 fun, creative, and slightly eccentric costume ideas. 
      Keep the tone festive and exciting. Return the result as a clean markdown list.`,
    });

    return response.text || "Could not generate ideas at this time.";
  } catch (error) {
    console.error("Error generating costume ideas:", error);
    throw new Error("Failed to consult the Party AI.");
  }
};
