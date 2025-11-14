import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Home, Trees, Waves, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Zapovednoe = () => {
  const advantages = [
    {
      icon: Trees,
      title: "Лесная зона",
      description: "Расположение в окружении соснового леса",
    },
    {
      icon: Waves,
      title: "Близость к воде",
      description: "Собственный водоем и река поблизости",
    },
    {
      icon: Home,
      title: "Развитая инфраструктура",
      description: "Электричество, газ, асфальтированные дороги",
    },
    {
      icon: MapPin,
      title: "Удобное расположение",
      description: "30 км от МКАД по Новорижскому шоссе",
    },
  ];

  return (
    <Layout settlement="zapovednoe">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-hero"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1464146072230-91cabc968266?q=80&w=2000')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-overlay" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            ДПК Заповедное
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-95">
            Премиум коттеджный поселок в экологически чистом районе Подмосковья
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg">
              <Link to="/zapovednoe/plots">
                Выбрать участок
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild className="text-lg">
              <a href="tel:+79000000000">Позвонить</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Преимущества поселка
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Заповедное — это идеальное место для жизни вашей семьи
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((advantage, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-medium transition-smooth animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <advantage.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{advantage.title}</h3>
                <p className="text-muted-foreground">{advantage.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                О поселке Заповедное
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Коттеджный поселок Заповедное — это современный комплекс премиум-класса,
                расположенный в экологически чистом районе Подмосковья. Здесь сочетаются
                комфорт городской жизни и единение с природой.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Все участки обеспечены необходимой инфраструктурой: электричество,
                газ, водоснабжение, асфальтированные дороги. На территории поселка
                предусмотрены детские и спортивные площадки, зоны отдыха.
              </p>
              <Button size="lg" asChild>
                <Link to="/zapovednoe/about">
                  Подробнее о поселке
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>

            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-medium">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000"
                alt="Дома в поселке"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Готовы выбрать свой участок?
          </h2>
          <p className="text-lg mb-8 opacity-95 max-w-2xl mx-auto">
            Наши специалисты помогут подобрать идеальный участок и ответят на все вопросы
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/zapovednoe/plots">Смотреть участки</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link to="/zapovednoe/contacts">Связаться с нами</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Zapovednoe;
