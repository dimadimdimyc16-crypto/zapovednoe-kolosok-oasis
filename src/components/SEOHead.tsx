import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  pageSlug?: string; // If provided, will fetch SEO from database
}

export const SEOHead = ({ 
  title: propTitle, 
  description: propDescription, 
  keywords: propKeywords,
  image = "https://lovable.dev/opengraph-image-p98pqg.png",
  url,
  pageSlug
}: SEOHeadProps) => {
  // Fetch SEO settings from database if pageSlug is provided
  const { data: pageSettings } = useQuery({
    queryKey: ["page-settings", pageSlug],
    queryFn: async () => {
      if (!pageSlug) return null;
      const { data, error } = await supabase
        .from("page_settings")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!pageSlug,
  });

  // Use database values if available, otherwise use props
  const title = pageSettings?.title || propTitle || "Заповедное & Колосок";
  const description = pageSettings?.meta_description || propDescription || "";
  const keywords = pageSettings?.meta_keywords || propKeywords;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? "property" : "name";
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute("content", content);
    };

    if (description) {
      updateMetaTag("description", description);
    }
    if (keywords) {
      updateMetaTag("keywords", keywords);
    }
    
    // Open Graph
    updateMetaTag("og:title", title, true);
    if (description) {
      updateMetaTag("og:description", description, true);
    }
    updateMetaTag("og:image", image, true);
    if (url) {
      updateMetaTag("og:url", url, true);
    }
    
    // Twitter
    updateMetaTag("twitter:title", title);
    if (description) {
      updateMetaTag("twitter:description", description);
    }
    updateMetaTag("twitter:image", image);

    return () => {
      // Cleanup not needed as we're just updating existing tags
    };
  }, [title, description, keywords, image, url]);

  return null;
};

// Hook to use page SEO settings
export const usePageSEO = (pageSlug: string) => {
  return useQuery({
    queryKey: ["page-settings", pageSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_settings")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
};