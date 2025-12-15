import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSiteSettings = (settlement: "zapovednoe" | "kolosok") => {
  return useQuery({
    queryKey: ["site-settings", settlement],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("settlement", settlement)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

export const useAllSiteSettings = () => {
  return useQuery({
    queryKey: ["site-settings-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};