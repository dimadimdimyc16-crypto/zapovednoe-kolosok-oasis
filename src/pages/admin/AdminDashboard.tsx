import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building,
  MapPin,
  Newspaper,
  MessageSquare,
  Calendar,
  Users,
  TrendingUp,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  href, 
  color = "primary" 
}: { 
  title: string; 
  value: number | string; 
  icon: any; 
  href: string;
  color?: string;
}) => (
  <Link to={href}>
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  </Link>
);

export const AdminDashboard = () => {
  const { data: housesCount = 0 } = useQuery({
    queryKey: ["admin-houses-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("houses")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: plotsCount = 0 } = useQuery({
    queryKey: ["admin-plots-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("plots")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: newsCount = 0 } = useQuery({
    queryKey: ["admin-news-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("news")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: supportCount = 0 } = useQuery({
    queryKey: ["admin-support-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("support_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");
      return count || 0;
    },
  });

  const { data: viewingCount = 0 } = useQuery({
    queryKey: ["admin-viewing-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("viewing_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");
      return count || 0;
    },
  });

  const { data: recentNews = [] } = useQuery({
    queryKey: ["admin-recent-news"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const { data: recentViewings = [] } = useQuery({
    queryKey: ["admin-recent-viewings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("viewing_requests")
        .select("*, houses(title)")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Дашборд</h1>
          <p className="text-muted-foreground mt-1">
            Обзор статистики и быстрый доступ к управлению
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Дома"
            value={housesCount}
            icon={Building}
            href="/admin/houses"
          />
          <StatCard
            title="Участки"
            value={plotsCount}
            icon={MapPin}
            href="/admin/plots"
          />
          <StatCard
            title="Новости"
            value={newsCount}
            icon={Newspaper}
            href="/admin/news"
          />
          <StatCard
            title="Новых обращений"
            value={supportCount}
            icon={MessageSquare}
            href="/admin/support"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="Заявок на просмотр"
            value={viewingCount}
            icon={Calendar}
            href="/admin/viewings"
          />
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Всего объектов</p>
                  <p className="text-3xl font-bold">{housesCount + plotsCount}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent News */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Newspaper className="h-5 w-5" />
                Последние новости
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentNews.length === 0 ? (
                <p className="text-muted-foreground text-sm">Нет новостей</p>
              ) : (
                <ul className="space-y-3">
                  {recentNews.map((news: any) => (
                    <li key={news.id} className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{news.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(news.created_at).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        news.published 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {news.published ? "Опубликовано" : "Черновик"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link 
                to="/admin/news" 
                className="block mt-4 text-sm text-primary hover:underline"
              >
                Все новости →
              </Link>
            </CardContent>
          </Card>

          {/* Recent Viewing Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Последние заявки на просмотр
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentViewings.length === 0 ? (
                <p className="text-muted-foreground text-sm">Нет заявок</p>
              ) : (
                <ul className="space-y-3">
                  {recentViewings.map((viewing: any) => (
                    <li key={viewing.id} className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{viewing.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {viewing.houses?.title || "Общий просмотр"}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        viewing.status === "new" 
                          ? "bg-blue-100 text-blue-700" 
                          : viewing.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {viewing.status === "new" ? "Новая" : viewing.status === "approved" ? "Одобрена" : viewing.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link 
                to="/admin/viewings" 
                className="block mt-4 text-sm text-primary hover:underline"
              >
                Все заявки →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
