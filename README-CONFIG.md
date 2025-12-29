# ⚙️ Configuração usando Arquivo .env

## 📋 Sobre

Este projeto permite usar variáveis de ambiente do arquivo `.env` para configurar as credenciais do Supabase, mantendo as informações sensíveis fora do código.

## 🚀 Como Configurar

### Passo 1: Criar Arquivo .env

1. Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```

   Ou crie manualmente um arquivo `.env` na raiz do projeto.

2. Edite o arquivo `.env` com suas credenciais do Supabase:
   ```env
   SUPABASE_URL=https://wpoylhkuonuzmugtxodn.supabase.co
   SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```

### Passo 2: Gerar config.js

Execute o script de build para gerar o `config.js` a partir do `.env`:

```bash
node build-config.js
```

Ou usando npm:

```bash
npm run build-config
```

### Passo 3: Verificar

O arquivo `config.js` será gerado automaticamente com as credenciais do `.env`.

## 📝 Estrutura dos Arquivos

```
projeto/
├── .env              # Suas credenciais (não commitado)
├── .env.example      # Template de exemplo (commitado)
├── config.js         # Gerado automaticamente (não commitado)
├── config.js.example # Exemplo manual (commitado)
└── build-config.js   # Script de build
```

## 🔒 Segurança

- ✅ `.env` está no `.gitignore` (não será commitado)
- ✅ `config.js` está no `.gitignore` (não será commitado)
- ✅ Apenas `.env.example` e `config.js.example` são commitados
- ✅ Nunca commite suas credenciais reais

## 🔄 Workflow

### Desenvolvimento Local

1. Edite `.env` com suas credenciais
2. Execute `node build-config.js`
3. Abra `index.html` no navegador

### Atualizar Credenciais

1. Edite o arquivo `.env`
2. Execute `node build-config.js` novamente
3. O `config.js` será atualizado

### Deploy/Hospedagem

**Opção 1: Usar .env (com build)**
- Configure as variáveis de ambiente no servidor
- Execute `node build-config.js` durante o build
- Faça deploy do `config.js` gerado

**Opção 2: Configuração Manual**
- Edite `config.js` diretamente (apenas para deploy)
- Ou use variáveis de ambiente do servidor

**Opção 3: Variáveis de Ambiente do Servidor**
- Netlify: Site settings > Environment variables
- Vercel: Project settings > Environment variables
- GitHub Pages: Não suporta variáveis, use `config.js` manual

## ⚙️ Usando Variáveis de Ambiente do Servidor

Se o servidor de hospedagem suporta variáveis de ambiente (Netlify, Vercel, etc.):

### Netlify

1. Configure em: Site settings > Environment variables
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

2. Durante o build, o `build-config.js` lerá do ambiente:
   ```javascript
   const SUPABASE_URL = process.env.SUPABASE_URL || env.SUPABASE_URL;
   ```

### Vercel

1. Configure em: Project settings > Environment variables
2. O Vercel automaticamente disponibiliza via `process.env`

## 🐛 Troubleshooting

### Erro: "Arquivo .env não encontrado"
- Certifique-se de que o arquivo `.env` existe na raiz do projeto
- Verifique se você copiou de `.env.example`

### Erro: "SUPABASE_URL e SUPABASE_ANON_KEY devem estar definidos"
- Verifique se as variáveis estão no arquivo `.env`
- Certifique-se de que não há espaços extras ou aspas incorretas

### config.js não está sendo gerado
- Verifique se o Node.js está instalado: `node --version`
- Verifique permissões de escrita na pasta

## 📚 Arquivos Relacionados

- `.env.example` - Template de exemplo
- `build-config.js` - Script que processa .env
- `config.js` - Arquivo gerado (não editar manualmente)
- `config.js.example` - Exemplo manual alternativo

---

**Dica**: Sempre teste localmente antes de fazer deploy!

