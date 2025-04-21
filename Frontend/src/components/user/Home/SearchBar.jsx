import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { SearchIcon } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
  const reduxSearchTerm = useSelector(state => state.articles.searchTerm);
  const [searchInput, setSearchInput] = useState(reduxSearchTerm || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  
  // Debounced search function
  const debouncedSearch = useCallback((term) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    searchTimeoutRef.current = setTimeout(() => {
      onSearch(term);
    }, 300);
  }, [onSearch]);

  useEffect(() => {
    setSearchInput(reduxSearchTerm || '');
  }, [reduxSearchTerm]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // Sample suggestions - would come from an API in production
  const sampleSuggestions = [
    'Technology',
    'Business',
    'Science',
    'Health',
    'Entertainment',
    'Sports',
    'Politics',
    'World News'
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // Filter suggestions based on input
    if (value) {
      const filtered = sampleSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(searchInput.trim());
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchInput.trim());
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchInput(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative mb-6 w-full px-4 max-w-2xl mx-auto" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-neutral-400" />
        </div>
        <input
          type="text"
          placeholder="Search articles..."
          value={searchInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => searchInput && setShowSuggestions(true)}
          className="w-full pl-10 pr-10 py-2 sm:py-3 text-base sm:text-lg border-2 border-neutral-300 rounded-full 
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                   shadow-sm transition-all duration-200"
          aria-label="Search articles"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-all"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute w-full mt-1 sm:mt-2 bg-white rounded-lg shadow-lg border border-neutral-200 max-h-48 sm:max-h-60 overflow-y-auto z-20">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-2 hover:bg-neutral-100 cursor-pointer transition-colors duration-150"
            >
              <div className="flex items-center">
                <SearchIcon className="h-4 w-4 text-neutral-400 mr-2" />
                <span className="text-neutral-700">{suggestion}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;