/**
 * Módulo para gerenciar banco de dados SQLite no navegador usando sql.js
 * Os dados são salvos no IndexedDB para persistência
 */

// Variável global para o banco de dados
let db = null;
let SQL = null;
const DB_NAME = 'palpites_db';
const DB_VERSION = 1;
const STORE_NAME = 'sqlite_db';

/**
 * Inicializa sql.js e carrega o banco de dados
 */
async function initSQLite() {
    if (db && SQL) {
        return { db, SQL };
    }

    try {
        // Verifica se sql.js já está carregado
        if (typeof initSqlJs === 'undefined') {
            throw new Error('sql.js não foi carregado. Certifique-se de incluir o script no HTML.');
        }

        // Inicializa SQL.js
        SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
        });

        // Tenta carregar banco existente do IndexedDB
        const savedDb = await loadDatabaseFromIndexedDB();
        
        if (savedDb) {
            db = new SQL.Database(savedDb);
            console.log('✅ Banco de dados carregado do IndexedDB');
        } else {
            db = new SQL.Database();
            console.log('✅ Novo banco de dados criado');
        }

        // Inicializa tabelas
        initTables();

        return { db, SQL };
    } catch (error) {
        console.error('❌ Erro ao inicializar SQLite:', error);
        throw error;
    }
}


/**
 * Carrega banco de dados do IndexedDB
 */
async function loadDatabaseFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.warn('IndexedDB não disponível, criando novo banco');
            resolve(null);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const getRequest = store.get('database');

            getRequest.onsuccess = () => {
                resolve(getRequest.result);
            };

            getRequest.onerror = () => {
                resolve(null);
            };
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
}

/**
 * Salva banco de dados no IndexedDB
 */
async function saveDatabaseToIndexedDB() {
    if (!db) return;

    try {
        const data = db.export();
        const uint8Array = new Uint8Array(data);

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const putRequest = store.put(uint8Array, 'database');

                putRequest.onsuccess = () => {
                    console.log('💾 Banco de dados salvo no IndexedDB');
                    resolve();
                };

                putRequest.onerror = () => reject(putRequest.error);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
        });
    } catch (error) {
        console.error('Erro ao salvar no IndexedDB:', error);
    }
}

/**
 * Inicializa as tabelas do banco de dados
 */
function initTables() {
    if (!db) return;

    try {
        // Cria tabela de palpites
        db.run(`
            CREATE TABLE IF NOT EXISTS palpites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                sexo TEXT NOT NULL CHECK(sexo IN ('menina', 'menino')),
                sugestao_nome TEXT,
                mensagem TEXT NOT NULL,
                data_palpite DATE NOT NULL,
                data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                eh_ganhador INTEGER DEFAULT 0
            )
        `);

        // Tenta adicionar coluna eh_ganhador se não existir (migração)
        try {
            db.run('ALTER TABLE palpites ADD COLUMN eh_ganhador INTEGER DEFAULT 0');
            console.log('✅ Coluna eh_ganhador adicionada');
        } catch (e) {
            // Coluna já existe, ignora
        }

        // Salva após criar tabelas
        saveDatabaseToIndexedDB();
        
        console.log('✅ Tabelas inicializadas');
    } catch (error) {
        console.error('Erro ao inicializar tabelas:', error);
    }
}

/**
 * Adiciona um novo palpite
 */
