// Original Dashboard Logic - Keep this file to maintain all JavaScript functionality
// This is extracted from the original index.html to work with React

window.initDashboardLogic = function() {
  // Variáveis globais
  let supabase = null;
  let isConnected = false;
  let allClients = [];
  let filteredClients = [];
  let currentPage = 1;
  let itemsPerPage = 10;
  let clientToDeleteId = null;
  let searchTerm = '';
  let selectedClientId = null;

  // Elementos DOM
  const supabaseUrlInput = document.getElementById('supabaseUrl');
  const supabaseKeyInput = document.getElementById('supabaseKey');
  const connectBtn = document.getElementById('connectBtn');
  const connectionStatus = document.getElementById('connectionStatus');
  const alertContainer = document.getElementById('alertContainer');
  const clientForm = document.getElementById('clientForm');
  const purchaseForm = document.getElementById('purchaseForm');
  const clientsList = document.getElementById('clientsList');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearch');
  const searchInfo = document.getElementById('searchInfo');
  const itemsPerPageSelect = document.getElementById('itemsPerPage');
  const clientSearchInput = document.getElementById('clientSearchInput');
  const clientDropdown = document.getElementById('clientDropdown');
  const selectedClientInfo = document.getElementById('selectedClientInfo');
  const fileInput = document.getElementById('fileInput');
  const fileInfo = document.getElementById('fileInfo');
  const deleteModal = document.getElementById('deleteModal');

  // Função para mostrar alertas
  function showAlert(message, type = 'success') {
    // Verificar se alertContainer existe, senão usar console
    if (!alertContainer) {
      console.log(`${type === 'success' ? '✓' : '✗'} ${message}`);
      return;
    }
    
    const alert = document.createElement('div');
    const iconSvg = type === 'success' 
      ? '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>'
      : '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
    
    alert.className = `alert px-5 py-4 rounded-xl mb-3 text-sm font-semibold animate-fade-in flex items-center gap-3 border shadow-lg ${
      type === 'success' 
        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
        : 'bg-red-500/10 text-red-400 border-red-500/20'
    }`;
    alert.innerHTML = `${iconSvg}<span>${message}</span>`;
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-10px)';
      alert.style.transition = 'all 0.3s ease-out';
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  }

  // Função para conectar ao Supabase
  async function connectToSupabase() {
    const url = supabaseUrlInput.value.trim();
    const key = supabaseKeyInput.value.trim();

    if (!url || !key) {
      showAlert('Por favor, preencha URL e Key do Supabase', 'error');
      return;
    }

    try {
      connectBtn.innerHTML = '<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Conectando...';
      connectBtn.disabled = true;
      connectionStatus.innerHTML = '<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Conectando...';
      connectionStatus.className = 'connection-status px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse-glow';

      supabase = window.supabase.createClient(url, key);
      
      const { data, error } = await supabase.from('clientes').select('count', { count: 'exact' });

      if (error) throw error;

      // Salvar credenciais no localStorage para persistência
      localStorage.setItem('supabaseUrl', url);
      localStorage.setItem('supabaseKey', key);

      isConnected = true;
      window.supabaseClient = supabase; // Expor globalmente para uso em outras páginas
      connectionStatus.innerHTML = '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Conectado';
      connectionStatus.className = 'connection-status px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 bg-green-500/10 text-green-400 border border-green-500/20';
      connectBtn.innerHTML = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/></svg>Conectar';
      connectBtn.disabled = false;
      showAlert('Conectado ao Supabase com sucesso!', 'success');
      
      // Redirecionar para dashboard após conexão bem-sucedida
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
      
      await loadClients();
      await loadMetrics();
    } catch (error) {
      isConnected = false;
      connectionStatus.innerHTML = '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>Erro';
      connectionStatus.className = 'connection-status px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20';
      connectBtn.innerHTML = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/></svg>Conectar';
      connectBtn.disabled = false;
      showAlert('Erro ao conectar: ' + error.message, 'error');
    }
  }

  // Função para restaurar conexão salva
  function restoreConnection() {
    const savedUrl = localStorage.getItem('supabaseUrl');
    const savedKey = localStorage.getItem('supabaseKey');

    if (savedUrl && savedKey) {
      supabase = window.supabase.createClient(savedUrl, savedKey);
      isConnected = true;
      window.supabaseClient = supabase; // Expor globalmente
      
      // Preencher os campos de input se existirem
      if (supabaseUrlInput) supabaseUrlInput.value = savedUrl;
      if (supabaseKeyInput) supabaseKeyInput.value = savedKey;
      
      // Atualizar status de conexão se os elementos existirem
      if (connectionStatus) {
        connectionStatus.innerHTML = '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Conectado';
        connectionStatus.className = 'connection-status px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 bg-green-500/10 text-green-400 border border-green-500/20';
      }
      
      // Carregar dados se não estiver na página de login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        loadClients();
        loadMetrics();
      }
    }
  }

  // Função para carregar métricas
  async function loadMetrics() {
    if (!isConnected) return;

    try {
      const { count: totalClientes, error: totalError } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });

      const { data: activesData } = await supabase
        .from('compras')
        .select('cliente_id')
        .not('cliente_id', 'is', null);

      const uniqueActiveClients = activesData ? new Set(activesData.map(c => c.cliente_id)).size : 0;

      const { count: totalMensagens, error: messagesError } = await supabase
        .from('mensagens')
        .select('*', { count: 'exact', head: true });

      const { count: totalIndicacoes, error: indicationsError } = await supabase
        .from('indicacoes')
        .select('*', { count: 'exact', head: true });

      const totalClientesEl = document.getElementById('totalClientes');
      const clientesAtivosEl = document.getElementById('clientesAtivos');
      const totalMensagensEl = document.getElementById('totalMensagens');
      const indicacoesObtidasEl = document.getElementById('indicacoesObtidas');

      if (totalClientesEl) totalClientesEl.textContent = totalClientes || 0;
      if (clientesAtivosEl) clientesAtivosEl.textContent = uniqueActiveClients;
      if (totalMensagensEl) totalMensagensEl.textContent = totalMensagens || 0;
      if (indicacoesObtidasEl) indicacoesObtidasEl.textContent = totalIndicacoes || 0;
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  }

  // Função para carregar clientes
  async function loadClients() {
    if (!isConnected) return;

    try {
      const { data, error } = await supabase
        .from('clientes_completos')
        .select('*')
        .order('data_cadastro', { ascending: false });

      if (error) throw error;

      allClients = data || [];
      filteredClients = allClients;
      displayClients();
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      showAlert('Erro ao carregar clientes: ' + error.message, 'error');
    }
  }

  // Função para exibir clientes com paginação
  function displayClients() {
    if (!clientsList) return; // Exit if element doesn't exist
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const clientsToShow = filteredClients.slice(start, end);

    const clientCountEl = document.getElementById('clientCount');
    if (clientCountEl) {
      clientCountEl.textContent = filteredClients.length;
    }

    if (clientsToShow.length === 0) {
      clientsList.innerHTML = `
        <div class="empty-state text-center py-16">
          <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/30 flex items-center justify-center">
            <svg class="w-10 h-10 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <div class="empty-title text-muted-foreground text-lg font-semibold mb-2">
            ${searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </div>
          <div class="empty-subtitle text-muted-foreground text-sm">
            ${searchTerm ? 'Tente buscar com outros termos' : 'Conecte-se ao Supabase e comece adicionando clientes'}
          </div>
        </div>
      `;
      const paginationContainer = document.getElementById('paginationContainer');
      if (paginationContainer) {
        paginationContainer.style.display = 'none';
      }
      return;
    }

    clientsList.innerHTML = clientsToShow.map((client, index) => `
      <a href="/perfil?id=${client.id}" class="block">
        <div class="client-item glass rounded-xl p-5 mb-4 relative hover:border-primary/30 transition-all duration-300 animate-fade-in group hover-lift cursor-pointer" style="animation-delay: ${index * 0.05}s">
          <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="relative">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-lg text-primary">
                  ${client.nome_completo.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div class="client-name text-foreground font-bold text-lg mb-1">${highlightText(client.nome_completo)}</div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                      ${client.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-2 min-w-[100px]">
                <button 
                  class="px-3 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-accent/20 w-full" 
                  onclick="event.preventDefault(); event.stopPropagation(); window.location.href='/conversas?id=${client.id}'"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                  </svg>
                  Conversas
                </button>
                <button 
                  class="btn-edit px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-primary/20 w-full" 
                  onclick="event.preventDefault(); event.stopPropagation(); openEditModal('${client.id}')"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Editar
                </button>
                <button 
                  class="btn-delete px-3 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-destructive/20 w-full" 
                  onclick="event.preventDefault(); event.stopPropagation(); openDeleteModal('${client.id}', '${client.nome_completo}')"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Excluir
                </button>
              </div>
            </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <svg class="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span class="truncate">${highlightText(client.email)}</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <svg class="w-4 h-4 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <span>${highlightText(client.telefone)}</span>
            </div>
            ${client.endereco ? `
              <div class="flex items-center gap-2 text-sm text-muted-foreground md:col-span-2">
                <svg class="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="truncate">${highlightText(client.endereco)}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="flex items-center justify-between pt-4 border-t border-border/50">
            <div class="flex items-center gap-4 text-xs text-muted-foreground">
              <div class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                </svg>
                <span>${client.data_aniversario ? new Date(client.data_aniversario + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informado'}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span>Desde ${new Date(client.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    updatePagination();
  }

  // Função para destacar texto nas buscas
  function highlightText(text) {
    if (!searchTerm || !text) return text || '';
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-primary text-primary-foreground px-1 rounded">$1</mark>');
  }

  // Função para atualizar paginação
  function updatePagination() {
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
    const paginationContainer = document.getElementById('paginationContainer');
    const paginationInfo = document.getElementById('paginationInfo');
    const paginationControls = document.getElementById('paginationControls');

    if (!paginationContainer) return; // Exit if element doesn't exist

    if (totalPages <= 1) {
      paginationContainer.style.display = 'none';
      return;
    }

    paginationContainer.style.display = 'flex';
    if (paginationInfo) {
      paginationInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    }

    let controls = `
      <button 
        class="btn-page px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${currentPage === 1 ? 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50' : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20'}" 
        onclick="goToPage(${currentPage - 1})" 
        ${currentPage === 1 ? 'disabled' : ''}
      >
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Anterior
      </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        controls += `
          <button 
            class="btn-page px-4 py-2 rounded-lg text-xs font-bold transition-all ${i === currentPage ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-primary' : 'bg-muted/50 text-foreground hover:bg-primary/10 hover:text-primary border border-border'}" 
            onclick="goToPage(${i})"
          >
            ${i}
          </button>
        `;
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        controls += '<span class="px-2 text-muted-foreground text-sm">...</span>';
      }
    }

    controls += `
      <button 
        class="btn-page px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${currentPage === totalPages ? 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50' : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20'}" 
        onclick="goToPage(${currentPage + 1})" 
        ${currentPage === totalPages ? 'disabled' : ''}
      >
        Próxima
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    `;

    if (paginationControls) {
      paginationControls.innerHTML = controls;
    }
  }

  // Função para ir para página
  window.goToPage = function(page) {
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      displayClients();
    }
  };

  // Função de busca
  function performSearch() {
    searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm) {
      filteredClients = allClients.filter(client => {
        return (
          client.nome_completo?.toLowerCase().includes(searchTerm) ||
          client.email?.toLowerCase().includes(searchTerm) ||
          client.telefone?.toLowerCase().includes(searchTerm) ||
          client.endereco?.toLowerCase().includes(searchTerm)
        );
      });
      if (clearSearchBtn) clearSearchBtn.style.display = 'block';
      if (searchInfo) {
        searchInfo.style.display = 'block';
        searchInfo.textContent = `Encontrados ${filteredClients.length} cliente(s) para "${searchTerm}"`;
      }
    } else {
      filteredClients = allClients;
      if (clearSearchBtn) clearSearchBtn.style.display = 'none';
      if (searchInfo) searchInfo.style.display = 'none';
    }

    currentPage = 1;
    displayClients();
  }

  // Função para limpar busca
  function clearSearch() {
    if (searchInput) searchInput.value = '';
    searchTerm = '';
    filteredClients = allClients;
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';
    if (searchInfo) searchInfo.style.display = 'none';
    currentPage = 1;
    displayClients();
  }

  // Modal de exclusão
  window.openDeleteModal = function(id, name) {
    clientToDeleteId = id;
    const deleteClientNameEl = document.getElementById('deleteClientName');
    if (deleteClientNameEl) {
      deleteClientNameEl.textContent = name;
    }
    if (deleteModal) {
      deleteModal.style.display = 'flex';
    }
  };

  window.closeDeleteModal = function() {
    if (deleteModal) {
      deleteModal.style.display = 'none';
    }
    clientToDeleteId = null;
  };

  window.confirmDelete = async function() {
    if (!clientToDeleteId || !isConnected) return;

    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clientToDeleteId);

      if (error) throw error;

      showAlert('Cliente excluído com sucesso!', 'success');
      closeDeleteModal();
      await loadClients();
      await loadMetrics();
    } catch (error) {
      showAlert('Erro ao excluir cliente: ' + error.message, 'error');
    }
  };

  // Modal de edição
  window.openEditModal = async function(id) {
    const editModal = document.getElementById('editModal');
    if (!editModal || !isConnected) return;

    try {
      // Carregar dados do cliente
      const { data: clientData, error: clientError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();

      if (clientError) throw clientError;

      // Carregar compras do cliente
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('compras')
        .select('*')
        .eq('cliente_id', id)
        .order('data_compra', { ascending: false });

      if (purchasesError) throw purchasesError;

      // Preencher formulário
      document.getElementById('editClientId').value = clientData.id;
      document.getElementById('editNomeCompleto').value = clientData.nome_completo;
      document.getElementById('editEmail').value = clientData.email;
      document.getElementById('editTelefone').value = clientData.telefone;
      document.getElementById('editEndereco').value = clientData.endereco || '';
      document.getElementById('editDataAniversario').value = clientData.data_aniversario || '';
      document.getElementById('editAtivo').checked = clientData.ativo;

      // Exibir compras
      const purchasesList = document.getElementById('editPurchasesList');
      if (purchasesData && purchasesData.length > 0) {
        purchasesList.innerHTML = purchasesData.map(purchase => `
          <div class="p-4 bg-muted/30 rounded-lg border border-border">
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1">
                <div class="font-semibold text-foreground">${purchase.produto_servico}</div>
                <div class="text-sm text-muted-foreground mt-1">
                  Valor: R$ ${purchase.valor?.toFixed(2) || '0.00'}
                </div>
                <div class="text-xs text-muted-foreground mt-1">
                  Entrega: ${purchase.data_compra ? new Date(purchase.data_compra + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não definida'}
                </div>
              </div>
              <button 
                class="px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg text-xs font-semibold transition-all border border-destructive/20"
                onclick="deletePurchase('${purchase.id}')"
              >
                Excluir
              </button>
            </div>
          </div>
        `).join('');
      } else {
        purchasesList.innerHTML = '<div class="text-center text-muted-foreground text-sm py-4">Nenhuma compra registrada</div>';
      }

      editModal.style.display = 'flex';
    } catch (error) {
      showAlert('Erro ao carregar dados: ' + error.message, 'error');
    }
  };

  window.closeEditModal = function() {
    const editModal = document.getElementById('editModal');
    if (editModal) {
      editModal.style.display = 'none';
    }
  };

  window.deletePurchase = async function(purchaseId) {
    if (!confirm('Deseja realmente excluir esta compra?')) return;

    try {
      const { error } = await supabase
        .from('compras')
        .delete()
        .eq('id', purchaseId);

      if (error) throw error;

      showAlert('Compra excluída com sucesso!', 'success');
      
      // Recarregar modal
      const clientId = document.getElementById('editClientId').value;
      if (clientId) {
        await openEditModal(clientId);
      }
      
      await loadMetrics();
    } catch (error) {
      showAlert('Erro ao excluir compra: ' + error.message, 'error');
    }
  };

  // Cadastro de cliente
  if (clientForm) {
    clientForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!isConnected) {
      showAlert('Conecte-se ao Supabase primeiro', 'error');
      return;
    }

    const nome = document.getElementById('nomeCompleto').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const dataAniversario = document.getElementById('dataAniversario').value;
    const endereco = document.getElementById('endereco').value.trim();

    try {
      const primeiroNome = nome.split(' ')[0];
      const [ano, mes, dia] = dataAniversario.split('-');
      const mesDia = `${mes}-${dia}`;

      const { error } = await supabase
        .from('clientes')
        .insert([{
          nome_completo: nome,
          email: email,
          telefone: telefone,
          data_aniversario: dataAniversario,
          mes_dia_aniversario: mesDia,
          primeiro_nome: primeiroNome,
          endereco: endereco || null,
          ativo: true
        }]);

      if (error) throw error;

      showAlert('Cliente cadastrado com sucesso!', 'success');
      clientForm.reset();
      await loadClients();
      await loadMetrics();
    } catch (error) {
      showAlert('Erro ao cadastrar cliente: ' + error.message, 'error');
    }
    });
  }

  // Registrar compra
  if (purchaseForm) {
    purchaseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!isConnected) {
      showAlert('Conecte-se ao Supabase primeiro', 'error');
      return;
    }

    const clienteId = document.getElementById('selectedClientId').value;
    const produto = document.getElementById('produtoComprado').value.trim();
    const valor = parseFloat(document.getElementById('valorCompra').value);
    const dataEntrega = document.getElementById('dataEntrega').value;

    if (!clienteId) {
      showAlert('Selecione um cliente', 'error');
      return;
    }

    if (!produto) {
      showAlert('Digite o produto comprado', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('compras')
        .insert([{
          cliente_id: clienteId,
          produto_servico: produto,
          valor: valor,
          data_compra: dataEntrega
        }]);

      if (error) throw error;

      showAlert('Compra registrada com sucesso!', 'success');
      purchaseForm.reset();
      const selectedClientIdInput = document.getElementById('selectedClientId');
      const clientSearchInputEl = document.getElementById('clientSearchInput');
      if (selectedClientIdInput) selectedClientIdInput.value = '';
      if (clientSearchInputEl) clientSearchInputEl.value = '';
      if (selectedClientInfo) selectedClientInfo.style.display = 'none';
      await loadMetrics();
    } catch (error) {
      showAlert('Erro ao registrar compra: ' + error.message, 'error');
    }
    });
  }

  // Busca de cliente para compra
  if (clientSearchInput) {
    clientSearchInput.addEventListener('input', async function() {
    const term = this.value.trim().toLowerCase();
    
    if (term.length < 2) {
      if (clientDropdown) clientDropdown.style.display = 'none';
      return;
    }

    if (!isConnected) {
      showAlert('Conecte-se ao Supabase primeiro', 'error');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .or(`nome_completo.ilike.%${term}%,email.ilike.%${term}%`)
        .limit(10);

      if (error) throw error;

      if (clientDropdown) {
        if (data.length === 0) {
          clientDropdown.innerHTML = '<div class="no-clients-found p-3 text-muted-foreground text-xs text-center italic">Nenhum cliente encontrado</div>';
        } else {
          clientDropdown.innerHTML = data.map((client, index) => `
          <div class="client-option p-4 cursor-pointer border-b border-border last:border-0 hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/5 transition-all group" onclick="selectClient('${client.id}', '${client.nome_completo}', '${client.email}', '${client.telefone}')">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-sm text-primary group-hover:scale-110 transition-transform">
                ${client.nome_completo.charAt(0).toUpperCase()}
              </div>
              <div class="flex-1 min-w-0">
                <div class="client-option-name text-foreground font-semibold mb-0.5 truncate">${client.nome_completo}</div>
                <div class="client-option-details text-muted-foreground text-xs flex items-center gap-2">
                  <span class="truncate">${client.email}</span>
                  <span class="text-border">•</span>
                  <span>${client.telefone}</span>
                </div>
              </div>
            </div>
          </div>
        `).join('');
        }
        
        clientDropdown.style.display = 'block';
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
    });
  }

  window.selectClient = function(id, nome, email, telefone) {
    const selectedClientIdInput = document.getElementById('selectedClientId');
    const clientSearchInputEl = document.getElementById('clientSearchInput');
    
    if (selectedClientIdInput) {
      selectedClientIdInput.value = id;
    }
    if (clientSearchInputEl) {
      clientSearchInputEl.value = nome;
    }
    if (clientDropdown) {
      clientDropdown.style.display = 'none';
    }
    if (selectedClientInfo) {
      selectedClientInfo.textContent = `Cliente selecionado: ${nome} (${email})`;
      selectedClientInfo.style.display = 'block';
    }
  };

  // Importação de planilha
  if (fileInput) {
    fileInput.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!isConnected) {
      showAlert('Conecte-se ao Supabase primeiro', 'error');
      return;
    }

    fileInfo.textContent = `Processando: ${file.name}...`;
    fileInfo.style.color = '#FE6E4B';

    try {
      let registros = [];
      
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        registros = result.data;
      } else {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        registros = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      }

      if (registros.length === 0) {
        showAlert('Nenhum registro válido encontrado no arquivo', 'error');
        fileInfo.textContent = '';
        return;
      }

      console.log('=== DEBUG PROCESSAMENTO ===');
      console.log('Total de linhas:', registros.length);
      console.log('Primeira linha:', registros[0]);
      console.log('Colunas disponíveis:', Object.keys(registros[0]));

      // Mapear colunas (aceitar variações de nome)
      const clients = registros.map((row, index) => {
        // Normalizar nomes de colunas
        const normalizedRow = {};
        Object.keys(row).forEach(key => {
          normalizedRow[key.toLowerCase().trim().replace(/\s+/g, '_')] = row[key];
        });

        console.log(`Linha ${index}:`, normalizedRow);

        // Extrair dados do cliente
        const nome = normalizedRow['nome_completo'] || normalizedRow['nome'] || '';
        const email = normalizedRow['email'] || normalizedRow['e-mail'] || '';
        const telefone = normalizedRow['telefone'] || normalizedRow['phone'] || '';
        let dataAniversario = normalizedRow['data_aniversario'] || normalizedRow['aniversario'] || '';
        const endereco = normalizedRow['endereco'] || normalizedRow['endereço'] || '';

        // Extrair dados da compra
        const produtoServico = normalizedRow['produto_servico'] || normalizedRow['produto'] || normalizedRow['servico'] || '';
        const valor = normalizedRow['valor'] || normalizedRow['preco'] || normalizedRow['price'] || '';
        const dataCompra = normalizedRow['data_compra'] || normalizedRow['data_entrega'] || '';
        const observacoes = normalizedRow['observacoes'] || normalizedRow['observacao'] || normalizedRow['obs'] || '';

        // Converter datas se necessário (DD/MM/YYYY para YYYY-MM-DD)
        if (dataAniversario && typeof dataAniversario === 'string' && dataAniversario.includes('/')) {
          const parts = dataAniversario.split('/');
          if (parts.length === 3) {
            dataAniversario = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }

        const clientData = {
          nome_completo: nome,
          email: email,
          telefone: telefone ? String(telefone).replace(/\D/g, '') : '',
          data_aniversario: dataAniversario,
          endereco: endereco,
          // Dados da compra
          produto_servico: produtoServico,
          valor: valor,
          data_compra: dataCompra,
          observacoes: observacoes
        };

        console.log(`Cliente processado ${index}:`, clientData);
        return clientData;
      }).filter(client => {
        // Filtrar apenas clientes com dados mínimos
        const isValid = client.nome_completo && client.email && client.telefone && client.data_aniversario;
        if (!isValid) {
          console.warn('Cliente inválido (faltando dados):', client);
        }
        return isValid;
      });

      console.log('Total de clientes válidos:', clients.length);
      console.log('Clientes processados:', clients);

      if (clients.length === 0) {
        fileInfo.innerHTML = `<div style="color:#ef4444;">❌ Nenhum registro válido encontrado no arquivo.<br>Verifique se as colunas estão corretas: nome_completo, email, telefone, data_aniversario</div>`;
        return;
      }

      fileInfo.innerHTML = `<div style="color:#22c55e;">✓ ${clients.length} registro(s) válido(s) encontrado(s)<br><small style="color:#888;">Processando importação...</small></div>`;

      // 1. Agrupar por cliente único (email)
      const clientesUnicos = new Map();
      const comprasPorCliente = new Map();

      clients.forEach(row => {
        const email = row.email.toLowerCase().trim();

        // Guardar dados do cliente (apenas uma vez)
        if (!clientesUnicos.has(email)) {
          clientesUnicos.set(email, {
            nome_completo: row.nome_completo,
            email: row.email,
            telefone: row.telefone,
            data_aniversario: row.data_aniversario,
            endereco: row.endereco
          });
          comprasPorCliente.set(email, []);
        }

        // Guardar compras se tiver dados de compra
        if (row.produto_servico && row.valor && row.data_compra) {
          comprasPorCliente.get(email).push({
            produto_servico: row.produto_servico,
            valor: parseFloat(row.valor),
            data_compra: row.data_compra,
            observacoes: row.observacoes || null
          });
        }
      });

      const totalClientes = clientesUnicos.size;
      const totalCompras = Array.from(comprasPorCliente.values()).reduce((sum, compras) => sum + compras.length, 0);

      fileInfo.innerHTML = `<div style="color:#FE6E4B;">📊 Identificados:<br>• ${totalClientes} cliente(s) único(s)<br>• ${totalCompras} compra(s)<br><small style="color:#888;">Processando...</small></div>`;

      // 2. Inserir clientes únicos na staging
      const stagingRecords = Array.from(clientesUnicos.values()).map(client => ({
        nome_completo: client.nome_completo,
        email: client.email,
        telefone: client.telefone,
        data_aniversario: client.data_aniversario,
        endereco: client.endereco,
        status_importacao: 'pendente'
      }));

      const { data: insertData, error: insertError } = await supabase
        .from('clientes_compras_staging')
        .insert(stagingRecords)
        .select();

      if (insertError) {
        throw new Error('Erro ao inserir na staging: ' + insertError.message);
      }

      // 3. Processar clientes usando a função do banco
      const { data: processResult, error: processError } = await supabase
        .rpc('processar_importacao_staging');

      if (processError) {
        throw new Error('Erro ao processar staging: ' + processError.message);
      }

      const result = processResult[0];
      const clientesImportados = result.processados_sucesso || 0;
      const clientesComErro = result.processados_erro || 0;

      // 4. Se há compras, processar após importar clientes
      let comprasImportadas = 0;
      let comprasComErro = 0;

      console.log('=== DEBUG COMPRAS ===');
      console.log('Total de compras identificadas:', totalCompras);
      console.log('Clientes importados:', clientesImportados);
      console.log('Compras por cliente:', comprasPorCliente);

      if (totalCompras > 0 && clientesImportados > 0) {
        fileInfo.innerHTML = `<div style="color:#FE6E4B;">✓ ${clientesImportados} cliente(s) importado(s)<br>Processando ${totalCompras} compra(s)...<br></div>`;

        // Buscar clientes recém-importados para pegar seus IDs
        const emailsImportados = Array.from(clientesUnicos.keys());
        console.log('Emails para buscar:', emailsImportados);

        const { data: clientesDB, error: clientesError } = await supabase
          .from('clientes')
          .select('id, email')
          .in('email', emailsImportados);

        console.log('Clientes encontrados no banco:', clientesDB);

        if (clientesError) {
          console.error('Erro ao buscar clientes:', clientesError);
          throw new Error('Erro ao buscar clientes: ' + clientesError.message);
        }

        // Mapear email -> id
        const emailParaId = new Map();
        clientesDB.forEach(c => emailParaId.set(c.email.toLowerCase(), c.id));
        console.log('Mapeamento email -> id:', emailParaId);

        // Preparar compras para inserir
        const comprasParaInserir = [];
        comprasPorCliente.forEach((compras, email) => {
          const clienteId = emailParaId.get(email);
          console.log(`Cliente ${email} -> ID: ${clienteId}, Compras:`, compras);

          if (clienteId) {
            compras.forEach(compra => {
              comprasParaInserir.push({
                cliente_id: clienteId,
                produto_servico: compra.produto_servico,
                valor: compra.valor,
                data_compra: compra.data_compra,
                observacoes: compra.observacoes
              });
            });
          } else {
            console.warn(`Cliente ${email} não encontrado no banco!`);
          }
        });

        console.log('Compras preparadas para inserir:', comprasParaInserir);
        console.log('Total de compras a inserir:', comprasParaInserir.length);

        // Inserir compras em lote
        if (comprasParaInserir.length > 0) {
          console.log('Iniciando inserção de compras...');
          const { data: comprasData, error: comprasError } = await supabase
            .from('compras')
            .insert(comprasParaInserir)
            .select();

          console.log('Resultado da inserção:', { comprasData, comprasError });

          if (comprasError) {
            console.error('ERRO ao inserir compras:', comprasError);
            comprasComErro = comprasParaInserir.length;
            showAlert(`Erro ao importar compras: ${comprasError.message}`, 'error');
          } else {
            comprasImportadas = comprasData.length;
            console.log('Compras importadas com sucesso:', comprasImportadas);
          }
        } else {
          console.warn('Nenhuma compra para inserir!');
        }
      } else {
        console.log('Condição não atendida para processar compras:');
        console.log('- totalCompras > 0?', totalCompras > 0);
        console.log('- clientesImportados > 0?', clientesImportados > 0);
      }

      // 5. Mostrar resultados finais
      if (clientesImportados > 0 || comprasImportadas > 0) {
        showAlert(`✓ Importação concluída! ${clientesImportados} cliente(s) e ${comprasImportadas} compra(s) importadas.`);
        await loadMetrics();
        await loadClients();
      }

      if (clientesComErro > 0 || comprasComErro > 0) {
        showAlert(`⚠️ ${clientesComErro} cliente(s) e ${comprasComErro} compra(s) com erro.`, 'error');
      }

      fileInfo.style.color = (clientesComErro === 0 && comprasComErro === 0) ? '#22c55e' : '#FE6E4B';
      fileInfo.innerHTML = `
        <div style="line-height: 1.6;">
          <strong>📊 Resultado da Importação:</strong><br>
          ${clientesImportados > 0 ? `✓ <strong>${clientesImportados}</strong> cliente(s) importado(s)<br>` : ''}
          ${comprasImportadas > 0 ? `✓ <strong>${comprasImportadas}</strong> compra(s) importadas<br>` : ''}
          ${clientesComErro > 0 ? `✗ <strong>${clientesComErro}</strong> cliente(s) com erro<br>` : ''}
          ${comprasComErro > 0 ? `✗ <strong>${comprasComErro}</strong> compra(s) com erro<br>` : ''}
        </div>
      `;

      // Limpar input de arquivo
      e.target.value = '';

    } catch (error) {
      console.error('Erro na importação:', error);
      if (fileInfo) {
        fileInfo.style.color = '#ef4444';
        fileInfo.textContent = 'Erro: ' + error.message;
      }
      showAlert('Erro ao processar arquivo: ' + error.message, 'error');
    }
    });
  }

  // Event listeners - Only add if elements exist
  if (connectBtn) {
    connectBtn.addEventListener('click', connectToSupabase);
  }
  
  if (searchInput) {
    searchInput.addEventListener('input', performSearch);
  }
  
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', clearSearch);
  }
  
  if (itemsPerPageSelect) {
    itemsPerPageSelect.addEventListener('change', function() {
      itemsPerPage = parseInt(this.value);
      currentPage = 1;
      displayClients();
    });
  }

  // Fechar modal ao clicar fora
  if (deleteModal) {
    deleteModal.addEventListener('click', function(e) {
      if (e.target === deleteModal) {
        closeDeleteModal();
      }
    });
  }

  // Botões do modal de exclusão
  const cancelDeleteBtn = document.getElementById('cancelDelete');
  const confirmDeleteBtn = document.getElementById('confirmDelete');
  
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  }
  
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', window.confirmDelete);
  }

  // Modal de edição - fechar ao clicar fora
  const editModal = document.getElementById('editModal');
  if (editModal) {
    editModal.addEventListener('click', function(e) {
      if (e.target === editModal) {
        closeEditModal();
      }
    });
  }

  // Formulário de edição
  const editClientForm = document.getElementById('editClientForm');
  if (editClientForm) {
    editClientForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!isConnected) {
        showAlert('Conecte-se ao Supabase primeiro', 'error');
        return;
      }

      const id = document.getElementById('editClientId').value;
      const nome = document.getElementById('editNomeCompleto').value.trim();
      const email = document.getElementById('editEmail').value.trim();
      const telefone = document.getElementById('editTelefone').value.trim();
      const dataAniversario = document.getElementById('editDataAniversario').value;
      const endereco = document.getElementById('editEndereco').value.trim();
      const ativo = document.getElementById('editAtivo').checked;

      try {
        const primeiroNome = nome.split(' ')[0];
        let mesDia = null;
        
        if (dataAniversario) {
          const [ano, mes, dia] = dataAniversario.split('-');
          mesDia = `${mes}-${dia}`;
        }

        const { error } = await supabase
          .from('clientes')
          .update({
            nome_completo: nome,
            email: email,
            telefone: telefone,
            data_aniversario: dataAniversario || null,
            mes_dia_aniversario: mesDia,
            primeiro_nome: primeiroNome,
            endereco: endereco || null,
            ativo: ativo
          })
          .eq('id', id);

        if (error) throw error;

        showAlert('Cliente atualizado com sucesso!', 'success');
        closeEditModal();
        await loadClients();
        await loadMetrics();
      } catch (error) {
        showAlert('Erro ao atualizar cliente: ' + error.message, 'error');
      }
    });
  }

  // Botões do modal de edição
  const cancelEditBtn = document.getElementById('cancelEdit');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', closeEditModal);
  }

  // Fechar dropdown ao clicar fora
  if (clientSearchInput && clientDropdown) {
    document.addEventListener('click', function(e) {
      if (!clientSearchInput.contains(e.target) && !clientDropdown.contains(e.target)) {
        clientDropdown.style.display = 'none';
      }
    });
  }

  // Restaurar conexão salva ao inicializar
  restoreConnection();
};
