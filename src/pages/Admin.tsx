import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AdminProps {
  settlement: "zapovednoe" | "kolosok";
}

const Admin = ({ settlement }: AdminProps) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate(`/${settlement}/auth`);
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAccess = roles?.some(r => 
      r.role === 'admin' || 
      r.role === `chairman_${settlement}`
    );

    if (!hasAccess) {
      navigate(`/${settlement}`);
      return;
    }

    // Redirect to main admin dashboard
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
        <p className="text-muted-foreground">Проверка доступа...</p>
      </div>
    </div>
  );
};

export default Admin;