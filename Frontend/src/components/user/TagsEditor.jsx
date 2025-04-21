import React, { useState, useRef } from 'react';
import { XIcon, PlusIcon } from 'lucide-react';

const TagsEditor = ({ currentTags = [], onSave, onClose }) => {
  const [tags, setTags] = useState(currentTags);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim().toLowerCase();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      setTags([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Edit Tags</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-neutral-100">
          <XIcon className="h-5 w-5" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a tag..."
              className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleAddTag}
              className="bg-primary-500 text-white p-2 rounded-r-lg hover:bg-primary-600"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-neutral-500 mb-2">Current tags:</p>
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.map(tag => (
                <div key={tag} className="bg-neutral-100 rounded-full px-3 py-1.5 flex items-center">
                  <span className="text-sm text-neutral-700">#{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1.5 text-neutral-500 hover:text-red-500"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500 italic">No tags yet</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(tags)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Save Tags
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagsEditor;