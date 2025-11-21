import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Ruler, Tag, Phone, Filter, SlidersHorizontal, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface PlotsProps {
  settlement: "zapovednoe" | "kolosok";
}

const Plots = ({ settlement }: PlotsProps) => {
  const navigate = useNavigate();
  const [areaFilter, setAreaFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const { data: plots = [], isLoading } = useQuery({
    queryKey: ['plots', settlement, areaFilter, statusFilter, maxPrice],
    queryFn: async () => {
      let query = supabase
        .from('plots')
        .select('*')
        .eq('settlement', settlement)
        .order('plot_number');

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as "available" | "reserved" | "sold");
      }

      if (areaFilter) {
        query = query.gte('area_sqm', parseInt(areaFilter));
      }

      if (maxPrice) {
        query = query.lte('price_rub', parseInt(maxPrice));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const plots_demo = [
    {
      number: "1",
      area: 1200,
      price: 3500000,
      status: "available",
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800",
    },
    {
      number: "2",
      area: 1500,
      price: 4200000,
      status: "available",
      image: "https://images.unsplash.com/photo-1464146072230-91cabc968266?q=80&w=800",
    },
    {
      number: "3",
      area: 1000,
      price: 2800000,
      status: "reserved",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800",
    },
  ];

  const statusLabels = {
    available: { label: "Доступен", variant: "default" as const },
    reserved: { label: "Забронирован", variant: "secondary" as const },
    sold: { label: "Продан", variant: "destructive" as const },
  };

  return (
    <Layout settlement={settlement}>
      <div className="container mx-auto px-4 py-12">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Земельные участки
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Выберите идеальный участок для строительства дома вашей мечты
          </p>
        </div>

        {/* Фильтры */}
        <Card className="p-6 mb-8 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Фильтры</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Площадь от (м²)</label>
              <Input
                type="number"
                placeholder="Минимальная площадь"
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Максимальная цена (₽)</label>
              <Input
                type="number"
                placeholder="Максимальная цена"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Статус</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Все участки" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все участки</SelectItem>
                  <SelectItem value="available">Доступен</SelectItem>
                  <SelectItem value="reserved">Забронирован</SelectItem>
                  <SelectItem value="sold">Продан</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Список участков */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Загрузка участков...</p>
          </div>
        ) : plots.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Участки не найдены. Попробуйте изменить фильтры.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plots.map((plot) => (
              <Card 
                key={plot.id} 
                className="overflow-hidden hover:shadow-elegant transition-smooth hover-scale group cursor-pointer"
                onClick={() => navigate(`/${settlement}/plots/${plot.id}`)}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={(plot.images as any)?.[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800"}
                    alt={`Участок ${plot.plot_number}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <Badge
                    variant={statusLabels[plot.status as keyof typeof statusLabels].variant}
                    className="absolute top-4 right-4 shadow-lg"
                  >
                    {statusLabels[plot.status as keyof typeof statusLabels].label}
                  </Badge>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                      Участок №{plot.plot_number}
                    </h3>
                  </div>
                  <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-primary text-primary-foreground rounded-full p-2">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  {plot.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {plot.description}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Ruler className="w-4 h-4 text-primary" />
                      <span className="text-sm">{plot.area_sqm} м²</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm">ДПК {settlement === "zapovednoe" ? "Заповедное" : "Колосок"}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-primary" />
                        <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                          {Number(plot.price_rub).toLocaleString("ru-RU")} ₽
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full shadow-elegant"
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (plot.status === "available") {
                          navigate(`/${settlement}/plots/${plot.id}`);
                        }
                      }}
                      disabled={plot.status !== "available"}
                    >
                      {plot.status === "available" ? (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Подробнее
                        </>
                      ) : (
                        <span>{statusLabels[plot.status as keyof typeof statusLabels].label}</span>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Plots;
