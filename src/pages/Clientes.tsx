import { useEffect, useState, useRef } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import Papa from "papaparse";

// Interfaces
interface Cliente {
  id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  endereco?: string;
  data_aniversario?: string;
  data_cadastro?: string; 
  ativo: boolean;
  created_at: string;
}

const Clientes = () => {
  // --- ESTADOS ---
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Busca e Compra
  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [selectedClientForPurchase, setSelectedClientForPurchase] = useState<Cliente | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Paginação
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modais
  const [clienteParaEditar, setClienteParaEditar] = useState<Cliente | null>(null);
  const [clienteParaDeletar, setClienteParaDeletar] = useState<Cliente | null>(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- HELPERS ---
  const highlightText = (text: string) => {
    if (!searchTerm || !text) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? 
        <mark key={i} className="bg-primary text-primary-foreground px-1 rounded">{part}</mark> : 
        part
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não informado';
    const dateToFormat = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
    return new Date(dateToFormat).toLocaleDateString('pt-BR');
  };

  const getInitials = (n: string) => n ? n.charAt(0).toUpperCase() : '?';

  // --- HANDLER: CADASTRO MANUAL COM VALIDAÇÃO RÍGIDA ---
  const handleRegisterClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const telefone = String(formData.get('telefone'));
    
    // 1. Remove tudo que não é número
    const apenasNumeros = telefone.replace(/\D/g, '');

    // 2. Validação de Comprimento e Dica
    if (apenasNumeros.length !== 13) {
      if (apenasNumeros.length === 12) {
        toast.warning("Telefone com 12 dígitos. Se for celular, adicione o dígito '9' após o DDD (Ex: 55 11 9xxxx-xxxx).");
      } else {
        toast.error(`Telefone inválido: ${apenasNumeros.length} dígitos encontrados. É obrigatório ter 13 dígitos (55 + DDD + 9 números).`);
      }
      return; 
    }

    // 3. Verifica DDI Brasil (55)
    if (!apenasNumeros.startsWith('55')) {
      toast.error("O telefone deve começar com o código do país 55.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('clientes').insert([{
        nome_completo: String(formData.get('nomeCompleto')),
        email: String(formData.get('email')),
        telefone: telefone,
        endereco: String(formData.get('endereco')),
        data_aniversario: String(formData.get('dataAniversario')),
        ativo: formData.get('ativo') === 'on'
      }]);
      
      if (error) {
        if (error.message.includes('duplicate key')) throw new Error("Email já cadastrado.");
        throw error;
      }
      
      toast.success("Cliente cadastrado!");
      (e.target as HTMLFormElement).reset();
      fetchClientes();
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterPurchase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClientForPurchase) {
      toast.error("Selecione um cliente primeiro");
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const { error } = await supabase.from('compras').insert([{
        cliente_id: selectedClientForPurchase.id,
        produto_servico: String(formData.get('produtoComprado')),
        valor: parseFloat(String(formData.get('valorCompra'))),
        data_compra: String(formData.get('dataEntrega'))
      }]);
      if (error) throw error;
      toast.success("Compra registrada!");
      (e.target as HTMLFormElement).reset();
      setPurchaseSearch("");
      setSelectedClientForPurchase(null);
    } catch (error) {
      toast.error("Erro ao registrar compra");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLER: IMPORTAÇÃO OTIMIZADA (BATCH/LOTE) ---
  const handleImport = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return toast.error("Selecione um arquivo CSV");
    
    toast.loading("Lendo arquivo...");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete: async (results) => {
        const rows = results.data as Record<string, string>[];
        
        if (rows.length === 0) {
          toast.dismiss();
          return toast.error("O arquivo CSV parece estar vazio ou inválido.");
        }

        // 1. Normalização das chaves
        const normalizedRows = rows.map(row => {
          const newRow: Record<string, string> = {};
          Object.keys(row).forEach(key => {
            newRow[key.trim().toLowerCase()] = row[key];
          });
          return newRow;
        });

        const firstRow = normalizedRows[0];
        const keys = Object.keys(firstRow);
        
        // 2. Mapeamento Inteligente
        const keyMap = {
          nome: keys.find(k => k.includes('nome')),
          email: keys.find(k => k.includes('email')),
          tel: keys.find(k => k.includes('tele') || k.includes('cel') || k.includes('phone')),
          end: keys.find(k => k.includes('end') || k.includes('rua') || k.includes('addr')),
          niver: keys.find(k => k.includes('aniver') || k.includes('nasc')),
          prod: keys.find(k => k.includes('prod') || k.includes('serv')),
          valor: keys.find(k => k.includes('valor') || k.includes('preço') || k.includes('price')),
          data: keys.find(k => k.includes('data') && (k.includes('compra') || k.includes('venda')))
        };

        if (!keyMap.nome) {
          toast.dismiss();
          return toast.error("Não foi possível encontrar a coluna 'Nome' no CSV.");
        }

        // 3. Preparação do Payload (Lista limpa)
        const payloadBatch = normalizedRows.map((row, i) => {
            if (!row[keyMap.nome!]) return null;

            // Tratamento de valor monetário
            let valorNumerico = null;
            if (keyMap.valor && row[keyMap.valor]) {
                const valStr = row[keyMap.valor].replace(/[R$\s]/g, '').replace(',', '.');
                valorNumerico = parseFloat(valStr);
            }

            return {
                nome: row[keyMap.nome!],
                email: keyMap.email && row[keyMap.email] ? row[keyMap.email] : `no_email_${Date.now()}_${i}@sys.local`,
                telefone: keyMap.tel ? row[keyMap.tel] : '',
                endereco: keyMap.end ? row[keyMap.end] : '',
                data_aniversario: keyMap.niver ? row[keyMap.niver] : null,
                produto: keyMap.prod ? row[keyMap.prod] : null,
                valor: valorNumerico,
                data: keyMap.data ? row[keyMap.data] : null
            };
        }).filter(item => item !== null);

        // 4. Envio em Lotes (Chunks)
        const BATCH_SIZE = 100; // Envia 100 clientes por vez
        let totalProcessado = 0;
        let errosTotais = 0;
        
        toast.dismiss(); // Remove o loading anterior
        toast.loading(`Importando ${payloadBatch.length} registros em lotes...`);

        for (let i = 0; i < payloadBatch.length; i += BATCH_SIZE) {
            const chunk = payloadBatch.slice(i, i + BATCH_SIZE);
            
            try {
                // Chama a nova RPC de lote
                const { error } = await supabase.rpc('importar_clientes_lote', { 
                    p_dados_json: chunk 
                });

                if (error) throw error;
                
                totalProcessado += chunk.length;
                // Feedback visual de progresso
                toast.message(`Processando... ${Math.min(totalProcessado, payloadBatch.length)} / ${payloadBatch.length}`);
                
            } catch (err) {
                console.error(`Erro no lote ${i}`, err);
                errosTotais += chunk.length;
                toast.error(`Falha ao processar um lote de ${chunk.length} itens.`);
            }
        }

        toast.dismiss();
        if (errosTotais === 0) {
            toast.success(`Importação concluída! ${totalProcessado} registros processados.`);
        } else {
            toast.warning(`Concluído com avisos. ${totalProcessado - errosTotais} sucessos, ${errosTotais} falhas.`);
        }
        
        fetchClientes();
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      error: (error) => {
        toast.dismiss();
        toast.error(`Erro ao ler CSV: ${error.message}`);
      }
    });
  };

  const handleDelete = async () => {
    if(!clienteParaDeletar) return;
    await supabase.from('clientes').delete().eq('id', clienteParaDeletar.id);
    toast.success("Cliente removido");
    setClienteParaDeletar(null);
    fetchClientes();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!clienteParaEditar) return;
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    await supabase.from('clientes').update({
      nome_completo: String(formData.get('editNomeCompleto')),
      email: String(formData.get('editEmail')),
      telefone: String(formData.get('editTelefone')),
      endereco: String(formData.get('editEndereco')),
      ativo: formData.get('editAtivo') === 'on'
    }).eq('id', clienteParaEditar.id);
    toast.success("Atualizado!");
    setClienteParaEditar(null);
    fetchClientes();
  };

  // Filtros
  const filteredList = clientes.filter(c => 
    c.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.endereco && c.endereco.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const paginatedList = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  return (
    <Layout>
      <div id="alertContainer" className="fixed top-4 right-4 z-50 max-w-md w-full"></div>
      
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
          {/* Client Registration */}
          <div className="glass rounded-2xl p-8 animate-slide-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              </div>
              Cadastro de Cliente
            </h2>
            <form onSubmit={handleRegisterClient} className="space-y-5">
              <div><label className="block text-sm font-semibold mb-2">Nome Completo*</label><input name="nomeCompleto" type="text" required className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="Digite o nome completo" /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-2">E-mail*</label><input name="email" type="email" required className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="email@exemplo.com" /></div>
                <div><label className="block text-sm font-semibold mb-2">Telefone*</label><input name="telefone" type="tel" required className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="55 (00) 00000-0000" /></div>
              </div>
              <div><label className="block text-sm font-semibold mb-2">Endereço</label><input name="endereco" type="text" className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" /></div>
              <div><label className="block text-sm font-semibold mb-2">Data de Aniversário</label><input name="dataAniversario" type="date" className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" /></div>
              <div className="flex items-center gap-3"><input name="ativo" type="checkbox" defaultChecked className="w-5 h-5 rounded border-border text-primary" /><label>Cliente Ativo</label></div>
              <button type="submit" disabled={isSubmitting} className="w-full px-6 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-bold hover:shadow-primary transition-all flex items-center justify-center gap-3 group hover-lift">{isSubmitting ? 'Salvando...' : 'Cadastrar Cliente'}</button>
            </form>
          </div>

          {/* Purchase Registration */}
          <div className="glass rounded-2xl p-8 animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              Registro de Compra
            </h2>
            <form onSubmit={handleRegisterPurchase} className="space-y-5">
              <div className="relative">
                <label className="block text-sm font-semibold mb-2">Buscar Cliente*</label>
                <input type="text" value={purchaseSearch} onChange={(e) => { setPurchaseSearch(e.target.value); setShowClientDropdown(true); if(e.target.value === "") setSelectedClientForPurchase(null); }} placeholder="Digite o nome do cliente" className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" autoComplete="off" />
                {showClientDropdown && purchaseSearch.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 max-h-48 overflow-y-auto glass rounded-xl z-20 bg-background border border-border shadow-lg">
                    {clientes.filter(c => c.nome_completo.toLowerCase().includes(purchaseSearch.toLowerCase())).map(c => (
                      <div key={c.id} onClick={() => { setSelectedClientForPurchase(c); setPurchaseSearch(c.nome_completo); setShowClientDropdown(false); }} className="p-3 hover:bg-muted cursor-pointer border-b border-border/50">
                        <div className="font-semibold">{c.nome_completo}</div><div className="text-xs text-muted-foreground">{c.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedClientForPurchase && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary">{getInitials(selectedClientForPurchase.nome_completo)}</div>
                  <div><div className="font-semibold">{selectedClientForPurchase.nome_completo}</div><div className="text-xs text-muted-foreground">{selectedClientForPurchase.email}</div></div>
                </div>
              )}
              <div><label className="block text-sm font-semibold mb-2">Produto*</label><input name="produtoComprado" type="text" required className="w-full px-4 py-3 bg-input border border-border rounded-xl" /></div>
              <div><label className="block text-sm font-semibold mb-2">Valor*</label><input name="valorCompra" type="number" step="0.01" required className="w-full px-4 py-3 bg-input border border-border rounded-xl" /></div>
              <div><label className="block text-sm font-semibold mb-2">Data*</label><input name="dataEntrega" type="date" required className="w-full px-4 py-3 bg-input border border-border rounded-xl" /></div>
              <button type="submit" disabled={isSubmitting} className="w-full px-6 py-4 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-xl font-bold hover:shadow-accent transition-all flex items-center justify-center gap-3 group hover-lift">{isSubmitting ? 'Registrando...' : 'Registrar Compra'}</button>
            </form>
          </div>
        </div>

        {/* Import Section */}
        <div className="glass rounded-2xl p-8 mb-12 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            Importação de Planilha
          </h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-semibold mb-2">Selecione um arquivo CSV</label><input ref={fileInputRef} type="file" accept=".csv" className="w-full px-4 py-3 bg-input border border-border rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer" /></div>
            <button onClick={handleImport} className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-bold hover:shadow-primary transition-all flex items-center gap-3 hover-lift"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Importar Clientes</button>
          </div>
        </div>

        {/* Client List */}
        <div className="glass rounded-2xl p-8 animate-fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              Lista de Clientes
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-semibold" id="clientCount">{filteredList.length}</span>
            </h2>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar..." className="w-full px-4 py-3 pl-11 bg-input border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                <svg className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="px-4 py-3 bg-input border border-border rounded-xl"><option value="10">10/pág</option><option value="25">25/pág</option><option value="50">50/pág</option></select>
            </div>
          </div>

          <div id="clientsList" className="space-y-4">
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Carregando lista...</div>
            ) : paginatedList.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">Nenhum cliente encontrado.</div>
            ) : (
              paginatedList.map((client, index) => (
                <Link to={`/perfil?id=${client.id}`} key={client.id} className="block">
                  <div 
                    className="client-item glass rounded-xl p-5 mb-4 relative hover:border-primary/30 transition-all duration-300 animate-fade-in group hover-lift cursor-pointer"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-lg text-primary">
                            {getInitials(client.nome_completo)}
                          </div>
                          <div>
                            <div className="client-name text-foreground font-bold text-lg mb-1">
                              {highlightText(client.nome_completo)}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${client.ativo ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>
                                {client.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 min-w-[100px]">
                          <button 
                            className="px-3 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-accent/20 w-full"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/conversas?id=${client.id}`); }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                            Conversas
                          </button>
                          <button 
                            className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-primary/20 w-full"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setClienteParaEditar(client); }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            Editar
                          </button>
                          <button 
                            className="px-3 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-destructive/20 w-full"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setClienteParaDeletar(client); }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            Excluir
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                          <span className="truncate">{highlightText(client.email)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                          <span>{highlightText(client.telefone)}</span>
                        </div>
                        {client.endereco && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground md:col-span-2">
                            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            <span className="truncate">{highlightText(client.endereco)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>
                            <span>{formatDate(client.data_aniversario)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            <span>Desde {formatDate(client.data_cadastro || client.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div id="paginationContainer" className="mt-8 flex items-center justify-between">
            <div id="paginationInfo" className="text-sm text-muted-foreground font-semibold">
              Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredList.length)} a {Math.min(currentPage * itemsPerPage, filteredList.length)} de {filteredList.length}
            </div>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-2 border border-border rounded-lg disabled:opacity-50 hover:bg-muted">&lt;</button>
              <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-2 border border-border rounded-lg disabled:opacity-50 hover:bg-muted">&gt;</button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {clienteParaDeletar && (
        <div id="deleteModal" className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass rounded-2xl p-8 max-w-md w-full mx-4 animate-scale-in">
            <div className="flex items-center gap-4 mb-6"><div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center"><svg className="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div><h3 className="text-xl font-bold">Confirmar Exclusão</h3></div>
            <p className="text-muted-foreground mb-6">Tem certeza que deseja excluir <strong>{clienteParaDeletar.nome_completo}</strong>?</p>
            <div className="flex gap-3"><button onClick={() => setClienteParaDeletar(null)} className="flex-1 px-6 py-3 bg-muted/50 hover:bg-muted text-foreground rounded-xl font-semibold">Cancelar</button><button onClick={handleDelete} className="flex-1 px-6 py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl font-semibold">Excluir</button></div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {clienteParaEditar && (
        <div id="editModal" className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto animate-fade-in">
          <div className="glass rounded-2xl p-8 max-w-2xl w-full mx-4 my-8 animate-scale-in">
            <div className="flex items-center justify-between mb-6"><h3 className="text-2xl font-bold flex items-center gap-3">Editar Cliente</h3></div>
            <form id="editClientForm" onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-4">
                <div><label className="block text-sm font-semibold mb-2">Nome*</label><input name="editNomeCompleto" defaultValue={clienteParaEditar.nome_completo} className="w-full px-4 py-3 bg-input border border-border rounded-xl" required /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-semibold mb-2">Email*</label><input name="editEmail" defaultValue={clienteParaEditar.email} className="w-full px-4 py-3 bg-input border border-border rounded-xl" required /></div>
                  <div><label className="block text-sm font-semibold mb-2">Telefone*</label><input name="editTelefone" defaultValue={clienteParaEditar.telefone} className="w-full px-4 py-3 bg-input border border-border rounded-xl" required /></div>
                </div>
                <div><label className="block text-sm font-semibold mb-2">Endereço</label><input name="editEndereco" defaultValue={clienteParaEditar.endereco} className="w-full px-4 py-3 bg-input border border-border rounded-xl" /></div>
                <div className="flex items-center gap-3"><input name="editAtivo" type="checkbox" defaultChecked={clienteParaEditar.ativo} className="w-5 h-5" /><label>Cliente Ativo</label></div>
              </div>
              <div className="flex gap-3 pt-4"><button type="button" onClick={() => setClienteParaEditar(null)} className="flex-1 px-6 py-3 bg-muted/50 hover:bg-muted font-semibold rounded-xl">Cancelar</button><button type="submit" className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl">Salvar</button></div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Clientes;
