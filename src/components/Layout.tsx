import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Menu, X, MapPin } from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: ReactNode;
  settlement: "zapovednoe" | "kolosok";
}

export const Layout = ({ children, settlement }: LayoutProps) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const settlementData = {
    zapovednoe: {
      name: "ДПК Заповедное",
      description: "Премиум коттеджный поселок в экологически чистом районе",
      color: "primary",
    },
    kolosok: {
      name: "ДПК Колосок",
      description: "Уютный семейный поселок с развитой инфраструктурой",
      color: "accent",
    },
  };

  const currentSettlement = settlementData[settlement];
  const otherSettlement = settlement === "zapovednoe" ? "kolosok" : "zapovednoe";

  const navItems = [
    { path: `/${settlement}`, label: "Главная" },
    { path: `/${settlement}/plots`, label: "Участки" },
    { path: `/${settlement}/about`, label: "О поселке" },
    { path: `/${settlement}/infrastructure`, label: "Инфраструктура" },
    { path: `/${settlement}/gallery`, label: "Галерея" },
    { path: `/${settlement}/news`, label: "Новости" },
    { path: `/${settlement}/contacts`, label: "Контакты" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b shadow-soft">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="tel:+79000000000" className="flex items-center gap-2 hover:text-primary transition-smooth">
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">+7 (900) 000-00-00</span>
              </a>
              <a href="mailto:info@dpk-zapovednoe.ru" className="flex items-center gap-2 hover:text-primary transition-smooth">
                <Mail className="w-4 h-4" />
                <span className="hidden md:inline">info@dpk-zapovednoe.ru</span>
              </a>
            </div>
            
            {/* Settlement Switcher */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs sm:text-sm"
            >
              <Link to={`/${otherSettlement}`}>
                <MapPin className="w-4 h-4 mr-2" />
                {settlementData[otherSettlement].name}
              </Link>
            </Button>
          </div>

          {/* Main Navigation */}
          <div className="flex items-center justify-between py-4">
            <Link to={`/${settlement}`} className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold text-primary">
                {currentSettlement.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                {currentSettlement.description}
              </p>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-smooth hover:text-primary ${
                    location.pathname === item.path
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Button size="sm" asChild>
                <a href="tel:+79000000000">Позвонить</a>
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
          <nav className="lg:hidden border-t bg-card">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium py-2 transition-smooth hover:text-primary ${
                    location.pathname === item.path
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Button size="sm" className="w-full" asChild>
                <a href="tel:+79000000000">Позвонить</a>
              </Button>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">{currentSettlement.name}</h3>
              <p className="text-sm opacity-90">{currentSettlement.description}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Навигация</h4>
              <ul className="space-y-2 text-sm">
                {navItems.slice(0, 4).map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="opacity-90 hover:opacity-100 transition-smooth"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li>+7 (900) 000-00-00</li>
                <li>info@dpk-zapovednoe.ru</li>
                <li>Московская область</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm opacity-75">
            <p>&copy; {new Date().getFullYear()} {currentSettlement.name}. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
