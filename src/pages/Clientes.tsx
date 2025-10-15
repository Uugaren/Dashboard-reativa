import { useEffect } from "react";
import Layout from "@/components/Layout";

const Clientes = () => {
  useEffect(() => {
    // Initialize dashboard logic for clients
    if ((window as any).initDashboardLogic) {
      (window as any).initDashboardLogic();
    }
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold mb-3">
            Gerenciamento de <span className="gradient-text">Clientes</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Cadastre, importe e gerencie seus clientes
          </p>
        </div>

        {/* Forms Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Client Registration Form */}
          <div className="glass rounded-2xl p-8 animate-slide-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              Cadastro de Cliente
            </h2>
            
            <form id="clientForm" className="space-y-5">
              <div>
                <label htmlFor="nomeCompleto" className="block text-sm font-semibold mb-2">Nome Completo*</label>
                <input
                  type="text"
                  id="nomeCompleto"
                  required
                  className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Digite o nome completo"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-2">E-mail*</label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <label htmlFor="telefone" className="block text-sm font-semibold mb-2">Telefone*</label>
                  <input
                    type="tel"
                    id="telefone"
                    required
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="endereco" className="block text-sm font-semibold mb-2">Endereço</label>
                <input
                  type="text"
                  id="endereco"
                  className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>

              <div>
                <label htmlFor="dataAniversario" className="block text-sm font-semibold mb-2">Data de Aniversário</label>
                <input
                  type="date"
                  id="dataAniversario"
                  className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="ativo"
                  defaultChecked
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="ativo" className="text-sm font-semibold">Cliente Ativo</label>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-bold hover:shadow-primary transition-all flex items-center justify-center gap-3 group hover-lift"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Cadastrar Cliente
              </button>
            </form>
          </div>

          {/* Purchase Registration Form */}
          <div className="glass rounded-2xl p-8 animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              Registro de Compra
            </h2>

            <form id="purchaseForm" className="space-y-5">
              <input type="hidden" id="selectedClientId" />
              <div>
                <label htmlFor="clientSearchInput" className="block text-sm font-semibold mb-2">Buscar Cliente*</label>
                <input
                  type="text"
                  id="clientSearchInput"
                  placeholder="Digite o nome do cliente"
                  className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  autoComplete="off"
                />
                <div id="clientDropdown" className="hidden mt-2 max-h-48 overflow-y-auto glass rounded-xl"></div>
              </div>

              <div id="selectedClientInfo" className="hidden p-4 bg-primary/10 border border-primary/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary">
                    ?
                  </div>
                  <div>
                    <div className="font-semibold text-foreground" id="selectedClientName"></div>
                    <div className="text-xs text-muted-foreground" id="selectedClientEmail"></div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="produtoComprado" className="block text-sm font-semibold mb-2">Produto Comprado*</label>
                <input
                  type="text"
                  id="produtoComprado"
                  required
                  className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Digite o nome do produto"
                />
              </div>

              <div>
                <label htmlFor="valorCompra" className="block text-sm font-semibold mb-2">Valor da Compra*</label>
                <input
                  type="number"
                  id="valorCompra"
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="dataEntrega" className="block text-sm font-semibold mb-2">Data de Entrega*</label>
                <input
                  type="date"
                  id="dataEntrega"
                  required
                  className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-4 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-xl font-bold hover:shadow-accent transition-all flex items-center justify-center gap-3 group hover-lift"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Registrar Compra
              </button>
            </form>
          </div>
        </div>

        {/* Import Section */}
        <div className="glass rounded-2xl p-8 mb-12 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            Importação de Planilha
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="fileInput" className="block text-sm font-semibold mb-2">
                Selecione um arquivo CSV
              </label>
              <input
                type="file"
                id="fileInput"
                accept=".csv"
                className="w-full px-4 py-3 bg-input border border-border rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
              />
              <div id="fileInfo" className="mt-2 text-sm text-muted-foreground"></div>
            </div>

            <button
              id="importBtn"
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-bold hover:shadow-primary transition-all flex items-center gap-3 hover-lift"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Importar Clientes
            </button>
          </div>
        </div>

        {/* Clients List */}
        <div className="glass rounded-2xl p-8 animate-fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                Lista de Clientes
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-semibold" id="clientCount">0</span>
              </h2>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <input
                  type="text"
                  id="searchInput"
                  placeholder="Buscar por nome, email ou telefone..."
                  className="w-full px-4 py-3 pl-11 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <svg className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button
                  id="clearSearch"
                  className="hidden absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <select
                id="itemsPerPage"
                className="px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="10">10 por página</option>
                <option value="25">25 por página</option>
                <option value="50">50 por página</option>
              </select>
            </div>
          </div>

          <div id="searchInfo" className="hidden mb-4 text-sm text-muted-foreground"></div>

          <div id="clientsList"></div>

          <div id="paginationContainer" className="hidden mt-8 flex items-center justify-between">
            <div id="paginationInfo" className="text-sm text-muted-foreground font-semibold"></div>
            <div id="paginationControls" className="flex items-center gap-2"></div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div id="deleteModal" className="hidden fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="glass rounded-2xl p-8 max-w-md w-full mx-4 animate-scale-in">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold">Confirmar Exclusão</h3>
          </div>
          
          <p className="text-muted-foreground mb-6">
            Tem certeza que deseja excluir o cliente <strong id="deleteClientName"></strong>? Esta ação não pode ser desfeita.
          </p>
          
          <div className="flex gap-3">
            <button
              id="cancelDelete"
              className="flex-1 px-6 py-3 bg-muted/50 hover:bg-muted text-foreground rounded-xl font-semibold transition-all"
            >
              Cancelar
            </button>
            <button
              id="confirmDelete"
              className="flex-1 px-6 py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl font-semibold transition-all"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Clientes;
