# 💝 Configuração do QR Code PIX

## Como configurar a chave PIX para presentear

1. Abra o arquivo `script.js`

2. Localize as linhas no início do arquivo:

```javascript
// Configuração da chave PIX para presentear
const PIX_KEY = 'sua-chave-pix-aqui@email.com'; // EXEMPLO: altere para sua chave PIX real
const PIX_NAME = 'Nome da Mãe/Pai'; // Nome que aparecerá no QR Code
```

3. Substitua os valores:

   - **PIX_KEY**: Sua chave PIX (pode ser):
     - Email: `seu-email@exemplo.com`
     - CPF: `123.456.789-00` (apenas números: `12345678900`)
     - Telefone: `+5511999999999`
     - Chave aleatória: `123e4567-e89b-12d3-a456-426614174000`
   
   - **PIX_NAME**: Nome que aparecerá quando alguém for pagar (ex: "Maria Silva" ou "João e Maria")

## Exemplos

### Exemplo 1: Chave PIX por Email
```javascript
const PIX_KEY = 'maria.silva@email.com';
const PIX_NAME = 'Maria Silva';
```

### Exemplo 2: Chave PIX por CPF
```javascript
const PIX_KEY = '12345678900'; // Apenas números, sem pontos ou traços
const PIX_NAME = 'João e Maria';
```

### Exemplo 3: Chave PIX por Telefone
```javascript
const PIX_KEY = '+5511999999999'; // Com código do país e DDD
const PIX_NAME = 'Família Silva';
```

## Como funciona

- Após registrar um palpite, o QR Code aparecerá automaticamente na mensagem de sucesso
- Os convidados podem escanear o QR Code com qualquer app de pagamento (PicPay, Nubank, Banco do Brasil, etc.)
- O QR Code contém sua chave PIX e pode ser usado para fazer transferências

## Importante

- Certifique-se de que a chave PIX está correta e ativa
- Teste o QR Code antes do evento para garantir que funciona
- O QR Code só aparecerá se a chave PIX estiver configurada (diferente do valor padrão)

