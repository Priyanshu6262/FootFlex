import { Check } from "lucide-react";

const CATEGORIES = ["Sports", "Formal", "Running", "Casual", "Sneakers", "Training"];
const SIZES = [6, 7, 8, 9, 10, 11];
const COLORS = [
  { name: "Black", colorClass: "bg-black" },
  { name: "White", colorClass: "bg-white" },
  { name: "Blue", colorClass: "bg-blue-500" },
  { name: "Red", colorClass: "bg-red-500" },
  { name: "Grey", colorClass: "bg-gray-500" },
  { name: "Green", colorClass: "bg-green-500" }
];

const FilterSidebar = ({ activeFilters, onFilterChange }) => {
  return (
    <div className="w-64 flex-shrink-0 hidden lg:block sticky top-32 overflow-y-auto max-h-[calc(100vh-8rem)] pr-4 scrollbar-hide">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Filters</h2>
        {(activeFilters.categories.length > 0 || activeFilters.sizes.length > 0 || activeFilters.colors.length > 0) && (
          <button 
            onClick={() => onFilterChange('clear', null)}
            className="text-xs text-text-muted hover:text-primary transition-colors uppercase tracking-wider font-semibold"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Category</h3>
        <div className="space-y-2">
          {CATEGORIES.map(category => (
            <label key={category} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${activeFilters.categories.includes(category) ? 'bg-primary border-primary' : 'border-border-accent bg-background-card group-hover:border-primary/50'}`}>
                {activeFilters.categories.includes(category) && <Check size={14} className="text-white" />}
              </div>
              <span className={`text-sm transition-colors ${activeFilters.categories.includes(category) ? 'text-white' : 'text-text-muted group-hover:text-text-secondary'}`}>
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Size</h3>
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map(size => (
            <button
              key={size}
              onClick={() => onFilterChange('sizes', size)}
              className={`py-2 rounded-xl text-sm font-medium transition-all ${
                activeFilters.sizes.includes(size)
                  ? 'bg-primary text-white border border-primary shadow-[0_0_15px_rgba(0,122,255,0.3)]'
                  : 'bg-background-card text-text-muted border border-border-accent hover:border-primary/50 hover:text-white'
              }`}
            >
              UK {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Color</h3>
        <div className="flex flex-col gap-3">
          {COLORS.map(color => (
            <button
              key={color.name}
              onClick={() => onFilterChange('colors', color.name)}
              className={`flex items-center gap-3 group transition-all p-2 rounded-xl ${activeFilters.colors.includes(color.name) ? 'bg-background-card border border-border-accent' : 'border border-transparent hover:bg-background-card/50'}`}
            >
              <div className={`w-6 h-6 rounded-full border-2 ${color.colorClass} ${activeFilters.colors.includes(color.name) ? 'border-primary' : 'border-border-accent'}`} />
              <span className={`text-sm ${activeFilters.colors.includes(color.name) ? 'text-white font-medium' : 'text-text-muted group-hover:text-text-secondary'}`}>{color.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
