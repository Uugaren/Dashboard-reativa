import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [topSpenders, setTopSpenders] = useState<any[]>([]);
  const [topTicket, setTopTicket] = useState<any[]>([]);
  const [topPurchases, setTopPurchases] = useState<any[]>([]);
  const [salesOverTime, setSalesOverTime] = useState<any[]>([]);
  const [totalMensagens, setTotalMensagens] = useState(0);
  const [totalIndicacoes, setTotalIndicacoes] = useState(0);

  useEffect(() => {
    // Initialize dashboard logic for metrics
    if ((window as any).initDashboardLogic) {
      (window as any).initDashboardLogic();
    }

    // Load chart data
    loadChartData();
  }, []);

  const loadChartData = async () => {
    const supabase = (window as any).supabaseClient;
    if (!supabase) return;

    try {
      // Top 10 clientes por valor total gasto
      const { data: spendersData } = await supabase
        .from('clientes')
        .select('nome_completo, id')
        .order('id', { ascending: true });

      // Calcular total gasto por cliente
      const { data: comprasData } = await supabase
        .from('compras')
        .select('cliente_id, valor');

      const clienteGastos = new Map();
      comprasData?.forEach((compra: any) => {
        const atual = clienteGastos.get(compra.cliente_id) || 0;
        clienteGastos.set(compra.cliente_id, atual + parseFloat(compra.valor || 0));
      });

      const spendersWithTotal = spendersData?.map(c => ({
        nome: c.nome_completo,
        valor: clienteGastos.get(c.id) || 0
      })).filter(c => c.valor > 0).sort((a, b) => b.valor - a.valor).slice(0, 10);

      setTopSpenders(spendersWithTotal?.map(c => ({
        nome: c.nome.split(' ')[0],
        valor: c.valor
      })) || []);

      // Top 10 clientes por ticket médio
      const ticketMedioData = spendersData?.map(c => {
        const comprasCliente = comprasData?.filter((comp: any) => comp.cliente_id === c.id);
        const totalGasto = clienteGastos.get(c.id) || 0;
        const qtdCompras = comprasCliente?.length || 0;
        return {
          nome: c.nome_completo,
          ticketMedio: qtdCompras > 0 ? totalGasto / qtdCompras : 0
        };
      }).filter(c => c.ticketMedio > 0).sort((a, b) => b.ticketMedio - a.ticketMedio).slice(0, 10);

      setTopTicket(ticketMedioData?.map(c => ({
        nome: c.nome.split(' ')[0],
        valor: c.ticketMedio
      })) || []);

      // Top 10 clientes por quantidade de compras
      const purchasesCountData = spendersData?.map(c => {
        const comprasCliente = comprasData?.filter((comp: any) => comp.cliente_id === c.id);
        return {
          nome: c.nome_completo,
          quantidade: comprasCliente?.length || 0
        };
      }).filter(c => c.quantidade > 0).sort((a, b) => b.quantidade - a.quantidade).slice(0, 10);

      setTopPurchases(purchasesCountData?.map(c => ({
        nome: c.nome.split(' ')[0],
        quantidade: c.quantidade
      })) || []);

      // Vendas ao longo do tempo (últimos 30 dias)
      const { data: salesData } = await supabase
        .from('compras')
        .select('data_compra, valor')
        .gte('data_compra', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('data_compra', { ascending: true });

      // Agrupar vendas por dia
      const salesByDay: Record<string, number> = {};
      salesData?.forEach((sale: any) => {
        const date = new Date(sale.data_compra + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        salesByDay[date] = (salesByDay[date] || 0) + parseFloat(sale.valor || 0);
      });

      setSalesOverTime(Object.entries(salesByDay).map(([data, valor]) => ({
        data,
        valor: parseFloat(valor.toFixed(2))
      })));

      // Buscar total de mensagens
      const { count: mensagensCount } = await supabase
        .from('mensagens')
        .select('*', { count: 'exact', head: true });
      setTotalMensagens(mensagensCount || 0);

      // Buscar total de indicações
      const { count: indicacoesCount } = await supabase
        .from('indicacoes')
        .select('*', { count: 'exact', head: true });
      setTotalIndicacoes(indicacoesCount || 0);

    } catch (error) {
      console.error('Erro ao carregar dados dos gráficos:', error);
    }
  };

  return (
    <Layout>
      {/* Alert Container */}
      <div id="alertContainer" className="fixed top-4 right-4 z-50 max-w-md w-full"></div>
      
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold mb-3">
            <span className="gradient-text">Dashboard</span> de Métricas
          </h1>
          <p className="text-muted-foreground text-lg">
            Acompanhe os principais indicadores do seu negócio
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Clientes */}
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
                <div className="text-4xl font-bold mb-2 text-foreground" id="totalClientes">0</div>
                <div className="text-sm font-semibold text-muted-foreground">Total de Clientes</div>
              </div>
            </div>
          </Link>

          {/* Clientes Ativos */}
          <Link to="/clientes" className="block">
            <div className="glass rounded-2xl p-6 hover-lift animate-slide-in group cursor-pointer" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                    <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold mb-2 text-foreground" id="clientesAtivos">0</div>
                <div className="text-sm font-semibold text-muted-foreground">Clientes Ativos</div>
              </div>
            </div>
          </Link>

          {/* Total Mensagens */}
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

          {/* Indicações Obtidas */}
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

        {/* Charts Grid */}
        <div className="mt-12 space-y-8">
          {/* Top Spenders */}
          <div className="glass rounded-2xl p-8 animate-fade-in">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Top 10 Clientes por Valor Total Gasto
            </h3>
            <ResponsiveContainer width="100%" height={350}>
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
                  formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Total Gasto']}
                />
                <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Two Column Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Ticket Médio */}
            <div className="glass rounded-2xl p-8 animate-fade-in">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Top 10 por Ticket Médio
              </h3>
              <ResponsiveContainer width="100%" height={300}>
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
                    formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Ticket Médio']}
                  />
                  <Bar dataKey="valor" fill="hsl(var(--accent))" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Quantidade de Compras */}
            <div className="glass rounded-2xl p-8 animate-fade-in">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                Top 10 em Compras
              </h3>
              <ResponsiveContainer width="100%" height={300}>
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
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sales Over Time */}
          <div className="glass rounded-2xl p-8 animate-fade-in">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              Evolução de Vendas (Últimos 30 dias)
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={salesOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="data" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Vendas']}
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
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
