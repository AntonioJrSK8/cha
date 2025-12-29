-- ============================================
-- Script SQL para criar tabelas no Supabase
-- Árvore dos Palpites - Reveillon do Bebê
-- ============================================

-- Cria a tabela de palpites
CREATE TABLE IF NOT EXISTS public.palpites (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    sexo TEXT NOT NULL CHECK (sexo IN ('menina', 'menino')),
    sugestao_nome TEXT,
    mensagem TEXT NOT NULL,
    data_palpite DATE NOT NULL,
    data_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    eh_ganhador INTEGER DEFAULT 0 CHECK (eh_ganhador IN (0, 1))
);

-- ============================================
-- Políticas de Segurança (RLS - Row Level Security)
-- ============================================

-- Habilita RLS na tabela
ALTER TABLE public.palpites ENABLE ROW LEVEL SECURITY;

-- Política: Permite leitura pública (qualquer um pode ler)
CREATE POLICY "Permitir leitura pública de palpites"
    ON public.palpites
    FOR SELECT
    USING (true);

-- Política: Permite inserção pública (qualquer um pode adicionar)
CREATE POLICY "Permitir inserção pública de palpites"
    ON public.palpites
    FOR INSERT
    WITH CHECK (true);

-- Política: Permite atualização pública (opcional - descomente se necessário)
-- CREATE POLICY "Permitir atualização pública de palpites"
--     ON public.palpites
--     FOR UPDATE
--     USING (true)
--     WITH CHECK (true);

-- Política: Permite deleção pública (opcional - descomente se necessário)
-- CREATE POLICY "Permitir deleção pública de palpites"
--     ON public.palpites
--     FOR DELETE
--     USING (true);

-- ============================================
-- Índices para melhor performance
-- ============================================

-- Índice para buscas por data de registro (ordenar por mais recentes)
CREATE INDEX IF NOT EXISTS idx_palpites_data_registro ON public.palpites(data_registro DESC);

-- Índice para buscas por sexo
CREATE INDEX IF NOT EXISTS idx_palpites_sexo ON public.palpites(sexo);

-- Índice para buscar ganhador
CREATE INDEX IF NOT EXISTS idx_palpites_eh_ganhador ON public.palpites(eh_ganhador);

-- ============================================
-- Comentários nas colunas (documentação)
-- ============================================

COMMENT ON TABLE public.palpites IS 'Tabela que armazena os palpites dos convidados sobre o sexo do bebê';
COMMENT ON COLUMN public.palpites.id IS 'ID único do palpite';
COMMENT ON COLUMN public.palpites.nome IS 'Nome da pessoa que fez o palpite';
COMMENT ON COLUMN public.palpites.sexo IS 'Palpite do sexo: menina ou menino';
COMMENT ON COLUMN public.palpites.sugestao_nome IS 'Sugestão de nome para o bebê (opcional)';
COMMENT ON COLUMN public.palpites.mensagem IS 'Mensagem carinhosa do convidado';
COMMENT ON COLUMN public.palpites.data_palpite IS 'Data do palpite';
COMMENT ON COLUMN public.palpites.data_registro IS 'Data e hora de registro no sistema';
COMMENT ON COLUMN public.palpites.eh_ganhador IS 'Indica se é o ganhador do voucher (10º palpite)';

-- ============================================
-- Exemplos de inserção (opcional)
-- ============================================

-- Exemplo 1: Palpite de menina
-- INSERT INTO public.palpites (nome, sexo, mensagem, data_palpite, sugestao_nome)
-- VALUES ('Maria Silva', 'menina', 'Parabéns pelo bebê!', '2025-12-28', 'Ana');

-- Exemplo 2: Palpite de menino
-- INSERT INTO public.palpites (nome, sexo, mensagem, data_palpite, sugestao_nome)
-- VALUES ('João Santos', 'menino', 'Que venha com saúde!', '2025-12-28', 'Pedro');

-- Exemplo 3: Palpite sem sugestão de nome
-- INSERT INTO public.palpites (nome, sexo, mensagem, data_palpite)
-- VALUES ('Ana Costa', 'menina', 'Muita felicidade!', '2025-12-28');

-- Exemplo 4: 10º palpite (ganhador do voucher)
-- INSERT INTO public.palpites (nome, sexo, mensagem, data_palpite, eh_ganhador)
-- VALUES ('Marcia Brandão', 'menina', 'Parabéns! Palavra chave: BRANDAO10', '2025-12-28', 1);

-- ============================================
-- Consultas úteis
-- ============================================

-- Listar todos os palpites ordenados por data (mais recentes primeiro)
-- SELECT * FROM public.palpites ORDER BY data_registro DESC;

-- Contar total de palpites
-- SELECT COUNT(*) as total FROM public.palpites;

-- Contar palpites por sexo
-- SELECT sexo, COUNT(*) as total FROM public.palpites GROUP BY sexo;

-- Buscar o ganhador (eh_ganhador = 1)
-- SELECT * FROM public.palpites WHERE eh_ganhador = 1;

-- Estatísticas completas
-- SELECT 
--     COUNT(*) as total,
--     SUM(CASE WHEN sexo = 'menina' THEN 1 ELSE 0 END) as meninas,
--     SUM(CASE WHEN sexo = 'menino' THEN 1 ELSE 0 END) as meninos,
--     (SELECT nome FROM public.palpites WHERE eh_ganhador = 1 LIMIT 1) as ganhador
-- FROM public.palpites;

