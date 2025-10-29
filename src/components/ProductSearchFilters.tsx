import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultiSelectDropdown } from "./MultiSelectDropdown";

interface ProductSearchFiltersProps {
  quickSearch: string;
  setQuickSearch: (value: string) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (value: boolean) => void;
  selectedVendors: string[];
  setSelectedVendors: (value: string[]) => void;
  selectedModels: string[];
  setSelectedModels: (value: string[]) => void; // ✅ 修正命名
  selectedSeries: string[];
  setSelectedSeries: (value: string[]) => void;
  selectedRemarks: string[];
  setSelectedRemarks: (value: string[]) => void;
  uniqueVendors: string[];
  uniqueModels: string[];
  uniqueSeries: string[];
  uniqueRemarks: string[];
  clearAllFilters: () => void;
  isLoading?: boolean; // ✅ 新增載入狀態
}

export const ProductSearchFilters = ({
  quickSearch,
  setQuickSearch,
  showAdvancedFilters,
  setShowAdvancedFilters,
  selectedVendors,
  setSelectedVendors,
  selectedModels,
  setSelectedModels, // ✅ 修正命名
  selectedSeries,
  setSelectedSeries,
  selectedRemarks,
  setSelectedRemarks,
  uniqueVendors,
  uniqueModels,
  uniqueSeries,
  uniqueRemarks,
  clearAllFilters,
  isLoading = false,
}: ProductSearchFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* 快速搜尋 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="快速搜尋產品..."
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
          className="pl-10"
          disabled={isLoading}
        />
      </div>

      {/* 進階篩選按鈕 */}
      <div className="flex gap-2">
        <Button
          variant={showAdvancedFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex-1"
          disabled={isLoading}
        >
          <Filter className="w-4 h-4 mr-2" />
          進階篩選
          {selectedVendors.length + selectedModels.length + 
           selectedSeries.length + selectedRemarks.length > 0 && (
            <Badge variant="destructive" className="ml-2 h-4 w-4">
              {selectedVendors.length + selectedModels.length + 
               selectedSeries.length + selectedRemarks.length}
            </Badge>
          )}
        </Button>
        {(selectedVendors.length > 0 ||
          selectedModels.length > 0 ||
          selectedSeries.length > 0 ||
          selectedRemarks.length > 0) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllFilters}
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            清除
          </Button>
        )}
      </div>

      {/* 進階篩選選項 */}
      {showAdvancedFilters && (
        <div className="space-y-3 p-4 border rounded-lg bg-muted/30 animate-fade-in">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm">載入篩選選項...</p>
            </div>
          ) : (
            <>
              <MultiSelectDropdown
                options={uniqueVendors}
                selected={selectedVendors}
                onChange={setSelectedVendors}
                label="廠商"
                placeholder={`選擇廠商... (${uniqueVendors.length} 個可用)`}
                disabled={isLoading}
              />
              <MultiSelectDropdown
                options={uniqueSeries}
                selected={selectedSeries}
                onChange={setSelectedSeries}
                label="系列"
                placeholder={`選擇系列... (${uniqueSeries.length} 個可用)`}
                disabled={isLoading}
              />
              <MultiSelectDropdown
                options={uniqueModels}
                selected={selectedModels}
                onChange={setSelectedModels} // ✅ 修正 onChange
                label="型號"
                placeholder={`選擇型號... (${uniqueModels.length} 個可用)`}
                disabled={isLoading}
              />
              <MultiSelectDropdown
                options={uniqueRemarks}
                selected={selectedRemarks}
                onChange={setSelectedRemarks}
                label="備註"
                placeholder={`選擇備註... (${uniqueRemarks.length} 個可用)`}
                disabled={isLoading}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};