import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ContactsProps {
  settlement: "zapovednoe" | "kolosok";
}

const Contacts = ({ settlement }: ContactsProps) => {
  return (
    <Layout settlement={settlement}>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Контакты</h1>
          <p className="text-lg text-muted-foreground">
            Свяжитесь с нами удобным способом
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Телефон</h3>
                  <p className="text-muted-foreground">+7 (900) 000-00-00</p>
                  <p className="text-sm text-muted-foreground mt-1">Ежедневно с 9:00 до 20:00</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-muted-foreground">info@dpk-zapovednoe.ru</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Адрес</h3>
                  <p className="text-muted-foreground">
                    Московская область<br />
                    {settlement === "zapovednoe" ? "ДПК Заповедное" : "ДПК Колосок"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Режим работы офиса</h3>
                  <p className="text-muted-foreground">
                    Пн-Пт: 9:00 - 18:00<br />
                    Сб-Вс: 10:00 - 16:00
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Форма обратной связи</h2>
            <form className="space-y-4">
              <div>
                <Input placeholder="Ваше имя" />
              </div>
              <div>
                <Input type="tel" placeholder="Телефон" />
              </div>
              <div>
                <Input type="email" placeholder="Email" />
              </div>
              <div>
                <Textarea placeholder="Ваше сообщение" rows={5} />
              </div>
              <Button type="submit" className="w-full">
                Отправить
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Contacts;
