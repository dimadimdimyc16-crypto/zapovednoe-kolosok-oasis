import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Home, Heart, Sun, ChevronRight, Wheat, Users, Baby, Bike, Phone, TreePine, Shield, Droplets } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HouseCard } from "@/components/HouseCard";
import { SEOHead } from "@/components/SEOHead";

const Kolosok = () => {
  const { data: featuredHouses } = useQuery({
    queryKey: ['featured-houses-kolosok'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('houses')
        .select('*')
        .eq('settlement', 'kolosok')
        .eq('status', 'available')
        .limit(3);
      if (error) throw error;
      return data;
    }
  });

  const { data: latestNews } = useQuery({
    queryKey: ['latest-news-kolosok'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('settlement', 'kolosok')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    }
  });

  const { data: settings } = useQuery({
    queryKey: ['site-settings', 'kolosok'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('settlement', 'kolosok')
        .maybeSingle();
      if (error) throw error;
      return data;
    }
  });

  const phone = settings?.contact_phone || '+7 (495) 765-43-21';

  const advantages = [
    {
      icon: Wheat,
      title: "Бескрайние поля",
      description: "Живописные виды на золотые поля пшеницы и бескрайние просторы",
    },
    {
      icon: Heart,
      title: "Дружное сообщество",
      description: "Более 120 семей, объединенных общими ценностями и традициями",
    },
    {
      icon: Baby,
      title: "Идеально для детей",
      description: "Безопасная среда, детские площадки, кружки и секции",
    },
    {
      icon: Bike,
      title: "Активный отдых",
      description: "Велодорожки, спортивные площадки, зоны для пикников",
    },
    {
      icon: Shield,
      title: "Безопасность",
      description: "Огороженная территория, КПП, видеонаблюдение",
    },
    {
      icon: Droplets,
      title: "Чистая экология",
      description: "Вдали от промзон, чистый воздух и артезианская вода",
    },
  ];

  const stats = [
    { value: "200+", label: "Участков" },
    { value: "127", label: "Семей" },
    { value: "12", label: "Лет поселку" },
    { value: "3", label: "Детских площадки" },
  ];

  const events = [
    { title: "Фестиваль урожая", date: "Сентябрь", description: "Ежегодный праздник с ярмаркой" },
    { title: "День соседей", date: "Июнь", description: "Общепоселковый пикник" },
    { title: "Масленица", date: "Февраль", description: "Блины и народные гуляния" },
  ];

  return (
    <Layout settlement="kolosok">
      <SEOHead pageSlug="/kolosok" />
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/30 to-foreground/70" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="animate-fade-in space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm">
              <Wheat className="w-4 h-4 text-accent" />
              Семейный поселок
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              ДПК Колосок
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90 leading-relaxed">
              Уютный семейный поселок среди золотых полей. 
              Место, где дети растут счастливыми, а соседи становятся друзьями.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="text-lg h-14 px-8 shadow-strong">
                <Link to="/kolosok/houses">
                  Выбрать дом
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg h-14 px-8 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
                <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>
                  <Phone className="mr-2 w-5 h-5" />
                  {phone}
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
      <section className="py-12 bg-accent text-accent-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="h-48 rounded-2xl overflow-hidden shadow-medium">
                    <img 
                      src="https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=500" 
                      alt="Дети играют"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="h-64 rounded-2xl overflow-hidden shadow-medium">
                    <img 
                      src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500" 
                      alt="Семейный отдых"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="h-64 rounded-2xl overflow-hidden shadow-medium">
                    <img 
                      src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500" 
                      alt="Праздник урожая"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="h-48 rounded-2xl overflow-hidden shadow-medium">
                    <img 
                      src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500" 
                      alt="Природа"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 text-accent font-medium">
                <Users className="w-5 h-5" />
                Наше сообщество
              </div>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                Больше, чем просто соседи
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                В Колоске мы создали настоящее сообщество. Здесь дети вместе играют на 
                безопасных площадках, взрослые устраивают барбекю и праздники, 
                а пожилые люди находят новых друзей.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Ежегодно мы проводим традиционные мероприятия: Фестиваль урожая, 
                День соседей, Масленицу и многие другие праздники, которые объединяют 
                всех жителей поселка.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                {events.map((event, index) => (
                  <Card key={index} className="p-4 text-center">
                    <div className="text-accent font-semibold mb-1">{event.date}</div>
                    <div className="font-medium">{event.title}</div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Почему выбирают Колосок
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Мы создали идеальное место для семейной жизни, где каждый 
              член семьи найдет что-то для себя
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => (
              <Card
                key={index}
                className="p-8 hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 group"
              >
                <div className="w-16 h-16 mb-6 rounded-2xl bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <advantage.icon className="w-8 h-8 text-accent" />
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
        <section className="py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Дома в продаже</h2>
                <p className="text-muted-foreground">Готовые решения для вашей семьи</p>
              </div>
              <Button variant="outline" size="lg" asChild>
                <Link to="/kolosok/houses">
                  Все дома
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredHouses.map((house) => (
                <HouseCard key={house.id} house={house} settlement="kolosok" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* News Section */}
      {latestNews && latestNews.length > 0 && (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Жизнь поселка</h2>
                <p className="text-muted-foreground">События и новости Колоска</p>
              </div>
              <Button variant="outline" size="lg" asChild>
                <Link to="/kolosok/news">
                  Все новости
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestNews.map((news) => (
                <Link 
                  key={news.id} 
                  to={`/kolosok/news/${news.id}`}
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
                      <h3 className="font-bold text-lg mb-2 group-hover:text-accent transition-colors">
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
      <section className="py-24 bg-accent text-accent-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Присоединяйтесь к семье Колоска
          </h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Приезжайте на экскурсию и почувствуйте атмосферу нашего поселка
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="h-14 px-8 text-lg shadow-strong bg-foreground text-background hover:bg-foreground/90">
              <Link to="/kolosok/houses">Выбрать дом</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent border-2 border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent" asChild>
              <Link to="/kolosok/contacts">Записаться на экскурсию</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Kolosok;
