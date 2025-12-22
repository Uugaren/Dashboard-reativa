import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase"; // <--- A MUDANÇA MÁGICA É ESSA IMPORTAÇÃO

const Config = () => {
  const [notifications, setNotifications] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    const savedAutoUpdate = localStorage.getItem('autoUpdate');
    
    if (savedNotifications !== null) setNotifications(savedNotifications === 'true');
    if (savedAutoUpdate !== null) setAutoUpdate(savedAutoUpdate === 'true');
    
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      // Verifica a sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserEmail(session.user.email || "");
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch {
      setConnectionStatus('error');
    }
  };

  const handleNotificationsToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem('notifications', String(newValue));
    toast.success(newValue ? 'Notificações ativadas' : 'Notificações desativadas');
  };

  const handleAutoUpdateToggle = () => {
    const newValue = !autoUpdate;
    setAutoUpdate(newValue);
    localStorage.setItem('autoUpdate', String(newValue));
    toast.success(newValue ? 'Atualização automática ativada' : 'Atualização automática desativada');
  };

  const handleExportData = async () => {
    try {
      toast.info('Exportando dados...');
      
      // Busca dados usando a conexão autenticada global
      const { data: clientes, error: errClientes } = await supabase
        .from('clientes')
        .select('*')
        .order('id');

      const { data: compras, error: errCompras } = await supabase
        .from('compras')
        .select('*')
        .order('id');

      if (errClientes || errCompras) throw new Error("Falha ao buscar dados");

      if ((!clientes || clientes.length === 0) && (!compras || compras.length === 0)) {
        toast.warning('Nenhum dado encontrado para exportar');
        return;
      }

      // Criar CSV de clientes
      const csvClientes = [
        'ID,Nome,Email,Telefone,Endereço,Ativo',
        ...(clientes || []).map(c => 
          `${c.id},"${c.nome_completo}","${c.email || ''}","${c.telefone || ''}","${c.endereco || ''}",${c.ativo}`
        )
      ].join('\n');

      const downloadCSV = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      };

      downloadCSV(csvClientes, `clientes_export_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Dados exportados com sucesso!');
      
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar dados. Verifique se você tem permissão.');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12">
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold mb-3">
            <span className="gradient-text">Configurações</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Preferências do sistema
          </p>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-8 animate-slide-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              Conta e Conexão
            </h2>
            <div className="space-y-4">
               <div className="p-4 bg-muted/30 rounded-xl flex items-center justify-between">
                <div>
                   <h3 className="font-semibold mb-1">Status da Sessão</h3>
                   <div className="flex items-center gap-2">
                      {connectionStatus === 'connected' ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600">Conectado como {userEmail}</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-red-600">Desconectado</span>
                        </>
                      )}
                   </div>
                </div>
               </div>

               <div className="p-4 bg-muted/30 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Exportar Dados</h3>
                    <p className="text-sm text-muted-foreground">Baixar CSV dos seus clientes</p>
                  </div>
                  <button 
                    onClick={handleExportData}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 transition-all"
                  >
                    Exportar CSV
                  </button>
               </div>
            </div>
          </div>
          
          {/* Outras configs visuais mantidas */}
          <div className="glass rounded-2xl p-8 animate-slide-in" style={{ animationDelay: '0.1s' }}>
             <h2 className="text-2xl font-bold mb-6">Preferências de Interface</h2>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <div>
                    <h3 className="font-semibold mb-1">Notificações</h3>
                    <p className="text-sm text-muted-foreground">Alertas visuais no sistema</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={notifications} onChange={handleNotificationsToggle} />
                    <div className="w-11 h-6 bg-muted peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Config;