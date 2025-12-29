# 🌳 Árvore dos Palpites - Reveillon do Bebê

Um site interativo e encantador para coletar palpites e mensagens carinhosas durante o chá de revelação do bebê.

## ✨ Funcionalidades

- **Formulário Interativo**: Coleta nome, palpite do sexo, sugestão de nome e mensagem carinhosa
- **Visualização de Palpites**: Página dedicada para ver todos os palpites recebidos
- **Estatísticas**: Contador de total de palpites e divisão por sexo
- **Design Responsivo**: Funciona perfeitamente em celulares (ideal para acesso via QR Code)
- **Banco de Dados Supabase**: Todos os navegadores compartilham o mesmo banco PostgreSQL na nuvem
- **100% JavaScript**: Funciona completamente no navegador, sem necessidade de servidor
- **Exportação**: Possibilidade de exportar os palpites em JSON para backup
- **Música de Fundo**: Player integrado com a música "Aquarela" (com controles de play/pause)
- **Gráfico Interativo**: Visualização da distribuição de palpites entre meninos e meninas

## 🚀 Como Usar

### Pré-requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conta no Supabase (gratuita)

### Configuração Inicial

1. **Crie uma conta no Supabase**:
   - Acesse [https://supabase.com](https://supabase.com)
   - Crie um projeto gratuito
   - Veja instruções detalhadas em `README-SUPABASE.md`

2. **Configure as credenciais**:
   - Copie `config.js.example` para `config.js`
   - Edite `config.js` com suas credenciais do Supabase

3. **Crie a tabela no Supabase**:
   - No SQL Editor do Supabase, execute o arquivo `supabase_schema.sql`
   - Verifique se a tabela `palpites` foi criada

4. **Abra o site**:
   - Abra `index.html` no navegador
   - Ou hospede em qualquer servidor estático (GitHub Pages, Netlify, Vercel, etc.)

### Hospedagem

Você pode hospedar em qualquer servidor de arquivos estáticos:

- **GitHub Pages**: Upload dos arquivos
- **Netlify**: Drag and drop ou Git
- **Vercel**: Conecte seu repositório
- **Qualquer servidor HTTP**: Apache, Nginx, etc.

**Importante**: Certifique-se de que `config.js` está configurado com suas credenciais do Supabase!

### Uso no Evento

1. **Configure o Supabase** (uma vez apenas)
2. **Hospede o site** em qualquer lugar
3. **Compartilhe o QR Code** para facilitar o acesso
4. **Todos os palpites** serão salvos automaticamente no Supabase
5. **Acesse de qualquer dispositivo** para ver os resultados em tempo real

## 📱 Acesso via QR Code

Para usar em um evento físico:

1. Configure o Supabase e hospede o site
2. Gere um QR Code apontando para a URL do site
3. Imprima o QR Code e integre ao design da "Árvore dos Palpites"
4. Os convidados escaneiam e preenchem o formulário
5. Todos os dados são salvos automaticamente no Supabase

## 🎨 Personalização

### Cores
As cores podem ser personalizadas no arquivo `style.css` através das variáveis CSS:

```css
:root {
    --primary-green: #2d5016;
    --light-green: #4a7c2a;
    --soft-green: #6b9f4a;
    /* ... */
}
```

### Textos
Edite os textos diretamente nos arquivos HTML:
- Título: `index.html` e `palpites.html`
- Labels do formulário: `index.html`
- Mensagens: `index.html` e `palpites.html`

### Música de Fundo
Para adicionar a música "Aquarela":
1. Coloque o arquivo de áudio na pasta `audio/` com o nome `aquarela.mp3` ou `aquarela.ogg`
2. O player aparecerá automaticamente no canto inferior direito
3. A música tocará automaticamente (se permitido pelo navegador)
4. Os usuários podem clicar no botão 🎵 para pausar/despausar
5. A preferência de reprodução é salva no navegador

## 📦 Estrutura de Dados

Os palpites são armazenados no formato:

```json
{
    "id": 1,
    "nome": "Nome do Convidado",
    "sexo": "menina" ou "menino",
    "sugestaoNome": "Nome sugerido (opcional)",
    "mensagem": "Mensagem carinhosa",
    "dataPalpite": "2024-01-15",
    "dataRegistro": "2024-01-15T10:30:00.000Z",
    "ehGanhador": false
}
```

## 🔧 Tecnologias Utilizadas

- **Frontend**:
  - HTML5
  - CSS3 (com animações e gradientes)
  - JavaScript (Vanilla)
  
- **Backend**:
  - Supabase (PostgreSQL na nuvem)
  - Supabase JavaScript Client

## 💾 Banco de Dados

- **Banco**: PostgreSQL (via Supabase)
- **Tabela**: `palpites`
- **Compartilhado**: Todos os navegadores usam o mesmo banco
- **Persistência**: Dados salvos permanentemente na nuvem
- **Gratuito**: Plano gratuito generoso do Supabase

## 📝 Arquivos Importantes

- `config.js` - **Configure suas credenciais do Supabase aqui** (não commitado)
- `config.js.example` - Exemplo de configuração
- `database.js` - Módulo de conexão com Supabase
- `supabase_schema.sql` - Script para criar a tabela
- `README-SUPABASE.md` - Guia completo de configuração do Supabase

## 🔒 Segurança

- **Row Level Security (RLS)**: Habilitado e configurado
- **Leitura pública**: Qualquer um pode ler palpites
- **Inserção pública**: Qualquer um pode adicionar palpites
- **Chave anônima**: Usa apenas chave pública (segura para frontend)

## 📚 Documentação Adicional

- `README-SUPABASE.md` - Configuração detalhada do Supabase
- `CREATE_DATABASE.md` - Informações sobre estrutura do banco (versão anterior)

## ⚠️ Notas Importantes

- ⚠️ **Configure `config.js`** antes de usar
- 🔑 **Nunca commite** `config.js` com credenciais reais
- 🌐 **Funciona em qualquer hospedagem** estática
- 💰 **Gratuito** até ~500MB de dados (suficiente para milhares de palpites)
- 🔄 **Dados compartilhados** em tempo real entre todos os dispositivos

## 🐛 Troubleshooting

### Site não conecta ao banco
- Verifique se `config.js` está configurado corretamente
- Confira as credenciais no painel do Supabase
- Abra o console do navegador (F12) para ver erros

### Erro "Invalid API key"
- Certifique-se de usar a chave "anon public", não "service_role"
- Verifique se copiou a chave completa (é muito longa)

### Tabela não existe
- Execute o script `supabase_schema.sql` no SQL Editor do Supabase

Veja mais em `README-SUPABASE.md`.

## 💚 Feito com carinho

Este projeto foi criado para tornar o momento do chá de revelação ainda mais especial e memorável!
