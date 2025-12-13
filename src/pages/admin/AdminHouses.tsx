import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Building } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type House = Database["public"]["Tables"]["houses"]["Row"];

export const AdminHouses = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
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

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("houses").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-houses"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-houses"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-houses"] });
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
    });
    setEditingHouse(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (house: House) => {
    setEditingHouse(house);
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
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
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
      short_description: formData.short_description,
      full_description: formData.full_description,
      has_garage: formData.has_garage,
      garage_spaces: parseInt(formData.garage_spaces),
    };

    if (editingHouse) {
      updateMutation.mutate({ id: editingHouse.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredHouses = houses.filter((house) =>
    house.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
  };

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    available: { label: "В продаже", variant: "default" },
    reserved: { label: "Забронирован", variant: "secondary" },
    sold: { label: "Продан", variant: "destructive" },
  };

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
              Всего объектов: {houses.length}
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
                    />
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
                    />
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Площадь участка (м²) *</Label>
                    <Input
                      type="number"
                      value={formData.land_area_sqm}
                      onChange={(e) => setFormData({ ...formData, land_area_sqm: e.target.value })}
                      placeholder="1000"
                    />
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

                <div className="flex gap-4 pt-4">
                  <Button onClick={handleSubmit} className="flex-1">
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

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell colSpan={7} className="text-center py-8">
                      Загрузка...
                    </TableCell>
                  </TableRow>
                ) : filteredHouses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Дома не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHouses.map((house) => (
                    <TableRow key={house.id}>
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Удалить этот дом?")) {
                                deleteMutation.mutate(house.id);
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

export default AdminHouses;
