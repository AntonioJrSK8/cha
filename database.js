/**
 * Módulo para gerenciar banco de dados SQLite compartilhado via API REST
 * Todos os navegadores compartilham o mesmo arquivo palpites.db no servidor
 */

// URL da API (usar /api quando estiver no mesmo servidor)
const API_BASE_URL = window.location.origin + '/api';

/**
 * Verifica se a API está disponível
 */
async function checkAPIAvailable() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`, {
            method: 'GET',
            signal: AbortSignal.timeout(3000) // 3 segundos de timeout
        });
        return response.ok;
    } catch (error) {
        console.warn('⚠️ API não disponível, usando modo offline');
        return false;
    }
}

/**
 * Inicializa a conexão com a API
 */
async function initSQLite() {
    const apiAvailable = await checkAPIAvailable();
    if (apiAvailable) {
        console.log('✅ Conectado à API - banco compartilhado disponível');
    } else {
        console.warn('⚠️ API offline - dados não serão compartilhados');
    }
    return { apiAvailable };
}

/**
 * Adiciona um novo palpite
 */
async function addPalpite(nome, sexo, mensagem, dataPalpite, sugestaoNome = null, ehGanhador = false) {
    try {
        const response = await fetch(`${API_BASE_URL}/palpites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome,
                sexo,
                mensagem,
                dataPalpite,
                sugestaoNome
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao adicionar palpite');
        }

        const result = await response.json();
        return result.id;
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
        const response = await fetch(`${API_BASE_URL}/palpites`, {
            method: 'GET',
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar palpites');
        }

        const data = await response.json();
        return data.palpites || [];
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
        const response = await fetch(`${API_BASE_URL}/stats`, {
            method: 'GET',
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar estatísticas');
        }

        return await response.json();
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
        const stats = await getStats();
        if (!stats.ganhador) {
            return null;
        }

        // Busca os dados completos do ganhador
        const palpites = await getAllPalpites();
        return palpites.find(p => p.ehGanhador) || null;
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
        const response = await fetch(`${API_BASE_URL}/palpites`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erro ao remover palpites');
        }

        console.log('✅ Todos os palpites foram removidos');
    } catch (error) {
        console.error('❌ Erro ao remover palpites:', error);
        throw error;
    }
}

/**
 * Exporta dados como JSON (banco SQLite não pode ser exportado via API facilmente)
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
