# 📊 Criando o Banco de Dados SQLite

## 📋 Arquivos SQL Disponíveis

### 1. `schema.sql`
Script completo com:
- Criação da tabela
- Índices para performance
- Exemplos de inserção
- Consultas úteis
- Comandos de manutenção

### 2. `init_database.sql`
Script simples para inicialização rápida:
- Cria apenas a estrutura básica
- Sem dados de exemplo

## 🚀 Como Criar o Banco de Dados

### Opção 1: Usando o Servidor Node.js (Automático)

O servidor cria automaticamente o banco quando iniciado:

```bash
npm start
```

O arquivo `palpites.db` será criado automaticamente na primeira execução.

### Opção 2: Usando SQLite CLI

1. **Instale o SQLite**:
   - Windows: Download de https://www.sqlite.org/download.html
   - Linux: `sudo apt-get install sqlite3`
   - Mac: `brew install sqlite3`

2. **Execute o script**:
   ```bash
   sqlite3 palpites.db < schema.sql
   ```
   
   Ou para inicialização simples:
   ```bash
   sqlite3 palpites.db < init_database.sql
   ```

3. **Verifique se foi criado**:
   ```bash
   sqlite3 palpites.db ".tables"
   ```

### Opção 3: Usando Interface Gráfica

#### DB Browser for SQLite (Recomendado)
1. Baixe: https://sqlitebrowser.org/
2. Abra o programa
3. Crie novo banco: `File > New Database`
4. Salve como `palpites.db`
5. Vá em `Execute SQL` e cole o conteúdo de `schema.sql` ou `init_database.sql`
6. Execute (F5 ou botão Execute)

#### DBeaver (Alternativa)
1. Baixe: https://dbeaver.io/
2. Crie nova conexão SQLite
3. Execute o script SQL

### Opção 4: Via Node.js Diretamente

Crie um arquivo `create_db.js`:

```javascript
const sqlite3 = require('better-sqlite3');
const fs = require('fs');

const db = sqlite3('palpites.db');

// Lê e executa o script SQL
const sql = fs.readFileSync('schema.sql', 'utf8');
db.exec(sql);

console.log('✅ Banco de dados criado com sucesso!');
db.close();
```

Execute:
```bash
node create_db.js
```

## 📊 Estrutura da Tabela

```
palpites
├── id (INTEGER, PRIMARY KEY, AUTOINCREMENT)
├── nome (TEXT, NOT NULL)
├── sexo (TEXT, NOT NULL, CHECK: 'menina' ou 'menino')
├── sugestao_nome (TEXT, NULL)
├── mensagem (TEXT, NOT NULL)
├── data_palpite (DATE, NOT NULL)
├── data_registro (TIMESTAMP, DEFAULT: CURRENT_TIMESTAMP)
└── eh_ganhador (INTEGER, DEFAULT: 0)
```

## 🔍 Verificando o Banco

### Listar tabelas:
```sql
SELECT name FROM sqlite_master WHERE type='table';
```

### Ver estrutura da tabela:
```sql
.schema palpites
```

### Ver dados:
```sql
SELECT * FROM palpites;
```

### Contar registros:
```sql
SELECT COUNT(*) FROM palpites;
```

## 📝 Notas Importantes

1. **Backup**: Sempre faça backup do arquivo `palpites.db` antes de alterações
2. **Permissões**: Certifique-se de que o servidor tem permissão para ler/escrever o arquivo
3. **Localização**: O arquivo `palpites.db` deve estar na raiz do projeto
4. **Migração**: Se já existir um banco antigo, você pode precisar adicionar a coluna `eh_ganhador` manualmente

## 🔄 Migração de Dados Antigos

Se você tem um banco antigo sem a coluna `eh_ganhador`:

```sql
ALTER TABLE palpites ADD COLUMN eh_ganhador INTEGER DEFAULT 0;
```

## ❓ Troubleshooting

### Erro: "database is locked"
- Certifique-se de que nenhum outro processo está usando o banco
- Feche o DB Browser ou outras conexões

### Erro: "no such table: palpites"
- Execute o script de criação novamente
- Verifique se está no diretório correto

### Erro de permissão
- Verifique as permissões do arquivo/diretório
- Tente executar como administrador (se necessário)

