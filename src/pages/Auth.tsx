import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary mb-4">
            <Home className="w-5 h-5" />
            <span className="font-semibold">На главную</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Вход в систему</h1>
          <p className="text-muted-foreground">Доступ для жителей и администрации</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Вход</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" type="password" />
            </div>
            <Button className="w-full" disabled={isLoading}>
              {isLoading ? "Вход..." : "Войти"}
            </Button>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Полное имя</Label>
              <Input id="name" placeholder="Иван Иванов" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input id="reg-email" type="email" placeholder="your@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Пароль</Label>
              <Input id="reg-password" type="password" />
            </div>
            <Button className="w-full" disabled={isLoading}>
              {isLoading ? "Регистрация..." : "Зарегистрироваться"}
            </Button>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Регистрируясь, вы соглашаетесь с обработкой персональных данных
        </p>
      </Card>
    </div>
  );
};

export default Auth;
