import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Cliente {
  id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  endereco?: string;
  data_aniversario?: string;
  data_cadastro?: string;
  created_at: string;
  ativo: boolean;
}

interface Compra {
  id: string;
  produto_servico: string;
  valor: number;
  data_compra: string;
  observacoes?: string;
}

interface Mensagem {
  id: string;
  bot_message?: string;
  user_message?: string;
  status: string;
  data_envio: string;
  created_at: string;
}

const Perfil = () => {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("id");
  const navigate = useNavigate();
  
  const [client, setClient] = useState<Cliente | null>(null);
  const [purchases, setPurchases] = useState<Compra[]>([]);
  const [messages, setMessages] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) {
      toast.error("Cliente não identificado");
      navigate("/clientes");
      return;
    }
    loadProfile();
  }, [clientId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // 1. Carregar Dados do Cliente
      const { data: clientData, error: clientError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);

      // 2. Carregar Histórico de Compras
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('compras')
        .select('*')
        .eq('cliente_id', clientId)
        .order('data_compra', { ascending: false });

      if (purchasesError) throw purchasesError;
      setPurchases(purchasesData || []);

      // 3. Carregar Histórico de Mensagens
      const { data: messagesData, error: messagesError } = await supabase
        .from('mensagens')
        .select('*')
        .eq('cliente_id', clientId)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      toast.error("Erro ao carregar dados do cliente");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando perfil...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!client) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-12">
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Cliente não encontrado</h2>
            <p className="text-muted-foreground mb-6">O cliente que você está procurando não existe.</p>
            <Link
              to="/clientes"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-bold hover:shadow-primary transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar para Clientes
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Cálculos de Totais
  const totalSpent = purchases.reduce((sum, p) => sum + (Number(p.valor) || 0), 0);

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12 animate-fade-in">
        {/* Header / Breadcrumb */}
        <div className="mb-8">
          <Link
            to="/clientes"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para Clientes
          </Link>
          <h1 className="text-4xl font-bold">
            Perfil de <span className="gradient-text">Cliente</span>
          </h1>
        </div>

        {/* Client Info Card */}
        <div className="glass rounded-3xl p-8 mb-8 relative overflow-hidden animate-slide-in">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 pointer-events-none"></div>
          
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-4xl text-primary shadow-inner flex-shrink-0">
              {client.nome_completo.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-foreground">{client.nome_completo}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  client.ativo 
                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  {client.ativo ? 'ATIVO' : 'INATIVO'}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {client.email}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {client.telefone}
                </div>
                {client.data_aniversario && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                    Aniv: {new Date(client.data_aniversario + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>

              {client.endereco && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/30 rounded-xl w-full md:w-fit">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  {client.endereco}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Link 
                to={`/conversas?id=${client.id}`}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                Abrir Chat IA
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-xl p-6 animate-slide-in">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground font-semibold">Total Gasto</div>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-primary">R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>

          <div className="glass rounded-xl p-6 animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground font-semibold">Compras</div>
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-accent">{purchases.length}</div>
          </div>

          <div className="glass rounded-xl p-6 animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground font-semibold">Mensagens</div>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
            </div>
            <div className="text-3xl font-bold">{messages.length}</div>
          </div>
        </div>

        {/* Listas: Compras e Mensagens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Histórico de Compras */}
          <div className="glass rounded-xl p-6 animate-fade-in">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              Histórico de Compras
            </h3>
            
            {purchases.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-muted rounded-xl">
                Nenhuma compra registrada
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-foreground">{purchase.produto_servico}</span>
                      <span className="font-bold text-accent">R$ {Number(purchase.valor).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{new Date(purchase.data_compra + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      {purchase.observacoes && <span className="italic truncate max-w-[150px]">{purchase.observacoes}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Histórico de Mensagens */}
          <div className="glass rounded-xl p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Últimas Mensagens</h3>
              <Link to={`/conversas?id=${clientId}`} className="text-xs text-primary hover:underline font-semibold">
                Ver todas
              </Link>
            </div>
            
            {messages.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-muted rounded-xl">
                Nenhuma mensagem trocada
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {messages.map((message) => (
                  <div key={message.id} className="p-4 bg-muted/30 rounded-xl border border-transparent">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                        message.status === 'enviada' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
                      }`}>
                        {message.status || 'Enviada'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">
                      {message.bot_message || message.user_message || 'Conteúdo da mensagem...'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Perfil;