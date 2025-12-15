import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Globe, Mail, Phone, MapPin, Save, Loader2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const settingsSchema = z.object({
  site_name: z.string().min(2, "Название должно содержать минимум 2 символа"),
  site_description: z.string().optional(),
  contact_email: z.string().email("Некорректный email"),
  contact_phone: z.string().min(5, "Некорректный номер телефона"),
  address: z.string().min(5, "Укажите адрес"),
  working_hours_weekdays: z.string().min(3, "Укажите часы работы"),
  working_hours_weekends: z.string().optional(),
});

export const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [settlement, setSettlement] = useState<"zapovednoe" | "kolosok">("zapovednoe");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    site_name: "",
    site_description: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    working_hours_weekdays: "",
    working_hours_weekends: "",
    telegram: "",
    whatsapp: "",
    vk_link: "",
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings", settlement],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("settlement", settlement)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        site_name: settings.site_name || "",
        site_description: settings.site_description || "",
        contact_email: settings.contact_email || "",
        contact_phone: settings.contact_phone || "",
        address: settings.address || "",
        working_hours_weekdays: settings.working_hours_weekdays || "",
        working_hours_weekends: settings.working_hours_weekends || "",
        telegram: settings.telegram || "",
        whatsapp: settings.whatsapp || "",
        vk_link: settings.vk_link || "",
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (settings?.id) {
        const { error } = await supabase
          .from("site_settings")
          .update(data)
          .eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert({ ...data, settlement });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Настройки сохранены");
    },
    onError: (error) => {
      toast.error("Ошибка: " + error.message);
    },
  });

  const validateForm = () => {
    const result = settingsSchema.safeParse(formData);
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

  const handleSave = () => {
    if (!validateForm()) {
      toast.error("Проверьте правильность заполнения полей");
      return;
    }
    updateMutation.mutate(formData);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Настройки сайта
            </h1>
            <p className="text-muted-foreground mt-1">
              Контактная информация и общие настройки
            </p>
          </div>
        </div>

        {/* Settlement Tabs */}
        <Tabs value={settlement} onValueChange={(v) => setSettlement(v as "zapovednoe" | "kolosok")}>
          <TabsList>
            <TabsTrigger value="zapovednoe">Заповедное</TabsTrigger>
            <TabsTrigger value="kolosok">Колосок</TabsTrigger>
          </TabsList>

          {["zapovednoe", "kolosok"].map((s) => (
            <TabsContent key={s} value={s} className="space-y-6">
              {isLoading ? (
                <Card className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                </Card>
              ) : (
                <>
                  {/* General Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Основные настройки
                      </CardTitle>
                      <CardDescription>
                        Название и описание поселка
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Название *</Label>
                          <Input
                            value={formData.site_name}
                            onChange={(e) => updateField("site_name", e.target.value)}
                            className={errors.site_name ? "border-destructive" : ""}
                          />
                          {errors.site_name && <p className="text-xs text-destructive">{errors.site_name}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>Описание</Label>
                          <Input
                            value={formData.site_description}
                            onChange={(e) => updateField("site_description", e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Контактная информация
                      </CardTitle>
                      <CardDescription>
                        Эти данные отображаются на странице "Контакты"
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email *
                          </Label>
                          <Input
                            type="email"
                            value={formData.contact_email}
                            onChange={(e) => updateField("contact_email", e.target.value)}
                            className={errors.contact_email ? "border-destructive" : ""}
                          />
                          {errors.contact_email && <p className="text-xs text-destructive">{errors.contact_email}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Телефон *
                          </Label>
                          <Input
                            value={formData.contact_phone}
                            onChange={(e) => updateField("contact_phone", e.target.value)}
                            className={errors.contact_phone ? "border-destructive" : ""}
                          />
                          {errors.contact_phone && <p className="text-xs text-destructive">{errors.contact_phone}</p>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Адрес *
                        </Label>
                        <Input
                          value={formData.address}
                          onChange={(e) => updateField("address", e.target.value)}
                          className={errors.address ? "border-destructive" : ""}
                        />
                        {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Часы работы (будни) *</Label>
                          <Input
                            value={formData.working_hours_weekdays}
                            onChange={(e) => updateField("working_hours_weekdays", e.target.value)}
                            placeholder="9:00 - 19:00"
                            className={errors.working_hours_weekdays ? "border-destructive" : ""}
                          />
                          {errors.working_hours_weekdays && <p className="text-xs text-destructive">{errors.working_hours_weekdays}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>Часы работы (выходные)</Label>
                          <Input
                            value={formData.working_hours_weekends}
                            onChange={(e) => updateField("working_hours_weekends", e.target.value)}
                            placeholder="10:00 - 17:00"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Social Links */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5" />
                        Мессенджеры и соцсети
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Telegram</Label>
                          <Input
                            value={formData.telegram}
                            onChange={(e) => updateField("telegram", e.target.value)}
                            placeholder="@username"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>WhatsApp</Label>
                          <Input
                            value={formData.whatsapp}
                            onChange={(e) => updateField("whatsapp", e.target.value)}
                            placeholder="+7 (999) 123-45-67"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>ВКонтакте</Label>
                          <Input
                            value={formData.vk_link}
                            onChange={(e) => updateField("vk_link", e.target.value)}
                            placeholder="https://vk.com/..."
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <Button onClick={handleSave} size="lg" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Сохранить настройки
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;