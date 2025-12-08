import React, { useState, useEffect, useCallback } from 'react';
import { Camera, Upload, Menu, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { DietaryFilter, Recipe, AppView, ShoppingItem } from './types';
import Sidebar from './components/Sidebar';
import RecipeCard from './components/RecipeCard';
import CookingMode from './components/CookingMode';
import { analyzeFridgeAndGetRecipes, blobToBase64 } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('HOME');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('fridge-genie-list');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeFilters, setActiveFilters] = useState<DietaryFilter[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('fridge-genie-list', JSON.stringify(shoppingList));
  }, [shoppingList]);

  // Handlers
  const handleToggleFilter = (filter: DietaryFilter) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  const handleToggleShoppingItem = (id: string) => {
    setShoppingList(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleAddShoppingItem = (name: string) => {
      setShoppingList(prev => [...prev, { id: Date.now().toString(), name, checked: false }]);
  };

  const handleClearShoppingList = () => setShoppingList([]);

  const handleAddMissingIngredients = (items: string[]) => {
    const newItems = items.map(name => ({
      id: Date.now() + Math.random().toString(),
      name,
      checked: false
    }));
    setShoppingList(prev => [...prev, ...newItems]);
    setIsSidebarOpen(true); // Open sidebar to show user items were added
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setAnalyzing(true);
        setView('ANALYZING');
        setError(null);
        
        // Preview
        const base64 = await blobToBase64(file);
        setUploadedImage(`data:image/jpeg;base64,${base64}`);
        
        // Analyze
        const fetchedRecipes = await analyzeFridgeAndGetRecipes(base64, activeFilters);
        setRecipes(fetchedRecipes);
        setView('RESULTS');
      } catch (err: any) {
        setError(err.message || "Failed to analyze image. Please try again.");
        setView('HOME');
      } finally {
        setAnalyzing(false);
      }
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'HOME':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
             <div className="max-w-xl w-full">
                <div className="mb-8 relative inline-block">
                    <div className="absolute inset-0 bg-emerald-200 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center text-white shadow-xl relative z-10 rotate-3 mx-auto">
                        <Camera size={40} />
                    </div>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
                  What's in your fridge?
                </h2>
                <p className="text-lg text-slate-500 mb-10 max-w-md mx-auto">
                  Snap a photo of your open fridge or pantry, and we'll suggest delicious recipes you can cook right now.
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm text-left border border-red-100">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <label className="relative group cursor-pointer inline-flex">
                   <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                   <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      onChange={handleFileSelect}
                      className="hidden" 
                   />
                   <div className="relative px-8 py-4 bg-white rounded-xl leading-none flex items-center gap-3 shadow-sm border border-emerald-100 hover:bg-emerald-50 transition-colors">
                      <span className="flex items-center gap-2 text-emerald-700 font-bold text-lg">
                         <Camera size={20} /> Snap Photo
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500 font-medium">Upload Image</span>
                   </div>
                </label>
             </div>
          </div>
        );

      case 'ANALYZING':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <Loader2 size={48} className="text-emerald-500 animate-spin mb-6" />
            <h3 className="text-2xl font-semibold text-slate-800 mb-2">Analyzing your ingredients...</h3>
            <p className="text-slate-500 animate-pulse">"Don't go bacon my heart..." 🥓</p>
            {uploadedImage && (
                <img src={uploadedImage} alt="Analysis Target" className="mt-8 max-w-xs rounded-xl shadow-lg border border-slate-200 opacity-50 grayscale" />
            )}
          </div>
        );

      case 'RESULTS':
        return (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                           <Sparkles className="text-amber-500" size={24} /> Suggested Recipes
                        </h2>
                        <p className="text-slate-500 text-sm">Based on your ingredients and preferences</p>
                    </div>
                    <button 
                        onClick={() => setView('HOME')} 
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                        Analyze another photo
                    </button>
                </div>
                
                {recipes.length === 0 ? (
                     <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-400">No recipes found matching your criteria. Try adjusting filters.</p>
                     </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {recipes.map(recipe => (
                        <RecipeCard 
                        key={recipe.id} 
                        recipe={recipe} 
                        onSelect={(r) => {
                            setSelectedRecipe(r);
                            setView('COOKING');
                        }}
                        onAddMissing={handleAddMissingIngredients}
                        />
                    ))}
                    </div>
                )}
            </div>
          </div>
        );

      case 'COOKING':
         // Handled by conditional rendering below to take full screen
         return null; 
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Hidden on mobile unless toggled */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        activeFilters={activeFilters}
        onToggleFilter={handleToggleFilter}
        shoppingList={shoppingList}
        onToggleShoppingItem={handleToggleShoppingItem}
        onClearShoppingList={handleClearShoppingList}
        onAddItem={handleAddShoppingItem}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20">
            <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                FridgeGenie
            </h1>
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
                <Menu size={24} />
            </button>
        </div>

        {view === 'COOKING' && selectedRecipe ? (
            <CookingMode 
                recipe={selectedRecipe} 
                onClose={() => setView('RESULTS')} 
            />
        ) : (
            renderContent()
        )}
      </div>
    </div>
  );
};

export default App;