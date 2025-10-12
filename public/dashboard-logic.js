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
    const alert = document.createElement('div');
    alert.className = `alert px-4 py-3 rounded-lg mb-3 text-sm font-medium animate-fade-in ${
      type === 'success' 
        ? 'bg-green-600 text-white' 
        : 'bg-red-600 text-white'
    }`;
    alert.textContent = message;
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
      connectBtn.textContent = 'Conectando...';
      connectBtn.disabled = true;
      connectionStatus.textContent = 'Conectando...';
      connectionStatus.className = 'connection-status px-4 py-2 rounded-lg text-xs font-medium bg-yellow-600 text-white animate-pulse-glow';

      supabase = window.supabase.createClient(url, key);
      
      const { data, error } = await supabase.from('clientes').select('count', { count: 'exact' });

      if (error) throw error;

      isConnected = true;
      connectionStatus.textContent = '✓ Conectado';
      connectionStatus.className = 'connection-status px-4 py-2 rounded-lg text-xs font-medium bg-green-600 text-white';
      connectBtn.textContent = 'Conectar';
      connectBtn.disabled = false;
      showAlert('Conectado ao Supabase com sucesso!', 'success');
      
      await loadClients();
      await loadMetrics();
    } catch (error) {
      isConnected = false;
      connectionStatus.textContent = '✗ Erro';
      connectionStatus.className = 'connection-status px-4 py-2 rounded-lg text-xs font-medium bg-red-600 text-white';
      connectBtn.textContent = 'Conectar';
      connectBtn.disabled = false;
      showAlert('Erro ao conectar: ' + error.message, 'error');
    }
  }

  // Função para carregar métricas
  async function loadMetrics() {
    if (!isConnected) return;

    try {
      const { data: totalData } = await supabase
        .from('clientes')
        .select('count', { count: 'exact' });

      const { data: activesData } = await supabase
        .from('compras')
        .select('cliente_id')
        .not('cliente_id', 'is', null);

      const uniqueActiveClients = activesData ? new Set(activesData.map(c => c.cliente_id)).size : 0;

      const { data: messagesData } = await supabase
        .from('mensagens')
        .select('count', { count: 'exact' });

      const { data: indicationsData } = await supabase
        .from('indicacoes')
        .select('count', { count: 'exact' });

      document.getElementById('totalClientes').textContent = totalData?.length || 0;
      document.getElementById('clientesAtivos').textContent = uniqueActiveClients;
      document.getElementById('totalMensagens').textContent = messagesData?.length || 0;
      document.getElementById('indicacoesObtidas').textContent = indicationsData?.length || 0;
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  }

  // Função para carregar clientes
  async function loadClients() {
    if (!isConnected) return;

    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      allClients = data || [];
      filteredClients = allClients;
      displayClients();
    } catch (error) {
      showAlert('Erro ao carregar clientes: ' + error.message, 'error');
    }
  }

  // Função para exibir clientes com paginação
  function displayClients() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const clientsToShow = filteredClients.slice(start, end);

    document.getElementById('clientCount').textContent = filteredClients.length;

    if (clientsToShow.length === 0) {
      clientsList.innerHTML = `
        <div class="empty-state text-center py-12">
          <div class="empty-icon text-6xl mb-4 opacity-20">👥</div>
          <div class="empty-title text-muted-foreground text-base mb-2">
            ${searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </div>
          <div class="empty-subtitle text-muted-foreground text-sm">
            ${searchTerm ? 'Tente buscar com outros termos' : 'Comece adicionando um novo cliente'}
          </div>
        </div>
      `;
      document.getElementById('paginationContainer').style.display = 'none';
      return;
    }

    clientsList.innerHTML = clientsToShow.map(client => `
      <div class="client-item bg-input border border-border rounded-lg p-4 mb-3 relative hover:border-primary/50 transition-all duration-300 animate-fade-in">
        <div class="client-actions absolute top-4 right-4 flex gap-2">
          <button 
            class="btn-delete px-3 py-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md text-xs font-medium transition-all" 
            onclick="openDeleteModal('${client.id}', '${client.nome_completo}')"
          >
            Excluir
          </button>
        </div>
        <div class="client-name text-primary font-semibold text-base mb-2">${highlightText(client.nome_completo)}</div>
        <div class="client-info text-muted-foreground text-sm mb-1">✉️ ${highlightText(client.email)}</div>
        <div class="client-info text-muted-foreground text-sm mb-1">📞 ${highlightText(client.telefone)}</div>
        ${client.endereco ? `<div class="client-info text-muted-foreground text-sm mb-1">📍 ${highlightText(client.endereco)}</div>` : ''}
        <div class="client-stats flex gap-4 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
          <span>🎂 ${client.data_aniversario || 'Não informado'}</span>
          <span>📅 Cadastro: ${new Date(client.created_at).toLocaleDateString('pt-BR')}</span>
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

    if (totalPages <= 1) {
      paginationContainer.style.display = 'none';
      return;
    }

    paginationContainer.style.display = 'flex';
    paginationInfo.textContent = `Página ${currentPage} de ${totalPages}`;

    let controls = `
      <button 
        class="btn-page px-3 py-2 rounded-md text-xs font-medium transition-all ${currentPage === 1 ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-card text-foreground hover:bg-primary hover:text-primary-foreground'}" 
        onclick="goToPage(${currentPage - 1})" 
        ${currentPage === 1 ? 'disabled' : ''}
      >
        ← Anterior
      </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        controls += `
          <button 
            class="btn-page px-3 py-2 rounded-md text-xs font-medium transition-all ${i === currentPage ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-primary/80 hover:text-primary-foreground'}" 
            onclick="goToPage(${i})"
          >
            ${i}
          </button>
        `;
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        controls += '<span class="px-2 text-muted-foreground">...</span>';
      }
    }

    controls += `
      <button 
        class="btn-page px-3 py-2 rounded-md text-xs font-medium transition-all ${currentPage === totalPages ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-card text-foreground hover:bg-primary hover:text-primary-foreground'}" 
        onclick="goToPage(${currentPage + 1})" 
        ${currentPage === totalPages ? 'disabled' : ''}
      >
        Próxima →
      </button>
    `;

    paginationControls.innerHTML = controls;
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
      clearSearchBtn.style.display = 'block';
      searchInfo.style.display = 'block';
      searchInfo.textContent = `Encontrados ${filteredClients.length} cliente(s) para "${searchTerm}"`;
    } else {
      filteredClients = allClients;
      clearSearchBtn.style.display = 'none';
      searchInfo.style.display = 'none';
    }

    currentPage = 1;
    displayClients();
  }

  // Função para limpar busca
  function clearSearch() {
    searchInput.value = '';
    searchTerm = '';
    filteredClients = allClients;
    clearSearchBtn.style.display = 'none';
    searchInfo.style.display = 'none';
    currentPage = 1;
    displayClients();
  }

  // Modal de exclusão
  window.openDeleteModal = function(id, name) {
    clientToDeleteId = id;
    document.getElementById('clientToDelete').textContent = name;
    deleteModal.style.display = 'flex';
  };

  window.closeDeleteModal = function() {
    deleteModal.style.display = 'none';
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

  // Cadastro de cliente
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
        .insert([{\
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

  // Registrar compra
  purchaseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!isConnected) {
      showAlert('Conecte-se ao Supabase primeiro', 'error');
      return;
    }

    const clienteId = document.getElementById('selectedClientId').value;
    const produto = document.getElementById('produtoServico').value.trim();
    const valor = parseFloat(document.getElementById('valor').value);
    const dataCompra = document.getElementById('dataCompra').value;
    const observacoes = document.getElementById('observacoes').value.trim();

    if (!clienteId) {
      showAlert('Selecione um cliente', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('compras')
        .insert([{\
          cliente_id: clienteId,
          produto_servico: produto,
          valor: valor,
          data_compra: dataCompra,
          observacoes: observacoes || null
        }]);

      if (error) throw error;

      showAlert('Compra registrada com sucesso!', 'success');
      purchaseForm.reset();
      document.getElementById('selectedClientId').value = '';
      document.getElementById('clientSearchInput').value = '';
      selectedClientInfo.style.display = 'none';
      await loadMetrics();
    } catch (error) {
      showAlert('Erro ao registrar compra: ' + error.message, 'error');
    }
  });

  // Busca de cliente para compra
  clientSearchInput.addEventListener('input', async function() {
    const term = this.value.trim().toLowerCase();
    
    if (term.length < 2) {
      clientDropdown.style.display = 'none';
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

      if (data.length === 0) {
        clientDropdown.innerHTML = '<div class="no-clients-found p-3 text-muted-foreground text-xs text-center italic">Nenhum cliente encontrado</div>';
      } else {
        clientDropdown.innerHTML = data.map(client => `
          <div class="client-option p-3 cursor-pointer border-b border-border hover:bg-primary/10 transition-colors" onclick="selectClient('${client.id}', '${client.nome_completo}', '${client.email}', '${client.telefone}')">
            <div class="client-option-name text-foreground font-medium mb-1">${client.nome_completo}</div>
            <div class="client-option-details text-muted-foreground text-xs">${client.email} • ${client.telefone}</div>
          </div>
        `).join('');
      }
      
      clientDropdown.style.display = 'block';
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  });

  window.selectClient = function(id, nome, email, telefone) {
    document.getElementById('selectedClientId').value = id;
    document.getElementById('clientSearchInput').value = nome;
    clientDropdown.style.display = 'none';
    selectedClientInfo.textContent = `Cliente selecionado: ${nome} (${email})`;
    selectedClientInfo.style.display = 'block';
  };

  // Importação de planilha
  fileInput.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!isConnected) {
      showAlert('Conecte-se ao Supabase primeiro', 'error');
      return;
    }

    fileInfo.textContent = `Processando: ${file.name}...`;

    try {
      let clientes = [];
      
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const result = Papa.parse(text, { header: true });
        clientes = result.data;
      } else {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        clientes = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      }

      let success = 0;
      let errors = 0;

      for (const cliente of clientes) {
        if (!cliente.nome_completo || !cliente.email || !cliente.telefone || !cliente.data_aniversario) {
          errors++;
          continue;
        }

        try {
          let dataAniversario = cliente.data_aniversario;
          if (dataAniversario.includes('/')) {
            const [dia, mes, ano] = dataAniversario.split('/');
            dataAniversario = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
          }

          const primeiroNome = cliente.nome_completo.split(' ')[0];
          const [ano, mes, dia] = dataAniversario.split('-');
          const mesDia = `${mes}-${dia}`;

          const { error } = await supabase
            .from('clientes')
            .insert([{\
              nome_completo: cliente.nome_completo,
              email: cliente.email,
              telefone: cliente.telefone,
              data_aniversario: dataAniversario,
              mes_dia_aniversario: mesDia,
              primeiro_nome: primeiroNome,
              endereco: cliente.endereco || null,
              ativo: true
            }]);

          if (error) {
            errors++;
          } else {
            success++;
          }
        } catch (err) {
          errors++;
        }
      }

      fileInfo.innerHTML = `
        <div class="text-green-600 text-xs">✓ ${success} clientes importados com sucesso</div>
        ${errors > 0 ? `<div class="text-red-600 text-xs">✗ ${errors} clientes com erro</div>` : ''}
      `;

      await loadClients();
      await loadMetrics();
      showAlert(`Importação concluída: ${success} sucesso, ${errors} erros`, success > 0 ? 'success' : 'error');
    } catch (error) {
      fileInfo.textContent = '';
      showAlert('Erro ao processar arquivo: ' + error.message, 'error');
    }
  });

  // Event listeners
  connectBtn.addEventListener('click', connectToSupabase);
  searchInput.addEventListener('input', performSearch);
  clearSearchBtn.addEventListener('click', clearSearch);
  itemsPerPageSelect.addEventListener('change', function() {
    itemsPerPage = parseInt(this.value);
    currentPage = 1;
    displayClients();
  });

  // Fechar modal ao clicar fora
  deleteModal.addEventListener('click', function(e) {
    if (e.target === deleteModal) {
      closeDeleteModal();
    }
  });

  // Fechar dropdown ao clicar fora
  document.addEventListener('click', function(e) {
    if (!clientSearchInput.contains(e.target) && !clientDropdown.contains(e.target)) {
      clientDropdown.style.display = 'none';
    }
  });
};
