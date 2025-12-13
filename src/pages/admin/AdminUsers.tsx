import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Search, Users, Shield, Plus, Trash2 } from "lucide-react";

const roleLabels: Record<string, string> = {
  admin: "Администратор",
  chairman_zapovednoe: "Председатель (Заповедное)",
  chairman_kolosok: "Председатель (Колосок)",
  resident_zapovednoe: "Житель (Заповедное)",
  resident_kolosok: "Житель (Колосок)",
};

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-800",
  chairman_zapovednoe: "bg-purple-100 text-purple-800",
  chairman_kolosok: "bg-blue-100 text-blue-800",
  resident_zapovednoe: "bg-green-100 text-green-800",
  resident_kolosok: "bg-teal-100 text-teal-800",
};

export const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState("");

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("user_roles").insert([{
        user_id: userId,
        role: role as "admin" | "chairman_zapovednoe" | "chairman_kolosok" | "resident_zapovednoe" | "resident_kolosok",
        assigned_by: user?.id,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("Роль добавлена");
      setIsDialogOpen(false);
      setNewRole("");
    },
    onError: (error) => {
      toast.error("Ошибка: " + error.message);
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("Роль удалена");
    },
    onError: (error) => {
      toast.error("Ошибка: " + error.message);
    },
  });

  const getUserRoles = (userId: string) => {
    return userRoles.filter((r) => r.user_id === userId);
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRole = () => {
    if (!selectedUser || !newRole) return;
    addRoleMutation.mutate({ userId: selectedUser.id, role: newRole });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Пользователи
          </h1>
          <p className="text-muted-foreground mt-1">
            Всего пользователей: {profiles.length}
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени или email..."
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
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Контакты</TableHead>
                  <TableHead>Роли</TableHead>
                  <TableHead>Дата регистрации</TableHead>
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
                ) : filteredProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Пользователи не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfiles.map((profile) => {
                    const roles = getUserRoles(profile.id);
                    return (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">
                          {profile.full_name}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{profile.email}</p>
                            {profile.phone && (
                              <p className="text-muted-foreground">{profile.phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {roles.length === 0 ? (
                              <span className="text-muted-foreground text-sm">Нет ролей</span>
                            ) : (
                              roles.map((role) => (
                                <Badge
                                  key={role.id}
                                  variant="secondary"
                                  className={`${roleColors[role.role] || ""} flex items-center gap-1`}
                                >
                                  {roleLabels[role.role] || role.role}
                                  <button
                                    onClick={() => {
                                      if (confirm("Удалить эту роль?")) {
                                        removeRoleMutation.mutate(role.id);
                                      }
                                    }}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(profile.created_at).toLocaleDateString("ru-RU")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(profile);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Shield className="h-4 w-4 mr-1" />
                            Роль
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add Role Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Добавить роль для {selectedUser?.full_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Выберите роль</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите роль..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddRole} disabled={!newRole} className="flex-1">
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
