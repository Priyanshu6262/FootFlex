import { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

const defaultFilterState = {
  categories: [],
  sizes: [],
  colors: [],
  rating: null,
  discount: null,
  sort: 'recommended'
};

export const FilterProvider = ({ children }) => {
  const [filterState, setFilterState] = useState({
    men: { ...defaultFilterState },
    women: { ...defaultFilterState },
    kids: { ...defaultFilterState }
  });

  const toggleFilter = (pageKey, filterType, value) => {
    setFilterState(prev => {
      const pageState = prev[pageKey];
      
      // For single-value filters (rating, discount, sort)
      if (['rating', 'discount', 'sort'].includes(filterType)) {
        return {
          ...prev,
          [pageKey]: {
            ...pageState,
            [filterType]: pageState[filterType] === value ? null : value
          }
        };
      }

      // For array filters (categories, sizes, colors)
      const currentList = pageState[filterType] || [];
      const isSelected = currentList.includes(value);
      
      return {
        ...prev,
        [pageKey]: {
          ...pageState,
          [filterType]: isSelected 
            ? currentList.filter(item => item !== value)
            : [...currentList, value]
        }
      };
    });
  };

  const setSort = (pageKey, value) => {
    setFilterState(prev => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        sort: value
      }
    }));
  };

  const clearAllFilters = (pageKey) => {
    setFilterState(prev => ({
      ...prev,
      [pageKey]: { ...defaultFilterState }
    }));
  };

  const removeFilter = (pageKey, filterType, value) => {
    toggleFilter(pageKey, filterType, value);
  };

  return (
    <FilterContext.Provider value={{ filterState, setFilterState, toggleFilter, setSort, clearAllFilters, removeFilter }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
