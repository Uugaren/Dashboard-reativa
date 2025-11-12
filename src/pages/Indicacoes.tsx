import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  indicacoes: Indicacao[];
}

const Indicacoes = () => {
  const [clientesIndicacoes, setClientesIndicacoes] = useState<ClienteIndicacoes[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalIndicacoes, setTotalIndicacoes] = useState(0);

  useEffect(() => {
    loadIndicacoes();

    // Setup realtime subscription
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
            indicacoes: []
          };
        }

        acc[clienteId].totalIndicacoes++;
        acc[clienteId].indicacoes.push(indicacao);

        return acc;
      }, {});

      const clientesArray = Object.values(groupedByClient) as ClienteIndicacoes[];
      clientesArray.sort((a, b) => b.totalIndicacoes - a.totalIndicacoes);

      setClientesIndicacoes(clientesArray);
      setTotalIndicacoes(data?.length || 0);
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
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-3">
            <span className="gradient-text">Indicações</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Acompanhe todas as indicações feitas pelos clientes
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-in">
          <Card className="glass border-border hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Indicações</p>
                  <p className="text-2xl font-bold text-foreground">{totalIndicacoes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clientes Indicadores</p>
                  <p className="text-2xl font-bold text-foreground">{clientesIndicacoes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Média por Cliente</p>
                  <p className="text-2xl font-bold text-foreground">
                    {clientesIndicacoes.length > 0 
                      ? (totalIndicacoes / clientesIndicacoes.length).toFixed(1)
                      : '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Indicações por Cliente */}
        <div className="space-y-6 animate-slide-in" style={{ animationDelay: '0.1s' }}>
          {clientesIndicacoes.length === 0 ? (
            <Card className="glass border-border">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Nenhuma indicação ainda</h3>
                <p className="text-muted-foreground">As indicações dos clientes aparecerão aqui</p>
              </CardContent>
            </Card>
          ) : (
            clientesIndicacoes.map((cliente) => (
              <Card key={cliente.clienteId} className="glass border-border hover-lift">
                <CardContent className="p-6">
                  {/* Cliente Header */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-semibold text-lg">
                        {getInitials(cliente.nomeCliente)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground">{cliente.nomeCliente}</h3>
                      <p className="text-sm text-muted-foreground">
                        {cliente.totalIndicacoes} {cliente.totalIndicacoes === 1 ? 'indicação' : 'indicações'}
                      </p>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                      <span className="text-primary font-semibold">🎯 {cliente.totalIndicacoes}</span>
                    </div>
                  </div>

                  {/* Lista de Indicações */}
                  <div className="space-y-3">
                    {cliente.indicacoes.map((indicacao) => (
                      <div 
                        key={indicacao.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-accent/10 text-accent font-semibold">
                              {getInitials(indicacao.nome_indicado || 'Indicado')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">
                              {indicacao.nome_indicado || 'Nome não informado'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatPhone(indicacao.telefones_indicados)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(indicacao.data_indicacao)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Indicacoes;
