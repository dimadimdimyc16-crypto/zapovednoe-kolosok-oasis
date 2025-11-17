import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MessageSquare, Clock, CheckCircle, XCircle, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminProps {
  settlement: "zapovednoe" | "kolosok";
}

const Admin = ({ settlement }: AdminProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [response, setResponse] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate(`/${settlement}/auth`);
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAccess = roles?.some(r => 
      r.role === 'admin' || 
      r.role === `chairman_${settlement}`
    );

    if (!hasAccess) {
      toast.error("У вас нет доступа к этой странице");
      navigate(`/${settlement}`);
      return;
    }

    setIsAdmin(true);
  };

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['support_requests', settlement],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .eq('settlement', settlement)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, admin_response }: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('support_requests')
        .update({
          status,
          admin_response,
          responded_at: new Date().toISOString(),
          responded_by: user?.id,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_requests'] });
      toast.success("Обращение обновлено");
      setSelectedRequest(null);
      setResponse("");
    },
    onError: () => {
      toast.error("Ошибка обновления обращения");
    },
  });

  const handleRespond = (status: string) => {
    if (!selectedRequest) return;
    updateRequestMutation.mutate({
      id: selectedRequest.id,
      status,
      admin_response: response,
    });
  };

  const statusConfig = {
    new: { label: "Новое", variant: "default" as const, icon: MessageSquare },
    in_progress: { label: "В работе", variant: "secondary" as const, icon: Clock },
    resolved: { label: "Решено", variant: "default" as const, icon: CheckCircle },
    closed: { label: "Закрыто", variant: "destructive" as const, icon: XCircle },
  };

  const filterByStatus = (status: string) => {
    if (status === 'all') return requests;
    return requests.filter(r => r.status === status);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout settlement={settlement}>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Панель администратора
          </h1>
          <p className="text-muted-foreground">
            Управление обращениями жителей ДПК {settlement === "zapovednoe" ? "Заповедное" : "Колосок"}
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              Все ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="new">
              Новые ({filterByStatus('new').length})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              В работе ({filterByStatus('in_progress').length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Решенные ({filterByStatus('resolved').length})
            </TabsTrigger>
          </TabsList>

          {['all', 'new', 'in_progress', 'resolved'].map(status => (
            <TabsContent key={status} value={status} className="space-y-4">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Загрузка...</p>
              ) : filterByStatus(status === 'all' ? '' : status).length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Нет обращений</p>
                </Card>
              ) : (
                filterByStatus(status === 'all' ? '' : status).map((request) => {
                  const StatusIcon = statusConfig[request.status as keyof typeof statusConfig].icon;
                  
                  return (
                    <Card key={request.id} className="p-6 hover:shadow-elegant transition-smooth">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{request.subject}</h3>
                            <Badge variant={statusConfig[request.status as keyof typeof statusConfig].variant}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig[request.status as keyof typeof statusConfig].label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            От: {request.name} • {request.email}
                            {request.phone && ` • ${request.phone}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(request.created_at).toLocaleString('ru-RU')}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Сообщение:</h4>
                          <p className="text-muted-foreground">{request.message}</p>
                        </div>

                        {request.admin_response && (
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Ответ администратора:</h4>
                            <p className="text-muted-foreground">{request.admin_response}</p>
                          </div>
                        )}

                        {selectedRequest?.id === request.id ? (
                          <div className="space-y-3 pt-4 border-t">
                            <Textarea
                              placeholder="Введите ответ..."
                              value={response}
                              onChange={(e) => setResponse(e.target.value)}
                              rows={4}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleRespond('in_progress')}
                                variant="secondary"
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                В работе
                              </Button>
                              <Button
                                onClick={() => handleRespond('resolved')}
                                disabled={!response.trim()}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Решено
                              </Button>
                              <Button
                                onClick={() => setSelectedRequest(null)}
                                variant="outline"
                              >
                                Отмена
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setSelectedRequest(request)}
                            variant="outline"
                            className="w-full"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Ответить
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
