// Configuração da chave PIX para presentear
// Altere aqui com sua chave PIX (CPF, email, telefone ou chave aleatória)
const PIX_KEY = '78737702300'; // EXEMPLO: altere para sua chave PIX real
const PIX_NAME = 'ANTONIO JUNIO'; // Nome que aparecerá no QR Code

// Configuração de exibição do QR Code
const SHOW_QRCODE = false; // Altere para false se não quiser exibir o QR Code

// Detecção de ambiente: GitHub Pages ou servidor local
const STORAGE_KEY = 'arvore_palpites';
const isGitHubPages = window.location.hostname.includes('github.io') || 
                      window.location.hostname.includes('github.com') ||
                      window.location.protocol === 'file:';

// Log para debug (remover em produção se necessário)
if (isGitHubPages) {
    console.log('🌐 Modo GitHub Pages detectado - usando localStorage');
} else {
    console.log('💻 Modo local detectado - tentando API primeiro');
}

// Função auxiliar para detectar se a API está disponível
async function isAPIAvailable() {
    // Se já sabemos que é GitHub Pages, não tenta a API
    if (isGitHubPages) {
        return false;
    }
    
    // Para localhost ou 127.0.0.1, tenta verificar se a API está disponível
    try {
        // Cria um timeout manual para melhor compatibilidade
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000); // Reduzido para 1 segundo
        
        const response = await fetch('/api/palpites', {
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        // Se der erro (timeout, network error, etc), retorna false
        return false;
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setDefaultDate();
    initializeMusic();
});

// Define a data atual como padrão
function setDefaultDate() {
    const dataInput = document.getElementById('dataPalpite');
    if (dataInput) {
        const today = new Date().toISOString().split('T')[0];
        dataInput.value = today;
    }
}

// Inicializa o formulário
function initializeForm() {
    const form = document.getElementById('palpiteForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

// Manipula o envio do formulário
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const palpite = {
        nome: formData.get('nome'),
        sexo: formData.get('sexo'),
        sugestaoNome: formData.get('sugestaoNome') || null,
        mensagem: formData.get('mensagem'),
        dataPalpite: formData.get('dataPalpite')
    };

    // Desabilita o botão durante o envio
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳</span> Enviando...';

    try {
        // Salva o palpite no servidor
        await savePalpite(palpite);

        // Mostra mensagem de sucesso
        showSuccessMessage();

        // Reseta o formulário
        e.target.reset();
        setDefaultDate();
    } catch (error) {
        // Mostra mensagem de erro
        showErrorMessage(error.message || 'Erro ao salvar palpite. Tente novamente.');
    } finally {
        // Reabilita o botão
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Salva o palpite no servidor (SQLite) ou localStorage (fallback)
async function savePalpite(palpite) {
    // Se estiver no GitHub Pages, usa localStorage diretamente sem tentar API
    if (isGitHubPages) {
        console.log('💾 Salvando no localStorage (GitHub Pages)');
        return savePalpiteLocalStorage(palpite);
    }
    
    // Para ambiente local, verifica se a API está disponível
    const apiAvailable = await isAPIAvailable();
    
    if (apiAvailable) {
        try {
            const response = await fetch('/api/palpites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(palpite)
            });
            
            if (!response.ok) {
                throw new Error('API retornou erro');
            }
            
            const result = await response.json();
            console.log('✅ Palpite salvo na API');
            return result;
        } catch (error) {
            console.warn('⚠️ API não disponível, usando localStorage como fallback:', error);
            // Fallback para localStorage
            return savePalpiteLocalStorage(palpite);
        }
    } else {
        // API não disponível, usa localStorage
        console.log('💾 Salvando no localStorage (API não disponível)');
        return savePalpiteLocalStorage(palpite);
    }
}

// Salva palpite no localStorage
function savePalpiteLocalStorage(palpite) {
    try {
        // Obtém palpites existentes
        const palpites = getPalpitesLocalStorage();
        
        // Adiciona novo palpite com ID único
        const newPalpite = {
            ...palpite,
            id: Date.now(), // Usa timestamp como ID único
            dataRegistro: new Date().toISOString()
        };
        
        palpites.push(newPalpite);
        
        // Salva no localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(palpites));
        
        console.log('Palpite salvo no localStorage:', newPalpite);
        
        return { id: newPalpite.id, message: 'Palpite salvo com sucesso' };
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
        throw new Error('Erro ao salvar palpite no navegador');
    }
}

// Obtém todos os palpites do servidor (SQLite) ou localStorage (fallback)
async function getPalpites() {
    // Se estiver no GitHub Pages, usa localStorage diretamente sem tentar API
    if (isGitHubPages) {
        return getPalpitesLocalStorage();
    }
    
    // Para ambiente local, verifica se a API está disponível
    const apiAvailable = await isAPIAvailable();
    
    if (apiAvailable) {
        try {
            const response = await fetch('/api/palpites');
            
            if (!response.ok) {
                throw new Error('API retornou erro');
            }
            
            const data = await response.json();
            return data.palpites || [];
        } catch (error) {
            console.warn('API não disponível, usando localStorage:', error);
            // Fallback para localStorage
            return getPalpitesLocalStorage();
        }
    } else {
        // Usa localStorage diretamente
        return getPalpitesLocalStorage();
    }
}

// Obtém palpites do localStorage
function getPalpitesLocalStorage() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Erro ao ler localStorage:', error);
        return [];
    }
}

// Gera o código PIX em formato EMV (simplificado)
function generatePixCode(chave, nome, valor = null) {
    // Formato básico do código PIX
    // Nota: Para produção completa, use uma biblioteca especializada
    let payload = '';
    
    // Payload Format Indicator
    payload += '000201';
    
    // Point of Initiation Method (opcional)
    payload += '0102';
    
    // Merchant Account Information
    payload += '26';
    let merchantInfo = '0014BR.GOV.BCB.PIX';
    merchantInfo += `01${String(chave.length).padStart(2, '0')}${chave}`;
    payload += String(merchantInfo.length).padStart(2, '0') + merchantInfo;
    
    // Merchant Category Code (opcional)
    payload += '52040000';
    
    // Transaction Currency (BRL = 986)
    payload += '5303986';
    
    // Transaction Amount (opcional - deixar vazio permite qualquer valor)
    if (valor) {
        payload += `54${String(valor.length).padStart(2, '0')}${valor}`;
    }
    
    // Country Code
    payload += '5802BR';
    
    // Merchant Name
    payload += `59${String(nome.length).padStart(2, '0')}${nome}`;
    
    // Merchant City
    payload += '6008BRASILIA';
    
    // Additional Data Field Template
    payload += '62070503***';
    
    // CRC16 (será calculado depois)
    payload += '6304';
    
    // Para simplificar, vamos usar a chave PIX diretamente
    // Os apps modernos conseguem ler chaves PIX diretamente
    return chave;
}

// Mostra mensagem de sucesso com agradecimento e QR Code PIX
function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    const qrcodeContainer = document.getElementById('qrcodeContainer');
    const qrcodeElement = document.getElementById('qrcode');
    
    if (successMessage) {
        // Mostra a mensagem de sucesso
        successMessage.classList.remove('hidden');
        successMessage.style.background = 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)';
        successMessage.style.borderColor = '#4caf50';
        
        // Mensagem de agradecimento
        const messageText = successMessage.querySelector('p');
        if (messageText) {
            messageText.innerHTML = '✨ <strong>Obrigado pelo seu palpite!</strong><br>Seu carinho é muito especial para nós! 💚';
        }
        
        // Gera e exibe o QR Code PIX se a chave estiver configurada e SHOW_QRCODE estiver habilitado
        if (SHOW_QRCODE && qrcodeContainer && qrcodeElement && PIX_KEY && PIX_KEY !== 'sua-chave-pix-aqui@email.com' && PIX_KEY.trim() !== '') {
            qrcodeContainer.classList.remove('hidden');
            qrcodeContainer.style.display = 'block';
            
            // Limpa QR Code anterior
            qrcodeElement.innerHTML = '';
            
            // Gera o código PIX (usa a chave diretamente)
            const pixCode = PIX_KEY;
            
            // Mostra a chave PIX formatada (usa a constante PIX_KEY configurada)
            const pixKeyDisplay = document.getElementById('pixKeyDisplay');
            if (pixKeyDisplay) {
                // Limpa qualquer valor anterior
                pixKeyDisplay.textContent = '';
                
                // Formata a chave PIX baseada no tipo
                let formattedKey = '';
                
                // Se for código PIX completo (EMV), extrai informações relevantes
                if (PIX_KEY.includes('BR.GOV.BCB.PIX')) {
                    // Extrai CPF do código PIX se possível
                    const cpfMatch = PIX_KEY.match(/01(\d{11})/);
                    if (cpfMatch) {
                        const cpf = cpfMatch[1];
                        formattedKey = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                    } else {
                        formattedKey = 'Código PIX configurado';
                    }
                } else if (/^\d{11}$/.test(PIX_KEY)) {
                    // Formata CPF se for numérico e tiver 11 dígitos (78737702300 -> 787.377.023-00)
                    formattedKey = PIX_KEY.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                } else if (/^\d+$/.test(PIX_KEY) && PIX_KEY.length === 11) {
                    // Garante formatação de CPF mesmo se não passar no teste anterior
                    formattedKey = PIX_KEY.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                } else {
                    // Para outros tipos (email, telefone, etc), mostra como está
                    formattedKey = PIX_KEY.length > 50 ? PIX_KEY.substring(0, 50) + '...' : PIX_KEY;
                }
                
                // Atualiza o texto com a chave formatada
                pixKeyDisplay.textContent = formattedKey;
                console.log('Chave PIX exibida:', formattedKey, '(original:', PIX_KEY + ')');
            }
            
            // Função para gerar QR Code usando API online (fallback)
            function generateQRCodeWithAPI() {
                // Usa API online como fallback
                // Usa PIX_KEY diretamente (a constante configurada no início do arquivo)
                const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(PIX_KEY)}&bgcolor=ffffff&color=2d5016`;
                const img = document.createElement('img');
                img.src = apiUrl;
                img.alt = 'QR Code PIX';
                img.style.display = 'block';
                img.style.margin = '0 auto';
                img.style.maxWidth = '100%';
                img.style.borderRadius = '8px';
                img.onerror = function() {
                    console.error('Erro ao carregar QR Code da API online');
                    qrcodeContainer.classList.add('hidden');
                };
                img.onload = function() {
                    console.log('QR Code gerado com sucesso usando API online');
                };
                qrcodeElement.innerHTML = '';
                qrcodeElement.appendChild(img);
            }
            
            // Função para gerar o QR Code usando biblioteca local
            function generateQRCode() {
                if (typeof QRCode === 'undefined') {
                    console.warn('Biblioteca QRCode não disponível, usando API online');
                    generateQRCodeWithAPI();
                    return false;
                }
                
                // Verifica qual método está disponível na biblioteca
                let qrMethod = null;
                if (typeof QRCode.toDataURL === 'function') {
                    qrMethod = 'toDataURL';
                } else if (typeof QRCode.toCanvas === 'function') {
                    qrMethod = 'toCanvas';
                } else if (typeof QRCode.toString === 'function') {
                    qrMethod = 'toString';
                } else {
                    console.warn('Método QRCode não encontrado, usando API online');
                    generateQRCodeWithAPI();
                    return false;
                }
                
                // Usa PIX_KEY diretamente (a constante configurada)
                const codeToEncode = PIX_KEY;
                
                // Tenta usar toDataURL primeiro (método mais comum)
                if (qrMethod === 'toDataURL') {
                    QRCode.toDataURL(codeToEncode, {
                        width: 180,
                        margin: 2,
                        color: {
                            dark: '#2d5016',
                            light: '#ffffff'
                        },
                        errorCorrectionLevel: 'M'
                    }, function (error, url) {
                        if (error) {
                            console.error('Erro ao gerar QR Code com biblioteca:', error);
                            console.log('Tentando usar API online como fallback...');
                            generateQRCodeWithAPI();
                        } else {
                            // Cria uma imagem com o QR Code
                            const img = document.createElement('img');
                            img.src = url;
                            img.alt = 'QR Code PIX';
                            img.style.display = 'block';
                            img.style.margin = '0 auto';
                            img.style.maxWidth = '100%';
                            img.style.borderRadius = '8px';
                            
                            // Limpa o elemento e adiciona a imagem
                            qrcodeElement.innerHTML = '';
                            qrcodeElement.appendChild(img);
                            console.log('QR Code gerado com sucesso usando biblioteca local');
                        }
                    });
                } else if (qrMethod === 'toCanvas') {
                    // Usa toCanvas como alternativa
                    const canvas = document.createElement('canvas');
                    qrcodeElement.appendChild(canvas);
                    QRCode.toCanvas(canvas, codeToEncode, {
                        width: 180,
                        margin: 2,
                        color: {
                            dark: '#2d5016',
                            light: '#ffffff'
                        },
                        errorCorrectionLevel: 'M'
                    }, function (error) {
                        if (error) {
                            console.error('Erro ao gerar QR Code com toCanvas:', error);
                            generateQRCodeWithAPI();
                        } else {
                            canvas.style.display = 'block';
                            canvas.style.margin = '0 auto';
                            canvas.style.maxWidth = '100%';
                            canvas.style.borderRadius = '8px';
                            console.log('QR Code gerado com sucesso usando toCanvas');
                        }
                    });
                } else {
                    // Se nenhum método funcionar, usa API online
                    generateQRCodeWithAPI();
                }
                return true;
            }
            
            // Tenta gerar o QR Code
            if (typeof QRCode !== 'undefined') {
                // Biblioteca já carregada
                generateQRCode();
            } else {
                // Aguarda o carregamento da biblioteca
                let attempts = 0;
                const maxAttempts = 15; // Aumentado para 1.5 segundos
                const checkQRCode = setInterval(function() {
                    attempts++;
                    if (typeof QRCode !== 'undefined') {
                        clearInterval(checkQRCode);
                        generateQRCode();
                    } else if (attempts >= maxAttempts) {
                        clearInterval(checkQRCode);
                        console.warn('Biblioteca QRCode não carregada após várias tentativas. Usando API online...');
                        // Usa API online como fallback
                        generateQRCodeWithAPI();
                    }
                }, 100);
            }
        } else {
            // Esconde o QR Code se não estiver configurado ou se SHOW_QRCODE estiver desabilitado
            if (qrcodeContainer) {
                qrcodeContainer.classList.add('hidden');
            }
        }
        
        // Se SHOW_QRCODE estiver desabilitado, esconde o container
        if (!SHOW_QRCODE && qrcodeContainer) {
            qrcodeContainer.classList.add('hidden');
        }
        
        // Scroll suave até a mensagem
        setTimeout(() => {
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        
        // Não esconde automaticamente quando há QR Code (permite que o usuário veja e escaneie)
        // A mensagem permanece visível para o usuário fechar manualmente ou continuar navegando
    }
}

// Mostra mensagem de erro
function showErrorMessage(message) {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.classList.remove('hidden');
        successMessage.style.background = 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)';
        successMessage.style.borderColor = '#f44336';
        successMessage.querySelector('.success-icon').textContent = '❌';
        successMessage.querySelector('p').textContent = message;
        
        // Scroll suave até a mensagem
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Esconde a mensagem após 5 segundos
        setTimeout(() => {
            successMessage.classList.add('hidden');
            // Restaura valores padrão
            successMessage.style.background = '';
            successMessage.style.borderColor = '';
            successMessage.querySelector('.success-icon').textContent = '✨';
        }, 5000);
    }
}

// Função para exportar palpites (útil para backup)
async function exportPalpites() {
    try {
        const palpites = await getPalpites();
        const dataStr = JSON.stringify(palpites, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `palpites_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Erro ao exportar palpites:', error);
        alert('Erro ao exportar palpites. Tente novamente.');
    }
}

