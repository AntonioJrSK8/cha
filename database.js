/**
 * Módulo para gerenciar banco de dados Supabase (PostgreSQL)
 * 100% JavaScript - funciona no navegador
 */

// Instância do cliente Supabase
let supabaseClient = null;
let initPromise = null;

/**
 * Aguarda as credenciais serem carregadas (se estiverem sendo carregadas via API)
 */
async function waitForConfig() {
    // Se já estão definidas, retorna imediatamente
    if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
        return;
    }
    
    // Se não estão definidas, espera pelo evento de carregamento
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Timeout aguardando configurações do Supabase. Verifique se config.js está carregado corretamente.'));
        }, 5000); // 5 segundos de timeout
        
        window.addEventListener('supabase-config-loaded', () => {
            clearTimeout(timeout);
            resolve();
        }, { once: true });
    });
}

/**
 * Obtém as credenciais do Supabase
 */
function getCredentials() {
    const url = window.SUPABASE_URL || '';
    const key = window.SUPABASE_ANON_KEY || '';
    return { url, key };
}

/**
 * Inicializa o cliente Supabase
 */
async function initSQLite() {
    // Se já foi inicializado, retorna a instância existente
    if (supabaseClient) {
        return { supabaseClient, apiAvailable: true };
    }
    
    // Se já está inicializando, aguarda
    if (initPromise) {
        return initPromise;
    }
    
    // Inicia a inicialização
    initPromise = (async () => {
        try {
            // Aguarda as credenciais serem carregadas (se necessário)
            await waitForConfig();
            
            // Obtém as credenciais
            const { url, key } = getCredentials();
            
            // Verifica se as variáveis estão configuradas
            if (!url || !key || url === 'https://seu-projeto.supabase.co' || key === 'sua-chave-anon-aqui') {
                throw new Error('Variáveis de ambiente do Supabase não configuradas. Edite config.js com suas credenciais do Supabase.');
            }

            // Verifica se o Supabase já está disponível (carregado via script tag)
            if (typeof supabase === 'undefined') {
                throw new Error('Supabase Client não foi carregado. Certifique-se de incluir o script do Supabase no HTML antes de database.js.');
            }

            // Cria instância do cliente
            supabaseClient = supabase.createClient(url, key);
            
            console.log('✅ Cliente Supabase inicializado');
            return { supabaseClient, apiAvailable: true };
        } catch (error) {
            console.error('❌ Erro ao inicializar Supabase:', error);
            initPromise = null; // Permite tentar novamente
            throw error;
        }
    })();
    
    return initPromise;
}


/**
 * Adiciona um novo palpite
 */
async function addPalpite(nome, sexo, mensagem, dataPalpite, sugestaoNome = null, ehGanhador = false) {
    try {
        if (!supabaseClient) {
            await initSQLite();
        }

        // Verifica quantos palpites existem para determinar se é ganhador
        const { count } = await supabaseClient
            .from('palpites')
            .select('*', { count: 'exact', head: true });

        const totalPalpites = count || 0;
        
        // Calcula se é ganhador (usa o valor passado se fornecido, senão calcula)
        let isGanhador;
        if (ehGanhador !== undefined && ehGanhador !== null) {
            // Converte para boolean explicitamente (pode vir como string, number, etc)
            isGanhador = ehGanhador === true || ehGanhador === 'true' || ehGanhador === 1 || ehGanhador === '1';
        } else {
            // Calcula automaticamente (10º palpite)
            isGanhador = (totalPalpites + 1) === 10;
        }
        
        // Converte para integer: 1 para true, 0 para false
        const ehGanhadorValue = isGanhador ? 1 : 0;

        // Insere o palpite - envia 1 para true, 0 para false
        const { data, error } = await supabaseClient
            .from('palpites')
            .insert([
                {
                    nome,
                    sexo,
                    sugestao_nome: sugestaoNome || null,
                    mensagem,
                    data_palpite: dataPalpite,
                    eh_ganhador: ehGanhadorValue  // Integer: 1 para true, 0 para false
                }
            ])
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data.id;
    } catch (error) {
        console.error('❌ Erro ao adicionar palpite:', error);
        throw error;
    }
}

