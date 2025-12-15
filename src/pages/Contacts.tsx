import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContactsProps {
  settlement: "zapovednoe" | "kolosok";
}

const Contacts = ({ settlement }: ContactsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('support_requests').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        settlement: settlement,
      });

      if (error) throw error;

      toast.success("Ваше сообщение отправлено! Мы свяжемся с вами в ближайшее время.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      toast.error("Ошибка отправки сообщения. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactCards = settings ? [
    {
      icon: Phone,
      title: "Телефон",
      content: settings.contact_phone || "",
      href: settings.contact_phone ? `tel:${settings.contact_phone.replace(/[^\d+]/g, '')}` : undefined,
      description: "Звоните в рабочее время",
    },
    {
      icon: Mail,
      title: "Email",
      content: settings.contact_email || "",
      href: settings.contact_email ? `mailto:${settings.contact_email}` : undefined,
      description: "Ответим в течение 24 часов",
    },
    {
      icon: MessageCircle,
      title: "Telegram",
      content: settings.telegram || "",
      href: settings.telegram ? `https://t.me/${settings.telegram.replace('@', '')}` : undefined,
      description: "Быстрые ответы на вопросы",
    },
    {
      icon: Clock,
      title: "Время работы",
      content: settings.working_hours_weekdays || "",
      description: settings.working_hours_weekends ? `Выходные: ${settings.working_hours_weekends}` : "",
    },
  ] : [];

  return (
    <Layout settlement={settlement}>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-muted to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Свяжитесь с нами
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Мы всегда рады ответить на ваши вопросы и помочь с выбором 
              идеального дома в {settlement === "zapovednoe" ? "Заповедном" : "Колоске"}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-6">
                  <div className="flex flex-col items-center text-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-2xl" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactCards.map((card, index) => (
                <Card 
                  key={index} 
                  className="p-6 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <card.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{card.title}</h3>
                      {card.href && card.content ? (
                        <a 
                          href={card.href} 
                          className="text-primary hover:underline font-medium"
                          target={card.href.startsWith('http') ? '_blank' : undefined}
                          rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                          {card.content}
                        </a>
                      ) : (
                        <p className="font-medium">{card.content || "—"}</p>
                      )}
                      {card.description && (
                        <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Address and Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Address Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">Контактная информация</h2>
                
                {isLoading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-6">
                        <div className="flex items-start gap-4">
                          <Skeleton className="w-12 h-12 rounded-xl" />
                          <div className="flex-1">
                            <Skeleton className="h-6 w-24 mb-2" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : settings && (
                  <>
                    <Card className="p-6 mb-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-2">Адрес</h3>
                          <p className="text-muted-foreground">{settings.address || "—"}</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 mb-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Phone className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-2">Телефон</h3>
                          {settings.contact_phone ? (
                            <a 
                              href={`tel:${settings.contact_phone.replace(/[^\d+]/g, '')}`}
                              className="text-primary hover:underline"
                            >
                              {settings.contact_phone}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-2">Email</h3>
                          {settings.contact_email ? (
                            <a 
                              href={`mailto:${settings.contact_email}`}
                              className="text-primary hover:underline"
                            >
                              {settings.contact_email}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="p-8 shadow-elegant">
                <h2 className="text-2xl font-bold mb-2">Напишите нам</h2>
                <p className="text-muted-foreground mb-8">
                  Заполните форму, и мы свяжемся с вами в ближайшее время
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ваше имя *</label>
                      <Input 
                        placeholder="Иван Иванов"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Телефон</label>
                      <Input 
                        placeholder="+7 (999) 123-45-67"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-12"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <Input 
                      type="email" 
                      placeholder="example@mail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Тема обращения *</label>
                    <Input 
                      placeholder="Вопрос о покупке дома"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Сообщение *</label>
                    <Textarea 
                      placeholder="Опишите ваш вопрос или пожелания..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      className="resize-none"
                    />
                  </div>
                  <Button 
                    type="submit"
                    size="lg" 
                    className="w-full h-14 text-lg shadow-elegant"
                    disabled={isSubmitting}
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {isSubmitting ? "Отправка..." : "Отправить сообщение"}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contacts;