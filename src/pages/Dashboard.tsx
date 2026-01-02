import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalCompras: 0, // Substituiu Clientes Ativos
    receitaTotal: 0,
    ticketMedio: 0,
  });

  // Dados para os gráficos
  const [vendasPorMes, setVendasPorMes] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Buscar Clientes
      const { data: clientes, error: errorClientes } = await supabase
        .from("clientes")
        .select("*");
      
      if (errorClientes) throw errorClientes;

      // 2. Buscar Compras
      const { data: compras, error: errorCompras } = await supabase
        .from("compras")
        .select("*");

      if (errorCompras) throw errorCompras;

      // 3. Calcular Estatísticas
      const totalClientes = clientes?.length || 0;
      const totalCompras = compras?.length || 0;
      
      // Soma do valor de todas as compras
      const receitaTotal = compras?.reduce((acc, curr) => acc + Number(curr.valor), 0) || 0;
      
      // Ticket Médio (Receita / Quantidade de Compras)
      const ticketMedio = totalCompras > 0 ? receitaTotal / totalCompras : 0;

      setStats({
        totalClientes,
        totalCompras,
        receitaTotal,
        ticketMedio,
      });

      // 4. Preparar dados para o Gráfico (Ex: Vendas dos últimos 6 meses)
      // Agrupando compras por mês/ano
      const vendasAgrupadas = compras?.reduce((acc: any, curr) => {
        const data = new Date(curr.data_compra || curr.created_at);
        const mesAno = data.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }); // ex: jan/24
        
        if (!acc[mesAno]) {
          acc[mesAno] = { name: mesAno, total: 0, qtd: 0 };
        }
        acc[mesAno].total += Number(curr.valor);
        acc[mesAno].qtd += 1;
        return acc;
      }, {});

      // Converter objeto em array e ordenar (simplificado)
      // *Nota: Para ordenação cronológica perfeita, seria ideal ordenar pelo timestamp das chaves
      const dadosGrafico = Object.values(vendasAgrupadas || {});
      setVendasPorMes(dadosGrafico);

    } catch (error: any) {
      console.error("Erro ao carregar dashboard:", error);
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">
            Dashboard <span className="gradient-text">Geral</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Visão geral do desempenho do seu negócio
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* Card 1: Total de Clientes */}
          <Card className="glass border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Clientes
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? "..." : stats.totalClientes}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Base cadastrada
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Total de Compras (Substituiu Clientes Ativos) */}
          <Card className="glass border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Compras
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? "..." : stats.totalCompras}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Vendas realizadas
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Receita Total */}
          <Card className="glass border-border/50 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receita Total
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? "..." : stats.receitaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Faturamento bruto
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Ticket Médio */}
          <Card className="glass border-border/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ticket Médio
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? "..." : stats.ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Por venda
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Gráfico de Barras: Receita */}
          <Card className="glass border-border/50 p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Evolução de Receita</CardTitle>
            </CardHeader>
            <div className="h-[300px] w-full">
              {vendasPorMes.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vendasPorMes}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `R$${value}`} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                    />
                    <Bar dataKey="total" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Sem dados de vendas ainda
                </div>
              )}
            </div>
          </Card>

          {/* Gráfico de Linha: Quantidade de Vendas */}
          <Card className="glass border-border/50 p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Volume de Vendas</CardTitle>
            </CardHeader>
            <div className="h-[300px] w-full">
               {vendasPorMes.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vendasPorMes}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="qtd" 
                      stroke="#F97316" 
                      strokeWidth={3}
                      dot={{ fill: '#F97316', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Sem dados de vendas ainda
                </div>
              )}
            </div>
          </Card>

        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
