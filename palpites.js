// Função auxiliar para obter palpites (fallback se script.js não carregou)
async function getPalpitesLocal() {
    try {
        // Tenta usar SQLite primeiro
        if (window.SQLiteDB) {
            await window.SQLiteDB.init();
            return await window.SQLiteDB.getAllPalpites();
        }
        return [];
    } catch (e) {
        console.error('Erro ao ler palpites:', e);
        return [];
    }
}

// Carrega e exibe os palpites
document.addEventListener('DOMContentLoaded', async function() {
    // Aguarda um pouco para garantir que script.js foi carregado
    setTimeout(async () => {
        await loadPalpites();
    }, 100);
    
    // Música não é reproduzida nesta página (apenas em index.html)
});

async function loadPalpites() {
    // Usa window.getPalpites se disponível (agora é async)
    let palpites = [];
    
    if (typeof window !== 'undefined' && window.getPalpites) {
        try {
            palpites = await window.getPalpites();
        } catch (error) {
            console.error('Erro ao carregar palpites:', error);
            // Fallback para SQLite direto
            palpites = await getPalpitesLocal();
        }
    } else {
        palpites = await getPalpitesLocal();
    }
    const container = document.getElementById('palpitesContainer');
    const emptyState = document.getElementById('emptyState');

    // Debug: verifica se há palpites
    console.log('Palpites encontrados:', palpites.length);

    // Atualiza estatísticas
    updateStats(palpites);
    
    // Atualiza gráfico
    updateChart(palpites);

    if (!palpites || palpites.length === 0) {
        if (container) {
            container.style.display = 'none';
            container.classList.add('hidden');
        }
        if (emptyState) {
            emptyState.style.display = 'block';
            emptyState.classList.remove('hidden');
        }
        return;
    }

    if (container) {
        container.style.display = 'grid';
        container.classList.remove('hidden');
    }
    if (emptyState) {
        emptyState.style.display = 'none';
        emptyState.classList.add('hidden');
    }

    // Ordena por data (mais recentes primeiro)
    palpites.sort((a, b) => new Date(b.dataRegistro) - new Date(a.dataRegistro));

    // Limpa o container
    if (container) {
        container.innerHTML = '';

        // Cria cards para cada palpite
        palpites.forEach(palpite => {
            const card = createPalpiteCard(palpite);
            container.appendChild(card);
        });
    }
}

function createPalpiteCard(palpite) {
    const card = document.createElement('div');
    card.className = 'palpite-card';

    const sexoIcon = palpite.sexo === 'menina' ? '👶💕' : '👶💙';
    const sexoText = palpite.sexo === 'menina' ? 'Menina' : 'Menino';

    const dataFormatada = formatDate(palpite.dataPalpite);

    card.innerHTML = `
        <div class="palpite-header">
            <span class="palpite-nome">${escapeHtml(palpite.nome)}</span>
            <span class="palpite-sexo" title="${sexoText}">${sexoIcon}</span>
        </div>
        ${palpite.sugestaoNome ? `
            <div style="margin-bottom: 10px; padding: 8px; background: rgba(74, 124, 42, 0.1); border-radius: 8px;">
                <strong style="color: var(--primary-green);">💡 Sugestão de Nome:</strong>
                <span style="color: var(--text-dark);">${escapeHtml(palpite.sugestaoNome)}</span>
            </div>
        ` : ''}
        <div class="palpite-mensagem">"${escapeHtml(palpite.mensagem)}"</div>
        <div class="palpite-detalhes">
            <span class="palpite-data">📅 ${dataFormatada}</span>
        </div>
    `;

    return card;
}

function updateStats(palpites) {
    const total = palpites.length;
    const meninas = palpites.filter(p => p.sexo === 'menina').length;
    const meninos = palpites.filter(p => p.sexo === 'menino').length;

    const totalEl = document.getElementById('totalPalpites');
    const meninasEl = document.getElementById('totalMeninas');
    const meninosEl = document.getElementById('totalMeninos');

    if (totalEl) totalEl.textContent = total;
    if (meninasEl) meninasEl.textContent = meninas;
    if (meninosEl) meninosEl.textContent = meninos;
}

function updateChart(palpites) {
    const chartContainer = document.getElementById('chartContainer');
    if (!chartContainer) return;

    const total = palpites.length;
    if (total === 0) {
        chartContainer.classList.add('hidden');
        return;
    }

    chartContainer.classList.remove('hidden');

    const meninas = palpites.filter(p => p.sexo === 'menina').length;
    const meninos = palpites.filter(p => p.sexo === 'menino').length;

    const percentMeninas = total > 0 ? (meninas / total) * 100 : 0;
    const percentMeninos = total > 0 ? (meninos / total) * 100 : 0;

    // Atualiza legendas
    const legendMenina = document.getElementById('legendMenina');
    const legendMenino = document.getElementById('legendMenino');
    if (legendMenina) legendMenina.textContent = `${percentMeninas.toFixed(1)}%`;
    if (legendMenino) legendMenino.textContent = `${percentMeninos.toFixed(1)}%`;

    // Cria gráfico de pizza usando stroke-dasharray
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    
    const chartMenina = document.getElementById('chartMenina');
    const chartMenino = document.getElementById('chartMenino');
    const chartCenterText = document.getElementById('chartCenterText');

    if (chartMenina && chartMenino && chartCenterText) {
        // Offset para começar do topo (rotaciona -90 graus = -25% da circunferência)
        const startOffset = -circumference / 4;
        
        // Calcula os valores do dash
        const meninaDash = circumference * (percentMeninas / 100);
        const meninoDash = circumference * (percentMeninos / 100);

        // Menina (primeira fatia)
        if (percentMeninas > 0) {
            chartMenina.setAttribute('stroke-dasharray', `${meninaDash} ${circumference}`);
            chartMenina.setAttribute('stroke-dashoffset', startOffset);
            chartMenina.style.opacity = '1';
        } else {
            chartMenina.setAttribute('stroke-dasharray', `0 ${circumference}`);
            chartMenina.style.opacity = '0';
        }

        // Menino (segunda fatia, continua de onde menina parou)
        if (percentMeninos > 0) {
            chartMenino.setAttribute('stroke-dasharray', `${meninoDash} ${circumference}`);
            chartMenino.setAttribute('stroke-dashoffset', startOffset - meninaDash);
            chartMenino.style.opacity = '1';
        } else {
            chartMenino.setAttribute('stroke-dasharray', `0 ${circumference}`);
            chartMenino.style.opacity = '0';
        }

        // Texto central com total
        chartCenterText.textContent = total > 0 ? `${total}` : '0';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Data não informada';
    
    const date = new Date(dateString + 'T00:00:00');
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Recarrega quando voltar para a página (caso tenha novos palpites)
window.addEventListener('focus', async function() {
    if (window.location.pathname.includes('palpites.html')) {
        await loadPalpites();
    }
});


