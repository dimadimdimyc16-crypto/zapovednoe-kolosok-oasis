import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, FileText, Eye, EyeOff } from "lucide-react";

export const AdminPages = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [formData, setFormData] = useState({
    page_slug: "",
    title: "",
    meta_description: "",
    meta_keywords: "",
    is_published: true,
  });

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_settings")
        .select("*")
        .order("page_slug", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("page_settings").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      toast.success("Страница добавлена");
      resetForm();
    },
    onError: (error) => {
      toast.error("Ошибка: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("page_settings")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      toast.success("Страница обновлена");
      resetForm();
    },
    onError: (error) => {
      toast.error("Ошибка: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("page_settings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      toast.success("Страница удалена");
    },
  });

  const resetForm = () => {
    setFormData({
      page_slug: "",
      title: "",
      meta_description: "",
      meta_keywords: "",
      is_published: true,
    });
    setEditingPage(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (page: any) => {
    setEditingPage(page);
    setFormData({
      page_slug: page.page_slug,
      title: page.title,
      meta_description: page.meta_description || "",
      meta_keywords: page.meta_keywords || "",
      is_published: page.is_published,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.page_slug.trim() || !formData.title.trim()) {
      toast.error("Заполните обязательные поля");
      return;
    }

    const data = {
      page_slug: formData.page_slug,
      title: formData.title,
      meta_description: formData.meta_description || null,
      meta_keywords: formData.meta_keywords || null,
      is_published: formData.is_published,
    };

    if (editingPage) {
      updateMutation.mutate({ id: editingPage.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8" />
              SEO и настройки страниц
            </h1>
            <p className="text-muted-foreground mt-1">
              Управление мета-данными страниц
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить страницу
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingPage ? "Редактирование страницы" : "Добавление страницы"}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Slug (URL) *</Label>
                  <Input
                    value={formData.page_slug}
                    onChange={(e) => setFormData({ ...formData, page_slug: e.target.value })}
                    placeholder="/about"
                  />
                  <p className="text-xs text-muted-foreground">
                    Например: /about, /contacts, /zapovednoe
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Title (заголовок) *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Заголовок страницы для SEO"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    placeholder="Описание страницы для поисковиков (до 160 символов)"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.meta_description.length}/160 символов
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Meta Keywords</Label>
                  <Input
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                    placeholder="ключевые, слова, через, запятую"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, is_published: checked })
                    }
                  />
                  <Label>Опубликована</Label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={handleSubmit} className="flex-1">
                    {editingPage ? "Сохранить" : "Добавить"}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Отмена
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Загрузка...
                    </TableCell>
                  </TableRow>
                ) : pages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Страницы не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  pages.map((page: any) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-mono text-sm">
                        {page.page_slug}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {page.title}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                        {page.meta_description || "—"}
                      </TableCell>
                      <TableCell>
                        {page.is_published ? (
                          <Badge variant="default" className="gap-1">
                            <Eye className="h-3 w-3" />
                            Опубл.
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <EyeOff className="h-3 w-3" />
                            Скрыта
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(page)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Удалить эту страницу?")) {
                                deleteMutation.mutate(page.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPages;
