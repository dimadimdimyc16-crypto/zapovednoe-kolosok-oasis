import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, MapPin, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";
import { MultipleImageUpload } from "@/components/admin/ImageUpload";

type Plot = Database["public"]["Tables"]["plots"]["Row"];

const plotSchema = z.object({
  plot_number: z.string().min(1, "Укажите номер участка"),
  settlement: z.enum(["zapovednoe", "kolosok"]),
  price_rub: z.string().min(1, "Укажите цену").refine(val => !isNaN(Number(val)) && Number(val) > 0, "Цена должна быть положительным числом"),
  area_sqm: z.string().min(1, "Укажите площадь").refine(val => !isNaN(Number(val)) && Number(val) > 0, "Площадь должна быть положительным числом"),
  status: z.enum(["available", "reserved", "sold"]),
});

export const AdminPlots = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    plot_number: "",
    settlement: "zapovednoe" as "zapovednoe" | "kolosok",
    price_rub: "",
    area_sqm: "",
    status: "available" as "available" | "reserved" | "sold",
    cadastral_number: "",
    description: "",
    images: [] as string[],
  });

  const { data: plots = [], isLoading } = useQuery({
    queryKey: ["admin-plots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plots")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-plots"] });
    queryClient.invalidateQueries({ queryKey: ["admin-plots-count"] });
    queryClient.invalidateQueries({ queryKey: ["admin-table-stats"] });
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("plots").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success("Участок успешно добавлен");
      resetForm();
    },
    onError: (error) => {
      toast.error("Ошибка при добавлении: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("plots")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success("Участок успешно обновлен");
      resetForm();
    },
    onError: (error) => {
      toast.error("Ошибка при обновлении: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("plots").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success("Участок удален");
    },
    onError: (error) => {
      toast.error("Ошибка при удалении: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      plot_number: "",
      settlement: "zapovednoe",
      price_rub: "",
      area_sqm: "",
      status: "available",
      cadastral_number: "",
      description: "",
      images: [],
    });
    setEditingPlot(null);
    setIsDialogOpen(false);
    setErrors({});
  };

  const handleEdit = (plot: Plot) => {
    setEditingPlot(plot);
    const images = plot.images as string[] || [];
    setFormData({
      plot_number: plot.plot_number,
      settlement: plot.settlement,
      price_rub: plot.price_rub.toString(),
      area_sqm: plot.area_sqm.toString(),
      status: plot.status,
      cadastral_number: plot.cadastral_number || "",
      description: plot.description || "",
      images: images,
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const validateForm = () => {
    const result = plotSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error("Проверьте правильность заполнения полей");
      return;
    }

    const data = {
      plot_number: formData.plot_number,
      settlement: formData.settlement,
      price_rub: parseFloat(formData.price_rub),
      area_sqm: parseFloat(formData.area_sqm),
      status: formData.status,
      cadastral_number: formData.cadastral_number || null,
      description: formData.description || null,
      images: formData.images,
    };

    if (editingPlot) {
      updateMutation.mutate({ id: editingPlot.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredPlots = plots.filter((plot) => {
    const matchesSearch = plot.plot_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || plot.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
  };

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    available: { label: "В продаже", variant: "default" },
    reserved: { label: "Забронирован", variant: "secondary" },
    sold: { label: "Продан", variant: "destructive" },
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MapPin className="h-8 w-8" />
              Управление участками
            </h1>
            <p className="text-muted-foreground mt-1">
              Всего участков: {plots.length} | 
              В продаже: {plots.filter(p => p.status === 'available').length} | 
              Продано: {plots.filter(p => p.status === 'sold').length}
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить участок
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingPlot ? "Редактирование участка" : "Добавление участка"}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Номер участка *</Label>
                    <Input
                      value={formData.plot_number}
                      onChange={(e) => setFormData({ ...formData, plot_number: e.target.value })}
                      placeholder="А-15"
                      className={errors.plot_number ? "border-destructive" : ""}
                    />
                    {errors.plot_number && <p className="text-xs text-destructive">{errors.plot_number}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Поселок *</Label>
                    <Select
                      value={formData.settlement}
                      onValueChange={(v: "zapovednoe" | "kolosok") => 
                        setFormData({ ...formData, settlement: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zapovednoe">Заповедное</SelectItem>
                        <SelectItem value="kolosok">Колосок</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Цена (₽) *</Label>
                    <Input
                      type="number"
                      value={formData.price_rub}
                      onChange={(e) => setFormData({ ...formData, price_rub: e.target.value })}
                      placeholder="1500000"
                      className={errors.price_rub ? "border-destructive" : ""}
                    />
                    {errors.price_rub && <p className="text-xs text-destructive">{errors.price_rub}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Площадь (м²) *</Label>
                    <Input
                      type="number"
                      value={formData.area_sqm}
                      onChange={(e) => setFormData({ ...formData, area_sqm: e.target.value })}
                      placeholder="1000"
                      className={errors.area_sqm ? "border-destructive" : ""}
                    />
                    {errors.area_sqm && <p className="text-xs text-destructive">{errors.area_sqm}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Статус</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v: "available" | "reserved" | "sold") => 
                        setFormData({ ...formData, status: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">В продаже</SelectItem>
                        <SelectItem value="reserved">Забронирован</SelectItem>
                        <SelectItem value="sold">Продан</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Кадастровый номер</Label>
                    <Input
                      value={formData.cadastral_number}
                      onChange={(e) => setFormData({ ...formData, cadastral_number: e.target.value })}
                      placeholder="50:00:0000000:0000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Описание участка..."
                    rows={3}
                  />
                </div>

                <MultipleImageUpload
                  value={formData.images}
                  onChange={(images) => setFormData({ ...formData, images })}
                  label="Фотографии участка"
                  folder="plots"
                  maxImages={10}
                />

                <div className="flex gap-4 pt-4">
                  <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingPlot ? "Сохранить" : "Добавить"}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Отмена
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по номеру участка..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="available">В продаже</SelectItem>
                  <SelectItem value="reserved">Забронирован</SelectItem>
                  <SelectItem value="sold">Продан</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Фото</TableHead>
                  <TableHead>Номер</TableHead>
                  <TableHead>Поселок</TableHead>
                  <TableHead>Площадь</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Кадастр</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredPlots.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Участки не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlots.map((plot) => {
                    const images = plot.images as string[] || [];
                    return (
                    <TableRow key={plot.id}>
                      <TableCell>
                        {images.length > 0 ? (
                          <img 
                            src={images[0]} 
                            alt={`Участок ${plot.plot_number}`}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{plot.plot_number}</TableCell>
                      <TableCell>
                        {plot.settlement === "zapovednoe" ? "Заповедное" : "Колосок"}
                      </TableCell>
                      <TableCell>{plot.area_sqm} м²</TableCell>
                      <TableCell>{formatPrice(plot.price_rub)}</TableCell>
                      <TableCell className="text-xs">
                        {plot.cadastral_number || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[plot.status]?.variant || "default"}>
                          {statusConfig[plot.status]?.label || plot.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(plot)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить участок?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Это действие нельзя отменить. Участок №{plot.plot_number} будет удален навсегда.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(plot.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Удалить
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  )})
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPlots;