/**
 * Obtém todos os palpites
 */
async function getAllPalpites() {
    try {
        if (!supabaseClient) {
            await initSQLite();
        }

        const { data, error } = await supabaseClient
            .from('palpites')
            .select('*')
            .order('data_registro', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        // Converte para o formato esperado pelo frontend
        return (data || []).map(p => ({
            id: p.id,
            nome: p.nome,
            sexo: p.sexo,
            sugestaoNome: p.sugestao_nome,
            mensagem: p.mensagem,
            dataPalpite: p.data_palpite,
            dataRegistro: p.data_registro,
            ehGanhador: Boolean(p.eh_ganhador) // Converte 0/1 para boolean
        }));
    } catch (error) {
        console.error('❌ Erro ao buscar palpites:', error);
        throw error;
    }
}

/**
 * Obtém estatísticas dos palpites
 */
async function getStats() {
    try {
        if (!supabaseClient) {
            await initSQLite();
        }

        // Busca total
        const { count: total } = await supabaseClient
            .from('palpites')
            .select('*', { count: 'exact', head: true });

        // Busca meninas
        const { count: meninas } = await supabaseClient
            .from('palpites')
            .select('*', { count: 'exact', head: true })
            .eq('sexo', 'menina');

        // Busca meninos
        const { count: meninos } = await supabaseClient
            .from('palpites')
            .select('*', { count: 'exact', head: true })
            .eq('sexo', 'menino');

        // Busca ganhador (eh_ganhador = 1)
        const { data: ganhadorData } = await supabaseClient
            .from('palpites')
            .select('nome')
            .eq('eh_ganhador', 1)  // Usa 1 ao invés de true
            .limit(1)
            .single();

        return {
            total: total || 0,
            meninas: meninas || 0,
            meninos: meninos || 0,
            ganhador: ganhadorData?.nome || null
        };
    } catch (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
        throw error;
    }
}

/**
 * Obtém informações do ganhador
 */
async function getGanhador() {
    try {
        if (!supabaseClient) {
            await initSQLite();
        }

        const { data, error } = await supabaseClient
            .from('palpites')
            .select('*')
            .eq('eh_ganhador', 1)  // Usa 1 ao invés de true
            .limit(1)
            .single();

        if (error || !data) {
            return null;
        }

        return {
            id: data.id,
            nome: data.nome,
            sexo: data.sexo,
            sugestaoNome: data.sugestao_nome,
            mensagem: data.mensagem,
            dataPalpite: data.data_palpite,
            dataRegistro: data.data_registro
        };
    } catch (error) {
        console.error('❌ Erro ao buscar ganhador:', error);
        return null;
    }
}

/**
 * Remove todos os palpites
 */
async function clearAllPalpites() {
    try {
        if (!supabaseClient) {
            await initSQLite();
        }

        const { error } = await supabaseClient
            .from('palpites')
            .delete()
            .neq('id', 0); // Deleta todos (id nunca é 0)

        if (error) {
            throw new Error(error.message);
        }

        console.log('✅ Todos os palpites foram removidos');
    } catch (error) {
        console.error('❌ Erro ao remover palpites:', error);
        throw error;
    }
}

/**
 * Exporta dados como JSON
 */
async function exportDatabase() {
    try {
        const palpites = await getAllPalpites();
        const dataStr = JSON.stringify(palpites, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `palpites_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        console.log('✅ Dados exportados como JSON');
    } catch (error) {
        console.error('❌ Erro ao exportar dados:', error);
        throw error;
    }
}

// Exporta funções para uso global
window.SQLiteDB = {
    init: initSQLite,
    addPalpite,
    getAllPalpites,
    getStats,
    getGanhador,
    clearAllPalpites,
    exportDatabase
};