// Função para limpar todos os palpites (cuidado!)
async function clearAllPalpites() {
    if (confirm('Tem certeza que deseja apagar todos os palpites? Esta ação não pode ser desfeita.')) {
        // Se estiver no GitHub Pages, usa localStorage diretamente
        if (isGitHubPages) {
            clearAllPalpitesLocalStorage();
        } else {
            // Para ambiente local, verifica se a API está disponível
            const apiAvailable = await isAPIAvailable();
            
            if (apiAvailable) {
                try {
                    const response = await fetch('/api/palpites', {
                        method: 'DELETE'
                    });
                    
                    if (!response.ok) {
                        throw new Error('API retornou erro');
                    }
                } catch (error) {
                    console.warn('API não disponível, usando localStorage:', error);
                    // Fallback para localStorage
                    clearAllPalpitesLocalStorage();
                }
            } else {
                // Usa localStorage diretamente
                clearAllPalpitesLocalStorage();
            }
        }
        
        if (window.location.pathname.includes('palpites.html')) {
            location.reload();
        }
    }
}

// Limpa todos os palpites do localStorage
function clearAllPalpitesLocalStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Todos os palpites foram removidos do localStorage');
    } catch (error) {
        console.error('Erro ao limpar localStorage:', error);
        throw new Error('Erro ao limpar palpites');
    }
}

