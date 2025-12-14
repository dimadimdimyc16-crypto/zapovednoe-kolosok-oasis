import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Search, Calendar, CheckCircle, XCircle, Clock, Phone, Mail } from "lucide-react";

export const AdminViewings = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: viewings = [], isLoading } = useQuery({
    queryKey: ["admin-viewings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("viewing_requests")
        .select("*, houses(title, settlement)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("viewing_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-viewings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-viewing-count"] });
      queryClient.invalidateQueries({ queryKey: ["admin-recent-viewings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-table-stats"] });
      toast.success("Статус заявки обновлен");
    },
    onError: (error) => {
      toast.error("Ошибка обновления: " + error.message);
    },
  });

  const filterByStatus = (status: string) => {
    if (status === "all") return viewings;
    return viewings.filter((v) => v.status === status);
  };

  const filteredViewings = viewings.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.phone.includes(searchTerm)
  );

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive"; icon: any }> = {
    new: { label: "Новая", variant: "default", icon: Clock },
    approved: { label: "Одобрена", variant: "secondary", icon: CheckCircle },
    declined: { label: "Отклонена", variant: "destructive", icon: XCircle },
    completed: { label: "Завершена", variant: "secondary", icon: CheckCircle },
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Заявки на просмотр
          </h1>
          <p className="text-muted-foreground mt-1">
            Всего: {viewings.length} | Новых: {filterByStatus("new").length}
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени, email или телефону..."
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
              Все ({viewings.length})
            </TabsTrigger>
            <TabsTrigger value="new">
              Новые ({filterByStatus("new").length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Одобренные ({filterByStatus("approved").length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Завершенные ({filterByStatus("completed").length})
            </TabsTrigger>
          </TabsList>

          {["all", "new", "approved", "completed"].map((status) => (
            <TabsContent key={status} value={status}>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Клиент</TableHead>
                        <TableHead>Контакты</TableHead>
                        <TableHead>Объект</TableHead>
                        <TableHead>Дата просмотра</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Загрузка...
                          </TableCell>
                        </TableRow>
                      ) : (
                        (status === "all" ? filteredViewings : filterByStatus(status).filter(
                          v => v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               v.phone.includes(searchTerm)
                        )).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              Заявки не найдены
                            </TableCell>
                          </TableRow>
                        ) : (
                          (status === "all" ? filteredViewings : filterByStatus(status).filter(
                            v => v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 v.phone.includes(searchTerm)
                          )).map((viewing: any) => {
                            const StatusIcon = statusConfig[viewing.status]?.icon || Clock;
                            return (
                              <TableRow key={viewing.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{viewing.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(viewing.created_at).toLocaleDateString("ru-RU")}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-sm">
                                      <Phone className="h-3 w-3" />
                                      {viewing.phone}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Mail className="h-3 w-3" />
                                      {viewing.email}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {viewing.houses?.title || "Общий просмотр"}
                                  <p className="text-xs text-muted-foreground">
                                    {viewing.houses?.settlement === "zapovednoe" ? "Заповедное" : 
                                     viewing.houses?.settlement === "kolosok" ? "Колосок" : viewing.settlement}
                                  </p>
                                </TableCell>
                                <TableCell>
                                  {viewing.preferred_date ? (
                                    <div>
                                      <p>{new Date(viewing.preferred_date).toLocaleDateString("ru-RU")}</p>
                                      {viewing.preferred_time && (
                                        <p className="text-xs text-muted-foreground">{viewing.preferred_time}</p>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">Не указана</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={statusConfig[viewing.status]?.variant || "default"}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {statusConfig[viewing.status]?.label || viewing.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    {viewing.status === "new" && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => 
                                            updateStatusMutation.mutate({ id: viewing.id, status: "approved" })
                                          }
                                        >
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => 
                                            updateStatusMutation.mutate({ id: viewing.id, status: "declined" })
                                          }
                                        >
                                          <XCircle className="h-4 w-4 text-destructive" />
                                        </Button>
                                      </>
                                    )}
                                    {viewing.status === "approved" && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => 
                                          updateStatusMutation.mutate({ id: viewing.id, status: "completed" })
                                        }
                                      >
                                        Завершить
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminViewings;
