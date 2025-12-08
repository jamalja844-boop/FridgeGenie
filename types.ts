export interface Ingredient {
  name: string;
  amount?: string;
}

export interface RecipeStep {
  instruction: string;
  duration?: string; // e.g., "5 mins"
}

export interface Recipe {
  id: string; // generated UUID or index
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTime: string; // e.g., "30 mins"
  calories: number;
  ingredients: Ingredient[];
  missingIngredients: Ingredient[];
  steps: RecipeStep[];
  dietaryTags: string[];
}

export type DietaryFilter = 'Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Keto' | 'Paleo' | 'Dairy-Free';

export type AppView = 'HOME' | 'ANALYZING' | 'RESULTS' | 'COOKING';

export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
}