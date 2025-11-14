import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Home, Heart, Sun, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Kolosok = () => {
  const advantages = [
    {
      icon: Heart,
      title: "Семейная атмосфера",
      description: "Дружное сообщество жителей",
    },
    {
      icon: Sun,
      title: "Открытые пространства",
      description: "Просторные участки с видом на поля",
    },
    {
      icon: Home,
      title: "Готовая инфраструктура",
      description: "Все коммуникации подведены",
    },
    {
      icon: MapPin,
      title: "Отличная доступность",
      description: "25 км от МКАД, хорошая транспортная доступность",
    },
  ];

  return (
    <Layout settlement="kolosok">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-hero"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-overlay" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            ДПК Колосок
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-95">
            Уютный семейный поселок с развитой инфраструктурой
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg">
              <Link to="/kolosok/plots">
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
              Колосок — место, где природа встречается с комфортом
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((advantage, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-medium transition-smooth animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <advantage.icon className="w-8 h-8 text-accent" />
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
            <div className="order-2 lg:order-1 relative h-[400px] rounded-2xl overflow-hidden shadow-medium">
              <img
                src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2000"
                alt="Дома в поселке"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="order-1 lg:order-2 animate-slide-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                О поселке Колосок
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                ДПК Колосок — это уютный семейный поселок, где каждый найдет свой уголок
                для счастливой жизни. Открытые пространства, чистый воздух и дружелюбные
                соседи создают особую атмосферу.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                В поселке предусмотрена вся необходимая инфраструктура: детские площадки,
                спортивные зоны, места для отдыха. Удобная транспортная доступность
                позволяет быстро добраться до Москвы.
              </p>
              <Button size="lg" asChild>
                <Link to="/kolosok/about">
                  Подробнее о поселке
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Станьте частью нашего сообщества
          </h2>
          <p className="text-lg mb-8 opacity-95 max-w-2xl mx-auto">
            Мы поможем найти идеальный участок для строительства дома вашей мечты
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/kolosok/plots">Смотреть участки</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link to="/kolosok/contacts">Связаться с нами</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Kolosok;
