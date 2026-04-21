import { Check, Star } from "lucide-react";

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
const RATINGS = [4, 3, 2];
const DISCOUNTS = [10, 20, 30, 40, 50];

const FilterSidebar = ({ activeFilters, onFilterChange }) => {
  return (
    <div className="w-64 flex-shrink-0 hidden lg:block sticky top-32 overflow-y-auto max-h-[calc(100vh-8rem)] pr-4 scrollbar-hide">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Filters</h2>
        {(activeFilters.categories.length > 0 || 
          activeFilters.sizes.length > 0 || 
          activeFilters.colors.length > 0 ||
          activeFilters.rating !== null ||
          activeFilters.discount !== null
        ) && (
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
            <label 
              key={category} 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onFilterChange('categories', category)}
            >
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
        <div className="grid grid-cols-2 gap-2">
          {SIZES.map(size => (
            <label 
              key={size} 
              className="flex items-center gap-2 cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => onFilterChange('sizes', size)}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${activeFilters.sizes.includes(size) ? 'bg-primary border-primary' : 'border-border-accent bg-background-card group-hover:border-primary/50'}`}>
                {activeFilters.sizes.includes(size) && <Check size={14} className="text-white" />}
              </div>
              <span className={`text-sm ${activeFilters.sizes.includes(size) ? 'text-white' : 'text-text-muted'}`}>UK {size}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Color</h3>
        <div className="space-y-2">
          {COLORS.map(color => (
            <label 
              key={color.name} 
              className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => onFilterChange('colors', color.name)}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${activeFilters.colors.includes(color.name) ? 'bg-primary border-primary' : 'border-border-accent bg-background-card group-hover:border-primary/50'}`}>
                {activeFilters.colors.includes(color.name) && <Check size={14} className="text-white" />}
              </div>
              <div className={`w-4 h-4 rounded-full ${color.colorClass} border border-white/20`} />
              <span className={`text-sm ${activeFilters.colors.includes(color.name) ? 'text-white' : 'text-text-muted'}`}>{color.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Customer Rating */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Customer Rating</h3>
        <div className="space-y-2">
          {RATINGS.map(rating => (
            <label 
              key={rating} 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onFilterChange('rating', rating)}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${activeFilters.rating === rating ? 'bg-primary border-primary' : 'border-border-accent bg-background-card group-hover:border-primary/50'}`}>
                {activeFilters.rating === rating && <Check size={14} className="text-white" />}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-white">{rating}</span>
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm text-text-muted font-light">& Up</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Discounts */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Best Discount</h3>
        <div className="space-y-2">
          {DISCOUNTS.map(discount => (
            <label 
              key={discount} 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onFilterChange('discount', discount)}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${activeFilters.discount === discount ? 'bg-primary border-primary' : 'border-border-accent bg-background-card group-hover:border-primary/50'}`}>
                {activeFilters.discount === discount && <Check size={14} className="text-white" />}
              </div>
              <span className={`text-sm ${activeFilters.discount === discount ? 'text-white' : 'text-text-muted'}`}>{discount}% and above</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
