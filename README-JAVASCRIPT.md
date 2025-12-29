# 🌳 Árvore dos Palpites - Versão 100% JavaScript

## ✨ O que mudou?

O projeto foi **completamente migrado para JavaScript puro**, usando **SQLite no navegador** através da biblioteca `sql.js`. Agora **não é mais necessário** um servidor Python ou qualquer backend!

### 🎯 Principais Mudanças

1. **SQLite no Navegador**: Usa `sql.js` (SQLite compilado para WebAssembly)
2. **Persistência no IndexedDB**: O banco SQLite é salvo automaticamente no IndexedDB do navegador
3. **100% Cliente**: Tudo funciona no navegador, sem necessidade de servidor
4. **Funciona em qualquer hospedagem**: GitHub Pages, Vercel, Netlify, ou até mesmo abrindo o arquivo HTML diretamente

## 📦 Arquivos Principais

- **`database.js`**: Módulo que gerencia o SQLite no navegador
- **`script.js`**: Lógica principal (agora usa SQLite diretamente)
- **`index.html`**: Página principal (inclui sql.js e database.js)
- **`palpites.html`**: Página de visualização (também usa SQLite)

## 🚀 Como Usar

### Opção 1: Abrir Diretamente (Mais Simples!)

1. **Abra `index.html`** diretamente no navegador
2. **Pronto!** O site funciona completamente offline

### Opção 2: Hospedar em Servidor Estático

1. **Faça upload** de todos os arquivos para:
   - GitHub Pages
   - Vercel
   - Netlify
   - Qualquer servidor de arquivos estáticos

2. **Acesse a URL** e use normalmente

### Opção 3: Servidor Local (Opcional)

Se quiser testar localmente com um servidor:

```bash
# Python 3
python -m http.server 8000

# Node.js (com http-server)
npx http-server

# PHP
php -S localhost:8000
```

## 💾 Como Funciona o Banco de Dados

### Armazenamento

- **SQLite em memória**: Durante o uso, o banco fica em memória
- **IndexedDB**: O banco é salvo automaticamente no IndexedDB do navegador
- **Persistência**: Os dados persistem mesmo após fechar o navegador

### Estrutura do Banco

```sql
CREATE TABLE palpites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    sexo TEXT NOT NULL CHECK(sexo IN ('menina', 'menino')),
    sugestao_nome TEXT,
    mensagem TEXT NOT NULL,
    data_palpite DATE NOT NULL,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    eh_ganhador INTEGER DEFAULT 0
)
```

## 🔧 Funcionalidades

### ✅ Todas as funcionalidades anteriores mantidas:

- ✅ Formulário de palpites
- ✅ Visualização de todos os palpites
- ✅ Estatísticas (total, meninas, meninos)
- ✅ Gráfico de distribuição
- ✅ Sistema de ganhador (10º palpite)
- ✅ Efeito de fogos de artifício
- ✅ Música de fundo
- ✅ Exportação de dados

### 🆕 Novas funcionalidades:

- ✅ **Exportação do banco SQLite completo** (além do JSON)
- ✅ **Funciona offline** (sem necessidade de internet após carregar)
- ✅ **Mais rápido** (sem latência de rede)

## 📊 API JavaScript

O módulo `database.js` expõe as seguintes funções:

```javascript
// Inicializar SQLite
await window.SQLiteDB.init();

// Adicionar palpite
const id = await window.SQLiteDB.addPalpite(
    nome, sexo, mensagem, dataPalpite, sugestaoNome, ehGanhador
);

// Obter todos os palpites
const palpites = await window.SQLiteDB.getAllPalpites();

// Obter estatísticas
const stats = await window.SQLiteDB.getStats();

// Obter ganhador
const ganhador = await window.SQLiteDB.getGanhador();

// Limpar todos os palpites
await window.SQLiteDB.clearAllPalpites();

// Exportar banco SQLite
await window.SQLiteDB.exportDatabase();
```

## ⚠️ Limitações

1. **Dados por navegador**: Cada navegador tem seu próprio banco de dados
2. **Não sincroniza entre dispositivos**: Os dados ficam no navegador local
3. **Limite de espaço**: IndexedDB tem limite (geralmente 50MB-1GB, dependendo do navegador)

## 🔄 Migração de Dados Antigos

Se você tinha dados no servidor Python ou localStorage:

1. **Exporte os dados antigos** (se possível)
2. **Importe manualmente** através do formulário, ou
3. **Use a função de exportação** do sistema antigo e importe no novo

## 🐛 Troubleshooting

### SQLite não inicializa

- Verifique se `sql.js` foi carregado corretamente
- Abra o console do navegador (F12) para ver erros
- Certifique-se de que o navegador suporta WebAssembly

### Dados não persistem

- Verifique se o navegador permite IndexedDB
- Alguns navegadores em modo privado bloqueiam IndexedDB
- Tente em modo normal (não privado)

### Performance lenta

- O SQLite pode ser lento com muitos registros (milhares)
- Para grandes volumes, considere usar um backend

## 📝 Notas Técnicas

- **sql.js**: Versão 1.10.3 (carregada via CDN)
- **IndexedDB**: Usado para persistência do banco
- **WebAssembly**: sql.js usa WASM para performance
- **Compatibilidade**: Funciona em todos os navegadores modernos

## 🎉 Vantagens da Nova Versão

1. ✅ **Sem servidor necessário** - funciona em qualquer lugar
2. ✅ **Mais rápido** - sem latência de rede
3. ✅ **Funciona offline** - após carregar, não precisa de internet
4. ✅ **Mais simples** - menos dependências
5. ✅ **Mais seguro** - dados ficam no navegador do usuário
6. ✅ **Fácil de hospedar** - qualquer servidor estático funciona

---

**Desenvolvido com ❤️ para o Chá de Revelação do Bebê**

