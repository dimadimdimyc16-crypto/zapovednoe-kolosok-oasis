import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { X } from "lucide-react";
import type { HouseFiltersState } from "@/pages/Houses";

interface HouseFiltersProps {
  filters: HouseFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<HouseFiltersState>>;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export const HouseFilters = ({ 
  filters, 
  setFilters, 
  onClear,
  hasActiveFilters 
}: HouseFiltersProps) => {
  return (
    <section className="py-6 bg-muted/50 border-y border-border">
      <div className="container mx-auto px-4">
        <Card className="p-6 bg-card/80 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Price Range */}
            <div>
              <label className="text-sm font-medium mb-2 block text-muted-foreground">
                Цена от (₽)
              </label>
              <Input
                type="number"
                placeholder="от 10 000 000"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                className="bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block text-muted-foreground">
                Цена до (₽)
              </label>
              <Input
                type="number"
                placeholder="до 200 000 000"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                className="bg-background"
              />
            </div>

            {/* Area Range */}
            <div>
              <label className="text-sm font-medium mb-2 block text-muted-foreground">
                Площадь от (м²)
              </label>
              <Input
                type="number"
                placeholder="от 100"
                value={filters.minArea}
                onChange={(e) => setFilters(prev => ({ ...prev, minArea: e.target.value }))}
                className="bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block text-muted-foreground">
                Площадь до (м²)
              </label>
              <Input
                type="number"
                placeholder="до 1000"
                value={filters.maxArea}
                onChange={(e) => setFilters(prev => ({ ...prev, maxArea: e.target.value }))}
                className="bg-background"
              />
            </div>

            {/* Rooms */}
            <div>
              <label className="text-sm font-medium mb-2 block text-muted-foreground">
                Комнат от
              </label>
              <Select 
                value={filters.minRooms} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, minRooms: value }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Любое" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Любое</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                  <SelectItem value="6">6+</SelectItem>
                  <SelectItem value="8">8+</SelectItem>
                  <SelectItem value="10">10+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium mb-2 block text-muted-foreground">
                Статус
              </label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Все" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все объекты</SelectItem>
                  <SelectItem value="available">В продаже</SelectItem>
                  <SelectItem value="reserved">Забронированы</SelectItem>
                  <SelectItem value="sold">Проданы</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-border flex justify-end">
              <Button variant="ghost" onClick={onClear} className="gap-2">
                <X className="w-4 h-4" />
                Сбросить фильтры
              </Button>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};