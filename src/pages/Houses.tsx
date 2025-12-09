import { Layout } from "@/components/Layout";
import { HouseCard } from "@/components/HouseCard";
import { HouseFilters } from "@/components/HouseFilters";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Home, SlidersHorizontal } from "lucide-react";

interface HousesProps {
  settlement: "zapovednoe" | "kolosok";
}

export interface HouseFiltersState {
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  minRooms: string;
  status: string;
}

const Houses = ({ settlement }: HousesProps) => {
  const [filters, setFilters] = useState<HouseFiltersState>({
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
    minRooms: "",
    status: "all",
  });
  const [showFilters, setShowFilters] = useState(false);

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
      if (filters.minRooms) {
        query = query.gte('rooms', parseInt(filters.minRooms));
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
      minRooms: "",
      status: "all",
    });
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== 'status' ? value !== '' : value !== 'all'
  );

  return (
    <Layout settlement={settlement}>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Home className="w-4 h-4" />
              <span>Элитная недвижимость</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Дома в{" "}
              <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                {settlement === "zapovednoe" ? "Заповедном" : "Колоске"}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              {settlement === "zapovednoe" 
                ? "Премиальные резиденции в окружении заповедного леса. От уютных коттеджей до роскошных усадеб."
                : "Комфортные дома для счастливой семейной жизни. Современная архитектура в гармонии с природой."
              }
            </p>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showFilters ? "Скрыть фильтры" : "Показать фильтры"}
            </Button>
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
              <div className="flex items-center justify-between mb-8">
                <p className="text-muted-foreground">
                  Найдено: <span className="font-semibold text-foreground">{houses.length}</span> объектов
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {houses.map((house) => (
                  <HouseCard key={house.id} house={house} settlement={settlement} />
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