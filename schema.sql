-- ============================================
-- Script SQL para criar o banco de dados
-- Árvore dos Palpites - Reveillon do Bebê
-- ============================================

-- Cria a tabela de palpites
CREATE TABLE IF NOT EXISTS palpites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    sexo TEXT NOT NULL CHECK(sexo IN ('menina', 'menino')),
    sugestao_nome TEXT,
    mensagem TEXT NOT NULL,
    data_palpite DATE NOT NULL,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    eh_ganhador INTEGER DEFAULT 0
);

-- ============================================
-- Índices para melhor performance
-- ============================================

-- Índice para buscas por data de registro (ordenar por mais recentes)
CREATE INDEX IF NOT EXISTS idx_data_registro ON palpites(data_registro DESC);

-- Índice para buscas por sexo
CREATE INDEX IF NOT EXISTS idx_sexo ON palpites(sexo);

-- Índice para buscar ganhador
CREATE INDEX IF NOT EXISTS idx_eh_ganhador ON palpites(eh_ganhador);

-- ============================================
-- Exemplos de inserção (opcional)
-- ============================================

-- Exemplo 1: Palpite de menina
-- INSERT INTO palpites (nome, sexo, mensagem, data_palpite, sugestao_nome)
-- VALUES ('Maria Silva', 'menina', 'Parabéns pelo bebê!', '2025-12-28', 'Ana');

-- Exemplo 2: Palpite de menino
-- INSERT INTO palpites (nome, sexo, mensagem, data_palpite, sugestao_nome)
-- VALUES ('João Santos', 'menino', 'Que venha com saúde!', '2025-12-28', 'Pedro');

-- Exemplo 3: Palpite sem sugestão de nome
-- INSERT INTO palpites (nome, sexo, mensagem, data_palpite)
-- VALUES ('Ana Costa', 'menina', 'Muita felicidade!', '2025-12-28');

-- Exemplo 4: 10º palpite (ganhador do voucher)
-- INSERT INTO palpites (nome, sexo, mensagem, data_palpite, eh_ganhador)
-- VALUES ('Marcia Brandão', 'menina', 'Parabéns! Palavra chave: BRANDAO10', '2025-12-28', 1);

-- ============================================
-- Consultas úteis
-- ============================================

-- Listar todos os palpites ordenados por data (mais recentes primeiro)
-- SELECT * FROM palpites ORDER BY data_registro DESC;

-- Contar total de palpites
-- SELECT COUNT(*) as total FROM palpites;

-- Contar palpites por sexo
-- SELECT sexo, COUNT(*) as total FROM palpites GROUP BY sexo;

-- Buscar o ganhador
-- SELECT * FROM palpites WHERE eh_ganhador = 1;

-- Estatísticas completas
-- SELECT 
--     COUNT(*) as total,
--     SUM(CASE WHEN sexo = 'menina' THEN 1 ELSE 0 END) as meninas,
--     SUM(CASE WHEN sexo = 'menino' THEN 1 ELSE 0 END) as meninos,
--     (SELECT nome FROM palpites WHERE eh_ganhador = 1 LIMIT 1) as ganhador
-- FROM palpites;

-- ============================================
-- Manutenção do banco
-- ============================================

-- Remover todos os palpites (cuidado!)
-- DELETE FROM palpites;

-- Remover palpite específico por ID
-- DELETE FROM palpites WHERE id = 1;

-- Atualizar palpite existente
-- UPDATE palpites 
-- SET mensagem = 'Nova mensagem' 
-- WHERE id = 1;

-- Vacuum para otimizar o banco (reduz tamanho do arquivo)
-- VACUUM;

