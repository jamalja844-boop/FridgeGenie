import React from 'react';
import { DietaryFilter, ShoppingItem } from '../types';
import { Leaf, ShoppingBasket, X, Trash2, Plus } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilters: DietaryFilter[];
  onToggleFilter: (filter: DietaryFilter) => void;
  shoppingList: ShoppingItem[];
  onToggleShoppingItem: (id: string) => void;
  onClearShoppingList: () => void;
  onAddItem: (name: string) => void;
}

const FILTERS: DietaryFilter[] = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo', 'Dairy-Free'];

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  activeFilters, 
  onToggleFilter,
  shoppingList,
  onToggleShoppingItem,
  onClearShoppingList,
  onAddItem
}) => {
  const [newItemName, setNewItemName] = React.useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAddItem(newItemName.trim());
      setNewItemName('');
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-40 w-80 bg-white border-r border-slate-200 
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static
      `}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent flex items-center gap-2">
            <span className="text-2xl">🥬</span> FridgeGenie
          </h1>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Dietary Filters */}
          <section>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Leaf size={16} /> Dietary Needs
            </h2>
            <div className="space-y-2">
              {FILTERS.map(filter => (
                <label key={filter} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`
                    w-5 h-5 rounded border flex items-center justify-center transition-colors
                    ${activeFilters.includes(filter) 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-slate-300 bg-white group-hover:border-emerald-400'}
                  `}>
                    {activeFilters.includes(filter) && <X size={12} className="rotate-45" strokeWidth={3} />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={activeFilters.includes(filter)}
                    onChange={() => onToggleFilter(filter)}
                  />
                  <span className={`text-sm ${activeFilters.includes(filter) ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>
                    {filter}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Shopping List */}
          <section>
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBasket size={16} /> Shopping List
                </h2>
                {shoppingList.length > 0 && (
                    <button 
                        onClick={onClearShoppingList} 
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        title="Clear all"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
             </div>

             {/* Add Item Input */}
             <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
                <input 
                    type="text" 
                    placeholder="Add item..." 
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                />
                <button 
                    type="submit"
                    disabled={!newItemName.trim()}
                    className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 disabled:opacity-50 transition-colors"
                >
                    <Plus size={18} />
                </button>
             </form>

             <div className="space-y-2">
                {shoppingList.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm italic">
                        Your list is empty.
                    </div>
                ) : (
                    shoppingList.map(item => (
                        <div key={item.id} className="flex items-start gap-3 group">
                             <button 
                                onClick={() => onToggleShoppingItem(item.id)}
                                className={`
                                    mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all
                                    ${item.checked 
                                        ? 'bg-slate-300 border-slate-300 text-white' 
                                        : 'bg-white border-slate-300 hover:border-emerald-400'}
                                `}
                             >
                                 {item.checked && <X size={10} className="rotate-45" strokeWidth={3} />}
                             </button>
                             <span className={`text-sm leading-tight transition-all ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                 {item.name}
                             </span>
                        </div>
                    ))
                )}
             </div>
          </section>
        </div>
        
        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center">
            Powered by Gemini 3 Pro
        </div>
      </aside>
    </>
  );
};

export default Sidebar;