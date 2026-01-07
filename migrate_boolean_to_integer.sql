-- ============================================
-- Script de Migração: BOOLEAN → INTEGER
-- Execute este script se a tabela já foi criada com BOOLEAN
-- ============================================

-- Altera a coluna eh_ganhador de BOOLEAN para INTEGER
ALTER TABLE public.palpites 
    ALTER COLUMN eh_ganhador TYPE INTEGER 
    USING CASE 
        WHEN eh_ganhador = true THEN 1 
        WHEN eh_ganhador = false THEN 0 
        ELSE 0 
    END;

-- Adiciona constraint para garantir que seja apenas 0 ou 1
ALTER TABLE public.palpites 
    ADD CONSTRAINT check_eh_ganhador 
    CHECK (eh_ganhador IN (0, 1));

-- Define valor padrão
ALTER TABLE public.palpites 
    ALTER COLUMN eh_ganhador SET DEFAULT 0;



