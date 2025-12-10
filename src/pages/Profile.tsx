import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, History, MessageSquare, User, Home, 
  Calendar, Loader2, Trash2, Eye, Send, LogOut
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface ProfileProps {
  settlement: "zapovednoe" | "kolosok";
}

const Profile = ({ settlement }: ProfileProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supportMessage, setSupportMessage] = useState({
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate(`/${settlement}/auth`);
        return;
      }
      setUser(session.user);
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate(`/${settlement}/auth`);
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, settlement]);

  // Fetch favorites
  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          houses (*)
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Fetch viewed houses
  const { data: viewedHouses = [], isLoading: viewedLoading } = useQuery({
    queryKey: ['viewed_houses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('viewed_houses')
        .select(`
          *,
          houses (*)
        `)
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Fetch user's support requests
  const { data: supportRequests = [], isLoading: supportLoading } = useQuery({
    queryKey: ['support_requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Remove from favorites
  const removeFavorite = useMutation({
    mutationFn: async (favoriteId: string) => {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Удалено из избранного');
    },
    onError: () => {
      toast.error('Ошибка при удалении');
    }
  });

  // Submit support request
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('support_requests').insert({
        name: user.email?.split('@')[0] || 'Пользователь',
        email: user.email,
        subject: supportMessage.subject,
        message: supportMessage.message,
        settlement: settlement,
      });

      if (error) throw error;

      toast.success('Сообщение отправлено! Мы ответим в ближайшее время.');
      setSupportMessage({ subject: "", message: "" });
      queryClient.invalidateQueries({ queryKey: ['support_requests'] });
    } catch (error) {
      toast.error('Ошибка отправки сообщения');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Вы вышли из аккаунта');
    navigate(`/${settlement}`);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMMM yyyy, HH:mm', { locale: ru });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return (
      <Layout settlement={settlement}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout settlement={settlement}>
      {/* Header */}
      <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Личный кабинет</h1>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Выйти
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="favorites" className="space-y-8">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 gap-2">
              <TabsTrigger value="favorites" className="gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Избранное</span>
                {favorites.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{favorites.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">История</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Поддержка</span>
              </TabsTrigger>
            </TabsList>

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Избранные дома
                </h2>
                {favoritesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Heart className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-4">У вас пока нет избранных домов</p>
                    <Link to={`/${settlement}/houses`}>
                      <Button>Перейти в каталог</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {favorites.map((fav: any) => (
                      <div 
                        key={fav.id} 
                        className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <img 
                          src={fav.houses?.images?.[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200"}
                          alt={fav.houses?.title}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{fav.houses?.title}</h3>
                          <p className="text-primary font-bold">
                            {fav.houses?.price_rub && formatPrice(fav.houses.price_rub)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {fav.houses?.house_area_sqm} м² • {fav.houses?.rooms} комнат
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/${fav.houses?.settlement}/houses/${fav.houses?.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeFavorite.mutate(fav.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  История просмотров
                </h2>
                {viewedLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : viewedHouses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <History className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-4">Вы еще не просматривали дома</p>
                    <Link to={`/${settlement}/houses`}>
                      <Button>Перейти в каталог</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {viewedHouses.map((view: any) => (
                      <div 
                        key={view.id} 
                        className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <img 
                          src={view.houses?.images?.[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200"}
                          alt={view.houses?.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{view.houses?.title}</h3>
                          <p className="text-primary font-bold">
                            {view.houses?.price_rub && formatPrice(view.houses.price_rub)}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(view.viewed_at)}
                          </p>
                        </div>
                        <Link to={`/${view.houses?.settlement}/houses/${view.houses?.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Support Tab */}
            <TabsContent value="support">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* New Message Form */}
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Send className="w-5 h-5 text-primary" />
                    Написать в поддержку
                  </h2>
                  <form onSubmit={handleSupportSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Тема обращения</label>
                      <Input 
                        placeholder="Кратко опишите вопрос"
                        value={supportMessage.subject}
                        onChange={(e) => setSupportMessage(prev => ({ ...prev, subject: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Сообщение</label>
                      <Textarea 
                        placeholder="Подробно опишите ваш вопрос или проблему..."
                        rows={5}
                        value={supportMessage.message}
                        onChange={(e) => setSupportMessage(prev => ({ ...prev, message: e.target.value }))}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                      <Send className="w-4 h-4" />
                      {isSubmitting ? "Отправка..." : "Отправить сообщение"}
                    </Button>
                  </form>
                </Card>

                {/* Previous Requests */}
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    История обращений
                  </h2>
                  {supportLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : supportRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">У вас пока нет обращений</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {supportRequests.map((request: any) => (
                        <div 
                          key={request.id} 
                          className="p-4 bg-muted/30 rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-medium line-clamp-1">{request.subject}</h4>
                            <Badge variant={
                              request.status === 'new' ? 'default' :
                              request.status === 'in_progress' ? 'secondary' :
                              'outline'
                            }>
                              {request.status === 'new' ? 'Новое' :
                               request.status === 'in_progress' ? 'В работе' :
                               'Завершено'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {request.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(request.created_at)}
                          </p>
                          {request.admin_response && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-xs font-medium text-primary mb-1">Ответ:</p>
                              <p className="text-sm">{request.admin_response}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Profile;