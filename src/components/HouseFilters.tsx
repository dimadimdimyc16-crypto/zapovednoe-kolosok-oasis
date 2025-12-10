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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X, RotateCcw } from "lucide-react";
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
    <section className="py-6 bg-muted/50 border-y border-border animate-fade-in">
      <div className="container mx-auto px-4">
        <Card className="p-6 bg-card/80 backdrop-blur-sm shadow-soft">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
            {/* Price Range */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Цена (₽)
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="от"
                  value={filters.minPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  className="bg-background"
                />
                <Input
                  type="number"
                  placeholder="до"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  className="bg-background"
                />
              </div>
            </div>

            {/* House Area Range */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Площадь дома (м²)
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="от"
                  value={filters.minArea}
                  onChange={(e) => setFilters(prev => ({ ...prev, minArea: e.target.value }))}
                  className="bg-background"
                />
                <Input
                  type="number"
                  placeholder="до"
                  value={filters.maxArea}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxArea: e.target.value }))}
                  className="bg-background"
                />
              </div>
            </div>

            {/* Land Area Range */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Площадь участка (м²)
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="от"
                  value={filters.minLandArea}
                  onChange={(e) => setFilters(prev => ({ ...prev, minLandArea: e.target.value }))}
                  className="bg-background"
                />
                <Input
                  type="number"
                  placeholder="до"
                  value={filters.maxLandArea}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxLandArea: e.target.value }))}
                  className="bg-background"
                />
              </div>
            </div>

            {/* Rooms */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Комнат от
              </Label>
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

            {/* House Class */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Класс дома
              </Label>
              <Select 
                value={filters.houseClass} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, houseClass: value }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Все классы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все классы</SelectItem>
                  <SelectItem value="comfort">Комфорт</SelectItem>
                  <SelectItem value="premium">Премиум</SelectItem>
                  <SelectItem value="luxury">Люкс</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Статус
              </Label>
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

            {/* Garage */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Гараж
              </Label>
              <div className="flex items-center space-x-3 h-10 px-3 bg-background rounded-md border border-input">
                <Switch
                  id="garage-filter"
                  checked={filters.hasGarage}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasGarage: checked }))}
                />
                <Label htmlFor="garage-filter" className="cursor-pointer">
                  Только с гаражом
                </Label>
              </div>
            </div>

            {/* Floors */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Этажей
              </Label>
              <Select 
                value={filters.floors} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, floors: value }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Любое" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Любое</SelectItem>
                  <SelectItem value="1">1 этаж</SelectItem>
                  <SelectItem value="2">2 этажа</SelectItem>
                  <SelectItem value="3">3 этажа</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-border flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Применены фильтры
              </p>
              <Button variant="ghost" onClick={onClear} className="gap-2 text-destructive hover:text-destructive">
                <RotateCcw className="w-4 h-4" />
                Сбросить все фильтры
              </Button>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};