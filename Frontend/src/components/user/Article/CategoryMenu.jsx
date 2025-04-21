import React from 'react';
import { useSelector } from 'react-redux';
import { XIcon, FolderIcon, CheckIcon } from 'lucide-react'; // Changed from @heroicons/react/solid

const CategoryMenu = ({ currentCategory, onSelect, onClose }) => {
  const { user } = useSelector(state => state.user);
  const categories = [
    { id: 'general', label: 'General' },
    ...(user?.interests || []).map(interest => ({
      id: interest,
      label: interest.charAt(0).toUpperCase() + interest.slice(1)
    }))
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Change Category</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-neutral-100">
          <XIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="p-4 max-h-60 overflow-y-auto">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`w-full text-left mb-2 p-3 rounded-lg flex items-center ${
              currentCategory === category.id
                ? 'bg-primary-100 text-primary-700'
                : 'hover:bg-neutral-100'
            }`}
          >
            <FolderIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{category.label}</span>
            {currentCategory === category.id && (
              <CheckIcon className="h-5 w-5 ml-auto text-primary-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryMenu;