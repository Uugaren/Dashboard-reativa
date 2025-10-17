import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { toast } from "sonner";

const Config = () => {
  const [notifications, setNotifications] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    // Carregar configurações do localStorage
    const savedNotifications = localStorage.getItem('notifications');
    const savedAutoUpdate = localStorage.getItem('autoUpdate');
    
    if (savedNotifications !== null) setNotifications(savedNotifications === 'true');
    if (savedAutoUpdate !== null) setAutoUpdate(savedAutoUpdate === 'true');
    
    // Verificar conexão com Supabase
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    const supabase = (window as any).supabaseClient;
    
    if (!supabase) {
      setConnectionStatus('error');
      return;
    }

    try {
      const { error } = await supabase.from('clientes').select('id').limit(1);
      setConnectionStatus(error ? 'error' : 'connected');
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

  const handleReconnect = async () => {
    toast.info('Reconectando...');
    await checkConnection();
    if (connectionStatus === 'connected') {
      toast.success('Conexão estabelecida com sucesso!');
    } else {
      toast.error('Falha ao conectar com o banco de dados');
    }
  };

  const handleExportData = async () => {
    const supabase = (window as any).supabaseClient;
    
    if (!supabase) {
      toast.error('Supabase não está conectado');
      return;
    }

    try {
      toast.info('Exportando dados...');
      
      const { data: clientes } = await supabase
        .from('clientes')
        .select('*')
        .order('id');

      const { data: compras } = await supabase
        .from('compras')
        .select('*')
        .order('id');

      if (!clientes && !compras) {
        toast.error('Nenhum dado encontrado para exportar');
        return;
      }

      // Criar CSV de clientes
      const csvClientes = [
        'ID,Nome,Email,Telefone,Endereço,Data Nascimento,Indicador,Ativo',
        ...clientes.map(c => 
          `${c.id},"${c.nome_completo}","${c.email || ''}","${c.telefone || ''}","${c.endereco || ''}","${c.data_nascimento || ''}","${c.indicador || ''}",${c.ativo}`
        )
      ].join('\n');

      // Criar CSV de compras
      const csvCompras = [
        'ID,Cliente ID,Data,Valor,Produto,Indicações',
        ...compras.map(c => 
          `${c.id},${c.cliente_id},"${c.data_compra}",${c.valor},"${c.produto || ''}",${c.indicacoes || 0}`
        )
      ].join('\n');

      // Download dos arquivos
      const downloadCSV = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      };

      downloadCSV(csvClientes, `clientes_${new Date().toISOString().split('T')[0]}.csv`);
      setTimeout(() => {
        downloadCSV(csvCompras, `compras_${new Date().toISOString().split('T')[0]}.csv`);
      }, 500);

      toast.success('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro ao exportar dados');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold mb-3">
            <span className="gradient-text">Configurações</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Ajuste as preferências e configurações do sistema
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* System Settings */}
          <div className="glass rounded-2xl p-8 animate-slide-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              Configurações do Sistema
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div>
                  <h3 className="font-semibold mb-1">Notificações</h3>
                  <p className="text-sm text-muted-foreground">Receber notificações de novas atividades</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications}
                    onChange={handleNotificationsToggle}
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div>
                  <h3 className="font-semibold mb-1">Modo Escuro</h3>
                  <p className="text-sm text-muted-foreground">Tema escuro ativado permanentemente</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                  <div className="w-11 h-6 bg-primary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all opacity-50 cursor-not-allowed"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div>
                  <h3 className="font-semibold mb-1">Atualização Automática</h3>
                  <p className="text-sm text-muted-foreground">Atualizar métricas automaticamente</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={autoUpdate}
                    onChange={handleAutoUpdateToggle}
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Database Settings */}
          <div className="glass rounded-2xl p-8 animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              Banco de Dados
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-xl">
                <h3 className="font-semibold mb-1">Status da Conexão</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Verifique o status da sua conexão com o banco de dados
                </p>
                <div className="mb-3 flex items-center gap-2">
                  {connectionStatus === 'checking' && (
                    <>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm">Verificando conexão...</span>
                    </>
                  )}
                  {connectionStatus === 'connected' && (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-500">Conectado</span>
                    </>
                  )}
                  {connectionStatus === 'error' && (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-red-500">Erro na conexão</span>
                    </>
                  )}
                </div>
                <button 
                  onClick={handleReconnect}
                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-semibold transition-all flex items-center gap-2 border border-primary/20"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reconectar
                </button>
              </div>

              <div className="p-4 bg-muted/30 rounded-xl">
                <h3 className="font-semibold mb-1">Backup de Dados</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Faça backup dos seus dados regularmente
                </p>
                <button 
                  onClick={handleExportData}
                  className="px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-sm font-semibold transition-all flex items-center gap-2 border border-accent/20"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Exportar Dados
                </button>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="glass rounded-2xl p-8 animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Sobre o Sistema
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Versão</span>
                <span className="font-semibold">2.0.0</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Última Atualização</span>
                <span className="font-semibold">{new Date().toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Desenvolvido com</span>
                <span className="font-semibold gradient-text">React + Supabase</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Config;
