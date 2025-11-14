import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Zapovednoe from "./pages/Zapovednoe";
import Kolosok from "./pages/Kolosok";
import Plots from "./pages/Plots";
import About from "./pages/About";
import Infrastructure from "./pages/Infrastructure";
import Gallery from "./pages/Gallery";
import Documents from "./pages/Documents";
import News from "./pages/News";
import Contacts from "./pages/Contacts";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Редирект / → /zapovednoe */}
          <Route path="/" element={<Navigate to="/zapovednoe" replace />} />
          
          {/* Маршруты для Заповедное */}
          <Route path="/zapovednoe" element={<Zapovednoe />} />
          <Route path="/zapovednoe/plots" element={<Plots settlement="zapovednoe" />} />
          <Route path="/zapovednoe/about" element={<About settlement="zapovednoe" />} />
          <Route path="/zapovednoe/infrastructure" element={<Infrastructure settlement="zapovednoe" />} />
          <Route path="/zapovednoe/gallery" element={<Gallery settlement="zapovednoe" />} />
          <Route path="/zapovednoe/documents" element={<Documents settlement="zapovednoe" />} />
          <Route path="/zapovednoe/news" element={<News settlement="zapovednoe" />} />
          <Route path="/zapovednoe/contacts" element={<Contacts settlement="zapovednoe" />} />
          
          {/* Маршруты для Колосок */}
          <Route path="/kolosok" element={<Kolosok />} />
          <Route path="/kolosok/plots" element={<Plots settlement="kolosok" />} />
          <Route path="/kolosok/about" element={<About settlement="kolosok" />} />
          <Route path="/kolosok/infrastructure" element={<Infrastructure settlement="kolosok" />} />
          <Route path="/kolosok/gallery" element={<Gallery settlement="kolosok" />} />
          <Route path="/kolosok/documents" element={<Documents settlement="kolosok" />} />
          <Route path="/kolosok/news" element={<News settlement="kolosok" />} />
          <Route path="/kolosok/contacts" element={<Contacts settlement="kolosok" />} />
          
          {/* Аутентификация */}
          <Route path="/auth" element={<Auth />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
