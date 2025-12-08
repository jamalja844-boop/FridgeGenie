import React from 'react';
import { Recipe, ShoppingItem } from '../types';
import { Clock, Flame, BarChart, ChefHat, ShoppingCart } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  onAddMissing: (items: string[]) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect, onAddMissing }) => {
  const missingCount = recipe.missingIngredients?.length || 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 overflow-hidden flex flex-col h-full">
      <div className="p-5 flex-1 cursor-pointer" onClick={() => onSelect(recipe)}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-slate-800 line-clamp-2">{recipe.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold 
            ${recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
              recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
              'bg-red-100 text-red-700'}`}>
            {recipe.difficulty}
          </span>
        </div>
        
        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{recipe.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{recipe.prepTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame size={16} />
            <span>{recipe.calories} kcal</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
            {recipe.dietaryTags?.map((tag, idx) => (
                <span key={idx} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-slate-100 text-slate-500 rounded-sm">
                    {tag}
                </span>
            ))}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-500">
           {missingCount > 0 ? (
             <span className="text-amber-600 font-medium">{missingCount} missing items</span>
           ) : (
             <span className="text-emerald-600 font-medium">You have everything!</span>
           )}
        </div>
        
        <div className="flex gap-2">
           {missingCount > 0 && (
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 onAddMissing(recipe.missingIngredients.map(i => i.name));
               }}
               className="p-2 text-amber-600 hover:bg-amber-50 rounded-full transition-colors tooltip-trigger"
               title="Add missing items to shopping list"
             >
               <ShoppingCart size={18} />
             </button>
           )}
           <button 
             onClick={() => onSelect(recipe)}
             className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
           >
             <ChefHat size={16} /> Cook
           </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;