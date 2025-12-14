import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Settings, Globe, Mail, Phone, MapPin, Save, Loader2, Link2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";

const settingsSchema = z.object({
  siteName: z.string().min(2, "Название должно содержать минимум 2 символа"),
  siteDescription: z.string().min(5, "Описание должно содержать минимум 5 символов"),
  contactEmail: z.string().email("Некорректный email"),
  contactPhone: z.string().min(5, "Некорректный номер телефона"),
  address: z.string().min(5, "Укажите адрес"),
  workingHours: z.string().min(5, "Укажите часы работы"),
});

const STORAGE_KEY = "admin_site_settings";

export const AdminSettings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState({
    siteName: "Заповедное & Колосок",
    siteDescription: "Премиальная загородная недвижимость",
    contactEmail: "info@zapovednoe.ru",
    contactPhone: "+7 (495) 123-45-67",
    address: "Московская область",
    workingHours: "Пн-Пт: 9:00-18:00, Сб: 10:00-16:00",
    vkLink: "",
    telegramLink: "",
    whatsappLink: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const validateForm = () => {
    const result = settingsSchema.safeParse(settings);
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

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Проверьте правильность заполнения полей");
      return;
    }

    setIsSaving(true);
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    toast.success("Настройки сохранены");
    setIsSaving(false);
  };

  const updateField = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Настройки
          </h1>
          <p className="text-muted-foreground mt-1">
            Общие настройки сайта
          </p>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Основные настройки
            </CardTitle>
            <CardDescription>
              Название и описание сайта
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Название сайта *</Label>
                <Input
                  value={settings.siteName}
                  onChange={(e) => updateField("siteName", e.target.value)}
                  className={errors.siteName ? "border-destructive" : ""}
                />
                {errors.siteName && <p className="text-xs text-destructive">{errors.siteName}</p>}
              </div>
              <div className="space-y-2">
                <Label>Описание сайта *</Label>
                <Input
                  value={settings.siteDescription}
                  onChange={(e) => updateField("siteDescription", e.target.value)}
                  className={errors.siteDescription ? "border-destructive" : ""}
                />
                {errors.siteDescription && <p className="text-xs text-destructive">{errors.siteDescription}</p>}
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
              Контактные данные для связи
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
                  value={settings.contactEmail}
                  onChange={(e) => updateField("contactEmail", e.target.value)}
                  className={errors.contactEmail ? "border-destructive" : ""}
                />
                {errors.contactEmail && <p className="text-xs text-destructive">{errors.contactEmail}</p>}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Телефон *
                </Label>
                <Input
                  value={settings.contactPhone}
                  onChange={(e) => updateField("contactPhone", e.target.value)}
                  className={errors.contactPhone ? "border-destructive" : ""}
                />
                {errors.contactPhone && <p className="text-xs text-destructive">{errors.contactPhone}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Адрес *
                </Label>
                <Input
                  value={settings.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className={errors.address ? "border-destructive" : ""}
                />
                {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
              </div>
              <div className="space-y-2">
                <Label>Часы работы *</Label>
                <Input
                  value={settings.workingHours}
                  onChange={(e) => updateField("workingHours", e.target.value)}
                  className={errors.workingHours ? "border-destructive" : ""}
                />
                {errors.workingHours && <p className="text-xs text-destructive">{errors.workingHours}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Социальные сети
            </CardTitle>
            <CardDescription>
              Ссылки на социальные сети
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>ВКонтакте</Label>
                <Input
                  value={settings.vkLink}
                  onChange={(e) => updateField("vkLink", e.target.value)}
                  placeholder="https://vk.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>Telegram</Label>
                <Input
                  value={settings.telegramLink}
                  onChange={(e) => updateField("telegramLink", e.target.value)}
                  placeholder="https://t.me/..."
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  value={settings.whatsappLink}
                  onChange={(e) => updateField("whatsappLink", e.target.value)}
                  placeholder="https://wa.me/..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Сохранить настройки
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
