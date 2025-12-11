import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Home, Trees, Waves, ChevronRight, Shield, Zap, Droplets, Car, Phone, Star, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HouseCard } from "@/components/HouseCard";

const Zapovednoe = () => {
  const { data: featuredHouses } = useQuery({
    queryKey: ['featured-houses-zapovednoe'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('houses')
        .select('*')
        .eq('settlement', 'zapovednoe')
        .eq('status', 'available')
        .limit(3);
      if (error) throw error;
      return data;
    }
  });

  const { data: latestNews } = useQuery({
    queryKey: ['latest-news-zapovednoe'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('settlement', 'zapovednoe')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    }
  });

  const advantages = [
    {
      icon: Trees,
      title: "Вековой сосновый лес",
      description: "Расположение в окружении заповедного соснового бора возрастом более 100 лет",
    },
    {
      icon: Waves,
      title: "Собственный водоем",
      description: "Благоустроенный пруд с беседками и зонами отдыха для жителей",
    },
    {
      icon: Shield,
      title: "Круглосуточная охрана",
      description: "Профессиональная служба безопасности, видеонаблюдение, КПП",
    },
    {
      icon: Zap,
      title: "Все коммуникации",
      description: "Электричество 15 кВт, магистральный газ, центральное водоснабжение",
    },
    {
      icon: Car,
      title: "Асфальтированные дороги",
      description: "Качественное дорожное покрытие, освещение, тротуары",
    },
    {
      icon: MapPin,
      title: "30 км от МКАД",
      description: "По Новорижскому шоссе, без пробок за 30 минут до центра",
    },
  ];

  const stats = [
    { value: "150+", label: "Участков" },
    { value: "89", label: "Семей живут" },
    { value: "15", label: "Лет поселку" },
    { value: "100%", label: "Коммуникаций" },
  ];

  return (
    <Layout settlement="zapovednoe">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1464146072230-91cabc968266?q=80&w=2000')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/80" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="animate-fade-in space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm">
              <Star className="w-4 h-4 text-accent" />
              Премиум-класс
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              ДПК Заповедное
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90 leading-relaxed">
              Эксклюзивный коттеджный поселок в окружении векового соснового леса. 
              Место, где роскошь встречается с природой.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="text-lg h-14 px-8 shadow-strong">
                <Link to="/zapovednoe/houses">
                  Выбрать дом
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg h-14 px-8 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
                <a href="tel:+74951234567">
                  <Phone className="mr-2 w-5 h-5" />
                  +7 (495) 123-45-67
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/70 rounded-full" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-primary-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Преимущества поселка
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Заповедное — это не просто место для жизни, это образ жизни, 
              где каждая деталь продумана для вашего комфорта
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => (
              <Card
                key={index}
                className="p-8 hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 group bg-card"
              >
                <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <advantage.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">{advantage.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{advantage.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Houses */}
      {featuredHouses && featuredHouses.length > 0 && (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Избранные дома</h2>
                <p className="text-muted-foreground">Лучшие предложения для вашей семьи</p>
              </div>
              <Button variant="outline" size="lg" asChild>
                <Link to="/zapovednoe/houses">
                  Все дома
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredHouses.map((house) => (
                <HouseCard key={house.id} house={house} settlement="zapovednoe" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-primary font-medium">
                <Users className="w-5 h-5" />
                О поселке
              </div>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                История и философия Заповедного
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Коттеджный поселок Заповедное был основан в 2009 году с целью создания 
                эксклюзивного места для жизни, где современный комфорт гармонично 
                сочетается с первозданной красотой природы.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                За более чем 15 лет мы создали уникальное сообщество из 89 семей, 
                объединенных общими ценностями: любовью к природе, стремлением к 
                качественной жизни и заботой о будущем своих детей.
              </p>
              <Button size="lg" asChild className="mt-4">
                <Link to="/zapovednoe/about">
                  Подробнее о поселке
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-strong">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000"
                  alt="Дома в поселке Заповедное"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-6 shadow-elegant">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">15 лет</div>
                    <div className="text-muted-foreground">на рынке</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      {latestNews && latestNews.length > 0 && (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Новости поселка</h2>
                <p className="text-muted-foreground">Актуальные события и объявления</p>
              </div>
              <Button variant="outline" size="lg" asChild>
                <Link to="/zapovednoe/news">
                  Все новости
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestNews.map((news) => (
                <Link 
                  key={news.id} 
                  to={`/zapovednoe/news/${news.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-elegant transition-all duration-500 h-full">
                    {news.image_url && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={news.image_url} 
                          alt={news.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="text-sm text-muted-foreground mb-2">
                        {new Date(news.created_at).toLocaleDateString('ru-RU')}
                      </div>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {news.excerpt}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-gradient-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Готовы стать частью Заповедного?
          </h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Запишитесь на бесплатную экскурсию по поселку и убедитесь в качестве сами
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="h-14 px-8 text-lg shadow-strong">
              <Link to="/zapovednoe/houses">Выбрать дом</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link to="/zapovednoe/contacts">Записаться на экскурсию</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Zapovednoe;
