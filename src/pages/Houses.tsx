import { Layout } from "@/components/Layout";
import { HouseCard } from "@/components/HouseCard";
import { HouseFilters } from "@/components/HouseFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Home, SlidersHorizontal, Grid3X3, List } from "lucide-react";

interface HousesProps {
  settlement: "zapovednoe" | "kolosok";
}

export interface HouseFiltersState {
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  minLandArea: string;
  maxLandArea: string;
  minRooms: string;
  status: string;
  houseClass: string;
  hasGarage: boolean;
  floors: string;
}

const Houses = ({ settlement }: HousesProps) => {
  const [filters, setFilters] = useState<HouseFiltersState>({
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
    minLandArea: "",
    maxLandArea: "",
    minRooms: "",
    status: "all",
    houseClass: "all",
    hasGarage: false,
    floors: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: houses = [], isLoading } = useQuery({
    queryKey: ['houses', settlement, filters],
    queryFn: async () => {
      let query = supabase
        .from('houses')
        .select('*')
        .eq('settlement', settlement)
        .order('price_rub', { ascending: true });

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status as "available" | "reserved" | "sold");
      }
      if (filters.houseClass !== 'all') {
        query = query.eq('house_class', filters.houseClass);
      }
      if (filters.minPrice) {
        query = query.gte('price_rub', parseInt(filters.minPrice));
      }
      if (filters.maxPrice) {
        query = query.lte('price_rub', parseInt(filters.maxPrice));
      }
      if (filters.minArea) {
        query = query.gte('house_area_sqm', parseInt(filters.minArea));
      }
      if (filters.maxArea) {
        query = query.lte('house_area_sqm', parseInt(filters.maxArea));
      }
      if (filters.minLandArea) {
        query = query.gte('land_area_sqm', parseInt(filters.minLandArea));
      }
      if (filters.maxLandArea) {
        query = query.lte('land_area_sqm', parseInt(filters.maxLandArea));
      }
      if (filters.minRooms) {
        query = query.gte('rooms', parseInt(filters.minRooms));
      }
      if (filters.hasGarage) {
        query = query.eq('has_garage', true);
      }
      if (filters.floors) {
        query = query.eq('floors', parseInt(filters.floors));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const clearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
      minLandArea: "",
      maxLandArea: "",
      minRooms: "",
      status: "all",
      houseClass: "all",
      hasGarage: false,
      floors: "",
    });
  };

  const hasActiveFilters = 
    filters.minPrice !== '' ||
    filters.maxPrice !== '' ||
    filters.minArea !== '' ||
    filters.maxArea !== '' ||
    filters.minLandArea !== '' ||
    filters.maxLandArea !== '' ||
    filters.minRooms !== '' ||
    filters.status !== 'all' ||
    filters.houseClass !== 'all' ||
    filters.hasGarage ||
    filters.floors !== '';

  const settlementInfo = {
    zapovednoe: {
      title: "Заповедном",
      description: "Премиальные резиденции в окружении заповедного леса. От уютных коттеджей до роскошных усадеб с полной инфраструктурой.",
      badge: "Элитная недвижимость"
    },
    kolosok: {
      title: "Колоске",
      description: "Комфортные дома для счастливой семейной жизни. Современная архитектура в гармонии с природой по доступным ценам.",
      badge: "Семейные дома"
    }
  };

  const info = settlementInfo[settlement];

  return (
    <Layout settlement={settlement}>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-accent/5 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="container relative mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-6 animate-fade-in">
              <Home className="w-3 h-3 mr-1" />
              {info.badge}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in">
              Дома в{" "}
              <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                {info.title}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in">
              {info.description}
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
              <Button 
                variant={showFilters ? "default" : "outline"}
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {showFilters ? "Скрыть фильтры" : "Показать фильтры"}
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1">Активны</Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      {showFilters && (
        <HouseFilters 
          filters={filters} 
          setFilters={setFilters} 
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* Houses Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Загружаем каталог домов...</p>
            </div>
          ) : houses.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Home className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Дома не найдены</h3>
              <p className="text-muted-foreground mb-6">
                {hasActiveFilters 
                  ? "Попробуйте изменить параметры фильтрации" 
                  : "В данный момент нет доступных объектов"
                }
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Сбросить фильтры
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <p className="text-muted-foreground">
                    Найдено: <span className="font-semibold text-foreground">{houses.length}</span> объектов
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Houses Grid/List */}
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
                  : "space-y-6"
              }>
                {houses.map((house, index) => (
                  <div 
                    key={house.id} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <HouseCard house={house} settlement={settlement} viewMode={viewMode} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Houses;