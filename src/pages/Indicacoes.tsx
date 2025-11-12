import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface Indicacao {
  id: string;
  cliente_indicador_id: string;
  nome_cliente_indicador: string;
  nome_indicado: string;
  telefones_indicados: string;
  data_indicacao: string;
}

interface ClienteIndicacoes {
  clienteId: string;
  nomeCliente: string;
  totalIndicacoes: number;
  ultimaIndicacao: string;
  indicacoes: Indicacao[];
}

const Indicacoes = () => {
  const [clientesIndicacoes, setClientesIndicacoes] = useState<ClienteIndicacoes[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<ClienteIndicacoes | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadIndicacoes();

    const supabase = (window as any).supabaseClient;
    if (!supabase) return;

    const channel = supabase
      .channel('indicacoes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'indicacoes'
        },
        () => {
          loadIndicacoes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadIndicacoes = async () => {
    const supabase = (window as any).supabaseClient;
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('indicacoes')
        .select('*')
        .order('data_indicacao', { ascending: false });

      if (error) throw error;

      // Agrupar indicações por cliente
      const groupedByClient = (data || []).reduce((acc: Record<string, ClienteIndicacoes>, indicacao: Indicacao) => {
        const clienteId = indicacao.cliente_indicador_id;
        
        if (!acc[clienteId]) {
          acc[clienteId] = {
            clienteId,
            nomeCliente: indicacao.nome_cliente_indicador || 'Cliente Desconhecido',
            totalIndicacoes: 0,
            ultimaIndicacao: indicacao.data_indicacao,
            indicacoes: []
          };
        }

        acc[clienteId].totalIndicacoes++;
        acc[clienteId].indicacoes.push(indicacao);
        
        // Atualizar última indicação se for mais recente
        if (new Date(indicacao.data_indicacao) > new Date(acc[clienteId].ultimaIndicacao)) {
          acc[clienteId].ultimaIndicacao = indicacao.data_indicacao;
        }

        return acc;
      }, {});

      const clientesArray = Object.values(groupedByClient) as ClienteIndicacoes[];
      clientesArray.sort((a, b) => b.totalIndicacoes - a.totalIndicacoes);

      setClientesIndicacoes(clientesArray);
      
      // Manter seleção se cliente já estava selecionado
      if (selectedCliente) {
        const updatedCliente = clientesArray.find(c => c.clienteId === selectedCliente.clienteId);
        if (updatedCliente) {
          setSelectedCliente(updatedCliente);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar indicações:', error);
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
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPhone = (phone: string) => {
    if (!phone) return 'Não informado';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 13) {
      return `+${cleaned.substring(0, 2)} (${cleaned.substring(2, 4)}) ${cleaned.substring(4, 9)}-${cleaned.substring(9)}`;
    }
    return phone;
  };

  const filteredClientes = clientesIndicacoes.filter(cliente =>
    cliente.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando indicações...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] md:h-screen flex">
        {/* Lista de Clientes - Esquerda */}
        <div className="w-full md:w-96 border-r border-border bg-card flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <h1 className="text-2xl font-bold mb-4">
              <span className="gradient-text">Indicações</span>
            </h1>
            <Input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background"
            />
          </div>

          {/* Lista de Clientes */}
          <ScrollArea className="flex-1">
            {filteredClientes.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhuma indicação ainda'}
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
                        <h3 className="font-semibold text-sm text-foreground truncate mb-1">
                          {cliente.nomeCliente}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {cliente.totalIndicacoes} {cliente.totalIndicacoes === 1 ? 'indicação' : 'indicações'}
                        </p>
                      </div>
                      <div className="flex-shrink-0 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                        <span className="text-primary font-semibold text-sm">
                          🎯 {cliente.totalIndicacoes}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Área de Indicações - Direita */}
        <div className="hidden md:flex flex-1 flex-col bg-background">
          {selectedCliente ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-border bg-card">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-semibold text-xl">
                      {getInitials(selectedCliente.nomeCliente)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">{selectedCliente.nomeCliente}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedCliente.totalIndicacoes} {selectedCliente.totalIndicacoes === 1 ? 'indicação realizada' : 'indicações realizadas'}
                    </p>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                    <span className="text-primary font-bold text-lg">🎯 {selectedCliente.totalIndicacoes}</span>
                  </div>
                </div>
              </div>

              {/* Lista de Indicações */}
              <ScrollArea className="flex-1 p-6">
                <div className="max-w-4xl mx-auto space-y-4">
                  {selectedCliente.indicacoes
                    .sort((a, b) => new Date(b.data_indicacao).getTime() - new Date(a.data_indicacao).getTime())
                    .map((indicacao) => (
                      <div 
                        key={indicacao.id}
                        className="glass rounded-xl p-6 hover-lift animate-slide-in"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="h-14 w-14 border-2 border-accent/20">
                            <AvatarFallback className="bg-gradient-to-br from-accent/20 to-primary/20 text-foreground font-semibold text-lg">
                              {getInitials(indicacao.nome_indicado || 'Indicado')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-lg font-semibold text-foreground mb-1">
                                  {indicacao.nome_indicado || 'Nome não informado'}
                                </h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {formatPhone(indicacao.telefones_indicados)}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDate(indicacao.data_indicacao)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 pt-3 border-t border-border">
                              <span className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">
                                📅 Indicado em {formatDate(indicacao.data_indicacao)}
                              </span>
                            </div>
                          </div>
                        </div>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Selecione um cliente</h3>
                <p className="text-muted-foreground">
                  Escolha um cliente à esquerda para ver suas indicações
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Indicacoes;
