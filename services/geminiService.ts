import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, DietaryFilter } from "../types";

// Helper to convert Blob to Base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const analyzeFridgeAndGetRecipes = async (
  imageBase64: string,
  filters: DietaryFilter[]
): Promise<Recipe[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const filterString = filters.length > 0 
    ? `The user has the following dietary restrictions: ${filters.join(', ')}. ONLY suggest recipes that fit these criteria.` 
    : "Suggest a diverse range of recipes.";

  const prompt = `
    Analyze this image of an open fridge/pantry. Identify the visible ingredients.
    Based on these ingredients, suggest 5 creative and delicious recipes.
    ${filterString}
    
    For each recipe:
    1. Provide a catchy title.
    2. Estimate preparation time.
    3. Rate difficulty (Easy, Medium, Hard).
    4. Estimate calories per serving.
    5. List ingredients found in the image used for this recipe.
    6. List ESSENTIAL missing ingredients that the user needs to buy.
    7. Provide step-by-step cooking instructions.
    
    Return the response as a JSON array of recipe objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG for simplicity, though the API handles others
              data: imageBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
              prepTime: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              dietaryTags: { type: Type.ARRAY, items: { type: Type.STRING } },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    amount: { type: Type.STRING }
                  }
                }
              },
              missingIngredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    amount: { type: Type.STRING }
                  }
                }
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    instruction: { type: Type.STRING },
                    duration: { type: Type.STRING }
                  }
                }
              }
            },
            required: ["title", "difficulty", "prepTime", "calories", "steps", "ingredients"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const recipes = JSON.parse(text) as Recipe[];
    
    // Add IDs since the API doesn't generate them reliably for UI keys
    return recipes.map((r, index) => ({
      ...r,
      id: `${Date.now()}-${index}`
    }));

  } catch (error) {
    console.error("Error analyzing fridge:", error);
    throw error;
  }
};