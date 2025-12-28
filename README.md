# 🌳 Árvore dos Palpites - Reveillon do Bebê

Um site interativo e encantador para coletar palpites e mensagens carinhosas durante o chá de revelação do bebê.

## ✨ Funcionalidades

- **Formulário Interativo**: Coleta nome, palpite do sexo, sugestão de nome e mensagem carinhosa
- **Visualização de Palpites**: Página dedicada para ver todos os palpites recebidos
- **Estatísticas**: Contador de total de palpites e divisão por sexo
- **Design Responsivo**: Funciona perfeitamente em celulares (ideal para acesso via QR Code)
- **Banco de Dados SQLite**: Todos os dados são salvos em banco de dados SQLite no servidor
- **API REST**: Endpoints para gerenciar palpites (GET, POST)
- **Exportação**: Possibilidade de exportar os palpites em JSON para backup
- **Música de Fundo**: Player integrado com a música "Aquarela" (com controles de play/pause)
- **Gráfico Interativo**: Visualização da distribuição de palpites entre meninos e meninas

## 🚀 Como Usar

### Opção 1: Servidor Local (Recomendado)

1. **Inicie o servidor Python**:
   - **Windows**: Clique duas vezes em `start-server.bat` ou execute `python server.py`
   - **Linux/Mac**: Execute `./start-server.sh` ou `python3 server.py`
   - **Manual**: Execute `python server.py` (ou `python3 server.py`)

2. **Acesse o site**: Abra `http://localhost:8000` no navegador

3. **Para usar outra porta**: Execute `python server.py 3000` (substitua 3000 pela porta desejada)

4. **Para parar o servidor**: Pressione `Ctrl+C` no terminal

### Opção 2: Abrir Diretamente

1. **Acesse o site**: Abra `index.html` diretamente no navegador (funcionalidade limitada)

### Uso no Evento

1. **Compartilhe o QR Code**: Gere um QR Code apontando para a URL do servidor local
2. **Colete Palpites**: Os convidados preenchem o formulário via celular
3. **Visualize Resultados**: Acesse `palpites.html` para ver todos os palpites

## 📱 Acesso via QR Code

Para usar em um evento físico:

1. Hospede o site em um servidor (GitHub Pages, Netlify, Vercel, etc.)
2. Gere um QR Code apontando para a URL do site
3. Imprima o QR Code e integre ao design da "Árvore dos Palpites"
4. Os convidados escaneiam e preenchem o formulário

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
    "id": 1234567890,
    "nome": "Nome do Convidado",
    "sexo": "menina" ou "menino",
    "sugestaoNome": "Nome sugerido (opcional)",
    "mensagem": "Mensagem carinhosa",
    "dataPalpite": "2024-01-15",
    "dataRegistro": "2024-01-15T10:30:00.000Z"
}
```

## 🔧 Tecnologias Utilizadas

- HTML5
- CSS3 (com animações e gradientes)
- JavaScript (Vanilla com Fetch API)
- Python 3 (servidor HTTP)
- SQLite (banco de dados)
- Python 3 (servidor HTTP local)

## 📝 Notas

- Os dados são armazenados em SQLite no servidor (arquivo `palpites.db`)
- O banco de dados é criado automaticamente na primeira execução
- Faça backup regular do arquivo `palpites.db` ou use a função de exportação
- O design é totalmente responsivo e otimizado para mobile
- O servidor precisa estar rodando para que o site funcione corretamente

## 💚 Feito com carinho

Este projeto foi criado para tornar o momento do chá de revelação ainda mais especial e memorável!


"# cha"  git init git add README.md git commit -m "first commit" git branch -M main git remote add origin https://github.com/AntonioJrSK8/cha.git git push -u origin main
