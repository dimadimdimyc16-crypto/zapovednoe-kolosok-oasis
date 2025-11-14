import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface DocumentsProps {
  settlement: "zapovednoe" | "kolosok";
}

const Documents = ({ settlement }: DocumentsProps) => {
  // Демо-данные
  const publicDocs = [
    { title: "Устав ДПК", type: "PDF" },
    { title: "Правила внутреннего распорядка", type: "PDF" },
  ];

  return (
    <Layout settlement={settlement}>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Документы</h1>
          <p className="text-lg text-muted-foreground">
            Уставные и нормативные документы поселка
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Публичные документы</h2>
            <div className="space-y-3">
              {publicDocs.map((doc, index) => (
                <Card key={index} className="p-4 hover:shadow-soft transition-smooth">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-sm text-muted-foreground">{doc.type}</p>
                      </div>
                    </div>
                    <Button size="sm">Скачать</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card className="p-8 text-center bg-muted">
            <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Документы для жителей</h3>
            <p className="text-muted-foreground mb-4">
              Доступ к внутренним документам поселка предоставляется только зарегистрированным жителям
            </p>
            <Button asChild>
              <Link to="/auth">Войти</Link>
            </Button>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Documents;
