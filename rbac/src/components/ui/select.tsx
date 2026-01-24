import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

interface SelectValueProps {
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={selectRef}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            return React.cloneElement(child as React.ReactElement<any>, {
              onClick: () => setIsOpen(!isOpen),
              isOpen
            });
          }
          if (child.type === SelectContent) {
            return isOpen ? React.cloneElement(child as React.ReactElement<any>, {
              onSelect: (selectedValue: string) => {
                onValueChange(selectedValue);
                setIsOpen(false);
              },
              selectedValue: value
            }) : null;
          }
        }
        return child;
      })}
    </div>
  );
};

export const SelectTrigger: React.FC<SelectTriggerProps & { onClick?: () => void; isOpen?: boolean }> = ({ 
  className = '', 
  children, 
  onClick,
  isOpen 
}) => {
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={onClick}
    >
      {children}
      <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
};

export const SelectContent: React.FC<SelectContentProps & { onSelect?: (value: string) => void; selectedValue?: string }> = ({ 
  children, 
  onSelect,
  selectedValue 
}) => {
  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectItem) {
          const childProps = child.props as { value: any };
          return React.cloneElement(child as React.ReactElement<any>, {
            onSelect,
            isSelected: childProps.value === selectedValue
          });
        }
        return child;
      })}
    </div>
  );
};

export const SelectItem: React.FC<SelectItemProps & { onSelect?: (value: string) => void; isSelected?: boolean }> = ({ 
  value, 
  children, 
  onSelect,
  isSelected 
}) => {
  return (
    <div
      className={`relative flex cursor-pointer select-none items-center py-2 px-3 text-sm hover:bg-gray-100 ${
        isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
      }`}
      onClick={() => onSelect?.(value)}
    >
      {children}
    </div>
  );
};

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  return <span className="text-gray-500">{placeholder}</span>;
};