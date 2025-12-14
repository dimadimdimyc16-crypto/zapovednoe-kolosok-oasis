import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Home,
  FileText,
  Newspaper,
  Settings,
  Users,
  MessageSquare,
  Calendar,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Building,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { 
    icon: LayoutDashboard, 
    label: "Дашборд", 
    href: "/admin" 
  },
  {
    icon: Building,
    label: "Недвижимость",
    children: [
      { label: "Дома", href: "/admin/houses" },
      { label: "Участки", href: "/admin/plots" },
    ],
  },
  {
    icon: Newspaper,
    label: "Контент",
    children: [
      { label: "Новости", href: "/admin/news" },
      { label: "Страницы", href: "/admin/pages" },
      { label: "Главная страница", href: "/admin/homepage" },
    ],
  },
  { 
    icon: Calendar, 
    label: "Заявки на просмотр", 
    href: "/admin/viewings" 
  },
  { 
    icon: MessageSquare, 
    label: "Обращения", 
    href: "/admin/support" 
  },
  { 
    icon: Users, 
    label: "Пользователи", 
    href: "/admin/users" 
  },
  {
    icon: Settings,
    label: "Система",
    children: [
      { label: "Настройки", href: "/admin/settings" },
      { label: "База данных", href: "/admin/database" },
    ],
  },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/zapovednoe/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const hasAccess = roles?.some(r => 
      r.role === "admin" || 
      r.role === "chairman_zapovednoe" || 
      r.role === "chairman_kolosok"
    );

    if (!hasAccess) {
      toast.error("У вас нет доступа к админ-панели");
      navigate("/");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    setUserProfile(profile);
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => 
      prev.includes(label) 
        ? prev.filter(m => m !== label) 
        : [...prev, label]
    );
  };

  const isActive = (href: string) => location.pathname === href;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-card border-r transition-all duration-300 flex flex-col",
          isSidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {isSidebarOpen && (
            <Link to="/admin" className="font-bold text-lg text-primary">
              Админ-панель
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                {item.children ? (
                  <Collapsible
                    open={openMenus.includes(item.label)}
                    onOpenChange={() => toggleMenu(item.label)}
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          openMenus.includes(item.label) && "bg-accent/50"
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {isSidebarOpen && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            <ChevronDown className={cn(
                              "h-4 w-4 transition-transform",
                              openMenus.includes(item.label) && "rotate-180"
                            )} />
                          </>
                        )}
                      </button>
                    </CollapsibleTrigger>
                    {isSidebarOpen && (
                      <CollapsibleContent className="pl-10 space-y-1 mt-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            to={child.href}
                            className={cn(
                              "block px-3 py-2 rounded-lg text-sm transition-colors",
                              "hover:bg-accent hover:text-accent-foreground",
                              isActive(child.href) && "bg-primary text-primary-foreground"
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                ) : (
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive(item.href) && "bg-primary text-primary-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {isSidebarOpen && <span>{item.label}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          {isSidebarOpen && userProfile && (
            <div className="mb-3 text-sm">
              <p className="font-medium truncate">{userProfile.full_name}</p>
              <p className="text-muted-foreground truncate text-xs">{userProfile.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size={isSidebarOpen ? "default" : "icon"}
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="ml-2">Выйти</span>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300",
          isSidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
