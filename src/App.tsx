import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Páginas
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro"; // Certifique-se de ter criado este arquivo
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Perfil from "./pages/Perfil";
import Conversas from "./pages/Conversas";
import Config from "./pages/Config";
import Mensagens from "./pages/Mensagens";
import Indicacoes from "./pages/Indicacoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// --- COMPONENTE VIGIA (NOVO) ---
// Este componente monitora se a sessão morreu e redireciona automaticamente
const AuthObserver = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // Rotas que não precisam de login
      const publicRoutes = ['/login', '/cadastro'];
      const isPublicRoute = publicRoutes.includes(location.pathname);

      // 1. Se NÃO tem sessão e tenta acessar área restrita -> Manda pro Login
      if (!session && !isPublicRoute) {
        navigate('/login');
      }

      // 2. Se TEM sessão e tenta acessar Login/Cadastro -> Manda pro Dashboard
      if (session && isPublicRoute) {
        navigate('/dashboard');
      }
    };

    checkAuth();

    // Escuta mudanças em tempo real (ex: token expirou, logout em outra aba)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        const publicRoutes = ['/login', '/cadastro'];
        const isPublicRoute = publicRoutes.includes(location.pathname);
        
        // Só redireciona se já não estiver em rota pública
        if (!isPublicRoute) {
          navigate('/login');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location]);

  return null; // Não renderiza nada visualmente
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        
        {/* O AuthObserver deve ficar AQUI, dentro do BrowserRouter */}
        <AuthObserver />
        
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/conversas" element={<Conversas />} />
          <Route path="/config" element={<Config />} />
          <Route path="/mensagens" element={<Mensagens />} />
          <Route path="/indicacoes" element={<Indicacoes />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;