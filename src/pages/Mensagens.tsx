import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase"; // <--- Importação

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

interface ClienteConversas {
  clienteId: string;
  nomeCliente: string;
  telefone: string;
  ultimaMensagem: string;
  ultimaData: string;
  totalMensagens: number;
  mensagens: Message[];
}

const Mensagens = () => {
  const [clientesConversas, setClientesConversas] = useState<ClienteConversas[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<ClienteConversas | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadMessages();
    
    // Substituindo a conexão global pela importada
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
    try {
      // Buscar mensagens
      const { data: mensagensData, error: mensagensError } = await supabase
        .from('mensagens')
        .select('*')
        .order('created_at', { ascending: false });

      if (mensagensError) throw mensagensError;

      // Buscar clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nome_completo, telefone');

      if (clientesError) throw clientesError;

      const clientesMap = (clientesData || []).reduce((acc: Record<string, { nome: string; telefone: string }>, cliente: any) => {
        acc[cliente.id] = {
          nome: cliente.nome_completo || '',
          telefone: cliente.telefone || ''
        };
        return acc;
      }, {});

      const groupedByClient = (mensagensData || []).reduce((acc: Record<string, ClienteConversas>, msg: Message) => {
        const clienteId = msg.cliente_id;
        const clienteInfo = clientesMap[clienteId];
        
        if (!acc[clienteId]) {
          acc[clienteId] = {
            clienteId,
            nomeCliente: clienteInfo?.nome || msg.nomewpp || 'Cliente Desconhecido',
            telefone: clienteInfo?.telefone || msg.telefone || '',
            ultimaMensagem: msg.bot_message || msg.user_message || '',
            ultimaData: msg.created_at,
            totalMensagens: 0,
            mensagens: []
          };
        }

        acc[clienteId].totalMensagens++;
        acc[clienteId].mensagens.push(msg);
        
        if (new Date(msg.created_at) > new Date(acc[clienteId].ultimaData)) {
          acc[clienteId].ultimaMensagem = msg.bot_message || msg.user_message || '';
          acc[clienteId].ultimaData = msg.created_at;
        }

        return acc;
      }, {});

      const clientesArray = Object.values(groupedByClient) as ClienteConversas[];
      clientesArray.sort((a, b) => new Date(b.ultimaData).getTime() - new Date(a.ultimaData).getTime());

      setClientesConversas(clientesArray);
      
      if (selectedCliente) {
        const updatedCliente = clientesArray.find(c => c.clienteId === selectedCliente.clienteId);
        if (updatedCliente) {
          setSelectedCliente(updatedCliente);
        }
      }
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
      month: '2-digit'
    });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredClientes = clientesConversas.filter(cliente => 
    cliente.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone.includes(searchTerm)
  );

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

  // O RESTANTE DO JSX É IDÊNTICO AO SEU ARQUIVO ORIGINAL
  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] md:h-screen flex">
        <div className="w-full md:w-96 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <h1 className="text-2xl font-bold mb-4">
              <span className="gradient-text">Mensagens</span>
            </h1>
            <Input
              type="text"
              placeholder="Buscar conversa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background"
            />
          </div>

          <ScrollArea className="flex-1">
            {filteredClientes.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma mensagem ainda'}
                </p>
              </div>
            ) : (
              <div className="p-2">
                {filteredClientes.map((cliente) => (
                  <button
                    key={cliente.clienteId}
                    onClick={() => setSelectedCliente(cliente)}
                    className={`w-full p-3 rounded-lg mb-1 transition-all hover:bg-muted/50 text-left ${
                      selectedCliente?.clienteId === cliente.clienteId 
                        ? 'bg-muted border-l-4 border-primary' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-semibold">
                          {getInitials(cliente.nomeCliente)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-sm text-foreground truncate">
                            {cliente.nomeCliente}
                          </h3>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {formatDate(cliente.ultimaData)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {cliente.ultimaMensagem}
                        </p>
                      </div>
                      {cliente.totalMensagens > 0 && (
                        <span className="flex-shrink-0 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {cliente.totalMensagens}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="hidden md:flex flex-1 flex-col bg-background">
          {selectedCliente ? (
            <>
              <div className="p-4 border-b border-border bg-card flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-semibold">
                    {getInitials(selectedCliente.nomeCliente)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="font-semibold text-foreground">{selectedCliente.nomeCliente}</h2>
                  <p className="text-xs text-muted-foreground">{selectedCliente.telefone}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {selectedCliente.totalMensagens} mensagens
                </span>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4 max-w-4xl mx-auto">
                  {selectedCliente.mensagens
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((message) => (
                      <div key={message.id} className="space-y-2">
                        {message.user_message && (
                          <div className="flex justify-end animate-slide-in">
                            <div className="max-w-[70%]">
                              <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tr-sm px-4 py-3">
                                <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                                  {message.user_message}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 text-right">
                                {formatFullDate(message.created_at)}
                              </p>
                            </div>
                          </div>
                        )}

                        {message.bot_message && (
                          <div className="flex justify-start animate-slide-in">
                            <div className="max-w-[70%]">
                              <div className="bg-muted/50 border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                                <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                                  {message.bot_message}
                                </p>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-muted-foreground">
                                  {formatFullDate(message.created_at)}
                                </p>
                                {message.message_type && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                                    {message.message_type}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Selecione uma conversa</h3>
                <p className="text-muted-foreground">
                  Escolha um cliente à esquerda para ver as mensagens
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Mensagens;