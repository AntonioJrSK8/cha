/**
 * Configurações do Supabase
 * 
 * IMPORTANTE: Você tem duas opções:
 * 
 * OPÇÃO 1 (Recomendada): Defina as credenciais diretamente abaixo
 * 
 * OPÇÃO 2: Carregue de um endpoint da API (descomente o código ao final)
 *          Neste caso, você precisa ter um servidor que forneça /api/config
 */

// ============================================
// OPÇÃO 1: Configuração direta (RECOMENDADA)
// ============================================
// Substitua pelos valores reais do seu projeto Supabase
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
