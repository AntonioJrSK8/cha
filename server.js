/**
 * Servidor Node.js simples para gerenciar o banco SQLite compartilhado
 * Todos os navegadores compartilham o mesmo arquivo palpites.db
 */

const express = require('express');
const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'palpites.db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve arquivos estáticos

// Inicializa o banco de dados
function initDB() {
    const db = sqlite3(DB_PATH);
    
    // Cria tabela se não existir
    db.exec(`
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
    
    // Tenta adicionar coluna eh_ganhador se não existir
    try {
        db.exec('ALTER TABLE palpites ADD COLUMN eh_ganhador INTEGER DEFAULT 0');
        console.log('✅ Coluna eh_ganhador adicionada');
    } catch (e) {
        // Coluna já existe, ignora
    }
    
    db.close();
    console.log('✅ Banco de dados inicializado:', DB_PATH);
}

// GET /api/palpites - Lista todos os palpites
app.get('/api/palpites', (req, res) => {
    try {
        const db = sqlite3(DB_PATH);
        const palpites = db.prepare(`
            SELECT id, nome, sexo, sugestao_nome, mensagem, 
                   data_palpite, data_registro, eh_ganhador
            FROM palpites
            ORDER BY data_registro DESC
        `).all();
        
        db.close();
        
        // Converte para formato esperado pelo frontend
        const formatted = palpites.map(p => ({
            id: p.id,
            nome: p.nome,
            sexo: p.sexo,
            sugestaoNome: p.sugestao_nome,
            mensagem: p.mensagem,
            dataPalpite: p.data_palpite,
            dataRegistro: p.data_registro,
            ehGanhador: Boolean(p.eh_ganhador)
        }));
        
        res.json({ palpites: formatted });
    } catch (error) {
        console.error('Erro ao buscar palpites:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/palpites - Adiciona novo palpite
app.post('/api/palpites', (req, res) => {
    try {
        const { nome, sexo, mensagem, dataPalpite, sugestaoNome } = req.body;
        
        // Validação
        if (!nome || !sexo || !mensagem || !dataPalpite) {
            return res.status(400).json({ error: 'Dados incompletos' });
        }
        
        if (sexo !== 'menina' && sexo !== 'menino') {
            return res.status(400).json({ error: 'Sexo inválido' });
        }
        
        const db = sqlite3(DB_PATH);
        
        // Verifica se é o 10º palpite (ganhador)
        const total = db.prepare('SELECT COUNT(*) as total FROM palpites').get();
        const ehGanhador = (total.total + 1) === 10;
        
        // Insere o palpite
        const result = db.prepare(`
            INSERT INTO palpites (nome, sexo, sugestao_nome, mensagem, data_palpite, eh_ganhador)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(nome, sexo, sugestaoNome || null, mensagem, dataPalpite, ehGanhador ? 1 : 0);
        
        db.close();
        
        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Palpite adicionado com sucesso',
            ehGanhador
        });
    } catch (error) {
        console.error('Erro ao adicionar palpite:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/stats - Estatísticas
app.get('/api/stats', (req, res) => {
    try {
        const db = sqlite3(DB_PATH);
        
        const total = db.prepare('SELECT COUNT(*) as total FROM palpites').get();
        const meninas = db.prepare("SELECT COUNT(*) as total FROM palpites WHERE sexo = 'menina'").get();
        const meninos = db.prepare("SELECT COUNT(*) as total FROM palpites WHERE sexo = 'menino'").get();
        const ganhador = db.prepare('SELECT nome FROM palpites WHERE eh_ganhador = 1 LIMIT 1').get();
        
        db.close();
        
        res.json({
            total: total.total,
            meninas: meninas.total,
            meninos: meninos.total,
            ganhador: ganhador ? ganhador.nome : null
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/palpites - Remove todos os palpites
app.delete('/api/palpites', (req, res) => {
    try {
        const db = sqlite3(DB_PATH);
        db.prepare('DELETE FROM palpites').run();
        db.close();
        
        res.json({ message: 'Todos os palpites foram removidos' });
    } catch (error) {
        console.error('Erro ao remover palpites:', error);
        res.status(500).json({ error: error.message });
    }
});

// Inicializa o banco ao iniciar
initDB();

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📊 Banco de dados: ${DB_PATH}`);
    console.log(`🌐 Acesse: http://localhost:${PORT}/index.html`);
});
