# 🚀 Configuração do Supabase

## 📋 Sobre

Este projeto usa **Supabase** (PostgreSQL na nuvem) como banco de dados, funcionando 100% em JavaScript no navegador, sem necessidade de servidor Node.js.

## ✨ Vantagens

- ✅ **100% JavaScript** - Sem servidor backend necessário
- ✅ **Gratuito** - Plano gratuito generoso
- ✅ **Compartilhado** - Todos os navegadores compartilham o mesmo banco
- ✅ **Escalável** - Suporta milhões de registros
- ✅ **Seguro** - Row Level Security (RLS) configurado
- ✅ **Fácil** - Configuração simples

## 🚀 Como Configurar

### Passo 1: Criar Conta no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub (ou crie conta)
4. Clique em "New Project"

### Passo 2: Criar Projeto

1. **Nome do Projeto**: `arvore-palpites` (ou qualquer nome)
2. **Database Password**: Crie uma senha forte (salve em local seguro)
3. **Region**: Escolha a região mais próxima (ex: `South America (São Paulo)`)
4. Clique em "Create new project"
5. Aguarde 2-3 minutos enquanto o projeto é criado

### Passo 3: Obter Credenciais

1. No painel do projeto, vá em **Settings** (⚙️) > **API**
2. Copie os seguintes valores:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public** key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Passo 4: Configurar no Projeto

**Opção A: Usando Arquivo .env (Recomendado)**

1. Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` com suas credenciais:
   ```env
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```

3. Gere o `config.js` a partir do `.env`:
   ```bash
   node build-config.js
   ```
   
   Ou usando npm:
   ```bash
   npm run build-config
   ```

**Opção B: Editar config.js Manualmente**

1. Abra o arquivo `config.js`
2. Substitua os valores diretamente

**⚠️ IMPORTANTE**: Não commite credenciais reais no Git! Use `.env` (recomendado) ou configure diretamente no servidor de produção.

### Passo 5: Criar Tabela no Supabase

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Cole o conteúdo do arquivo `supabase_schema.sql`
4. Clique em "Run" (ou pressione Ctrl+Enter)
5. Verifique se aparece "Success. No rows returned"

### Passo 6: Verificar Tabela

1. Vá em **Table Editor**
2. Você deve ver a tabela `palpites`
3. A tabela deve estar vazia inicialmente

## 📊 Estrutura da Tabela

```
palpites
├── id (BIGSERIAL, PRIMARY KEY)
├── nome (TEXT, NOT NULL)
├── sexo (TEXT, NOT NULL - 'menina' ou 'menino')
├── sugestao_nome (TEXT, NULLABLE)
├── mensagem (TEXT, NOT NULL)
├── data_palpite (DATE, NOT NULL)
├── data_registro (TIMESTAMP, DEFAULT: NOW())
└── eh_ganhador (BOOLEAN, DEFAULT: false)
```

## 🔒 Segurança (RLS)

O projeto está configurado com **Row Level Security**:

- ✅ **Leitura pública**: Qualquer um pode ler palpites
- ✅ **Inserção pública**: Qualquer um pode adicionar palpites
- ❌ **Atualização**: Desabilitada por padrão (comentada no SQL)
- ❌ **Deleção**: Desabilitada por padrão (comentada no SQL)

Para habilitar atualização/deleção, descomente as políticas no `supabase_schema.sql`.

## 🌐 Usar em Produção

### Opção 1: Variáveis de Ambiente (Recomendado)

Não commite `config.js` com credenciais. Use variáveis de ambiente:

1. Crie `.env` (não commitado):
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-aqui
```

2. No HTML, use:
```html
<script>
    window.SUPABASE_URL = '%%SUPABASE_URL%%'; // Substituir no build
    window.SUPABASE_ANON_KEY = '%%SUPABASE_ANON_KEY%%';
</script>
```

### Opção 2: Configurar no Servidor

Configure as variáveis diretamente no servidor de hospedagem:
- Netlify: Site settings > Environment variables
- Vercel: Project settings > Environment variables
- GitHub Pages: Não suporta variáveis, use `config.js`

### Opção 3: Configurar em Runtime

Modifique `config.js` para carregar de uma fonte segura:

```javascript
// Carregar de um endpoint seguro do seu servidor
fetch('/api/config')
    .then(r => r.json())
    .then(config => {
        window.SUPABASE_URL = config.url;
        window.SUPABASE_ANON_KEY = config.key;
    });
```

## 🧪 Testar a Conexão

Abra o console do navegador (F12) e verifique:

```javascript
// Deve aparecer: ✅ Cliente Supabase inicializado
```

Se aparecer erro, verifique:
- ✅ Credenciais estão corretas em `config.js`
- ✅ Tabela `palpites` foi criada no Supabase
- ✅ Políticas RLS estão habilitadas

## 📝 Comandos SQL Úteis

### Ver todos os palpites:
```sql
SELECT * FROM palpites ORDER BY data_registro DESC;
```

### Contar por sexo:
```sql
SELECT sexo, COUNT(*) FROM palpites GROUP BY sexo;
```

### Ver ganhador:
```sql
SELECT * FROM palpites WHERE eh_ganhador = true;
```

### Limpar todos os dados (cuidado!):
```sql
DELETE FROM palpites;
```

## 🐛 Troubleshooting

### Erro: "Invalid API key"
- Verifique se copiou a chave completa (é muito longa)
- Certifique-se de usar a chave "anon public", não a "service_role"

### Erro: "relation 'palpites' does not exist"
- Execute o script `supabase_schema.sql` no SQL Editor
- Verifique se está usando o schema `public`

### Erro: "new row violates row-level security policy"
- Verifique se as políticas RLS estão criadas
- Execute novamente as políticas no SQL Editor

### Dados não aparecem
- Verifique o console do navegador para erros
- Confira se as políticas RLS permitem leitura pública
- Teste no SQL Editor do Supabase se os dados existem

## 💰 Limites do Plano Gratuito

- **500 MB** de espaço no banco
- **2 GB** de transferência por mês
- **2 GB** de armazenamento de arquivos
- **50,000** usuários mensais ativos
- Suporta até ~1 milhão de palpites (estimado)

## 🔄 Migração de Dados

Se você tinha dados no SQLite local:

1. Exporte para JSON do banco antigo
2. Use o SQL Editor do Supabase para inserir:
```sql
INSERT INTO palpites (nome, sexo, mensagem, data_palpite, sugestao_nome)
VALUES ('Nome', 'menina', 'Mensagem', '2025-12-28', 'Sugestão');
```

Ou crie um script para importar via API do Supabase.

## 📚 Documentação Adicional

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Desenvolvido com ❤️ usando Supabase**

