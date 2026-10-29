import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  error?: boolean;
  className?: string;
  id?: string;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Selecciona una opción',
  emptyMessage = 'Sin coincidencias',
  error = false,
  className,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(() => options.find((opt) => opt.value === value), [options, value]);

  useEffect(() => {
    if (selectedOption && !isOpen) {
      setInputValue(selectedOption.label);
    } else if (!selectedOption && !isOpen) {
      setInputValue('');
    }
  }, [selectedOption, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (selectedOption) {
          setInputValue(selectedOption.label);
        } else {
          setInputValue('');
        }
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOption]);

  const filteredOptions = useMemo(() => {
    if (!inputValue.trim()) return options;
    const normalizedQuery = normalizeText(inputValue);
    return options.filter((opt) => normalizeText(opt.label).includes(normalizedQuery));
  }, [options, inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
    if (!e.target.value) {
      onChange('');
    }
  };

  const handleSelect = (option: ComboboxOption) => {
    onChange(option.value);
    setInputValue(option.label);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      if (selectedOption) {
        setInputValue(selectedOption.label);
      } else {
        setInputValue('');
      }
      setHighlightedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            'flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 pl-9 pr-9 text-base ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-interactive focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-rose-500 focus-visible:ring-rose-500',
          )}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="area-combobox-list"
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>
      {isOpen && (
        <div
          id="area-combobox-list"
          className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-[200px] overflow-auto"
          role="listbox"
        >
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">{emptyMessage}</div>
          ) : (
            filteredOptions.slice(0, 8).map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between',
                  highlightedIndex === index && 'bg-slate-50',
                  selectedOption?.value === option.value && 'font-semibold',
                )}
                role="option"
                aria-selected={selectedOption?.value === option.value}
              >
                <span>{option.label}</span>
                {selectedOption?.value === option.value && <Check className="w-4 h-4 text-brand-primary" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
