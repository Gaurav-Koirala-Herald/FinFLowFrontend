import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ 
  id, 
  checked = false, 
  onCheckedChange, 
  className = '' 
}) => {
  return (
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={checked}
      className={`peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white'
      } ${className}`}
      onClick={() => onCheckedChange?.(!checked)}
    >
      {checked && (
        <Check className="h-3 w-3" />
      )}
    </button>
  );
};