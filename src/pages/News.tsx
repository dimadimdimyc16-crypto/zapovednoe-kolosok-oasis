import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface NewsProps {
  settlement: "zapovednoe" | "kolosok";
}

const News = ({ settlement }: NewsProps) => {
  const news = [
    {
      title: "Новая детская площадка открыта",
      excerpt: "На территории поселка установлена современная детская площадка",
      date: "15 марта 2024",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800",
    },
    {
      title: "Общее собрание жителей",
      excerpt: "Приглашаем всех жителей на ежегодное общее собрание",
      date: "10 марта 2024",
      image: "https://images.unsplash.com/photo-1464146072230-91cabc968266?q=80&w=800",
    },
  ];

  return (
    <Layout settlement={settlement}>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Новости и объявления</h1>
          <p className="text-lg text-muted-foreground">
            Актуальная информация о жизни поселка
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {news.map((item, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-medium transition-smooth">
              <div className="md:flex">
                <div className="md:w-1/3 h-48 md:h-auto">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 md:w-2/3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{item.date}</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-3">{item.title}</h2>
                  <p className="text-muted-foreground">{item.excerpt}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default News;
