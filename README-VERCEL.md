# 🌳 Árvore dos Palpites - Deploy no Vercel

Este projeto está configurado para funcionar no Vercel com Serverless Functions em Python e SQLite.

## 📋 Estrutura do Projeto

```
├── api/
│   ├── database.py      # Módulo de banco de dados SQLite
│   ├── palpites.py      # Serverless Function para /api/palpites
│   └── stats.py         # Serverless Function para /api/stats
├── vercel.json          # Configuração do Vercel
├── requirements.txt     # Dependências Python
└── arquivos estáticos   # index.html, script.js, style.css, etc.
```

## 🚀 Como Fazer Deploy no Vercel

### Opção 1: Usando Vercel CLI

1. **Instale o Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Faça login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Para produção**:
   ```bash
   vercel --prod
   ```

### Opção 2: Usando GitHub

1. **Conecte o repositório ao Vercel**:
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "Add New Project"
   - Conecte seu repositório GitHub
   - O Vercel detectará automaticamente as configurações

2. **Configure as variáveis de ambiente** (se necessário):
   - No painel do Vercel, vá em Settings → Environment Variables

3. **Deploy automático**:
   - Cada push no GitHub fará deploy automaticamente

## ⚠️ Importante sobre SQLite no Vercel

**SQLite no Vercel tem limitações**:

- O Vercel é serverless e stateless
- Cada Serverless Function pode estar em um container diferente
- O arquivo SQLite em `/tmp` **pode ser perdido** entre deployments ou reinicializações
- **Recomendado para produção**: Use um banco de dados na nuvem (Supabase, PlanetScale, MongoDB Atlas, etc.)

### Alternativas para Banco de Dados Persistente

1. **Supabase** (PostgreSQL gratuito)
2. **Turso** (SQLite na nuvem)
3. **PlanetScale** (MySQL serverless)
4. **MongoDB Atlas** (MongoDB gratuito)

## 🔧 Configuração Atual

- **Serverless Functions**: Python
- **Banco de Dados**: SQLite em `/tmp/palpites.db`
- **API Endpoints**:
  - `GET /api/palpites` - Lista todos os palpites
  - `POST /api/palpites` - Adiciona novo palpite
  - `DELETE /api/palpites` - Remove todos os palpites
  - `GET /api/stats` - Estatísticas dos palpites

## 📝 Notas

- O banco SQLite será criado automaticamente na primeira requisição
- Os dados podem ser perdidos em novos deployments
- Para dados persistentes, considere migrar para um banco na nuvem

## 🔄 Migração para Banco na Nuvem

Se precisar de persistência garantida, você pode migrar para:
- Supabase (PostgreSQL) - mais simples
- Turso (SQLite na nuvem) - mantém SQLite
- Outros bancos cloud

