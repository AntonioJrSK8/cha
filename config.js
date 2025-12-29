/**
 * Configurações do Supabase
 * 
 * IMPORTANTE: Este arquivo é gerado automaticamente a partir do arquivo .env
 * NÃO edite este arquivo manualmente!
 * 
 * Para alterar as configurações, edite o arquivo .env e execute: node build-config.js
 * 
 * Gerado em: 2025-12-29T19:01:20.159Z
 */

// ============================================
// Credenciais carregadas do arquivo .env
// ============================================
window.SUPABASE_URL = 'https://wpoylhkuonuzmugtxodn.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwb3lsaGt1b251em11Z3R4b2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTE3ODksImV4cCI6MjA4MjU4Nzc4OX0.K9a5dmDKDYvI7IqP45wBGmc3Qxn1tRYSdjUG2XinAEU';

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
