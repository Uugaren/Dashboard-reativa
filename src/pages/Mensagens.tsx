import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: number;
  cliente_id: string;
  nomewpp: string;
  telefone: string;
  bot_message: string;
  user_message: string;
  created_at: string;
  message_type: string;
}

const Mensagens = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
    
    // Setup realtime subscription
    const supabase = (window as any).supabaseClient;
    if (!supabase) return;

    const channel = supabase
      .channel('mensagens-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mensagens'
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMessages = async () => {
    const supabase = (window as any).supabaseClient;
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.length > 1 
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando mensagens...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-3">
            <span className="gradient-text">Mensagens</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Histórico completo de conversas com clientes
          </p>
        </div>

        {/* Messages Feed */}
        <div className="glass rounded-2xl overflow-hidden animate-slide-in">
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Nenhuma mensagem ainda</h3>
                  <p className="text-muted-foreground">As conversas com clientes aparecerão aqui</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="glass rounded-xl p-4 hover-lift">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-semibold">
                          {getInitials(message.nomewpp || 'Cliente')}
                        </AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {message.nomewpp || 'Cliente'}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {message.telefone}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(message.created_at)}
                          </span>
                        </div>

                        {/* Messages */}
                        <div className="space-y-3">
                          {/* User Message */}
                          {message.user_message && (
                            <div className="flex justify-end">
                              <div className="max-w-[80%] bg-primary/10 border border-primary/20 rounded-2xl rounded-tr-sm px-4 py-2">
                                <p className="text-sm text-foreground">{message.user_message}</p>
                              </div>
                            </div>
                          )}

                          {/* Bot Message */}
                          {message.bot_message && (
                            <div className="flex justify-start">
                              <div className="max-w-[80%] bg-muted/50 border border-border rounded-2xl rounded-tl-sm px-4 py-2">
                                <p className="text-sm text-foreground">{message.bot_message}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Type Badge */}
                        {message.message_type && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/10 text-accent border border-accent/20">
                              {message.message_type}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </Layout>
  );
};

export default Mensagens;
