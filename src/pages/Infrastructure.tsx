import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Zap, Droplet, Flame, Wifi, Shield, TreePine } from "lucide-react";

interface InfrastructureProps {
  settlement: "zapovednoe" | "kolosok";
}

const Infrastructure = ({ settlement }: InfrastructureProps) => {
  const items = [
    { icon: Zap, title: "Электричество", description: "Подключение 15 кВт, надежные линии электропередач" },
    { icon: Droplet, title: "Водоснабжение", description: "Центральный водопровод, артезианские скважины" },
    { icon: Flame, title: "Газоснабжение", description: "Магистральный газ подведен ко всем участкам" },
    { icon: Wifi, title: "Интернет", description: "Высокоскоростной оптоволоконный интернет" },
    { icon: Shield, title: "Безопасность", description: "Видеонаблюдение, охрана, контроль въезда" },
    { icon: TreePine, title: "Благоустройство", description: "Асфальтированные дороги, освещение, озеленение" },
  ];

  return (
    <Layout settlement={settlement}>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Инфраструктура</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Все необходимое для комфортной жизни
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <Card key={index} className="p-6 hover:shadow-medium transition-smooth">
              <div className="w-12 h-12 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Infrastructure;
