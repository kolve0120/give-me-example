import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AutocompleteInputProps {
  label?: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  id?: string;
  className?: string;
}

export const AutocompleteInput = ({
  label,
  icon,
  value,
  onChange,
  onSelect,
  suggestions,
  placeholder,
  id,
  className,
}: AutocompleteInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // 過濾建議
  useEffect(() => {
    if (!value || !isOpen) {
      setFilteredSuggestions([]);
      return;
    }

    const lowerValue = value.toLowerCase();
    const filtered = suggestions.filter(s => 
      s.toLowerCase().includes(lowerValue)
    );
    setFilteredSuggestions(filtered);
  }, [value, suggestions, isOpen]);

  // 點擊外部關閉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    onSelect?.(suggestion);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="space-y-2 relative">
      {label && (
        <Label htmlFor={id} className={cn("flex items-center gap-2", icon && "")}>
          {icon}
          {label}
        </Label>
      )}
      <Input
        id={id}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className={cn("input-elegant", className)}
      />
      {filteredSuggestions.length > 0 && isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-60 overflow-auto animate-slide-up">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={`${suggestion}-${index}`}
              className="px-3 py-2 hover:bg-accent cursor-pointer text-sm transition-colors"
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
