# 🚀 Guia de Instalação Rápida

## 📋 Passo a Passo

### 1. Clone ou baixe o projeto

```bash
git clone <seu-repositorio>
cd ChaRevelacao
```

### 2. Configure as credenciais do Supabase

**Crie o arquivo `.env`:**
```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

**Edite o arquivo `.env` com suas credenciais:**
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 3. Gere o arquivo config.js

```bash
node build-config.js
```

Isso irá gerar o arquivo `config.js` com as variáveis do `.env`.

### 4. Crie a tabela no Supabase

1. Acesse o painel do Supabase
2. Vá em **SQL Editor**
3. Execute o conteúdo do arquivo `supabase_schema.sql`

### 5. Abra o site

Abra `index.html` no navegador ou hospede em um servidor estático.

## ✅ Verificação

Após seguir os passos, você deve:

1. Ver `config.js` gerado na raiz do projeto
2. Abrir `index.html` e verificar no console:
   - `✅ Cliente Supabase inicializado`
   - `✅ Sistema inicializado - usando Supabase para banco compartilhado`

## 📝 Notas Importantes

- **`.env`** não será commitado no Git (está no `.gitignore`)
- **`config.js`** não será commitado no Git (está no `.gitignore`)
- Sempre execute `node build-config.js` após alterar o `.env`
- O `database.js` usa as variáveis do `config.js` automaticamente

---

**Pronto! Seu projeto está configurado! 🎉**

