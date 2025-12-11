import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { FileText, Lock, Download, ExternalLink, FolderOpen, Shield, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface DocumentsProps {
  settlement: "zapovednoe" | "kolosok";
}

const settlementInfo = {
  zapovednoe: {
    name: "Заповедное",
    publicDocs: [
      { 
        title: "Устав ДПК «Заповедное»", 
        type: "PDF", 
        size: "1.2 MB",
        description: "Основной учредительный документ поселка",
        category: "Уставные документы"
      },
      { 
        title: "Правила внутреннего распорядка", 
        type: "PDF", 
        size: "850 KB",
        description: "Правила проживания и поведения на территории",
        category: "Правила"
      },
      { 
        title: "Генеральный план поселка", 
        type: "PDF", 
        size: "3.5 MB",
        description: "Схема расположения участков и инфраструктуры",
        category: "Планы"
      },
      { 
        title: "Тарифы на обслуживание 2024", 
        type: "PDF", 
        size: "420 KB",
        description: "Актуальные тарифы на услуги ЖКХ",
        category: "Тарифы"
      },
    ],
    privateDocs: [
      "Протоколы общих собраний",
      "Финансовые отчеты",
      "Договоры с подрядчиками",
      "Техническая документация",
    ],
  },
  kolosok: {
    name: "Колосок",
    publicDocs: [
      { 
        title: "Устав ДПК «Колосок»", 
        type: "PDF", 
        size: "980 KB",
        description: "Основной учредительный документ поселка",
        category: "Уставные документы"
      },
      { 
        title: "Правила проживания в поселке", 
        type: "PDF", 
        size: "720 KB",
        description: "Правила для жителей поселка Колосок",
        category: "Правила"
      },
      { 
        title: "План территории поселка", 
        type: "PDF", 
        size: "2.8 MB",
        description: "Схема участков и общих территорий",
        category: "Планы"
      },
      { 
        title: "Расценки на услуги 2024", 
        type: "PDF", 
        size: "380 KB",
        description: "Стоимость обслуживания и коммунальных услуг",
        category: "Тарифы"
      },
    ],
    privateDocs: [
      "Решения правления",
      "Бухгалтерская отчетность",
      "Контракты с поставщиками",
      "Акты выполненных работ",
    ],
  },
};

const Documents = ({ settlement }: DocumentsProps) => {
  const [user, setUser] = useState<any>(null);
  const info = settlementInfo[settlement];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const { data: dbDocuments } = useQuery({
    queryKey: ['documents', settlement],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('settlement', settlement)
        .eq('is_public', true);
      if (error) throw error;
      return data;
    }
  });

  const groupedDocs = info.publicDocs.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, typeof info.publicDocs>);

  return (
    <Layout settlement={settlement}>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-muted to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-6">
              <FileText className="w-4 h-4" />
              Документация
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Документы поселка {info.name}
            </h1>
            <p className="text-xl text-muted-foreground">
              Уставные, нормативные и информационные документы для жителей и покупателей
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Public Documents by Category */}
            {Object.entries(groupedDocs).map(([category, docs]) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-6">
                  <FolderOpen className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">{category}</h2>
                </div>
                <div className="grid gap-4">
                  {docs.map((doc, index) => (
                    <Card 
                      key={index} 
                      className="p-5 hover:shadow-elegant transition-all duration-300 hover:-translate-y-0.5 group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-destructive" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {doc.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">{doc.description}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                {doc.type}
                              </span>
                              <span className="text-xs text-muted-foreground">{doc.size}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Открыть
                          </Button>
                          <Button size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Скачать
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {/* Documents from DB */}
            {dbDocuments && dbDocuments.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <FileCheck className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Дополнительные документы</h2>
                </div>
                <div className="grid gap-4">
                  {dbDocuments.map((doc) => (
                    <Card 
                      key={doc.id} 
                      className="p-5 hover:shadow-elegant transition-all duration-300"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{doc.title}</h3>
                            {doc.category && (
                              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                {doc.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button size="sm" asChild>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            Скачать
                          </a>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Private Documents Section */}
            <Card className="p-8 bg-muted/50 border-dashed">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Lock className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Документы для жителей</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Доступ к внутренним документам поселка предоставляется только 
                  зарегистрированным жителям {info.name}
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-8 w-full max-w-md">
                  {info.privateDocs.map((doc, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-3 rounded-lg bg-background"
                    >
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{doc}</span>
                    </div>
                  ))}
                </div>

                {user ? (
                  <p className="text-sm text-muted-foreground">
                    Для доступа к приватным документам обратитесь к администрации поселка
                  </p>
                ) : (
                  <Button size="lg" asChild>
                    <Link to={`/${settlement}/auth`}>
                      <Lock className="w-4 h-4 mr-2" />
                      Войти для доступа
                    </Link>
                  </Button>
                )}
              </div>
            </Card>

          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Documents;
