import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner"; // Assumindo que você tenha o sonner ou use o toast padrão do seu projeto

const Dashboard = () => {
  // Estados dos Gráficos (Dados já processados do Backend)
  const [topSpenders, setTopSpenders] = useState<any[]>([]);
  const [topTicket, setTopTicket] = useState<any[]>([]);
  const [topPurchases, setTopPurchases] = useState<any[]>([]);
  const [salesOverTime, setSalesOverTime] = useState<any[]>([]);
   
  // Estados dos KPIs
  const [totalMensagens, setTotalMensagens] = useState(0);
  const [totalIndicacoes, setTotalIndicacoes] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalVendas, setTotalVendas] = useState(0);
  const [valorTotalVendas, setValorTotalVendas] = useState(0); // Novo estado opcional para mostrar R$ total

  // Estados de Filtro
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Carregamento Inicial (Dados que não mudam com o filtro de mês)
  useEffect(() => {
    loadStaticData();
    loadAvailableMonths();
  }, []);

  // 2. Carregamento Dinâmico (Sempre que mudar o mês selecionado)
  useEffect(() => {
    fetchDashboardMetrics();
  }, [selectedMonth]);

  const loadStaticData = async () => {
    try {
      // Contagem rápida usando HEAD (sem baixar dados)
      const { count: clientesCount } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });
      setTotalClientes(clientesCount || 0);

      const { count: mensagensCount } = await supabase
        .from('mensagens')
        .select('*', { count: 'exact', head: true });
      setTotalMensagens(mensagensCount || 0);

      const { count: indicacoesCount } = await supabase
        .from('indicacoes')
        .select('*', { count: 'exact', head: true });
      setTotalIndicacoes(indicacoesCount || 0);

    } catch (error) {
      console.error('Erro ao carregar totais estáticos:', error);
    }
  };

  const loadAvailableMonths = async () => {
    try {
      // RPC para buscar meses disponíveis (muito mais leve que baixar tudo)
      // Crie a função: CREATE FUNCTION get_available_months() RETURNS text[] ...
      const { data, error } = await supabase.rpc('get_available_months');
      
      if (!error && data) {
        setAvailableMonths(data);
      } else {
        // Fallback caso a RPC não exista ainda (busca leve apenas das datas)
        const { data: dates } = await supabase
          .from('compras')
          .select('data_compra')
          .order('data_compra', { ascending: false });
          
        if (dates) {
          const uniqueMonths = [...new Set(dates.map((c: any) => c.data_compra.slice(0, 7)))];
          setAvailableMonths(uniqueMonths);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar meses:', error);
    }
  };

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      // Chamada PRINCIPAL para buscar métricas e gráfico de evolução
      // Espera uma RPC 'get_dashboard_metrics' que retorna { kpi_count, kpi_valor, grafico_evolucao }
      const { data: metricsData, error: metricsError } = await supabase
        .rpc('get_dashboard_metrics', { filtro_mes: selectedMonth });

      if (metricsError) throw metricsError;

      if (metricsData) {
        setTotalVendas(metricsData.kpi_vendas_count || 0);
        setValorTotalVendas(metricsData.kpi_vendas_valor || 0);
        setSalesOverTime(metricsData.grafico_evolucao || []);
      }

      // Buscas paralelas para os gráficos de TOP (podem ser RPCs separadas para organização)
      
      // 1. Top Spenders
      const { data: spendersData } = await supabase
        .rpc('get_top_spenders', { filtro_mes: selectedMonth });
      setTopSpenders(spendersData || []);

      // 2. Top Ticket Médio
      const { data: ticketData } = await supabase
        .rpc('get_top_ticket', { filtro_mes: selectedMonth });
      setTopTicket(ticketData || []);

      // 3. Top Volume de Compras
      const { data: purchasesData } = await supabase
        .rpc('get_top_purchases', { filtro_mes: selectedMonth });
      setTopPurchases(purchasesData || []);

    } catch (error) {
      console.error('Erro ao carregar métricas do dashboard:', error);
      toast.error("Erro ao atualizar dashboard. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const formatMonthDisplay = (yyyyMm: string) => {
    if (yyyyMm === 'all') return "Todo o período";
    if (!yyyyMm) return "";
    const [year, month] = yyyyMm.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <Layout>
      <div id="alertContainer" className="fixed top-4 right-4 z-50 max-w-md w-full"></div>
       
      <div className="container mx-auto px-6 py-12">
        <div className="mb-12 animate-fade-in flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-3">
              <span className="gradient-text">Dashboard</span> de Métricas
            </h1>
            <p className="text-muted-foreground text-lg">
              Acompanhe os principais indicadores do seu negócio
              {loading && <span className="ml-2 text-sm text-primary animate-pulse">(Atualizando...)</span>}
            </p>
          </div>
           
          <div className="w-full md:w-64">
            <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={loading}>
              <SelectTrigger className="w-full bg-background border-input">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o período</SelectItem>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month} className="capitalize">
                    {formatMonthDisplay(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/clientes" className="block">
            <div className="glass rounded-2xl p-6 hover-lift animate-slide-in group cursor-pointer relative" style={{ animationDelay: '0.1s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold mb-2 text-foreground">{totalClientes}</div>
                <div className="text-sm font-semibold text-muted-foreground">Total de Clientes</div>
              </div>
            </div>
          </Link>

          <Link to="/clientes" className="block">
            <div className="glass rounded-2xl p-6 hover-lift animate-slide-in group cursor-pointer" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                    <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold mb-2 text-foreground">{totalVendas}</div>
                <div className="text-sm font-semibold text-muted-foreground">
                    Vendas ({selectedMonth === 'all' ? 'Total' : 'Mês'})
                </div>
              </div>
            </div>
          </Link>

          <Link to="/mensagens" className="block">
            <div className="glass rounded-2xl p-6 hover-lift animate-slide-in group cursor-pointer relative" style={{ animationDelay: '0.3s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold mb-2 text-foreground">{totalMensagens}</div>
                <div className="text-sm font-semibold text-muted-foreground">Total de Mensagens</div>
              </div>
            </div>
          </Link>

          <Link to="/indicacoes" className="block">
            <div className="glass rounded-2xl p-6 hover-lift animate-slide-in group cursor-pointer relative" style={{ animationDelay: '0.4s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                    <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold mb-2 text-foreground">{totalIndicacoes}</div>
                <div className="text-sm font-semibold text-muted-foreground">Indicações Obtidas</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Charts Section */}
        <div className="mt-12 space-y-8">
          
          {/* Top Spenders Chart */}
          <div className="glass rounded-2xl p-8 animate-fade-in">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Top 10 Clientes por Valor Total Gasto ({selectedMonth === 'all' ? 'Todo o período' : formatMonthDisplay(selectedMonth)})
            </h3>
            <div className="w-full h-[350px]">
              {topSpenders.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSpenders}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="nome" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Total Gasto']}
                    />
                    <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                 <div className="h-full flex items-center justify-center text-muted-foreground">Sem dados para este período</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Ticket Chart */}
            <div className="glass rounded-2xl p-8 animate-fade-in">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Top 10 por Ticket Médio
              </h3>
              <div className="w-full h-[450px]">
                {topTicket.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topTicket} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="nome" type="category" stroke="hsl(var(--muted-foreground))" width={80} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Ticket Médio']}
                      />
                      <Bar dataKey="valor" fill="hsl(var(--accent))" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">Sem dados</div>
                )}
              </div>
            </div>

            {/* Purchases Pie Chart */}
            <div className="glass rounded-2xl p-8 animate-fade-in">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                Top 10 em Número de Compras
              </h3>
              <div className="w-full h-[300px]">
                {topPurchases.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topPurchases}
                        dataKey="quantidade"
                        nameKey="nome"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.nome}: ${entry.quantidade}`}
                      >
                        {topPurchases.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`hsl(${(index * 360) / topPurchases.length}, 70%, 60%)`} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">Sem dados</div>
                )}
              </div>
            </div>
          </div>

          {/* Sales Evolution Line Chart */}
          <div className="glass rounded-2xl p-8 animate-fade-in">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              Evolução de Vendas ({selectedMonth === 'all' ? 'Todo o período' : formatMonthDisplay(selectedMonth)})
            </h3>
            <div className="w-full h-[350px]">
              {salesOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Vendas']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="valor" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Total de Vendas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">Sem dados de evolução</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
