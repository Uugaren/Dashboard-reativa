import { useEffect, useState } from 'react';

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
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="header mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Painel de <span className="text-primary">Clientes</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mt-1">
              Gerencie seus clientes e suas compras de forma eficiente
            </p>
          </div>
        </div>
      </header>

      {/* Configuration Section */}
      <div className="config-section bg-card border border-border rounded-xl p-6 mb-6 shadow-lg animate-slide-in">
        <div className="config-header flex items-center gap-2 mb-4">
          <span className="text-xl">⚙️</span>
          <h2 className="text-lg font-semibold text-foreground">Configuração do Supabase</h2>
        </div>
        <div className="config-row grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-3 items-center">
          <input
            type="text"
            id="supabaseUrl"
            className="config-input px-4 py-2.5 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            placeholder="URL do Supabase"
          />
          <input
            type="password"
            id="supabaseKey"
            className="config-input px-4 py-2.5 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            placeholder="Anon Key do Supabase"
          />
          <button
            id="connectBtn"
            className="btn-connect px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium text-sm transition-all hover:scale-105 active:scale-95"
          >
            Conectar
          </button>
          <span
            id="connectionStatus"
            className="connection-status status-disconnected px-4 py-2 rounded-lg text-xs font-medium bg-destructive text-destructive-foreground"
          >
            Desconectado
          </span>
        </div>
      </div>

      {/* Alerts */}
      <div id="alertContainer" className="space-y-2 mb-6"></div>

      {/* Metrics Grid */}
      <div className="metrics-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="metric-card bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 animate-fade-in hover:shadow-lg hover:shadow-primary/10">
          <div className="metric-title text-muted-foreground text-xs font-medium uppercase tracking-wide mb-2">
            Total de Clientes
          </div>
          <div className="metric-value text-primary text-3xl font-bold mb-1" id="totalClientes">
            0
          </div>
          <div className="metric-subtitle text-muted-foreground text-xs">
            clientes cadastrados
          </div>
        </div>

        <div className="metric-card bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 animate-fade-in hover:shadow-lg hover:shadow-primary/10" style={{ animationDelay: '0.1s' }}>
          <div className="metric-title text-muted-foreground text-xs font-medium uppercase tracking-wide mb-2">
            Clientes Ativos
          </div>
          <div className="metric-value text-primary text-3xl font-bold mb-1" id="clientesAtivos">
            0
          </div>
          <div className="metric-subtitle text-muted-foreground text-xs">
            com compras registradas
          </div>
        </div>

        <div className="metric-card bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 animate-fade-in hover:shadow-lg hover:shadow-primary/10" style={{ animationDelay: '0.2s' }}>
          <div className="metric-title text-muted-foreground text-xs font-medium uppercase tracking-wide mb-2">
            Total de Mensagens Enviadas
          </div>
          <div className="metric-value text-primary text-3xl font-bold mb-1" id="totalMensagens">
            0
          </div>
          <div className="metric-subtitle text-muted-foreground text-xs">
            mensagens enviadas
          </div>
        </div>

        <div className="metric-card bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 animate-fade-in hover:shadow-lg hover:shadow-primary/10" style={{ animationDelay: '0.3s' }}>
          <div className="metric-title text-muted-foreground text-xs font-medium uppercase tracking-wide mb-2">
            Indicações Obtidas
          </div>
          <div className="metric-value text-primary text-3xl font-bold mb-1" id="indicacoesObtidas">
            0
          </div>
          <div className="metric-subtitle text-muted-foreground text-xs">
            novas indicações
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
        {/* Form Section */}
        <div className="form-section bg-card border border-border rounded-xl p-6 shadow-lg animate-slide-in">
          <div className="section-header flex items-start gap-3 mb-6">
            <div className="section-icon text-2xl">👤</div>
            <div>
              <h3 className="section-title text-xl font-semibold text-foreground">Cadastrar Cliente</h3>
              <p className="section-subtitle text-muted-foreground text-sm mt-1">
                Adicione as informações do novo cliente
              </p>
            </div>
          </div>

          {/* Import Section */}
          <div className="import-box bg-input border border-border rounded-lg p-4 mb-6">
            <div className="import-header flex items-center gap-2 mb-2">
              <span className="text-lg">📊</span>
              <span className="import-title text-sm font-medium text-foreground">Importar Clientes</span>
            </div>
            <p className="import-description text-xs text-muted-foreground mb-3">
              Importe múltiplos clientes de uma vez usando Excel (.xlsx, .xls) ou CSV
            </p>
            <input type="file" id="fileInput" accept=".xlsx,.xls,.csv" className="hidden" />
            <button
              type="button"
              onClick={() => document.getElementById('fileInput')?.click()}
              className="btn-primary w-full px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium text-sm transition-all mb-2"
            >
              📂 Selecionar Arquivo
            </button>
            <div id="fileInfo" className="file-info text-xs text-muted-foreground"></div>
            <details className="mt-3">
              <summary className="text-primary text-xs cursor-pointer select-none hover:text-primary/80 transition-colors">
                ℹ️ Formato esperado da planilha
              </summary>
              <div className="mt-3 p-3 bg-background rounded-md text-xs text-muted-foreground">
                <p className="mb-2">A planilha deve conter as seguintes colunas (na primeira linha):</p>
                <ul className="ml-5 space-y-1 list-disc">
                  <li><strong className="text-foreground">nome_completo</strong> (obrigatório)</li>
                  <li><strong className="text-foreground">email</strong> (obrigatório)</li>
                  <li><strong className="text-foreground">telefone</strong> (obrigatório - formato: 5511999999999)</li>
                  <li><strong className="text-foreground">data_aniversario</strong> (obrigatório - formato: YYYY-MM-DD ou DD/MM/YYYY)</li>
                  <li><strong className="text-foreground">endereco</strong> (opcional)</li>
                </ul>
                <p className="mt-2 text-primary">
                  ⚠️ O telefone deve estar no formato: 5511999999999 (código país + DDD + número)
                </p>
              </div>
            </details>
          </div>

          <div className="border-t border-border pt-6 mb-6">
            <p className="text-muted-foreground text-sm mb-4">Ou cadastre manualmente:</p>

            {/* Client Form */}
            <form id="clientForm" className="space-y-4">
              <div className="form-group">
                <label className="form-label block text-foreground text-sm font-medium mb-2">
                  👤 Nome Completo <span className="required text-primary">*</span>
                </label>
                <input
                  type="text"
                  id="nomeCompleto"
                  className="form-input w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="Digite o nome do cliente"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label block text-foreground text-sm font-medium mb-2">
                  ✉️ E-mail <span className="required text-primary">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-input w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="cliente@exemplo.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label block text-foreground text-sm font-medium mb-2">
                  📞 Telefone <span className="required text-primary">*</span>
                </label>
                <input
                  type="tel"
                  id="telefone"
                  className="form-input w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="5511999999999"
                  required
                />
                <small className="text-muted-foreground text-xs mt-1 block">
                  Formato: 5511xxxxxxxxx (código do país + DDD + número)
                </small>
                <div id="phoneError" className="phone-error text-destructive text-xs mt-1 hidden"></div>
              </div>

              <div className="form-group">
                <label className="form-label block text-foreground text-sm font-medium mb-2">
                  🎂 Data de Aniversário <span className="required text-primary">*</span>
                </label>
                <input
                  type="date"
                  id="dataAniversario"
                  className="form-input w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label block text-foreground text-sm font-medium mb-2">
                  📍 Endereço
                </label>
                <input
                  type="text"
                  id="endereco"
                  className="form-input w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold text-sm transition-all hover:scale-[1.02] active:scale-95"
              >
                Cadastrar Cliente
              </button>
            </form>
          </div>

          {/* Purchase Form */}
          <div className="mt-8">
            <div className="section-header flex items-start gap-3 mb-6">
              <div className="section-icon text-2xl">🛒</div>
              <div>
                <h3 className="section-title text-xl font-semibold text-foreground">Registrar Compra</h3>
                <p className="section-subtitle text-muted-foreground text-sm mt-1">
                  Adicione uma nova compra para um cliente
                </p>
              </div>
            </div>

            <form id="purchaseForm" className="space-y-4">
              <div className="form-group">
                <label className="form-label block text-foreground text-sm font-medium mb-2">
                  🛍️ Cliente <span className="required text-primary">*</span>
                </label>
                <div className="client-select-container relative">
                  <input
                    type="text"
                    id="clientSearchInput"
                    className="client-search-input w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Digite o nome ou email do cliente..."
                    autoComplete="off"
                  />
                  <input type="hidden" id="selectedClientId" required />
                  <div id="clientDropdown" className="client-dropdown absolute top-full left-0 right-0 bg-card border border-border rounded-b-lg mt-[-1px] max-h-[200px] overflow-y-auto z-50 hidden shadow-lg"></div>
                </div>
                <div id="selectedClientInfo" className="selected-client-info hidden mt-2 p-3 bg-input rounded-lg border border-border text-xs text-muted-foreground"></div>
              </div>

              <div className="form-group">
                <label className="form-label block text-foreground text-sm font-medium mb-2">
                  📦 Produto/Serviço <span className="required text-primary">*</span>
                </label>
                <input
                  type="text"
                  id="produtoServico"
                  className="form-input w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="Digite o produto ou serviço adquirido"
                  required
                />
                <small className="text-muted-foreground text-xs mt-1 block">
                  Ex: Óculos de Grau, Lentes de Contato, Óculos de Sol, etc.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label block text-foreground text-sm font-medium mb-2">
                  💰 Valor (R$) <span className="required text-primary">*</span>
                </label>
                <input
                  type="number"
                  id="valor"
                  className="form-input w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label block text-foreground text-sm font-medium mb-2">
                  📅 Data de entrega <span className="required text-primary">*</span>
                </label>
                <input
                  type="date"
                  id="dataCompra"
                  className="form-input w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label block text-foreground text-sm font-medium mb-2">
                  📝 Observações
                </label>
                <input
                  type="text"
                  id="observacoes"
                  className="form-input w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="Observações sobre a compra"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold text-sm transition-all hover:scale-[1.02] active:scale-95"
              >
                Registrar Compra
              </button>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="list-section bg-card border border-border rounded-xl p-6 shadow-lg animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <div className="section-header flex items-start gap-3 mb-6">
            <div className="section-icon text-2xl">📋</div>
            <div>
              <h3 className="section-title text-xl font-semibold text-foreground">
                Lista de Clientes (<span id="clientCount">0</span>)
              </h3>
              <p className="section-subtitle text-muted-foreground text-sm mt-1">
                Todos os clientes cadastrados e suas informações
              </p>
            </div>
          </div>

          {/* Search Section */}
          <div className="search-section flex items-center gap-3 mb-4 p-4 bg-input border border-border rounded-lg">
            <div className="text-primary text-lg">🔍</div>
            <input
              type="text"
              id="searchInput"
              className="search-input flex-1 px-3 py-2 bg-card border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="Buscar por nome, email, telefone ou endereço..."
            />
            <button
              id="clearSearch"
              className="btn-clear-search px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-md text-xs font-medium transition-all whitespace-nowrap hidden"
            >
              Limpar busca
            </button>
          </div>

          <div id="searchInfo" className="search-info text-muted-foreground text-xs mb-3 italic hidden"></div>

          <div className="items-per-page flex items-center gap-3 mb-4 text-xs text-muted-foreground">
            <label htmlFor="itemsPerPage">Clientes por página:</label>
            <select
              id="itemsPerPage"
              className="px-3 py-1.5 bg-input border border-border rounded-md text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="5">5</option>
              <option value="10" selected>10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>

          <div id="clientsList">
            <div className="empty-state text-center py-12">
              <div className="empty-icon text-6xl mb-4 opacity-20">👥</div>
              <div className="empty-title text-muted-foreground text-base mb-2">Nenhum cliente cadastrado</div>
              <div className="empty-subtitle text-muted-foreground text-sm">
                Conecte-se ao Supabase e comece adicionando um novo cliente
              </div>
            </div>
          </div>

          <div className="pagination hidden justify-center items-center gap-3 mt-6 py-4" id="paginationContainer">
            <div className="pagination-info text-muted-foreground text-xs" id="paginationInfo"></div>
            <div className="pagination-controls flex gap-2" id="paginationControls"></div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div id="deleteModal" className="modal fixed inset-0 bg-black/80 backdrop-blur-sm hidden items-center justify-center z-50">
        <div className="modal-content bg-card p-8 rounded-xl max-w-md w-[90%] border border-border shadow-2xl animate-fade-in">
          <div className="modal-title text-primary text-xl font-semibold mb-4 text-center">
            ⚠️ Confirmar Exclusão
          </div>
          <div className="modal-body text-foreground mb-6 text-center space-y-3">
            <p>Tem certeza que deseja excluir este cliente?</p>
            <p className="font-semibold" id="clientToDelete"></p>
            <p className="text-destructive text-xs">
              Esta ação não pode ser desfeita e também excluirá todas as compras, mensagens e indicações relacionadas.
            </p>
          </div>
          <div className="modal-actions flex gap-3 justify-center">
            <button className="btn-cancel px-6 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium text-sm transition-all">
              Cancelar
            </button>
            <button className="btn-confirm px-6 py-2.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg font-medium text-sm transition-all">
              Excluir Cliente
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
