import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface MultiSelectDropdownProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean
}

export const MultiSelectDropdown = ({
  options,
  selected,
  onChange,
  label,
  placeholder = "搜尋...",
}: MultiSelectDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter((option) =>
      option.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((v) => v !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const clearAll = () => {
    onChange([]);
    setSearch("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {label} ({selected.length})
        </label>
        {selected.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-6 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            清除
          </Button>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">
              {selected.length > 0
                ? `已選擇 ${selected.length} 項`
                : `選擇${label}`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-2 border-b">
            <Input
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                沒有找到結果
              </div>
            ) : (
              <div className="space-y-1">
                {filteredOptions.map((option) => (
                  <label
                    key={option}
                    className={cn(
                      "flex items-center gap-2 rounded-sm px-2 py-1.5 cursor-pointer hover:bg-accent",
                      selected.includes(option) && "bg-accent"
                    )}
                  >
                    <Checkbox
                      checked={selected.includes(option)}
                      onCheckedChange={() => toggleOption(option)}
                    />
                    <span className="text-sm flex-1">{option}</span>
                    {selected.includes(option) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
          {selected.length > 0 && (
            <div className="p-2 border-t">
              <div className="flex flex-wrap gap-1">
                {selected.map((item) => (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="text-xs"
                  >
                    {item}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOption(item);
                      }}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};
