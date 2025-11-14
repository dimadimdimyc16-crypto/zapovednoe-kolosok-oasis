import { Layout } from "@/components/Layout";

interface AboutProps {
  settlement: "zapovednoe" | "kolosok";
}

const About = ({ settlement }: AboutProps) => {
  const content = {
    zapovednoe: {
      title: "О поселке Заповедное",
      description: "Премиум коттеджный поселок в живописном районе Подмосковья",
      history: "Поселок основан в 2015 году и с тех пор активно развивается. На сегодняшний день уже построено более 50 домов, создана вся необходимая инфраструктура.",
    },
    kolosok: {
      title: "О поселке Колосок",
      description: "Уютный семейный поселок с дружелюбной атмосферой",
      history: "ДПК Колосок существует с 2010 года. Это сплоченное сообщество жителей, которые ценят комфорт и близость к природе.",
    },
  };

  const current = content[settlement];

  return (
    <Layout settlement={settlement}>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">{current.title}</h1>
        <p className="text-xl text-muted-foreground mb-8">{current.description}</p>
        
        <div className="prose max-w-none">
          <h2 className="text-2xl font-semibold mb-4">История</h2>
          <p className="text-lg mb-8">{current.history}</p>
          
          <h2 className="text-2xl font-semibold mb-4">Управление поселком</h2>
          <p className="text-lg mb-8">
            Поселком управляет правление, избранное общим собранием жителей.
            Председатель правления координирует все вопросы, связанные с благоустройством
            и развитием территории.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default About;
