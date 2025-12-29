# 🔄 Instruções de Migração: BOOLEAN → INTEGER

## ⚠️ IMPORTANTE

Se você já criou a tabela `palpites` no Supabase com o tipo `BOOLEAN`, precisa migrar para `INTEGER` usando o script de migração.

## 📋 Passos para Migração

### 1. Verifique o Tipo Atual da Coluna

No SQL Editor do Supabase, execute:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'palpites' 
AND column_name = 'eh_ganhador';
```

### 2a. Se a Coluna é BOOLEAN (precisa migrar)

Execute o script `migrate_boolean_to_integer.sql` no SQL Editor:

```sql
-- Altera de BOOLEAN para INTEGER
ALTER TABLE public.palpites 
    ALTER COLUMN eh_ganhador TYPE INTEGER 
    USING CASE 
        WHEN eh_ganhador = true THEN 1 
        WHEN eh_ganhador = false THEN 0 
        ELSE 0 
    END;

-- Adiciona constraint
ALTER TABLE public.palpites 
    ADD CONSTRAINT check_eh_ganhador 
    CHECK (eh_ganhador IN (0, 1));

-- Define valor padrão
ALTER TABLE public.palpites 
    ALTER COLUMN eh_ganhador SET DEFAULT 0;
```

### 2b. Se a Coluna é INTEGER (já está correto)

Não precisa fazer nada! Continue usando normalmente.

### 3. Se Criar Tabela Nova

Use o script `supabase_schema.sql` atualizado que já cria a coluna como `INTEGER`.

## ✅ Verificação

Após a migração, execute para verificar:
```sql
SELECT * FROM public.palpites LIMIT 1;
```

A coluna `eh_ganhador` deve mostrar `0` ou `1`, não `true`/`false`.

## 📝 Notas

- **0** = Não é ganhador (false)
- **1** = É ganhador (true)
- O código JavaScript já está configurado para usar 0/1
- As consultas foram atualizadas para usar `= 1` ao invés de `= true`

