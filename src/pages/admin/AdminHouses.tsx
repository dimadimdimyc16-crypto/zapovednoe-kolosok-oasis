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
import { Plus, Pencil, Trash2, Search, Building, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";
import { MultipleImageUpload } from "@/components/admin/ImageUpload";

type House = Database["public"]["Tables"]["houses"]["Row"];

const houseSchema = z.object({
  title: z.string().min(3, "Название должно содержать минимум 3 символа"),
  settlement: z.enum(["zapovednoe", "kolosok"]),
  price_rub: z.string().min(1, "Укажите цену").refine(val => !isNaN(Number(val)) && Number(val) > 0, "Цена должна быть положительным числом"),
  house_area_sqm: z.string().min(1, "Укажите площадь дома").refine(val => !isNaN(Number(val)) && Number(val) > 0, "Площадь должна быть положительным числом"),
  land_area_sqm: z.string().min(1, "Укажите площадь участка").refine(val => !isNaN(Number(val)) && Number(val) > 0, "Площадь должна быть положительным числом"),
  rooms: z.string(),
  floors: z.string(),
  house_class: z.string(),
  status: z.enum(["available", "reserved", "sold"]),
  short_description: z.string(),
  full_description: z.string(),
});

export const AdminHouses = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: "",
    settlement: "zapovednoe" as "zapovednoe" | "kolosok",
    price_rub: "",
    house_area_sqm: "",
    land_area_sqm: "",
    rooms: "4",
    floors: "2",
    house_class: "premium",
    status: "available" as "available" | "reserved" | "sold",
    short_description: "",
    full_description: "",
    has_garage: false,
    garage_spaces: "0",
    images: [] as string[],
  });

  const { data: houses = [], isLoading } = useQuery({
    queryKey: ["admin-houses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("houses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-houses"] });
    queryClient.invalidateQueries({ queryKey: ["admin-houses-count"] });
    queryClient.invalidateQueries({ queryKey: ["admin-table-stats"] });
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("houses").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success("Дом успешно добавлен");
      resetForm();
    },
    onError: (error) => {
      toast.error("Ошибка при добавлении: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("houses")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success("Дом успешно обновлен");
      resetForm();
    },
    onError: (error) => {
      toast.error("Ошибка при обновлении: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("houses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success("Дом удален");
    },
    onError: (error) => {
      toast.error("Ошибка при удалении: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      settlement: "zapovednoe",
      price_rub: "",
      house_area_sqm: "",
      land_area_sqm: "",
      rooms: "4",
      floors: "2",
      house_class: "premium",
      status: "available",
      short_description: "",
      full_description: "",
      has_garage: false,
      garage_spaces: "0",
      images: [],
    });
    setEditingHouse(null);
    setIsDialogOpen(false);
    setErrors({});
  };

  const handleEdit = (house: House) => {
    setEditingHouse(house);
    const images = house.images as string[] || [];
    setFormData({
      title: house.title,
      settlement: house.settlement,
      price_rub: house.price_rub.toString(),
      house_area_sqm: house.house_area_sqm.toString(),
      land_area_sqm: house.land_area_sqm.toString(),
      rooms: house.rooms.toString(),
      floors: house.floors.toString(),
      house_class: house.house_class,
      status: house.status,
      short_description: house.short_description || "",
      full_description: house.full_description || "",
      has_garage: house.has_garage || false,
      garage_spaces: (house.garage_spaces || 0).toString(),
      images: images,
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const validateForm = () => {
    const result = houseSchema.safeParse(formData);
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
      title: formData.title,
      settlement: formData.settlement,
      price_rub: parseFloat(formData.price_rub),
      house_area_sqm: parseFloat(formData.house_area_sqm),
      land_area_sqm: parseFloat(formData.land_area_sqm),
      rooms: parseInt(formData.rooms),
      floors: parseInt(formData.floors),
      house_class: formData.house_class,
      status: formData.status,
      short_description: formData.short_description || null,
      full_description: formData.full_description || null,
      has_garage: formData.has_garage,
      garage_spaces: parseInt(formData.garage_spaces),
      images: formData.images,
    };

    if (editingHouse) {
      updateMutation.mutate({ id: editingHouse.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredHouses = houses.filter((house) => {
    const matchesSearch = house.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || house.status === statusFilter;
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
              <Building className="h-8 w-8" />
              Управление домами
            </h1>
            <p className="text-muted-foreground mt-1">
              Всего объектов: {houses.length} | 
              В продаже: {houses.filter(h => h.status === 'available').length} | 
              Продано: {houses.filter(h => h.status === 'sold').length}
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить дом
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingHouse ? "Редактирование дома" : "Добавление дома"}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Название *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Название дома"
                      className={errors.title ? "border-destructive" : ""}
                    />
                    {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
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
                      placeholder="10000000"
                      className={errors.price_rub ? "border-destructive" : ""}
                    />
                    {errors.price_rub && <p className="text-xs text-destructive">{errors.price_rub}</p>}
                  </div>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Площадь дома (м²) *</Label>
                    <Input
                      type="number"
                      value={formData.house_area_sqm}
                      onChange={(e) => setFormData({ ...formData, house_area_sqm: e.target.value })}
                      placeholder="200"
                      className={errors.house_area_sqm ? "border-destructive" : ""}
                    />
                    {errors.house_area_sqm && <p className="text-xs text-destructive">{errors.house_area_sqm}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Площадь участка (м²) *</Label>
                    <Input
                      type="number"
                      value={formData.land_area_sqm}
                      onChange={(e) => setFormData({ ...formData, land_area_sqm: e.target.value })}
                      placeholder="1000"
                      className={errors.land_area_sqm ? "border-destructive" : ""}
                    />
                    {errors.land_area_sqm && <p className="text-xs text-destructive">{errors.land_area_sqm}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Комнаты</Label>
                    <Input
                      type="number"
                      value={formData.rooms}
                      onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Этажей</Label>
                    <Input
                      type="number"
                      value={formData.floors}
                      onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Класс</Label>
                    <Select
                      value={formData.house_class}
                      onValueChange={(v) => setFormData({ ...formData, house_class: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comfort">Комфорт</SelectItem>
                        <SelectItem value="business">Бизнес</SelectItem>
                        <SelectItem value="premium">Премиум</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Краткое описание</Label>
                  <Textarea
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    placeholder="Краткое описание дома..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Полное описание</Label>
                  <Textarea
                    value={formData.full_description}
                    onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                    placeholder="Подробное описание дома..."
                    rows={5}
                  />
                </div>

                <MultipleImageUpload
                  value={formData.images}
                  onChange={(images) => setFormData({ ...formData, images })}
                  label="Фотографии дома"
                  folder="houses"
                  maxImages={15}
                />

                <div className="flex gap-4 pt-4">
                  <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingHouse ? "Сохранить" : "Добавить"}
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
                  placeholder="Поиск по названию..."
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
                  <TableHead>Название</TableHead>
                  <TableHead>Поселок</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Площадь</TableHead>
                  <TableHead>Класс</TableHead>
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
                ) : filteredHouses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Дома не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHouses.map((house) => {
                    const images = house.images as string[] || [];
                    return (
                    <TableRow key={house.id}>
                      <TableCell>
                        {images.length > 0 ? (
                          <img 
                            src={images[0]} 
                            alt={house.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <Building className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{house.title}</TableCell>
                      <TableCell>
                        {house.settlement === "zapovednoe" ? "Заповедное" : "Колосок"}
                      </TableCell>
                      <TableCell>{formatPrice(house.price_rub)}</TableCell>
                      <TableCell>{house.house_area_sqm} м²</TableCell>
                      <TableCell className="capitalize">{house.house_class}</TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[house.status]?.variant || "default"}>
                          {statusConfig[house.status]?.label || house.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(house)}
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
                                <AlertDialogTitle>Удалить дом?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Это действие нельзя отменить. Дом "{house.title}" будет удален навсегда.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(house.id)}
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

export default AdminHouses;
