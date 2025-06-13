import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options = [],
  placeholder = "Select an option...",
  searchPlaceholder = "Search options...",
  value,
  onValueChange,
  className = "",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchValue) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
        option.value.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [options, searchValue]);

  const selectedOption = options.find((option) => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearchValue("");
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        setOpen(false);
        setSearchValue("");
        setFocusedIndex(-1);
        triggerRef.current?.focus();
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleSelect(filteredOptions[focusedIndex].value);
        }
        break;
    }
  };

  const handleSelect = (selectedValue: string) => {
    onValueChange?.(selectedValue);
    setOpen(false);
    setSearchValue("");
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  };

  const handleToggle = () => {
    if (!disabled) {
      setOpen(!open);
      if (!open) {
        setSearchValue("");
        setFocusedIndex(-1);
      }
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:border-gray-400"
        }`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={selectedOption ? selectedOption.label : placeholder}
      >
        <span className="truncate text-left">
          {selectedOption?.label || (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`ml-2 h-4 w-4 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden"
          role="listbox"
        >
          {/* Search Input */}
          <div className="flex items-center border-b border-gray-200 px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
            <input
              ref={searchInputRef}
              className="flex h-6 w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setFocusedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Options */}
          <div className="max-h-40 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                No options found.
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors ${
                    value === option.value
                      ? "bg-blue-100 text-blue-900"
                      : focusedIndex === index
                      ? "bg-gray-100 text-gray-900"
                      : "hover:bg-gray-100 hover:text-gray-900"
                  } ${option.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  role="option"
                  aria-selected={value === option.value}
                >
                  {value === option.value && (
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                  <span>{option.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
