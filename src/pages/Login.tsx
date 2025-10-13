import { useEffect } from "react";
import Layout from "@/components/Layout";

const Login = () => {
  useEffect(() => {
    // Initialize dashboard logic for this page
    if ((window as any).initDashboardLogic) {
      (window as any).initDashboardLogic();
    }
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-6 animate-pulse-glow">
              <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Conecte-se ao <span className="gradient-text">Supabase</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Configure a conexão com seu banco de dados para começar a gerenciar clientes
            </p>
          </div>

          {/* Connection Card */}
          <div className="glass rounded-2xl p-8 animate-slide-in shadow-lg">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Credenciais de Acesso
              </h2>
              <p className="text-sm text-muted-foreground">
                Insira suas credenciais do Supabase para estabelecer a conexão
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="supabaseUrl" className="block text-sm font-semibold mb-2 text-foreground">
                  URL do Supabase
                </label>
                <input
                  type="text"
                  id="supabaseUrl"
                  placeholder="https://seu-projeto.supabase.co"
                  className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label htmlFor="supabaseKey" className="block text-sm font-semibold mb-2 text-foreground">
                  Anon Key
                </label>
                <input
                  type="password"
                  id="supabaseKey"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <button
                id="connectBtn"
                className="w-full px-6 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-bold text-base hover:shadow-primary transition-all flex items-center justify-center gap-3 group hover-lift"
              >
                <svg className="w-5 h-5 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                Conectar ao Supabase
              </button>
            </div>

            <div id="connectionStatus" className="mt-6"></div>
          </div>

          {/* Alert Container */}
          <div id="alertContainer" className="fixed top-6 right-6 z-50 max-w-md"></div>

          {/* Info Card */}
          <div className="mt-8 p-6 rounded-xl bg-primary/5 border border-primary/20 animate-fade-in">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-primary mb-1">Como obter suas credenciais</h3>
                <p className="text-sm text-muted-foreground">
                  Acesse o painel do Supabase, vá em Settings → API e copie a URL do projeto e a anon/public key.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
