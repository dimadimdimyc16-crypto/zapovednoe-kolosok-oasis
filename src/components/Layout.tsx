import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Mail, 
  Menu, 
  X, 
  MapPin, 
  ChevronDown,
  Home,
  FileText,
  User,
  LogOut
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface LayoutProps {
  children: ReactNode;
  settlement: "zapovednoe" | "kolosok";
}

export const Layout = ({ children, settlement }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(`/${settlement}`);
  };

  const settlementData = {
    zapovednoe: {
      name: "ДПК Заповедное",
      shortName: "Заповедное",
      description: "Премиум коттеджный поселок в экологически чистом районе",
      phone: "+7 (900) 000-00-00",
      email: "info@dpk-zapovednoe.ru",
    },
    kolosok: {
      name: "ДПК Колосок",
      shortName: "Колосок",
      description: "Уютный семейный поселок с развитой инфраструктурой",
      phone: "+7 (900) 111-11-11",
      email: "info@dpk-kolosok.ru",
    },
  };

  const currentSettlement = settlementData[settlement];
  const otherSettlement = settlement === "zapovednoe" ? "kolosok" : "zapovednoe";

  const navItems = [
    { path: `/${settlement}`, label: "Главная", icon: Home },
    { path: `/${settlement}/plots`, label: "Участки" },
    { path: `/${settlement}/about`, label: "О поселке" },
    { path: `/${settlement}/infrastructure`, label: "Инфраструктура" },
    { path: `/${settlement}/gallery`, label: "Галерея" },
    { path: `/${settlement}/documents`, label: "Документы", icon: FileText },
    { path: `/${settlement}/news`, label: "Новости" },
    { path: `/${settlement}/contacts`, label: "Контакты" },
  ];

  const switchSettlement = (newSettlement: string) => {
    const currentPath = location.pathname;
    const pathParts = currentPath.split('/').filter(Boolean);
    
    if (pathParts.length > 1) {
      const subPath = pathParts.slice(1).join('/');
      navigate(`/${newSettlement}/${subPath}`);
    } else {
      navigate(`/${newSettlement}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Contact Bar */}
      <div className="bg-primary text-primary-foreground py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 md:gap-6">
              <a 
                href={`tel:${currentSettlement.phone}`} 
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">{currentSettlement.phone}</span>
              </a>
              <a 
                href={`mailto:${currentSettlement.email}`} 
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Mail className="w-4 h-4" />
                <span className="hidden md:inline">{currentSettlement.email}</span>
              </a>
            </div>
            
            {/* Settlement Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-foreground hover:bg-primary-dark/50 gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{currentSettlement.shortName}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => switchSettlement("zapovednoe")}
                  className={settlement === "zapovednoe" ? "bg-primary/10" : ""}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  ДПК Заповедное
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => switchSettlement("kolosok")}
                  className={settlement === "kolosok" ? "bg-primary/10" : ""}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  ДПК Колосок
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-card border-b shadow-soft">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to={`/${settlement}`} className="flex flex-col group">
              <h1 className="text-xl sm:text-2xl font-bold text-primary group-hover:text-primary-dark transition-colors">
                {currentSettlement.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                {currentSettlement.description}
              </p>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all hover:bg-primary/10 hover:text-primary ${
                    location.pathname === item.path
                      ? "text-primary bg-primary/5"
                      : "text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* User Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="w-4 h-4" />
                      <span className="max-w-24 truncate">
                        {user.email?.split('@')[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/${settlement}/admin`)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Админ-панель
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/${settlement}/auth`}>
                    <User className="w-4 h-4 mr-2" />
                    Войти
                  </Link>
                </Button>
              )}
              <Button size="sm" asChild className="shadow-soft">
                <a href={`tel:${currentSettlement.phone}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  Позвонить
                </a>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Меню"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t bg-card animate-fade-in">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium py-3 px-4 rounded-md transition-all ${
                    location.pathname === item.path
                      ? "text-primary bg-primary/5"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="border-t mt-2 pt-3 space-y-2">
                {user ? (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={() => {
                        navigate(`/${settlement}/admin`);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Админ-панель
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-destructive" 
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Выйти
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    asChild
                  >
                    <Link to={`/${settlement}/auth`} onClick={() => setMobileMenuOpen(false)}>
                      <User className="w-4 h-4 mr-2" />
                      Войти
                    </Link>
                  </Button>
                )}
                <Button className="w-full" asChild>
                  <a href={`tel:${currentSettlement.phone}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Позвонить
                  </a>
                </Button>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-foreground text-background mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <h3 className="text-xl font-bold mb-4">{currentSettlement.name}</h3>
              <p className="text-sm opacity-80 mb-4">{currentSettlement.description}</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-transparent border-background/30 text-background hover:bg-background/10"
                  onClick={() => switchSettlement("zapovednoe")}
                >
                  Заповедное
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-transparent border-background/30 text-background hover:bg-background/10"
                  onClick={() => switchSettlement("kolosok")}
                >
                  Колосок
                </Button>
              </div>
            </div>
            
            {/* Navigation */}
            <div>
              <h4 className="font-semibold mb-4">Навигация</h4>
              <ul className="space-y-2 text-sm">
                {navItems.slice(0, 5).map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="opacity-80 hover:opacity-100 transition-opacity"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* More Links */}
            <div>
              <h4 className="font-semibold mb-4">Информация</h4>
              <ul className="space-y-2 text-sm">
                {navItems.slice(5).map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="opacity-80 hover:opacity-100 transition-opacity"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to={`/${settlement}/auth`}
                    className="opacity-80 hover:opacity-100 transition-opacity"
                  >
                    Личный кабинет
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Contacts */}
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 opacity-80">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${currentSettlement.phone}`} className="hover:opacity-100">
                    {currentSettlement.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2 opacity-80">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${currentSettlement.email}`} className="hover:opacity-100">
                    {currentSettlement.email}
                  </a>
                </li>
                <li className="flex items-start gap-2 opacity-80">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Московская область, Серпуховский район</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-background/20 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm opacity-60">
            <p>&copy; {new Date().getFullYear()} {currentSettlement.name}. Все права защищены.</p>
            <p>Сайт разработан с ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
