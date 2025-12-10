import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Loader2, Newspaper, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface NewsProps {
  settlement: "zapovednoe" | "kolosok";
}

const News = ({ settlement }: NewsProps) => {
  const { data: news = [], isLoading } = useQuery({
    queryKey: ['news', settlement],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('settlement', settlement)
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMMM yyyy', { locale: ru });
  };

  const getExcerpt = (content: string, maxLength: number = 200) => {
    const plainText = content.replace(/\*\*/g, '').replace(/\n/g, ' ');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
  };

  return (
    <Layout settlement={settlement}>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <Newspaper className="w-3 h-3 mr-1" />
              Новости и события
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Новости{" "}
              <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                {settlement === "zapovednoe" ? "Заповедного" : "Колоска"}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Актуальная информация о жизни посёлка, мероприятиях и важных событиях
            </p>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Загружаем новости...</p>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Newspaper className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Новостей пока нет</h3>
              <p className="text-muted-foreground">
                Следите за обновлениями — скоро здесь появятся интересные материалы
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Featured News (first item) */}
              {news.length > 0 && (
                <Card className="overflow-hidden hover:shadow-elegant transition-all duration-300">
                  <div className="lg:flex">
                    <div className="lg:w-1/2 h-64 lg:h-auto">
                      <img
                        src={news[0].image_url || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
                        alt={news[0].title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="lg:w-1/2 p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        {news[0].category && (
                          <Badge variant="secondary">{news[0].category}</Badge>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(news[0].created_at)}</span>
                        </div>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-4 hover:text-primary transition-colors">
                        <Link to={`/${settlement}/news/${news[0].id}`}>
                          {news[0].title}
                        </Link>
                      </h2>
                      <p className="text-muted-foreground mb-6 line-clamp-3">
                        {news[0].excerpt || getExcerpt(news[0].content)}
                      </p>
                      <Link to={`/${settlement}/news/${news[0].id}`}>
                        <Button className="gap-2">
                          Читать полностью
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              )}

              {/* Other News */}
              {news.length > 1 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {news.slice(1).map((item) => (
                    <Card 
                      key={item.id} 
                      className="overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 group"
                    >
                      <div className="h-48 overflow-hidden">
                        <img
                          src={item.image_url || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          {item.category && (
                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(item.created_at)}</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          <Link to={`/${settlement}/news/${item.id}`}>
                            {item.title}
                          </Link>
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                          {item.excerpt || getExcerpt(item.content, 100)}
                        </p>
                        <Link 
                          to={`/${settlement}/news/${item.id}`}
                          className="text-primary text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                        >
                          Читать далее
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default News;
