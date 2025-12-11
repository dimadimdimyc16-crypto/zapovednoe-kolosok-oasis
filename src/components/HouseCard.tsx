import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Ruler, 
  BedDouble, 
  Layers, 
  MapPin, 
  Eye,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface House {
  id: string;
  title: string;
  price_rub: number;
  house_area_sqm: number;
  land_area_sqm: number;
  rooms: number;
  floors: number;
  house_class: string;
  short_description: string | null;
  images: unknown;
  status: string;
}

interface HouseCardProps {
  house: House;
  settlement: "zapovednoe" | "kolosok";
  viewMode?: "grid" | "list";
}

const statusLabels = {
  available: { label: "В продаже", variant: "default" as const },
  reserved: { label: "Забронирован", variant: "secondary" as const },
  sold: { label: "Продан", variant: "destructive" as const },
};

const classLabels = {
  comfort: { label: "Комфорт", color: "bg-blue-500" },
  business: { label: "Бизнес", color: "bg-amber-500" },
  premium: { label: "Премиум", color: "bg-purple-500" },
};

export const HouseCard = ({ house, settlement, viewMode = "grid" }: HouseCardProps) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const images = (house.images as string[]) || [];
  const mainImage = images[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800";

  useEffect(() => {
    checkFavoriteStatus();
  }, [house.id]);

  const checkFavoriteStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('house_id', house.id)
      .maybeSingle();

    setIsFavorite(!!data);
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Войдите в аккаунт, чтобы добавить в избранное");
        navigate(`/${settlement}/auth`);
        return;
      }

      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('house_id', house.id);
        setIsFavorite(false);
        toast.success("Удалено из избранного");
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, house_id: house.id });
        setIsFavorite(true);
        toast.success("Добавлено в избранное");
      }
    } catch (error) {
      toast.error("Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1)} млн ₽`;
    }
    return `${price.toLocaleString("ru-RU")} ₽`;
  };

  const houseClass = house.house_class as keyof typeof classLabels;

  return (
    <Card 
      className="group overflow-hidden hover:shadow-strong transition-all duration-500 cursor-pointer bg-card border-border/50"
      onClick={() => navigate(`/${settlement}/houses/${house.id}`)}
    >
      {/* Image Section */}
      <div className="relative h-72 overflow-hidden">
        <img
          src={mainImage}
          alt={house.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <Badge 
              variant={statusLabels[house.status as keyof typeof statusLabels]?.variant || "default"}
              className="shadow-lg"
            >
              {statusLabels[house.status as keyof typeof statusLabels]?.label || house.status}
            </Badge>
            {classLabels[houseClass] && (
              <Badge className={`${classLabels[houseClass].color} text-white shadow-lg`}>
                <Sparkles className="w-3 h-3 mr-1" />
                {classLabels[houseClass].label}
              </Badge>
            )}
          </div>
          
          <button
            onClick={toggleFavorite}
            disabled={isLoading}
            className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 ${
              isFavorite 
                ? "bg-red-500 text-white" 
                : "bg-white/20 text-white hover:bg-white/40"
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Bottom Info on Image */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg line-clamp-1">
            {house.title}
          </h3>
          <div className="flex items-center gap-1 text-white/90 text-sm">
            <MapPin className="w-4 h-4" />
            <span>ДПК {settlement === "zapovednoe" ? "Заповедное" : "Колосок"}</span>
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-300">
            <Eye className="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Short Description */}
        {house.short_description && (
          <p className="text-muted-foreground text-sm line-clamp-2">
            {house.short_description}
          </p>
        )}

        {/* Characteristics */}
        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
            <Ruler className="w-4 h-4 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Дом</span>
            <span className="text-sm font-semibold">{house.house_area_sqm} м²</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
            <MapPin className="w-4 h-4 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Участок</span>
            <span className="text-sm font-semibold">{house.land_area_sqm} м²</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
            <BedDouble className="w-4 h-4 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Комнат</span>
            <span className="text-sm font-semibold">{house.rooms}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
            <Layers className="w-4 h-4 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Этажей</span>
            <span className="text-sm font-semibold">{house.floors}</span>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Стоимость</p>
            <p className="text-2xl font-bold text-primary">
              {formatPrice(house.price_rub)}
            </p>
          </div>
          <Button 
            size="lg"
            className="shadow-soft"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/${settlement}/houses/${house.id}`);
            }}
          >
            Подробнее
          </Button>
        </div>
      </div>
    </Card>
  );
};