// Inicializa o player de música
function initializeMusic() {
    const audio = document.getElementById('backgroundMusic');
    const toggleBtn = document.getElementById('musicToggle');
    const musicIcon = document.getElementById('musicIcon');
    const musicPrompt = document.getElementById('musicPrompt');
    const musicPromptClose = document.getElementById('musicPromptClose');

    if (!audio || !toggleBtn) return;

    let userInteracted = false;
    let musicStarted = false;

    // Função para tentar tocar a música
    function tryPlayMusic() {
        if (musicStarted || !audio) return;
        
        audio.volume = 0.3; // Volume em 30%
        audio.play().then(() => {
            musicStarted = true;
            toggleBtn.classList.add('playing');
            if (musicIcon) musicIcon.textContent = '🎵';
            localStorage.setItem('musicPlaying', 'true');
            
            // Esconde o prompt se estiver visível
            if (musicPrompt) {
                musicPrompt.classList.add('hidden');
            }
        }).catch(err => {
            console.log('Aguardando interação do usuário para tocar música...');
            // Mostra prompt se autoplay foi bloqueado
            if (musicPrompt && !userInteracted) {
                setTimeout(() => {
                    if (!musicStarted && musicPrompt) {
                        musicPrompt.classList.remove('hidden');
                    }
                }, 2000);
            }
        });
    }

    // Verifica preferência salva
    const musicPreference = localStorage.getItem('musicPlaying');
    const shouldPlay = musicPreference !== 'false'; // Toca por padrão, exceto se explicitamente pausado

    // Tenta tocar automaticamente ao carregar
    if (shouldPlay) {
        // Aguarda um pouco para o áudio carregar
        audio.addEventListener('loadeddata', function() {
            tryPlayMusic();
        }, { once: true });
        
        // Tenta imediatamente também
        setTimeout(tryPlayMusic, 500);
    }

    // Função para ativar música após interação do usuário
    function activateMusicOnInteraction() {
        if (!userInteracted && !musicStarted) {
            userInteracted = true;
            tryPlayMusic();
        }
    }

    // Escuta interações do usuário para desbloquear autoplay
    const interactionEvents = ['click', 'touchstart', 'keydown', 'mousemove'];
    interactionEvents.forEach(event => {
        document.addEventListener(event, activateMusicOnInteraction, { once: true, passive: true });
    });

    // Controle de play/pause pelo botão
    toggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        userInteracted = true;
        
        if (audio.paused) {
            audio.volume = 0.3;
            audio.play().then(() => {
                musicStarted = true;
                toggleBtn.classList.add('playing');
                if (musicIcon) musicIcon.textContent = '🎵';
                localStorage.setItem('musicPlaying', 'true');
                
                if (musicPrompt) {
                    musicPrompt.classList.add('hidden');
                }
            }).catch(err => {
                console.error('Erro ao tocar música:', err);
            });
        } else {
            audio.pause();
            musicStarted = false;
            toggleBtn.classList.remove('playing');
            if (musicIcon) musicIcon.textContent = '🔇';
            localStorage.setItem('musicPlaying', 'false');
        }
    });

    // Fecha o prompt
    if (musicPromptClose) {
        musicPromptClose.addEventListener('click', function(e) {
            e.stopPropagation();
            if (musicPrompt) {
                musicPrompt.classList.add('hidden');
            }
        });
    }

    // Clique no prompt também ativa a música
    if (musicPrompt) {
        musicPrompt.addEventListener('click', function(e) {
            if (e.target === musicPrompt || e.target.closest('.music-prompt-content')) {
                userInteracted = true;
                tryPlayMusic();
            }
        });
    }

    // Atualiza estado quando a música termina (não deve acontecer com loop)
    audio.addEventListener('ended', function() {
        if (audio.loop) return; // Se está em loop, não faz nada
        toggleBtn.classList.remove('playing');
        if (musicIcon) musicIcon.textContent = '🔇';
    });

    // Tratamento de erros
    audio.addEventListener('error', function(e) {
        console.error('Erro ao carregar áudio. Verifique se o arquivo existe em audio/aquarela.mp3');
        if (toggleBtn) toggleBtn.style.display = 'none';
        if (musicPrompt) musicPrompt.style.display = 'none';
    });

    // Tenta tocar quando o áudio estiver pronto
    audio.addEventListener('canplaythrough', function() {
        if (shouldPlay && !musicStarted) {
            tryPlayMusic();
        }
    }, { once: true });
}

// Exporta funções para uso em outras páginas (garante disponibilidade global)
window.getPalpites = getPalpites;
window.savePalpite = savePalpite;
window.exportPalpites = exportPalpites;
window.clearAllPalpites = clearAllPalpites;
window.initializeMusic = initializeMusic;


