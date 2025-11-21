import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Ruler, 
  Tag, 
  Phone, 
  FileText, 
  Image as ImageIcon,
  Check,
  ArrowLeft,
  Mail,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface PlotDetailProps {
  settlement: "zapovednoe" | "kolosok";
}

const PlotDetail = ({ settlement }: PlotDetailProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });

  const { data: plot, isLoading } = useQuery({
    queryKey: ['plot', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plots')
        .select('*')
        .eq('id', id)
        .eq('settlement', settlement)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const statusLabels = {
    available: { label: "Доступен", variant: "default" as const, color: "text-green-600" },
    reserved: { label: "Забронирован", variant: "secondary" as const, color: "text-yellow-600" },
    sold: { label: "Продан", variant: "destructive" as const, color: "text-red-600" },
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('support_requests')
        .insert({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          subject: `Бронирование участка №${plot?.plot_number}`,
          message: formData.message || `Интересует участок №${plot?.plot_number}`,
          settlement: settlement,
          status: 'new'
        });

      if (error) throw error;

      toast.success("Заявка отправлена! Мы свяжемся с вами в ближайшее время.");
      setShowContactForm(false);
      setFormData({ name: "", phone: "", email: "", message: "" });
    } catch (error) {
      console.error('Error submitting contact:', error);
      toast.error("Ошибка при отправке заявки. Попробуйте позже.");
    }
  };

  if (isLoading) {
    return (
      <Layout settlement={settlement}>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Загрузка информации об участке...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!plot) {
    return (
      <Layout settlement={settlement}>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Участок не найден</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться назад
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const images = (plot.images as string[]) || [];
  const advantages = (plot.advantages as string[]) || [];
  const documents = (plot.documents as Array<{name: string, url: string}>) || [];

  return (
    <Layout settlement={settlement}>
      <div className="container mx-auto px-4 py-8">
        {/* Навигация назад */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Вернуться к списку участков
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Заголовок и статус */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    Участок №{plot.plot_number}
                  </h1>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    ДПК {settlement === "zapovednoe" ? "Заповедное" : "Колосок"}
                  </p>
                </div>
                <Badge 
                  variant={statusLabels[plot.status as keyof typeof statusLabels].variant}
                  className="text-lg px-4 py-2"
                >
                  {statusLabels[plot.status as keyof typeof statusLabels].label}
                </Badge>
              </div>

              {plot.cadastral_number && (
                <p className="text-sm text-muted-foreground">
                  Кадастровый номер: {plot.cadastral_number}
                </p>
              )}
            </div>

            {/* Галерея */}
            <Card className="overflow-hidden">
              <div className="relative h-96">
                <img
                  src={images[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200"}
                  alt={`Участок ${plot.plot_number}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setSelectedImage(images[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200")}
                />
              </div>
              {images.length > 1 && (
                <div className="p-4 bg-card">
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(1, 5).map((img, idx) => (
                      <div 
                        key={idx}
                        className="relative h-24 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedImage(img)}
                      >
                        <img
                          src={img}
                          alt={`Фото ${idx + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Описание */}
            {plot.description && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Описание</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {plot.description}
                </p>
              </Card>
            )}

            {/* Преимущества */}
            {advantages.length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Преимущества участка</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {advantages.map((advantage, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{advantage}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Карта */}
            {plot.latitude && plot.longitude && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Расположение на карте</h2>
                <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Координаты: {plot.latitude}, {plot.longitude}
                  </p>
                </div>
              </Card>
            )}

            {/* Документы */}
            {documents.length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Документы
                </h2>
                <div className="space-y-2">
                  {documents.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm">{doc.name}</span>
                    </a>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Боковая панель */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4 space-y-6">
              {/* Цена */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Стоимость</p>
                <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {Number(plot.price_rub).toLocaleString("ru-RU")} ₽
                </p>
              </div>

              <Separator />

              {/* Характеристики */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Характеристики</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Ruler className="w-4 h-4 text-primary" />
                    <span className="text-sm">Площадь</span>
                  </div>
                  <span className="font-semibold">{plot.area_sqm} м²</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="w-4 h-4 text-primary" />
                    <span className="text-sm">Статус</span>
                  </div>
                  <span className={`font-semibold ${statusLabels[plot.status as keyof typeof statusLabels].color}`}>
                    {statusLabels[plot.status as keyof typeof statusLabels].label}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm">Поселок</span>
                  </div>
                  <span className="font-semibold">
                    {settlement === "zapovednoe" ? "Заповедное" : "Колосок"}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Кнопки действий */}
              <div className="space-y-3">
                {plot.status === "available" && (
                  <>
                    <Button 
                      className="w-full shadow-elegant" 
                      size="lg"
                      onClick={() => setShowContactForm(true)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Забронировать
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="lg"
                      asChild
                    >
                      <a href="tel:+79000000000" className="flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4" />
                        Позвонить
                      </a>
                    </Button>
                  </>
                )}
                
                {plot.status === "reserved" && (
                  <Button 
                    variant="secondary" 
                    className="w-full" 
                    size="lg"
                    disabled
                  >
                    Участок забронирован
                  </Button>
                )}
                
                {plot.status === "sold" && (
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    size="lg"
                    disabled
                  >
                    Участок продан
                  </Button>
                )}
              </div>

              <Separator />

              {/* Контактная информация */}
              <div className="space-y-2">
                <p className="text-sm font-semibold">Есть вопросы?</p>
                <p className="text-sm text-muted-foreground">
                  Свяжитесь с нами для получения дополнительной информации
                </p>
                <div className="space-y-1">
                  <a 
                    href="tel:+79000000000"
                    className="text-sm text-primary hover:underline flex items-center gap-2"
                  >
                    <Phone className="w-3 h-3" />
                    +7 (900) 000-00-00
                  </a>
                  <a 
                    href="mailto:info@example.com"
                    className="text-sm text-primary hover:underline flex items-center gap-2"
                  >
                    <Mail className="w-3 h-3" />
                    info@example.com
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Модальное окно с увеличенным изображением */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          <img
            src={selectedImage || ""}
            alt="Увеличенное фото"
            className="w-full h-auto"
          />
        </DialogContent>
      </Dialog>

      {/* Форма связи */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Забронировать участок</h2>
              <p className="text-muted-foreground">
                Оставьте заявку и мы свяжемся с вами в ближайшее время
              </p>
            </div>
            
            <form onSubmit={handleSubmitContact} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Имя *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ваше имя"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Телефон *</label>
                <Input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+7 (___) ___-__-__"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Email *</label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Сообщение</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Дополнительная информация или вопросы..."
                  rows={4}
                />
              </div>
              
              <Button type="submit" className="w-full" size="lg">
                Отправить заявку
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default PlotDetail;