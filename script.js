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

// Detecta se é localhost (servidor Python)
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '';

// Log para debug
console.log('🔍 Detecção de ambiente:');
console.log('  - Hostname:', window.location.hostname);
console.log('  - Protocol:', window.location.protocol);
console.log('  - É GitHub Pages:', isGitHubPages);
console.log('  - É Localhost:', isLocalhost);

if (isGitHubPages) {
    console.log('🌐 Modo GitHub Pages detectado - usando localStorage');
} else if (isLocalhost) {
    console.log('💻 Modo localhost detectado - tentando API primeiro');
} else {
    console.log('⚠️ Ambiente desconhecido - tentando API primeiro');
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
    console.log('🚀 handleFormSubmit chamado!', e);
    e.preventDefault();
    console.log('✅ preventDefault executado');
    
    // Pausa a música para melhorar performance durante o envio
    const audio = document.getElementById('backgroundMusic');
    let musicaEstavaTocando = false;
    
    if (audio && !audio.paused) {
        musicaEstavaTocando = true;
        audio.pause();
        console.log('🎵 Música pausada para melhorar performance');
        
        // Atualiza o botão de música visualmente
        const toggleBtn = document.getElementById('musicToggle');
        const musicIcon = document.getElementById('musicIcon');
        if (toggleBtn) {
            toggleBtn.classList.remove('playing');
        }
        if (musicIcon) {
            musicIcon.textContent = '🔇';
        }
    }
    
    const formData = new FormData(e.target);
    const palpite = {
        nome: formData.get('nome'),
        sexo: formData.get('sexo'),
        sugestaoNome: formData.get('sugestaoNome') || null,
        mensagem: formData.get('mensagem'),
        dataPalpite: formData.get('dataPalpite')
    };
    
    console.log('📋 Dados do formulário coletados:', palpite);

    // Desabilita o botão durante o envio
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (!submitBtn) {
        console.error('❌ Botão submit não encontrado!');
        return;
    }
    
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳</span> Enviando...';
    console.log('🔒 Botão desabilitado');

    try {
        console.log('📝 Iniciando salvamento do palpite...', palpite);
        
        // Salva o palpite primeiro (mais importante)
        console.log('💾 Salvando palpite...');
        const resultado = await savePalpite(palpite);
        console.log('✅ Palpite salvo:', resultado);

        // Verifica se é ganhador APÓS salvar (não bloqueia o envio)
        let isGanhador = false;
        try {
            // Usa Promise.race com timeout para não travar
            const palpitesPromise = getPalpites();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 3000)
            );
            
            const palpitesExistentes = await Promise.race([palpitesPromise, timeoutPromise]);
            const numeroTotal = palpitesExistentes.length;
            isGanhador = numeroTotal === 10;
            console.log(`📊 Total de palpites após salvar: ${numeroTotal}, é o ${numeroTotal}º palpite? ${isGanhador}`);
        } catch (error) {
            console.warn('⚠️ Não foi possível verificar se é ganhador (timeout ou erro), continuando...', error.message);
            // Continua mesmo se não conseguir verificar (não é crítico)
        }

        // Dispara fogos de artifício (mais intensos se for ganhador)
        triggerFireworks(isGanhador);
        
        // Mostra mensagem de sucesso (com informação se é ganhador)
        showSuccessMessage(isGanhador);

        // Reseta o formulário
        e.target.reset();
        setDefaultDate();
        
        console.log('🎉 Processo concluído com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao salvar palpite:', error);
        // Mostra mensagem de erro
        showErrorMessage(error.message || 'Erro ao salvar palpite. Tente novamente.');
    } finally {
        // Reabilita o botão (sempre executa, mesmo se houver erro)
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        console.log('🔄 Botão reabilitado');
        
        // Opcional: Retoma a música se estava tocando (comentado para manter pausada)
        // Se quiser que a música volte automaticamente após o envio, descomente:
        // if (musicaEstavaTocando && audio) {
        //     audio.play().catch(err => console.log('Não foi possível retomar a música:', err));
        // }
    }
}

