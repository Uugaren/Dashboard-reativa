import { useEffect, useState } from 'react';
import { Activity, Users, MessageSquare, TrendingUp, Search, X, ChevronLeft, ChevronRight, Download, Upload, Settings, Database, CheckCircle2, AlertCircle } from 'lucide-react';

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Load external scripts
    const scripts = [
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
      'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
    ];

    scripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
    });

    // Initialize dashboard logic after scripts load
    setTimeout(() => {
      initializeDashboard();
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">OptiFlow</h1>
                <p className="text-[10px] text-muted-foreground">Dashboard de Gestão</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">Em tempo real</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <div className="mb-8 animate-fade-in">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 p-8 border border-primary/20 shadow-lg">
            <div className="absolute inset-0 bg-grid-white/5"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Bem-vindo ao <span className="gradient-text">OptiFlow</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
                Sistema completo de gerenciamento de clientes com acompanhamento inteligente de follow-up
              </p>
            </div>
            <div className="absolute top-4 right-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 right-20 w-24 h-24 bg-accent/10 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Configuration Section */}
        <div className="config-section mb-8 animate-slide-in">
          <div className="glass rounded-2xl p-6 border border-border/50 shadow-card hover-lift">
            <div className="config-header flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Configuração do Supabase</h3>
                <p className="text-xs text-muted-foreground">Configure sua conexão com o banco de dados</p>
              </div>
            </div>
            <div className="config-row grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-4 items-center">
              <input
                type="text"
                id="supabaseUrl"
                className="config-input px-4 py-3 bg-input border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="URL do Supabase"
              />
              <input
                type="password"
                id="supabaseKey"
                className="config-input px-4 py-3 bg-input border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Anon Key do Supabase"
              />
              <button
                id="connectBtn"
                className="btn-connect px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 shadow-primary flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                Conectar
              </button>
              <span
                id="connectionStatus"
                className="connection-status status-disconnected px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20"
              >
                <AlertCircle className="w-4 h-4" />
                Desconectado
              </span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div id="alertContainer" className="space-y-3 mb-8"></div>

        {/* Metrics Grid */}
        <div className="metrics-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {/* Total Clientes */}
          <div className="metric-card glass rounded-2xl p-6 border border-border/50 hover:border-primary/50 transition-all duration-500 hover-lift animate-fade-in group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                Total
              </div>
            </div>
            <div className="metric-value text-4xl font-bold text-foreground mb-2" id="totalClientes">
              0
            </div>
            <div className="metric-title text-muted-foreground text-sm font-medium">
              Clientes Cadastrados
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span>Atualizado agora</span>
              </div>
            </div>
          </div>

          {/* Clientes Ativos */}
          <div className="metric-card glass rounded-2xl p-6 border border-border/50 hover:border-accent/50 transition-all duration-500 hover-lift animate-fade-in group" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-accent" />
              </div>
              <div className="px-2 py-1 rounded-lg bg-green-500/10 text-green-500 text-xs font-semibold">
                Ativos
              </div>
            </div>
            <div className="metric-value text-4xl font-bold text-foreground mb-2" id="clientesAtivos">
              0
            </div>
            <div className="metric-title text-muted-foreground text-sm font-medium">
              Com Compras Registradas
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="w-3 h-3 text-green-500" />
                <span>Atualizado agora</span>
              </div>
            </div>
          </div>

          {/* Total Mensagens */}
          <div className="metric-card glass rounded-2xl p-6 border border-border/50 hover:border-primary/50 transition-all duration-500 hover-lift animate-fade-in group" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                Enviadas
              </div>
            </div>
            <div className="metric-value text-4xl font-bold text-foreground mb-2" id="totalMensagens">
              0
            </div>
            <div className="metric-title text-muted-foreground text-sm font-medium">
              Mensagens de Follow-up
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageSquare className="w-3 h-3 text-primary" />
                <span>Atualizado agora</span>
              </div>
            </div>
          </div>

          {/* Indicações */}
          <div className="metric-card glass rounded-2xl p-6 border border-border/50 hover:border-accent/50 transition-all duration-500 hover-lift animate-fade-in group" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div className="px-2 py-1 rounded-lg bg-accent/10 text-accent text-xs font-semibold">
                Novas
              </div>
            </div>
            <div className="metric-value text-4xl font-bold text-foreground mb-2" id="indicacoesObtidas">
              0
            </div>
            <div className="metric-title text-muted-foreground text-sm font-medium">
              Indicações Obtidas
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-accent" />
                <span>Atualizado agora</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="main-content grid grid-cols-1 xl:grid-cols-[450px_1fr] gap-6">
          {/* Forms Section */}
          <div className="space-y-6">
            {/* Client Form */}
            <div className="form-section glass rounded-2xl p-6 border border-border/50 shadow-card animate-slide-in">
              <div className="section-header flex items-start gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="section-title text-xl font-bold text-foreground">Cadastrar Cliente</h3>
                  <p className="section-subtitle text-muted-foreground text-sm mt-1">
                    Adicione novos clientes ao sistema
                  </p>
                </div>
              </div>

              {/* Import Section */}
              <div className="import-box bg-muted/30 border border-border rounded-xl p-5 mb-6 hover:border-primary/30 transition-all">
                <div className="import-header flex items-center gap-2 mb-3">
                  <Upload className="w-5 h-5 text-primary" />
                  <span className="import-title text-sm font-semibold text-foreground">Importação em Massa</span>
                </div>
                <p className="import-description text-xs text-muted-foreground mb-4">
                  Importe múltiplos clientes de uma vez usando Excel (.xlsx, .xls) ou CSV
                </p>
                <input type="file" id="fileInput" accept=".xlsx,.xls,.csv" className="hidden" />
                <button
                  type="button"
                  onClick={() => document.getElementById('fileInput')?.click()}
                  className="btn-primary w-full px-4 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-98 shadow-primary flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Selecionar Arquivo
                </button>
                <div id="fileInfo" className="file-info text-xs text-muted-foreground mt-3"></div>
                <details className="mt-4">
                  <summary className="text-primary text-xs cursor-pointer select-none hover:text-primary/80 transition-colors font-medium">
                    ℹ️ Formato esperado da planilha
                  </summary>
                  <div className="mt-3 p-4 bg-background/50 rounded-lg text-xs text-muted-foreground space-y-2">
                    <p className="font-medium text-foreground">Colunas obrigatórias:</p>
                    <ul className="ml-5 space-y-1 list-disc">
                      <li><strong className="text-foreground">nome_completo</strong></li>
                      <li><strong className="text-foreground">email</strong></li>
                      <li><strong className="text-foreground">telefone</strong> (formato: 5511999999999)</li>
                      <li><strong className="text-foreground">data_aniversario</strong> (YYYY-MM-DD)</li>
                      <li><strong className="text-muted-foreground">endereco</strong> (opcional)</li>
                    </ul>
                  </div>
                </details>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted-foreground">ou cadastre manualmente</span>
                </div>
              </div>

              {/* Client Form */}
              <form id="clientForm" className="space-y-4">
                <div className="form-group">
                  <label className="form-label block text-foreground text-sm font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Nome Completo <span className="required text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    id="nomeCompleto"
                    className="form-input w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label block text-foreground text-sm font-semibold mb-2">
                    ✉️ E-mail <span className="required text-accent">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="form-input w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="cliente@exemplo.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label block text-foreground text-sm font-semibold mb-2">
                    📞 Telefone <span className="required text-accent">*</span>
                  </label>
                  <input
                    type="tel"
                    id="telefone"
                    className="form-input w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="5511999999999"
                    required
                  />
                  <small className="text-muted-foreground text-xs mt-2 block">
                    Formato: 5511xxxxxxxxx (código do país + DDD + número)
                  </small>
                  <div id="phoneError" className="phone-error text-destructive text-xs mt-1 hidden"></div>
                </div>

                <div className="form-group">
                  <label className="form-label block text-foreground text-sm font-semibold mb-2">
                    🎂 Data de Aniversário <span className="required text-accent">*</span>
                  </label>
                  <input
                    type="date"
                    id="dataAniversario"
                    className="form-input w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label block text-foreground text-sm font-semibold mb-2">
                    📍 Endereço
                  </label>
                  <input
                    type="text"
                    id="endereco"
                    className="form-input w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full px-4 py-3.5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-98 shadow-primary"
                >
                  Cadastrar Cliente
                </button>
              </form>
            </div>

            {/* Purchase Form */}
            <div className="form-section glass rounded-2xl p-6 border border-border/50 shadow-card animate-slide-in" style={{ animationDelay: '0.1s' }}>
              <div className="section-header flex items-start gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="section-title text-xl font-bold text-foreground">Registrar Compra</h3>
                  <p className="section-subtitle text-muted-foreground text-sm mt-1">
                    Adicione uma nova transação
                  </p>
                </div>
              </div>

              <form id="purchaseForm" className="space-y-4">
                <div className="form-group">
                  <label className="form-label block text-foreground text-sm font-semibold mb-2">
                    🛍️ Cliente <span className="required text-accent">*</span>
                  </label>
                  <div className="client-select-container relative">
                    <input
                      type="text"
                      id="clientSearchInput"
                      className="client-search-input w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Digite o nome ou email..."
                      autoComplete="off"
                    />
                    <input type="hidden" id="selectedClientId" required />
                    <div id="clientDropdown" className="client-dropdown absolute top-full left-0 right-0 glass rounded-b-xl mt-1 max-h-[200px] overflow-y-auto z-50 hidden shadow-lg border border-border"></div>
                  </div>
                  <div id="selectedClientInfo" className="selected-client-info hidden mt-3 p-3 bg-muted/30 rounded-lg border border-border text-xs text-muted-foreground"></div>
                </div>

                <div className="form-group">
                  <label className="form-label block text-foreground text-sm font-semibold mb-2">
                    📦 Produto/Serviço <span className="required text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    id="produtoServico"
                    className="form-input w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Ex: Óculos de Grau, Lentes..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label block text-foreground text-sm font-semibold mb-2">
                    💰 Valor (R$) <span className="required text-accent">*</span>
                  </label>
                  <input
                    type="number"
                    id="valor"
                    className="form-input w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="0,00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label block text-foreground text-sm font-semibold mb-2">
                    📅 Data de Entrega <span className="required text-accent">*</span>
                  </label>
                  <input
                    type="date"
                    id="dataCompra"
                    className="form-input w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label block text-foreground text-sm font-semibold mb-2">
                    📝 Observações
                  </label>
                  <input
                    type="text"
                    id="observacoes"
                    className="form-input w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Informações adicionais..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full px-4 py-3.5 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-98 shadow-accent"
                >
                  Registrar Compra
                </button>
              </form>
            </div>
          </div>

          {/* Clients List Section */}
          <div className="list-section glass rounded-2xl p-6 border border-border/50 shadow-card animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <div className="section-header flex items-start justify-between mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="section-title text-xl font-bold text-foreground flex items-center gap-2">
                    Lista de Clientes
                    <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-bold" id="clientCount">0</span>
                  </h3>
                  <p className="section-subtitle text-muted-foreground text-sm mt-1">
                    Gerencie todos os clientes cadastrados
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>

            {/* Search Section */}
            <div className="search-section flex items-center gap-3 mb-6 p-4 bg-muted/30 border border-border rounded-xl">
              <Search className="w-5 h-5 text-primary flex-shrink-0" />
              <input
                type="text"
                id="searchInput"
                className="search-input flex-1 px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Buscar por nome, email, telefone ou endereço..."
              />
              <button
                id="clearSearch"
                className="btn-clear-search px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg text-xs font-semibold transition-all whitespace-nowrap hidden flex items-center gap-2"
              >
                <X className="w-3 h-3" />
                Limpar
              </button>
            </div>

            <div id="searchInfo" className="search-info text-muted-foreground text-xs mb-4 italic hidden px-4"></div>

            <div className="items-per-page flex items-center gap-3 mb-6 text-xs text-muted-foreground px-4">
              <label htmlFor="itemsPerPage" className="font-medium">Itens por página:</label>
              <select
                id="itemsPerPage"
                className="px-3 py-2 bg-input border border-border rounded-lg text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary font-medium"
              >
                <option value="5">5</option>
                <option value="10" selected>10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            <div id="clientsList" className="min-h-[400px]">
              <div className="empty-state text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/30 flex items-center justify-center">
                  <Users className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <div className="empty-title text-muted-foreground text-lg font-semibold mb-2">
                  Nenhum cliente cadastrado
                </div>
                <div className="empty-subtitle text-muted-foreground text-sm">
                  Conecte-se ao Supabase e comece adicionando clientes
                </div>
              </div>
            </div>

            <div className="pagination hidden justify-center items-center gap-4 mt-8 pt-6 border-t border-border" id="paginationContainer">
              <button className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="pagination-info text-muted-foreground text-sm font-medium" id="paginationInfo"></div>
              <div className="pagination-controls flex gap-2" id="paginationControls"></div>
              <button className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div id="deleteModal" className="modal fixed inset-0 bg-black/80 backdrop-blur-sm hidden items-center justify-center z-50 p-4">
        <div className="modal-content glass max-w-md w-full p-8 rounded-2xl border border-destructive/20 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div className="modal-title text-foreground text-2xl font-bold mb-4 text-center">
            Confirmar Exclusão
          </div>
          <div className="modal-body text-muted-foreground mb-8 text-center space-y-4">
            <p className="text-sm">Tem certeza que deseja excluir este cliente?</p>
            <p className="font-semibold text-foreground text-lg" id="clientToDelete"></p>
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-destructive text-xs font-medium">
                ⚠️ Esta ação é irreversível e excluirá todas as compras, mensagens e indicações relacionadas.
              </p>
            </div>
          </div>
          <div className="modal-actions flex gap-3">
            <button className="btn-cancel flex-1 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-semibold text-sm transition-all">
              Cancelar
            </button>
            <button className="btn-confirm flex-1 px-6 py-3 bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 text-destructive-foreground rounded-xl font-semibold text-sm transition-all shadow-lg">
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Initialize dashboard with original JavaScript logic
function initializeDashboard() {
  // @ts-ignore - JavaScript code from original file will be injected
  if (typeof window !== 'undefined') {
    (window as any).initDashboardLogic?.();
  }
}

export default Index;
