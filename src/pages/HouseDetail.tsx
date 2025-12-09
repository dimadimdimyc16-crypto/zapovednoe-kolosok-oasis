import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  MapPin, Ruler, BedDouble, Layers, Phone, Mail, Heart, 
  ChevronLeft, ChevronRight, X, Check, Calendar, Clock,
  Share2, Sparkles, Eye, MessageSquare, ArrowLeft
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface HouseDetailProps {
  settlement: "zapovednoe" | "kolosok";
}

const statusLabels = {
  available: { label: "В продаже", variant: "default" as const, color: "text-green-600" },
  reserved: { label: "Забронирован", variant: "secondary" as const, color: "text-amber-600" },
  sold: { label: "Продан", variant: "destructive" as const, color: "text-red-600" },
};

const classLabels = {
  comfort: { label: "Комфорт класс", color: "bg-blue-500" },
  business: { label: "Бизнес класс", color: "bg-amber-500" },
  premium: { label: "Премиум класс", color: "bg-purple-500" },
};

const HouseDetail = ({ settlement }: HouseDetailProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showViewingForm, setShowViewingForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const [contactForm, setContactForm] = useState({
    name: "", phone: "", email: "", message: ""
  });
  const [viewingForm, setViewingForm] = useState({
    name: "", phone: "", email: "", preferred_date: "", preferred_time: "", message: ""
  });

  const { data: house, isLoading } = useQuery({
    queryKey: ['house', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('houses')
        .select('*')
        .eq('id', id)
        .eq('settlement', settlement)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (house) checkFavoriteStatus();
  }, [house?.id]);

  const checkFavoriteStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !house) return;

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('house_id', house.id)
      .maybeSingle();

    setIsFavorite(!!data);
  };

  const toggleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Войдите в аккаунт, чтобы добавить в избранное");
      navigate(`/${settlement}/auth`);
      return;
    }

    if (!house) return;

    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('house_id', house.id);
      setIsFavorite(false);
      toast.success("Удалено из избранного");
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, house_id: house.id });
      setIsFavorite(true);
      toast.success("Добавлено в избранное");
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('support_requests').insert({
        name: contactForm.name,
        phone: contactForm.phone,
        email: contactForm.email,
        subject: `Запрос по объекту: ${house?.title}`,
        message: contactForm.message,
        settlement,
      });
      toast.success("Заявка отправлена! Мы свяжемся с вами в ближайшее время.");
      setShowContactForm(false);
      setContactForm({ name: "", phone: "", email: "", message: "" });
    } catch {
      toast.error("Ошибка при отправке заявки");
    }
  };

  const handleViewingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('viewing_requests').insert({
        house_id: house?.id,
        settlement,
        name: viewingForm.name,
        phone: viewingForm.phone,
        email: viewingForm.email,
        preferred_date: viewingForm.preferred_date || null,
        preferred_time: viewingForm.preferred_time || null,
        message: viewingForm.message,
      });
      toast.success("Заявка на просмотр отправлена! Менеджер свяжется с вами для подтверждения.");
      setShowViewingForm(false);
      setViewingForm({ name: "", phone: "", email: "", preferred_date: "", preferred_time: "", message: "" });
    } catch {
      toast.error("Ошибка при отправке заявки");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  if (isLoading) {
    return (
      <Layout settlement={settlement}>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4" />
            <div className="h-96 bg-muted rounded mb-6" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!house) {
    return (
      <Layout settlement={settlement}>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Объект не найден</h1>
          <p className="text-muted-foreground mb-6">Возможно, он был удалён или никогда не существовал</p>
          <Button onClick={() => navigate(`/${settlement}/houses`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к каталогу
          </Button>
        </div>
      </Layout>
    );
  }

  const images = (house.images as string[]) || [];
  const features = (house.features as string[]) || [];
  const advantages = (house.advantages as string[]) || [];
  const houseClass = house.house_class as keyof typeof classLabels;

  return (
    <Layout settlement={settlement}>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Назад к каталогу
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="space-y-4">
              <div 
                className="relative h-[500px] rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() => setShowGallery(true)}
              >
                <img
                  src={images[selectedImageIndex] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200"}
                  alt={house.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur rounded-full p-4">
                    <Eye className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {images.length || 1}
                </div>
              </div>
              
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden transition-all ${
                        idx === selectedImageIndex ? "ring-2 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Фото ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Status */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant={statusLabels[house.status as keyof typeof statusLabels]?.variant}>
                  {statusLabels[house.status as keyof typeof statusLabels]?.label}
                </Badge>
                {classLabels[houseClass] && (
                  <Badge className={`${classLabels[houseClass].color} text-white`}>
                    <Sparkles className="w-3 h-3 mr-1" />
                    {classLabels[houseClass].label}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{house.title}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                ДПК {settlement === "zapovednoe" ? "Заповедное" : "Колосок"}, Московская область
              </p>
            </div>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Описание</h2>
              <div className="prose prose-lg max-w-none text-muted-foreground whitespace-pre-line">
                {house.full_description || house.short_description}
              </div>
            </Card>

            {/* Features */}
            {features.length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Оснащение дома</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Advantages */}
            {advantages.length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Преимущества</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {advantages.map((advantage, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="font-medium">{advantage}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 space-y-6">
              {/* Price */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Стоимость</p>
                <p className="text-3xl font-bold text-primary">{formatPrice(house.price_rub)}</p>
              </div>

              <Separator />

              {/* Characteristics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <Ruler className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Дом</p>
                  <p className="font-bold text-lg">{house.house_area_sqm} м²</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Участок</p>
                  <p className="font-bold text-lg">{house.land_area_sqm} м²</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <BedDouble className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Комнат</p>
                  <p className="font-bold text-lg">{house.rooms}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <Layers className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Этажей</p>
                  <p className="font-bold text-lg">{house.floors}</p>
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-3">
                {house.status === "available" && (
                  <>
                    <Button className="w-full" size="lg" onClick={() => setShowViewingForm(true)}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Записаться на просмотр
                    </Button>
                    <Button variant="outline" className="w-full" size="lg" onClick={() => setShowContactForm(true)}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Связаться с менеджером
                    </Button>
                  </>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className={`flex-1 ${isFavorite ? "text-red-500 border-red-500" : ""}`}
                    onClick={toggleFavorite}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                    {isFavorite ? "В избранном" : "В избранное"}
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                <Button variant="secondary" className="w-full" size="lg" asChild>
                  <a href="tel:+79000000000">
                    <Phone className="w-4 h-4 mr-2" />
                    Позвонить
                  </a>
                </Button>
              </div>

              <Separator />

              {/* Contact Info */}
              <div className="text-sm space-y-2">
                <p className="font-semibold">Отдел продаж</p>
                <a href="tel:+79000000000" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                  <Phone className="w-4 h-4" /> +7 (900) 000-00-00
                </a>
                <a href="mailto:sales@dpk-zapovednoe.ru" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                  <Mail className="w-4 h-4" /> sales@dpk-zapovednoe.ru
                </a>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" /> Ежедневно 9:00 — 21:00
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Full Gallery Modal */}
      <Dialog open={showGallery} onOpenChange={setShowGallery}>
        <DialogContent className="max-w-6xl p-0 bg-black/95">
          <div className="relative h-[80vh]">
            <img
              src={images[selectedImageIndex] || ""}
              alt={`Фото ${selectedImageIndex + 1}`}
              className="w-full h-full object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setShowGallery(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={() => setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={() => setSelectedImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Form Modal */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Связаться с менеджером</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Имя *</label>
              <Input required value={contactForm.name} onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Ваше имя" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Телефон *</label>
              <Input required type="tel" value={contactForm.phone} onChange={e => setContactForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="+7 (___) ___-__-__" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email *</label>
              <Input required type="email" value={contactForm.email} onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))} placeholder="email@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Сообщение</label>
              <Textarea value={contactForm.message} onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))} placeholder="Ваш вопрос..." rows={4} />
            </div>
            <Button type="submit" className="w-full">Отправить заявку</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Viewing Form Modal */}
      <Dialog open={showViewingForm} onOpenChange={setShowViewingForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Записаться на просмотр</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleViewingSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Имя *</label>
              <Input required value={viewingForm.name} onChange={e => setViewingForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Ваше имя" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Телефон *</label>
              <Input required type="tel" value={viewingForm.phone} onChange={e => setViewingForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="+7 (___) ___-__-__" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email *</label>
              <Input required type="email" value={viewingForm.email} onChange={e => setViewingForm(prev => ({ ...prev, email: e.target.value }))} placeholder="email@example.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Желаемая дата</label>
                <Input type="date" value={viewingForm.preferred_date} onChange={e => setViewingForm(prev => ({ ...prev, preferred_date: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Время</label>
                <Input type="time" value={viewingForm.preferred_time} onChange={e => setViewingForm(prev => ({ ...prev, preferred_time: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Комментарий</label>
              <Textarea value={viewingForm.message} onChange={e => setViewingForm(prev => ({ ...prev, message: e.target.value }))} placeholder="Дополнительные пожелания..." rows={3} />
            </div>
            <Button type="submit" className="w-full">Записаться на просмотр</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default HouseDetail;