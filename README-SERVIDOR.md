# 🚀 Servidor Node.js para Banco SQLite Compartilhado

## 📋 Sobre

Este servidor permite que **todos os navegadores compartilhem o mesmo banco de dados SQLite** (`palpites.db`). Os dados são centralizados em um único arquivo no servidor.

## 🔧 Instalação

1. **Instale o Node.js** (versão 14 ou superior):
   - Download: https://nodejs.org/

2. **Instale as dependências**:
   ```bash
   npm install
   ```

## 🚀 Como Usar

### Iniciar o Servidor

```bash
npm start
```

Ou:

```bash
node server.js
```

O servidor iniciará em `http://localhost:3000`

### Acessar o Site

Abra no navegador:
```
http://localhost:3000/index.html
```

## 📊 Endpoints da API

### GET /api/palpites
Lista todos os palpites

**Resposta:**
```json
{
  "palpites": [
    {
      "id": 1,
      "nome": "João Silva",
      "sexo": "menino",
      "sugestaoNome": "Pedro",
      "mensagem": "Parabéns!",
      "dataPalpite": "2025-12-28",
      "dataRegistro": "2025-12-28T10:30:00",
      "ehGanhador": false
    }
  ]
}
```

### POST /api/palpites
Adiciona um novo palpite

**Body:**
```json
{
  "nome": "Maria Silva",
  "sexo": "menina",
  "mensagem": "Parabéns!",
  "dataPalpite": "2025-12-28",
  "sugestaoNome": "Ana" // opcional
}
```

**Resposta:**
```json
{
  "id": 2,
  "message": "Palpite adicionado com sucesso",
  "ehGanhador": false
}
```

### GET /api/stats
Retorna estatísticas

**Resposta:**
```json
{
  "total": 15,
  "meninas": 8,
  "meninos": 7,
  "ganhador": "Nome do Ganhador"
}
```

### DELETE /api/palpites
Remove todos os palpites

**Resposta:**
```json
{
  "message": "Todos os palpites foram removidos"
}
```

## 🌐 Hospedagem

### Opção 1: Servidor Próprio (VPS)
- Instale Node.js no servidor
- Execute `npm install` e `npm start`
- Configure proxy reverso (nginx) se necessário

### Opção 2: Serviços Cloud
- **Heroku**: Deploy automático
- **Railway**: Simples e rápido
- **Render**: Gratuito com limitações
- **Fly.io**: Bom para Node.js

### Opção 3: Vercel/Netlify
- Não recomendado (são serverless)
- Prefira serviços com servidor persistente

## 📝 Variáveis de Ambiente

- `PORT`: Porta do servidor (padrão: 3000)

Exemplo:
```bash
PORT=8080 npm start
```

## 🔒 Segurança

**IMPORTANTE**: Este servidor é para uso interno/local. Para produção:

1. Adicione autenticação/autorização
2. Configure HTTPS
3. Valide e sanitize todas as entradas
4. Configure rate limiting
5. Use variáveis de ambiente para dados sensíveis

## 💾 Backup

O arquivo `palpites.db` contém todos os dados. Faça backup regular:

```bash
# Backup manual
cp palpites.db palpites_backup_$(date +%Y%m%d).db
```

## 🐛 Troubleshooting

### Porta já está em uso
```bash
# Use outra porta
PORT=3001 npm start
```

### Erro ao criar banco de dados
- Verifique permissões de escrita no diretório
- Certifique-se de que o Node.js tem acesso ao diretório

### API não responde
- Verifique se o servidor está rodando
- Verifique a porta no console
- Teste com `curl http://localhost:3000/api/stats`

## 📚 Dependências

- **express**: Servidor HTTP
- **better-sqlite3**: Driver SQLite para Node.js (mais rápido)
- **cors**: Permite requisições de outros domínios

---

**Desenvolvido com ❤️ para compartilhar dados entre navegadores**



