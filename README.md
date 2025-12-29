# 🌳 Árvore dos Palpites - Reveillon do Bebê

Um site interativo e encantador para coletar palpites e mensagens carinhosas durante o chá de revelação do bebê.

## ✨ Funcionalidades

- **Formulário Interativo**: Coleta nome, palpite do sexo, sugestão de nome e mensagem carinhosa
- **Visualização de Palpites**: Página dedicada para ver todos os palpites recebidos
- **Estatísticas**: Contador de total de palpites e divisão por sexo
- **Design Responsivo**: Funciona perfeitamente em celulares (ideal para acesso via QR Code)
- **Banco de Dados SQLite Compartilhado**: Todos os navegadores compartilham o mesmo banco `palpites.db`
- **API REST**: Endpoints para gerenciar palpites via servidor Node.js
- **Exportação**: Possibilidade de exportar os palpites em JSON para backup
- **Música de Fundo**: Player integrado com a música "Aquarela" (com controles de play/pause)
- **Gráfico Interativo**: Visualização da distribuição de palpites entre meninos e meninas

## 🚀 Como Usar

### Pré-requisitos

- Node.js 14 ou superior instalado
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Instalação e Execução

1. **Instale as dependências**:
   ```bash
   npm install
   ```

2. **Inicie o servidor**:
   ```bash
   npm start
   ```

3. **Acesse o site**:
   ```
   http://localhost:3000/index.html
   ```

O servidor iniciará na porta 3000 (ou na porta definida na variável de ambiente `PORT`).

### Uso no Evento

1. **Inicie o servidor** no computador principal
2. **Obtenha o IP local** do computador (ex: `192.168.1.100`)
3. **Acesse de qualquer dispositivo na mesma rede**:
   ```
   http://192.168.1.100:3000/index.html
   ```
4. **Compartilhe o QR Code** para facilitar o acesso
5. **Todos os palpites** serão salvos no mesmo banco `palpites.db`

## 📱 Acesso via QR Code

Para usar em um evento físico:

1. Configure o servidor em um computador na rede local
2. Gere um QR Code apontando para `http://IP_DO_SERVIDOR:3000/index.html`
3. Imprima o QR Code e integre ao design da "Árvore dos Palpites"
4. Os convidados escaneiam e preenchem o formulário
5. Todos os dados são salvos no mesmo banco compartilhado

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
  - Node.js
  - Express.js
  - better-sqlite3 (SQLite)

## 💾 Banco de Dados

- **Arquivo**: `palpites.db` (criado automaticamente)
- **Localização**: Raiz do projeto
- **Compartilhado**: Todos os navegadores usam o mesmo arquivo via API
- **Persistência**: Os dados são salvos permanentemente no servidor

## 📝 Notas Importantes

- ⚠️ **O servidor precisa estar rodando** para que o site funcione
- 💾 O arquivo `palpites.db` contém todos os dados
- 🔄 **Faça backup regular** do arquivo `palpites.db`
- 🌐 Para acesso remoto, configure firewall/roteador adequadamente
- 🔒 Para produção, adicione autenticação e HTTPS

## 📚 Documentação Adicional

- `README-SERVIDOR.md` - Documentação detalhada do servidor e API
- `README-JAVASCRIPT.md` - Documentação sobre a versão anterior (offline)

## 🔄 Migração

Se você estava usando a versão anterior (100% JavaScript offline):
- Os dados do IndexedDB não são migrados automaticamente
- Você pode exportar os dados antigos manualmente
- Os novos dados serão salvos no banco compartilhado `palpites.db`

## 💚 Feito com carinho

Este projeto foi criado para tornar o momento do chá de revelação ainda mais especial e memorável!