async function addPalpite(nome, sexo, mensagem, dataPalpite, sugestaoNome = null, ehGanhador = false) {
    await initSQLite();

    try {
        const ehGanhadorInt = ehGanhador ? 1 : 0;
        
        db.run(`
            INSERT INTO palpites (nome, sexo, sugestao_nome, mensagem, data_palpite, eh_ganhador)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [nome, sexo, sugestaoNome, mensagem, dataPalpite, ehGanhadorInt]);

        const result = db.exec('SELECT last_insert_rowid() as id');
        const palpiteId = result[0].values[0][0];

        // Salva no IndexedDB
        await saveDatabaseToIndexedDB();

        return palpiteId;
    } catch (error) {
        console.error('Erro ao adicionar palpite:', error);
        throw error;
    }
}

/**
 * Obtém todos os palpites
 */
async function getAllPalpites() {
    await initSQLite();

    try {
        const result = db.exec(`
            SELECT id, nome, sexo, sugestao_nome, mensagem, 
                   data_palpite, data_registro, eh_ganhador
            FROM palpites
            ORDER BY data_registro DESC
        `);

        if (result.length === 0) {
            return [];
        }

        const rows = result[0].values;
        const columns = result[0].columns;

        return rows.map(row => {
            const palpite = {};
            columns.forEach((col, index) => {
                if (col === 'sugestao_nome') {
                    palpite['sugestaoNome'] = row[index];
                } else if (col === 'data_palpite') {
                    palpite['dataPalpite'] = row[index];
                } else if (col === 'data_registro') {
                    palpite['dataRegistro'] = row[index];
                } else if (col === 'eh_ganhador') {
                    palpite['ehGanhador'] = Boolean(row[index]);
                } else {
                    palpite[col] = row[index];
                }
            });
            return palpite;
        });
    } catch (error) {
        console.error('Erro ao buscar palpites:', error);
        return [];
    }
}

/**
 * Obtém estatísticas dos palpites
 */
async function getStats() {
    await initSQLite();

    try {
        const totalResult = db.exec('SELECT COUNT(*) as total FROM palpites');
        const total = totalResult.length > 0 ? totalResult[0].values[0][0] : 0;

        const meninasResult = db.exec("SELECT COUNT(*) as total FROM palpites WHERE sexo = 'menina'");
        const meninas = meninasResult.length > 0 ? meninasResult[0].values[0][0] : 0;

        const meninosResult = db.exec("SELECT COUNT(*) as total FROM palpites WHERE sexo = 'menino'");
        const meninos = meninosResult.length > 0 ? meninosResult[0].values[0][0] : 0;

        const ganhadorResult = db.exec("SELECT nome FROM palpites WHERE eh_ganhador = 1 LIMIT 1");
        const ganhador = ganhadorResult.length > 0 && ganhadorResult[0].values.length > 0 
            ? ganhadorResult[0].values[0][0] 
            : null;

        return {
            total,
            meninas,
            meninos,
            ganhador
        };
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return { total: 0, meninas: 0, meninos: 0, ganhador: null };
    }
}

/**
 * Obtém informações do ganhador
 */
async function getGanhador() {
    await initSQLite();

    try {
        const result = db.exec(`
            SELECT id, nome, sexo, sugestao_nome, mensagem, 
                   data_palpite, data_registro
            FROM palpites
            WHERE eh_ganhador = 1
            LIMIT 1
        `);

        if (result.length === 0 || result[0].values.length === 0) {
            return null;
        }

        const row = result[0].values[0];
        const columns = result[0].columns;

        const ganhador = {};
        columns.forEach((col, index) => {
            if (col === 'sugestao_nome') {
                ganhador['sugestaoNome'] = row[index];
            } else if (col === 'data_palpite') {
                ganhador['dataPalpite'] = row[index];
            } else if (col === 'data_registro') {
                ganhador['dataRegistro'] = row[index];
            } else {
                ganhador[col] = row[index];
            }
        });

        return ganhador;
    } catch (error) {
        console.error('Erro ao buscar ganhador:', error);
        return null;
    }
}

/**
 * Remove todos os palpites
 */
async function clearAllPalpites() {
    await initSQLite();

    try {
        db.run('DELETE FROM palpites');
        await saveDatabaseToIndexedDB();
        console.log('✅ Todos os palpites foram removidos');
    } catch (error) {
        console.error('Erro ao limpar palpites:', error);
        throw error;
    }
}

/**
 * Exporta banco de dados como arquivo
 */
async function exportDatabase() {
    await initSQLite();

    try {
        const data = db.export();
        const blob = new Blob([data], { type: 'application/x-sqlite3' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `palpites_${new Date().toISOString().split('T')[0]}.db`;
        link.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Erro ao exportar banco:', error);
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

