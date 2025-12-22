import { useEffect, useState } from "react";
// 1. ADICIONEI 'useNavigate' AQUI
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabase";
// 2. ADICIONEI A IMPORTAÇÃO DO TOAST AQUI
import { toast } from "sonner";

const Conversas = () => {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("id");
  // 3. ADICIONEI A DEFINIÇÃO DO NAVIGATE AQUI
  const navigate = useNavigate();
  
  const [client, setClient] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientId) {
      loadConversations();
    }
  }, [clientId]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      // Verifica sessão
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login"); // Agora vai funcionar
        return;
      }

      // Carrega dados do cliente (RLS filtrará automaticamente)
      const { data: clientData, error: clientError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);

      // Carrega mensagens
      const { data: messagesData, error: messagesError } = await supabase
        .from('mensagens')
        .select('*')
        .eq('cliente_id', clientId)
        .order('data_envio', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
      toast.error("Erro ao carregar dados"); // Agora vai funcionar
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
              <p className="text-muted-foreground">Carregando conversas...</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
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

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/perfil?id=${clientId}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para Perfil
          </Link>
          <h1 className="text-4xl font-bold">
            Conversas com <span className="gradient-text">{client.nome_completo}</span>
          </h1>
          <p className="text-muted-foreground mt-2">Histórico completo de interações da IA</p>
        </div>

        {/* Chat Container */}
        <div className="glass rounded-2xl p-6 animate-fade-in">
          {messages.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <svg className="w-20 h-20 mx-auto mb-6 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Nenhuma conversa ainda</h3>
              <p>As conversas da IA com este cliente aparecerão aqui.</p>
            </div>
          ) : (
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4">
              {messages.map((message, index) => (
                <div key={message.id} className="animate-slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
                  {/* Client Message (user_message) */}
                  {message.user_message && (
                    <div className="flex justify-end mb-4">
                      <div className="max-w-[70%]">
                        <div className="bg-primary/10 rounded-2xl rounded-tr-sm p-4 border border-primary/20">
                          <p className="text-sm">{message.user_message}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2 justify-end">
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.data_envio).toLocaleString('pt-BR')}
                          </span>
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                            {client.nome_completo.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bot Response (bot_message) */}
                  {message.bot_message && (
                    <div className="flex justify-start mb-4">
                      <div className="max-w-[70%]">
                        <div className="bg-accent/10 rounded-2xl rounded-tl-sm p-4 border border-accent/20">
                          <p className="text-sm">{message.bot_message}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent/40 to-primary/40 flex items-center justify-center">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                            </svg>
                          </div>
                          <span className="text-xs text-muted-foreground font-semibold">IA Assistente</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            message.status === 'enviado' 
                              ? 'bg-green-500/10 text-green-400' 
                              : 'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {message.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Conversas;