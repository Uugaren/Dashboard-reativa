// Profile page specific logic
window.loadClientProfile = async function(clientId) {
  const supabaseUrl = document.getElementById('supabaseUrl')?.value || localStorage.getItem('supabaseUrl');
  const supabaseKey = document.getElementById('supabaseKey')?.value || localStorage.getItem('supabaseKey');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase não está conectado');
  }

  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  try {
    // Load client data
    const { data: client, error: clientError } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError) throw clientError;

    // Load purchases
    const { data: purchases, error: purchasesError } = await supabase
      .from('compras')
      .select('*')
      .eq('cliente_id', clientId)
      .order('data_compra', { ascending: false });

    // Load messages
    const { data: messages, error: messagesError } = await supabase
      .from('mensagens')
      .select('*')
      .eq('cliente_id', clientId)
      .order('data_envio', { ascending: false });

    return {
      client,
      purchases: purchases || [],
      messages: messages || []
    };
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    throw error;
  }
};
