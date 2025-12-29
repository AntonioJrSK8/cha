# 🚀 Configuração para Vercel

## Estrutura Criada

```
├── api/
│   ├── database.py      # Módulo SQLite (usa /tmp no Vercel)
│   ├── palpites.py      # Serverless Function para /api/palpites
│   └── stats.py         # Serverless Function para /api/stats
├── vercel.json          # Configuração do Vercel
└── requirements.txt     # Dependências (vazio - SQLite é built-in)
```

## ⚠️ IMPORTANTE: Limitação do SQLite no Vercel

**O SQLite no Vercel tem uma limitação crítica:**

- O Vercel é **serverless e stateless**
- Cada Serverless Function roda em um container separado
- O arquivo SQLite em `/tmp` **pode ser perdido** quando:
  - O container é reiniciado
  - Há um novo deployment
  - O container fica inativo por muito tempo

**Recomendação**: Para produção com persistência garantida, use um banco na nuvem:
- **Turso** (SQLite na nuvem) - mantém SQLite
- **Supabase** (PostgreSQL gratuito)
- **PlanetScale** (MySQL serverless)
- **MongoDB Atlas** (MongoDB gratuito)

## 📝 Como Fazer Deploy

1. **Instale Vercel CLI**:
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

4. **Produção**:
   ```bash
   vercel --prod
   ```

## 🔧 Testando Localmente

Para testar as Serverless Functions localmente:

```bash
vercel dev
```

Isso iniciará um servidor local que simula o ambiente do Vercel.

## 📊 Estrutura da API

### GET /api/palpites
Lista todos os palpites

### POST /api/palpites
Adiciona um novo palpite
```json
{
  "nome": "Nome",
  "sexo": "menina" | "menino",
  "mensagem": "Mensagem",
  "dataPalpite": "2025-12-28",
  "sugestaoNome": "Nome sugerido (opcional)"
}
```

### DELETE /api/palpites
Remove todos os palpites

### GET /api/stats
Retorna estatísticas dos palpites