// Salva o palpite no servidor (SQLite) ou localStorage (fallback)
async function savePalpite(palpite) {
    // Validação básica dos dados
    if (!palpite.nome || !palpite.sexo || !palpite.mensagem || !palpite.dataPalpite) {
        throw new Error('Dados do palpite incompletos');
    }
    
    // Se estiver no GitHub Pages, usa localStorage diretamente sem tentar API
    if (isGitHubPages) {
        console.log('💾 Salvando no localStorage (GitHub Pages)');
        return savePalpiteLocalStorage(palpite);
    }
    
    // Para localhost ou qualquer ambiente que não seja GitHub Pages, SEMPRE tenta API primeiro
    console.log('🌐 Tentando salvar na API...', palpite);
    try {
        // Adiciona timeout para evitar que trave indefinidamente
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
        
        const response = await fetch('/api/palpites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(palpite),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('📡 Resposta da API recebida:', response.status, response.statusText);
        
        if (!response.ok) {
            // Tenta ler a mensagem de erro do servidor
            let errorMessage = `API retornou erro: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
                console.error('📋 Detalhes do erro:', errorData);
            } catch (e) {
                // Se não conseguir ler o JSON de erro, usa a mensagem padrão
                console.error('⚠️ Não foi possível ler detalhes do erro');
            }
            throw new Error(errorMessage);
        }
        
        const result = await response.json();
        console.log('✅ Palpite salvo com sucesso na API:', result);
        return result;
    } catch (error) {
        // Se der erro na API (servidor offline, erro de rede, timeout, etc), usa localStorage como fallback
        if (error.name === 'AbortError') {
            console.warn('⏱️ Timeout ao salvar na API (10s), usando localStorage como fallback');
        } else {
            console.warn('⚠️ Erro ao salvar na API:', error);
        }
        console.log('💾 Usando localStorage como fallback...');
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
    // Se estiver no GitHub Pages, usa localStorage diretamente
    if (isGitHubPages) {
        console.log('💾 Carregando palpites do localStorage (GitHub Pages)');
        return getPalpitesLocalStorage();
    }
    
    // Para localhost ou qualquer ambiente que não seja GitHub Pages, SEMPRE tenta API primeiro
    console.log('🌐 Tentando carregar palpites da API...');
    try {
        // Adiciona timeout para evitar que trave indefinidamente
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout
        
        const response = await fetch('/api/palpites', {
            method: 'GET',
            cache: 'no-cache',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`API retornou erro: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const palpites = data.palpites || [];
        console.log(`✅ Carregados ${palpites.length} palpites da API`);
        return palpites;
    } catch (error) {
        // Se der erro na API (servidor offline, erro de rede, timeout, etc), usa localStorage como fallback
        if (error.name === 'AbortError') {
            console.warn('⏱️ Timeout ao carregar da API (5s), usando localStorage como fallback');
        } else {
            console.warn('⚠️ Erro ao carregar da API, usando localStorage como fallback:', error.message);
        }
        console.log('💾 Carregando palpites do localStorage...');
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

// Função para criar efeito de fogos de artifício
function triggerFireworks(isGanhador = false) {
    console.log('🎆 Iniciando fogos de artifício!', isGanhador ? '(Ganhador)' : '');
    
    // Cria canvas para os fogos de artifício
    const canvas = document.createElement('canvas');
    canvas.id = 'fireworksCanvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Array de partículas de fogos
    const particles = [];
    
    // Cores dos fogos (verde e dourado para combinar com o tema)
    // Se for ganhador, usa mais cores douradas
    const colors = isGanhador 
        ? ['#ffc107', '#ff6f00', '#ffeb3b', '#ff9800', '#ff5722', '#ffd700', '#ffa500']
        : ['#4caf50', '#2d5016', '#ffc107', '#ff6f00', '#ffffff', '#4a7c2a'];
    
    // Cria múltiplos fogos de artifício (mais se for ganhador)
    const fireworkCount = isGanhador ? 8 : 5;
    const particleBase = isGanhador ? 50 : 30;
    let fogosCriados = 0;
    
    function createFirework() {
        // Se for ganhador, alguns fogos aparecem no centro superior (onde está a mensagem)
        let x, y;
        if (isGanhador && Math.random() > 0.5) {
            x = canvas.width / 2 + (Math.random() - 0.5) * 300;
            y = canvas.height * 0.3 + Math.random() * 100;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() * (canvas.height * 0.5) + canvas.height * 0.2;
        }
        
        // Cria partículas explosivas
        const particleCount = particleBase + Math.random() * 50;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = isGanhador ? (3 + Math.random() * 5) : (2 + Math.random() * 4);
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            
            particles.push({
                x: x,
                y: y,
                vx: velocity.x,
                vy: velocity.y,
                life: 1,
                decay: 0.012 + Math.random() * 0.02,
                size: isGanhador ? (4 + Math.random() * 5) : (3 + Math.random() * 4),
                color: color,
                brightness: 1
            });
        }
        fogosCriados++;
    }
    
    // Função de animação
    function animate() {
        // Limpa o canvas com fade (cria efeito de rastro)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Atualiza e desenha partículas
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // Gravidade
            p.life -= p.decay;
            p.brightness *= 0.98;
            
            if (p.life > 0) {
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 15;
                ctx.shadowColor = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else {
                particles.splice(i, 1);
            }
        }
        
        ctx.globalAlpha = 1;
        
        // Continua animação se houver partículas ou se ainda há fogos sendo criados
        const todosFogosCriados = fogosCriados >= fireworkCount;
        const aindaHaParticulas = particles.length > 0;
        
        if (aindaHaParticulas || !todosFogosCriados) {
            requestAnimationFrame(animate);
        } else {
            // Todos os fogos foram criados e não há mais partículas, remove canvas
            setTimeout(() => {
                if (canvas.parentNode) {
                    canvas.parentNode.removeChild(canvas);
                }
            }, 500);
        }
    }
    
    // Inicia animação imediatamente
    animate();
    
    // Cria os fogos com delay
    for (let i = 0; i < fireworkCount; i++) {
        setTimeout(() => {
            createFirework();
        }, i * 300);
    }
    
    // Ajusta canvas quando a janela é redimensionada
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Mostra mensagem de sucesso com agradecimento e QR Code PIX
function showSuccessMessage(isGanhador = false) {
    const successMessage = document.getElementById('successMessage');
    const qrcodeContainer = document.getElementById('qrcodeContainer');
    const qrcodeElement = document.getElementById('qrcode');
    
    if (successMessage) {
        // Mostra a mensagem de sucesso
        successMessage.classList.remove('hidden');
        
        // Mensagem de agradecimento
        const messageText = successMessage.querySelector('p');
        
        if (isGanhador) {
            // Mensagem especial para o ganhador (10º participante)
            successMessage.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 193, 7, 0.15) 100%)';
            successMessage.style.borderColor = '#ffc107';
            successMessage.style.borderWidth = '3px';
            successMessage.style.boxShadow = '0 8px 32px rgba(255, 215, 0, 0.3)';
            
            if (messageText) {
                messageText.innerHTML = `
                    🎉🎉🎉 <strong style="font-size: 1.2em; color: #ff6f00;">PARABÉNS! VOCÊ GANHOU! 🎉🎉🎉</strong><br><br>
                    <div style="background: rgba(255, 255, 255, 0.9); padding: 15px; border-radius: 10px; margin: 10px 0; border: 2px solid #ffc107;">
                        <p style="margin: 0; font-size: 1.1em; color: #333;">
                            Você foi a <strong style="color: #ff6f00;">ganhadora do prêmio de participação!</strong><br><br>
                            <strong style="font-size: 1.3em; color: #d32f2f; letter-spacing: 2px;">SUA PALAVRA-CHAVE É:</strong><br>
                            <span style="font-size: 2em; font-weight: bold; color: #ff6f00; display: block; margin: 10px 0; padding: 10px; background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%); border-radius: 8px; border: 3px solid #ffc107;">BRANDAO10</span><br>
                            <strong style="color: #d32f2f;">🎁 Vale-presente de R$ 100,00</strong> nas lojas <strong>C&A</strong><br><br>
                            <small style="color: #666;">Guarde esta palavra-chave! Você precisará dela para resgatar seu prêmio.</small>
                        </p>
                    </div>
                    <p style="margin-top: 10px;">✨ Obrigado pelo seu palpite e parabéns pela participação! 💚</p>
                `;
            }
            
            // Adiciona efeito de pulso especial para ganhador
            successMessage.style.animation = 'winnerPulse 2s infinite';
            
            // Scroll para garantir que o usuário veja a mensagem
            setTimeout(() => {
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        } else {
            // Mensagem normal para outros participantes
            successMessage.style.background = 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)';
            successMessage.style.borderColor = '#4caf50';
            successMessage.style.borderWidth = '';
            successMessage.style.boxShadow = '';
            successMessage.style.animation = '';
            
            if (messageText) {
                messageText.innerHTML = '✨ <strong>Obrigado pelo seu palpite!</strong><br>Seu carinho é muito especial para nós! 💚';
            }
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
    console.error('🚨 Mostrando mensagem de erro:', message);
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.classList.remove('hidden');
        successMessage.style.background = 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)';
        successMessage.style.borderColor = '#f44336';
        
        const icon = successMessage.querySelector('.success-icon');
        if (icon) {
            icon.textContent = '❌';
        }
        
        const messageElement = successMessage.querySelector('p');
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        // Scroll suave até a mensagem
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Esconde a mensagem após 5 segundos
        setTimeout(() => {
            successMessage.classList.add('hidden');
            // Restaura valores padrão
            successMessage.style.background = '';
            successMessage.style.borderColor = '';
            if (icon) {
                icon.textContent = '✨';
            }
        }, 5000);
    } else {
        // Se não encontrar o elemento, mostra alerta
        alert('Erro: ' + message);
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
            // Para localhost, SEMPRE tenta API primeiro
            try {
                const response = await fetch('/api/palpites', {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    throw new Error(`API retornou erro: ${response.status} ${response.statusText}`);
                }
                
                console.log('✅ Palpites removidos da API');
            } catch (error) {
                console.warn('⚠️ Erro ao limpar na API, usando localStorage:', error.message);
                // Fallback para localStorage
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


