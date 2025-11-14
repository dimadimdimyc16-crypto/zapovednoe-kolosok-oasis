import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Ruler, Tag, Phone } from "lucide-react";

interface PlotsProps {
  settlement: "zapovednoe" | "kolosok";
}

const Plots = ({ settlement }: PlotsProps) => {
  // Демо-данные
  const plots = [
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Земельные участки</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Выберите идеальный участок для строительства дома вашей мечты
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plots.map((plot) => (
            <Card key={plot.number} className="overflow-hidden hover:shadow-medium transition-smooth">
              <div className="relative h-48">
                <img
                  src={plot.image}
                  alt={`Участок ${plot.number}`}
                  className="w-full h-full object-cover"
                />
                <Badge
                  variant={statusLabels[plot.status as keyof typeof statusLabels].variant}
                  className="absolute top-3 right-3"
                >
                  {statusLabels[plot.status as keyof typeof statusLabels].label}
                </Badge>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Участок №{plot.number}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Ruler className="w-4 h-4" />
                    <span>Площадь: {plot.area} м²</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>ДПК {settlement === "zapovednoe" ? "Заповедное" : "Колосок"}</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-xl text-primary">
                    <Tag className="w-5 h-5" />
                    <span>{plot.price.toLocaleString("ru-RU")} ₽</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  disabled={plot.status !== "available"}
                  asChild={plot.status === "available"}
                >
                  {plot.status === "available" ? (
                    <a href="tel:+79000000000">
                      <Phone className="w-4 h-4 mr-2" />
                      Забронировать
                    </a>
                  ) : (
                    <span>{statusLabels[plot.status as keyof typeof statusLabels].label}</span>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Plots;
