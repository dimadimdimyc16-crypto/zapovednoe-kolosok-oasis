import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Search, MessageSquare, CheckCircle, Clock, Send, XCircle } from "lucide-react";

export const AdminSupport = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [response, setResponse] = useState("");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["admin-support"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, admin_response }: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("support_requests")
        .update({
          status,
          admin_response,
          responded_at: new Date().toISOString(),
          responded_by: user?.id,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-support"] });
      toast.success("Обращение обновлено");
      setSelectedRequest(null);
      setResponse("");
    },
    onError: (error) => {
      toast.error("Ошибка: " + error.message);
    },
  });

  const handleRespond = (status: string) => {
    if (!selectedRequest) return;
    updateMutation.mutate({
      id: selectedRequest.id,
      status,
      admin_response: response,
    });
  };

  const filterByStatus = (status: string) => {
    if (status === "all") return requests;
    return requests.filter((r) => r.status === status);
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive"; icon: any }> = {
    new: { label: "Новое", variant: "default", icon: MessageSquare },
    in_progress: { label: "В работе", variant: "secondary", icon: Clock },
    resolved: { label: "Решено", variant: "default", icon: CheckCircle },
    closed: { label: "Закрыто", variant: "destructive", icon: XCircle },
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            Обращения
          </h1>
          <p className="text-muted-foreground mt-1">
            Всего: {requests.length} | Новых: {filterByStatus("new").length}
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени, теме или email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">
              Все ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="new">
              Новые ({filterByStatus("new").length})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              В работе ({filterByStatus("in_progress").length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Решенные ({filterByStatus("resolved").length})
            </TabsTrigger>
          </TabsList>

          {["all", "new", "in_progress", "resolved"].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {isLoading ? (
                <Card className="p-8 text-center text-muted-foreground">
                  Загрузка...
                </Card>
              ) : (
                (status === "all"
                  ? filteredRequests
                  : filterByStatus(status).filter(
                      (r) =>
                        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                ).length === 0 ? (
                  <Card className="p-8 text-center text-muted-foreground">
                    Обращений не найдено
                  </Card>
                ) : (
                  (status === "all"
                    ? filteredRequests
                    : filterByStatus(status).filter(
                        (r) =>
                          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                  ).map((request) => {
                    const StatusIcon = statusConfig[request.status]?.icon || MessageSquare;

                    return (
                      <Card key={request.id} className="hover:shadow-lg transition-all">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <CardTitle className="text-lg">{request.subject}</CardTitle>
                                <Badge variant={statusConfig[request.status]?.variant || "default"}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusConfig[request.status]?.label || request.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                От: {request.name} • {request.email}
                                {request.phone && ` • ${request.phone}`}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(request.created_at).toLocaleString("ru-RU")} • 
                                {request.settlement === "zapovednoe" ? " Заповедное" : " Колосок"}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-1">Сообщение:</p>
                            <p className="text-muted-foreground text-sm">{request.message}</p>
                          </div>

                          {request.admin_response && (
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <p className="text-sm font-medium mb-1">Ответ:</p>
                              <p className="text-muted-foreground text-sm">{request.admin_response}</p>
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
                                  onClick={() => handleRespond("in_progress")}
                                  variant="secondary"
                                  size="sm"
                                >
                                  <Clock className="w-4 h-4 mr-1" />
                                  В работу
                                </Button>
                                <Button
                                  onClick={() => handleRespond("resolved")}
                                  disabled={!response.trim()}
                                  size="sm"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Решено
                                </Button>
                                <Button
                                  onClick={() => setSelectedRequest(null)}
                                  variant="outline"
                                  size="sm"
                                >
                                  Отмена
                                </Button>
                              </div>
                            </div>
                          ) : (
                            request.status !== "resolved" && request.status !== "closed" && (
                              <Button
                                onClick={() => setSelectedRequest(request)}
                                variant="outline"
                                className="w-full"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Ответить
                              </Button>
                            )
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSupport;
