// components/ClientSearchInput.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Client } from '../../types';

interface ClientSearchInputProps {
  value: string;
  suggestions: Client[];
  onSelect: (client: Client) => void;
  onChange: (value: string) => void;
}

const ClientSearchInput: React.FC<ClientSearchInputProps> = ({
  value,
  suggestions,
  onSelect,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Start met type om een klant te zoeken..."
        required
      />
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                onSelect(suggestion);
                setIsOpen(false);
              }}
            >
              <div className="font-medium">{suggestion.name}</div>
              <div className="text-sm text-gray-600">{suggestion.btw}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientSearchInput;