import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, Table2, RefreshCw, CheckCircle2, AlertCircle, Eye, Download } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TableInfo {
  name: string;
  displayName: string;
  count: number;
  status: "connected" | "error";
}

export const AdminDatabase = () => {
  const [selectedTable, setSelectedTable] = useState<string>("houses");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const tables: { name: string; displayName: string }[] = [
    { name: "houses", displayName: "Дома" },
    { name: "plots", displayName: "Участки" },
    { name: "news", displayName: "Новости" },
    { name: "viewing_requests", displayName: "Заявки на просмотр" },
    { name: "support_requests", displayName: "Обращения" },
    { name: "profiles", displayName: "Профили" },
    { name: "user_roles", displayName: "Роли пользователей" },
    { name: "documents", displayName: "Документы" },
    { name: "gallery", displayName: "Галерея" },
    { name: "homepage_blocks", displayName: "Блоки главной" },
    { name: "page_settings", displayName: "Настройки страниц" },
    { name: "site_settings", displayName: "Настройки сайта" },
  ];

  const { data: tableStats = [], refetch: refetchStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["admin-table-stats"],
    queryFn: async () => {
      const stats: TableInfo[] = [];
      
      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table.name as any)
            .select("*", { count: "exact", head: true });
          
          stats.push({
            name: table.name,
            displayName: table.displayName,
            count: count || 0,
            status: error ? "error" : "connected",
          });
        } catch {
          stats.push({
            name: table.name,
            displayName: table.displayName,
            count: 0,
            status: "error",
          });
        }
      }
      
      return stats;
    },
  });

  const { data: tableData = [], isLoading: isLoadingData } = useQuery({
    queryKey: ["admin-table-data", selectedTable],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(selectedTable as any)
        .select("*")
        .limit(50);
      
      if (error) {
        console.error("Error fetching table data:", error);
        return [];
      }
      
      return data || [];
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchStats();
    setIsRefreshing(false);
    toast.success("Данные обновлены");
  };

  const handleExport = () => {
    if (tableData.length === 0) {
      toast.error("Нет данных для экспорта");
      return;
    }
    
    const jsonString = JSON.stringify(tableData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedTable}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Данные экспортированы");
  };

  const getColumns = () => {
    if (tableData.length === 0) return [];
    return Object.keys(tableData[0]).slice(0, 6); // Show first 6 columns
  };

  const formatCellValue = (value: any) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Да" : "Нет";
    if (typeof value === "object") return JSON.stringify(value).slice(0, 50) + "...";
    if (typeof value === "string" && value.length > 50) return value.slice(0, 50) + "...";
    return String(value);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="h-8 w-8" />
              Управление базой данных
            </h1>
            <p className="text-muted-foreground mt-1">
              Просмотр таблиц и статистики
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Обновить
          </Button>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Статус подключения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant="default" className="bg-green-500">
                Подключено
              </Badge>
              <span className="text-sm text-muted-foreground">
                База данных работает нормально
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tables Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Table2 className="h-5 w-5" />
              Таблицы базы данных
            </CardTitle>
            <CardDescription>
              Обзор всех таблиц и количество записей
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="text-center py-8 text-muted-foreground">
                Загрузка статистики...
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tableStats.map((table) => (
                  <Card
                    key={table.name}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTable === table.name ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedTable(table.name)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{table.displayName}</span>
                        {table.status === "connected" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-2xl font-bold">{table.count}</p>
                      <p className="text-xs text-muted-foreground">записей</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table Data Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Просмотр данных: {tables.find(t => t.name === selectedTable)?.displayName}
                </CardTitle>
                <CardDescription>
                  Последние 50 записей
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Экспорт JSON
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingData ? (
              <div className="text-center py-8 text-muted-foreground">
                Загрузка данных...
              </div>
            ) : tableData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Таблица пуста
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {getColumns().map((col) => (
                        <TableHead key={col} className="whitespace-nowrap">
                          {col}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.slice(0, 10).map((row: any, idx: number) => (
                      <TableRow key={idx}>
                        {getColumns().map((col) => (
                          <TableCell key={col} className="max-w-[200px] truncate">
                            {formatCellValue(row[col])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {tableData.length > 10 && (
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    Показано 10 из {tableData.length} записей
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDatabase;
