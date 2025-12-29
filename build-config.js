/**
 * Script Node.js para gerar config.js a partir do arquivo .env
 * Execute: node build-config.js
 */

const fs = require('fs');
const path = require('path');

// Carrega variáveis de ambiente do arquivo .env ou process.env
function loadEnvFile() {
    const env = {};
    
    // Primeiro tenta carregar do arquivo .env
    const envPath = path.join(__dirname, '.env');
    
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        
        envContent.split('\n').forEach(line => {
            line = line.trim();
            // Ignora comentários e linhas vazias
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                }
            }
        });
        
        console.log('📄 Carregando variáveis do arquivo .env');
    } else {
        console.log('⚠️  Arquivo .env não encontrado, usando variáveis de ambiente do sistema');
    }
    
    // Sobrescreve com variáveis de ambiente do sistema (se disponíveis)
    // Útil para servidores como Netlify, Vercel, etc.
    if (process.env.SUPABASE_URL) {
        env.SUPABASE_URL = process.env.SUPABASE_URL;
        console.log('🔧 Usando SUPABASE_URL das variáveis de ambiente do sistema');
    }
    if (process.env.SUPABASE_ANON_KEY) {
        env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
        console.log('🔧 Usando SUPABASE_ANON_KEY das variáveis de ambiente do sistema');
    }
    
    return env;
}

// Gera o arquivo config.js
function generateConfigFile(env) {
    const SUPABASE_URL = env.SUPABASE_URL || '';
    const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || '';
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error('❌ SUPABASE_URL e SUPABASE_ANON_KEY devem estar definidos');
        console.error('   Configure no arquivo .env ou nas variáveis de ambiente do sistema');
        console.error('   Exemplo: cp .env.example .env');
        process.exit(1);
    }
    
    const configContent = `/**
 * Configurações do Supabase
 * 
 * IMPORTANTE: Este arquivo é gerado automaticamente a partir do arquivo .env
 * NÃO edite este arquivo manualmente!
 * 
 * Para alterar as configurações, edite o arquivo .env e execute: node build-config.js
 * 
 * Gerado em: ${new Date().toISOString()}
 */

// ============================================
// Credenciais carregadas do arquivo .env
// ============================================
window.SUPABASE_URL = '${SUPABASE_URL}';
window.SUPABASE_ANON_KEY = '${SUPABASE_ANON_KEY}';

// ============================================
// OPÇÃO 2: Carregar de API (descomente se usar)
// ============================================
// fetch('/api/config')
//     .then(r => r.json())
//     .then(config => {
//         window.SUPABASE_URL = config.url;
//         window.SUPABASE_ANON_KEY = config.key;
//         // Notifica que as credenciais foram carregadas
//         window.dispatchEvent(new CustomEvent('supabase-config-loaded'));
//     })
//     .catch(error => {
//         console.error('❌ Erro ao carregar configurações:', error);
//         alert('Erro ao carregar configurações do servidor. Verifique se a API está disponível.');
//     });
`;

    const configPath = path.join(__dirname, 'config.js');
    fs.writeFileSync(configPath, configContent, 'utf-8');
    
    console.log('✅ Arquivo config.js gerado com sucesso!');
    console.log(`   SUPABASE_URL: ${SUPABASE_URL.substring(0, 30)}...`);
    console.log(`   SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
}

// Executa
try {
    const env = loadEnvFile();
    generateConfigFile(env);
} catch (error) {
    console.error('❌ Erro ao processar arquivo .env:', error.message);
    process.exit(1);
}

