-- ============================================
-- Script de inicialização do banco de dados
-- Execute este script para criar o banco do zero
-- ============================================

-- Remove a tabela se já existir (CUIDADO: apaga todos os dados!)
-- DROP TABLE IF EXISTS palpites;

-- Cria a tabela de palpites
CREATE TABLE palpites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    sexo TEXT NOT NULL CHECK(sexo IN ('menina', 'menino')),
    sugestao_nome TEXT,
    mensagem TEXT NOT NULL,
    data_palpite DATE NOT NULL,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    eh_ganhador INTEGER DEFAULT 0
);

-- Cria índices para melhor performance
CREATE INDEX idx_data_registro ON palpites(data_registro DESC);
CREATE INDEX idx_sexo ON palpites(sexo);
CREATE INDEX idx_eh_ganhador ON palpites(eh_ganhador);

-- Verifica se a tabela foi criada corretamente
SELECT name FROM sqlite_master WHERE type='table' AND name='palpites';

