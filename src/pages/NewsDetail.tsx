import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Share2, Loader2, Newspaper, Clock } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";

interface NewsDetailProps {
  settlement: "zapovednoe" | "kolosok";
}

const NewsDetail = ({ settlement }: NewsDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: newsItem, isLoading, error } = useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided');
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: relatedNews = [] } = useQuery({
    queryKey: ['related-news', settlement, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('settlement', settlement)
        .eq('published', true)
        .neq('id', id || '')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!id
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMMM yyyy', { locale: ru });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: newsItem?.title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Ссылка скопирована');
    }
  };

  const renderContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      // Check for headers (bold text on its own line)
      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
        return (
          <h3 key={index} className="text-2xl font-bold mt-10 mb-4 text-foreground">
            {paragraph.replace(/\*\*/g, '')}
          </h3>
        );
      }
      
      // Check for inline bold
      if (paragraph.includes('**')) {
        const parts = paragraph.split(/\*\*(.+?)\*\*/g);
        return (
          <p key={index} className="text-lg text-muted-foreground leading-relaxed mb-6">
            {parts.map((part, partIndex) => 
              partIndex % 2 === 1 ? (
                <strong key={partIndex} className="font-semibold text-foreground">{part}</strong>
              ) : (
                part
              )
            )}
          </p>
        );
      }

      // Check for numbered lists
      if (paragraph.match(/^\d+\./)) {
        const listItems = paragraph.split('\n').filter(item => item.trim());
        return (
          <ol key={index} className="list-decimal list-inside space-y-2 mb-6 text-muted-foreground">
            {listItems.map((item, itemIndex) => (
              <li key={itemIndex} className="text-lg leading-relaxed">
                {item.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ol>
        );
      }

      return (
        <p key={index} className="text-lg text-muted-foreground leading-relaxed mb-6">
          {paragraph}
        </p>
      );
    });
  };

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  if (isLoading) {
    return (
      <Layout settlement={settlement}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Загружаем новость...</p>
        </div>
      </Layout>
    );
  }

  if (error || !newsItem) {
    return (
      <Layout settlement={settlement}>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Newspaper className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Новость не найдена</h1>
          <p className="text-muted-foreground mb-8">
            Возможно, она была удалена или перемещена
          </p>
          <Link to={`/${settlement}/news`}>
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              К списку новостей
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout settlement={settlement}>
      {/* Hero Image */}
      <section className="relative h-[40vh] md:h-[50vh]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${newsItem.image_url || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600"})` 
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="container mx-auto">
            <Link 
              to={`/${settlement}/news`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Все новости
            </Link>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {newsItem.category && (
                <Badge variant="secondary" className="text-sm">
                  {newsItem.category}
                </Badge>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(newsItem.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{estimateReadTime(newsItem.content)} мин чтения</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto gap-2"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                Поделиться
              </Button>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 leading-tight">
              {newsItem.title}
            </h1>

            {/* Content */}
            <article className="prose prose-lg max-w-none">
              {renderContent(newsItem.content)}
            </article>

            {/* Share */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex items-center justify-between">
                <Link 
                  to={`/${settlement}/news`}
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Все новости
                </Link>
                <Button variant="outline" onClick={handleShare} className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Поделиться
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related News */}
      {relatedNews.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Другие новости</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedNews.map((item) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="h-40 overflow-hidden">
                    <img
                      src={item.image_url || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    <h3 className="font-bold line-clamp-2 group-hover:text-primary transition-colors">
                      <Link to={`/${settlement}/news/${item.id}`}>
                        {item.title}
                      </Link>
                    </h3>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default NewsDetail;