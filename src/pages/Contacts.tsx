import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
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

  return (
    <Layout settlement={settlement}>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Контакты
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Свяжитесь с нами любым удобным способом
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 hover:shadow-elegant transition-smooth">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Телефон</h3>
                <a href="tel:+79000000000" className="text-muted-foreground hover:text-primary transition-colors">
                  +7 (900) 000-00-00
                </a>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-elegant transition-smooth">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Email</h3>
                <a href="mailto:info@zapovednoe.ru" className="text-muted-foreground hover:text-primary transition-colors">
                  info@zapovednoe.ru
                </a>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-elegant transition-smooth">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Адрес</h3>
                <p className="text-muted-foreground text-sm">
                  {settlement === "zapovednoe" 
                    ? "Московская область, Серпуховский район, ДПК Заповедное"
                    : "Московская область, Серпуховский район, ДПК Колосок"
                  }
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-elegant transition-smooth">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Время работы</h3>
                <p className="text-muted-foreground text-sm">
                  Пн-Пт: 9:00 - 18:00<br />
                  Сб-Вс: 10:00 - 16:00
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-8 shadow-elegant">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-2 text-center">Форма обратной связи</h2>
            <p className="text-muted-foreground text-center mb-8">
              Заполните форму, и мы свяжемся с вами в ближайшее время
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ваше имя *</label>
                  <Input 
                    placeholder="Иван Иванов"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Телефон</label>
                  <Input 
                    placeholder="+7 (999) 123-45-67"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Тема обращения *</label>
                <Input 
                  placeholder="Вопрос о покупке участка"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Сообщение *</label>
                <Textarea 
                  placeholder="Ваше сообщение..."
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>
              <Button 
                type="submit"
                size="lg" 
                className="w-full shadow-elegant"
                disabled={isSubmitting}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Отправка..." : "Отправить сообщение"}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Contacts;
