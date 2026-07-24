// assistente-guia.js - Assistente Guia Autónomo para Devoluções
// Fala sozinho, envia notificações e gera relatórios periódicos

(function() {
    'use strict';

    console.log('🤖 VerdeChat carregado!');

    // ============================================
    // CONFIGURAÇÕES PADRÃO
    // ============================================
    const CONFIG_KEY = 'verdechat_guia_config';
    let config = {
        intensidade: 'media', // alta, media, baixa, silencioso
        diasPendente: 2,
        diasUrgente: 5,
        diasAntiga: 30,
        silenciosoInicio: 22,
        silenciosoFim: 7
    };

    function carregarConfig() {
        try {
            const dados = localStorage.getItem(CONFIG_KEY);
            if (dados) {
                config = { ...config, ...JSON.parse(dados) };
            }
        } catch (e) {}
    }

    function salvarConfig() {
        try {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
        } catch (e) {}
    }

    // ============================================
    // ESTADO E AUXILIARES
    // ============================================
    let lastActivity = Date.now();
    let cacheConcluidas = [];

    try {
        cacheConcluidas = JSON.parse(localStorage.getItem('verdechat_guia_cache_concluidas') || '[]');
    } catch (e) {}

    function formatarData(data) {
        const d = new Date(data);
        return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    function isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }

    function isLastBusinessDayOfMonth() {
        const today = new Date();
        const y = today.getFullYear();
        const m = today.getMonth();
        let lastDay = new Date(y, m + 1, 0);
        if (lastDay.getDay() === 6) lastDay.setDate(lastDay.getDate() - 1);
        else if (lastDay.getDay() === 0) lastDay.setDate(lastDay.getDate() - 2);
        return today.getDate() === lastDay.getDate();
    }

    function isFirstBusinessDayOfMonth() {
        const today = new Date();
        const y = today.getFullYear();
        const m = today.getMonth();
        let firstDay = new Date(y, m, 1);
        if (firstDay.getDay() === 6) firstDay.setDate(firstDay.getDate() + 2);
        else if (firstDay.getDay() === 0) firstDay.setDate(firstDay.getDate() + 1);
        return today.getDate() === firstDay.getDate();
    }

    // ============================================
    // COMUNICAÇÃO (NOTIFICAÇÕES & BUBBLES)
    // ============================================
    function enviarNotificacaoNativa(titulo, corpo) {
        const hr = new Date().getHours();
        if (hr >= config.silenciosoInicio || hr < config.silenciosoFim) {
            return; // Silent hours
        }
        if (Notification.permission === 'granted') {
            new Notification('VerdeChat', { body: corpo, silent: config.intensidade === 'silencioso' });
        }
    }

    function enviarMensagemGuia(conteudo) {
        if (config.intensidade === 'silencioso') {
            return; // Silent mode does not print bubbles in chat
        }
        if (window.devolucoes && typeof window.devolucoes.modo === 'function' && window.devolucoes.modo()) {
            if (typeof window.addMessageDirect === 'function') {
                window.addMessageDirect('bot', `🤖 **VerdeChat:**\n\n${conteudo}`, false);
            }
        }
    }

    // ============================================
    // RELATÓRIOS E AGENDAMENTOS
    // ============================================
    function enviarResumoMatinal() {
        if (!window.devolucoes) return;
        const todas = window.devolucoes.todos();
        const pendentes = todas.filter(d => d.status === 'pendente');
        const concluidas = todas.filter(d => d.status === 'concluida');
        
        const urgentes = pendentes.filter(d => {
            const diffDays = Math.floor((new Date() - new Date(d.data)) / (1000 * 60 * 60 * 24));
            return diffDays >= config.diasUrgente;
        });

        let msg = `🌅 **Resumo Matinal (09:00):**\n\n`;
        msg += `📊 **Painel Geral:**\n`;
        msg += `• ⏳ Pendentes: **${pendentes.length}** devoluções\n`;
        msg += `• ✅ Concluídas: **${concluidas.length}** devoluções\n\n`;
        if (urgentes.length > 0) {
            msg += `⚠️ **Atenção:** Temos **${urgentes.length}** notas urgentes (${config.diasUrgente}+ dias) pendentes. Sugiro priorizá-las hoje!`;
        } else {
            msg += `✨ Nenhuma urgência pendente no momento. Excelente!`;
        }
        enviarMensagemGuia(msg);
        enviarNotificacaoNativa('Resumo Matinal VerdeChat', `Pendentes: ${pendentes.length} | Concluídas: ${concluidas.length}`);
    }

    function enviarCheckpointTarde() {
        if (!window.devolucoes) return;
        const todas = window.devolucoes.todos();
        const pendentes = todas.filter(d => d.status === 'pendente');
        const concluidasHoje = todas.filter(d => d.status === 'concluida' && isToday(new Date(d.data)));

        let msg = `☀️ **Checkpoint de Tarde (14:00):**\n\n`;
        msg += `📈 Progresso de hoje: **${concluidasHoje.length}** notas concluídas.\n`;
        msg += `⏳ Pendências restantes: **${pendentes.length}** notas.\n\n`;
        if (pendentes.length > 0) {
            const ordenadaAntigas = [...pendentes].sort((a, b) => new Date(a.data) - new Date(b.data));
            msg += `💡 **Recomendação de Prioridade:** Focar na nota **${ordenadaAntigas[0].nota}** (pendente desde ${formatarData(ordenadaAntigas[0].data)}).`;
        } else {
            msg += `🏆 Parabéns! Não há notas pendentes.`;
        }
        enviarMensagemGuia(msg);
    }

    function enviarFimDia() {
        if (!window.devolucoes) return;
        const todas = window.devolucoes.todos();
        const concluidasHoje = todas.filter(d => d.status === 'concluida' && isToday(new Date(d.data)));
        const pendentes = todas.filter(d => d.status === 'pendente');

        let msg = `🌇 **Fim de Expediente (17:30):**\n\n`;
        msg += `📊 **Balanço Diário:**\n`;
        msg += `• Notas concluídas hoje: **${concluidasHoje.length}**\n`;
        msg += `• Pendentes para amanhã: **${pendentes.length}**\n\n`;
        if (pendentes.length > 0) {
            msg += `🎯 **Meta recomendada para amanhã:** Resolver pelo menos **${Math.min(3, pendentes.length)}** notas pendentes.`;
        } else {
            msg += `🏆 Excelente dia de trabalho! Finalizado com 100% de conclusão.`;
        }
        enviarMensagemGuia(msg);
        enviarNotificacaoNativa('Fim de Expediente VerdeChat', `Notas concluídas hoje: ${concluidasHoje.length}`);
    }

    function enviarResumoFimMes() {
        if (!window.devolucoes) return;
        const todas = window.devolucoes.todos();
        const concluidas = todas.filter(d => d.status === 'concluida');

        let msg = `📅 **Fechamento de Mês (Último Dia Útil):**\n\n`;
        msg += `📊 Temos **${concluidas.length}** devoluções concluídas na lista.\n`;
        msg += `💡 Para manter a tabela limpa e rápida, sugere-se arquivar estas notas.\n\n`;
        msg += `👉 Digite **"arquivar todas concluídas"** para limpar a visualização.`;
        enviarMensagemGuia(msg);
    }

    function enviarResumoInicioMes() {
        if (!window.devolucoes) return;
        const todas = window.devolucoes.todos();
        const pendentes = todas.filter(d => d.status === 'pendente');

        let msg = `📅 **Consolidado de Mês Anterior (1º Dia Útil):**\n\n`;
        msg += `• Transição: Iniciamos este mês com **${pendentes.length}** notas pendentes.\n`;
        msg += `💪 Tenha um ótimo e produtivo mês de trabalho!`;
        enviarMensagemGuia(msg);
    }

    // ============================================
    // MONITORAMENTO E ALERTAS PERIÓDICOS
    // ============================================
    function verificarAlertasPeriodicos() {
        if (!window.devolucoes || !window.devolucoes.modo()) return;

        const todas = window.devolucoes.todos();
        const pendentes = todas.filter(d => d.status === 'pendente');
        if (pendentes.length === 0) return;

        const hojeStr = new Date().toDateString();
        const nowTime = Date.now();

        let countPendencia = 0; // 2+ dias
        let countUrgencia = 0;  // 5+ dias
        let countAntiga = 0;    // 30+ dias

        pendentes.forEach(d => {
            const diffMs = new Date() - new Date(d.data);
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            if (diffDays >= config.diasAntiga) {
                countAntiga++;
            } else if (diffDays >= config.diasUrgente) {
                countUrgencia++;
            } else if (diffDays >= config.diasPendente) {
                countPendencia++;
            }
        });

        // 1. Alerta de Notas Antigas (30+ dias) - 1x ao dia
        const lastAntiga = localStorage.getItem('verdechat_guia_last_antiga_alert') || '';
        if (countAntiga > 0 && lastAntiga !== hojeStr) {
            localStorage.setItem('verdechat_guia_last_antiga_alert', hojeStr);
            const texto = `🔴 **Alerta de Notas Antigas:** Temos **${countAntiga}** devoluções pendentes há mais de ${config.diasAntiga} dias!`;
            enviarMensagemGuia(texto);
            enviarNotificacaoNativa('Notas Antigas Acumuladas', texto.replace(/\*\*|🔴/g, ''));
            return;
        }

        // 2. Alerta de Urgência (5+ dias) - 2x ao dia (mínimo 4h intervalo)
        const lastUrgenciaDate = localStorage.getItem('verdechat_guia_last_urgencia_alert_date') || '';
        let urgenciaCount = parseInt(localStorage.getItem('verdechat_guia_urgencia_alert_count') || '0');
        const lastUrgenciaTime = parseInt(localStorage.getItem('verdechat_guia_last_urgencia_alert_time') || '0');

        if (hojeStr !== lastUrgenciaDate) {
            urgenciaCount = 0;
            localStorage.setItem('verdechat_guia_last_urgencia_alert_date', hojeStr);
        }

        const totalUrgentes = countUrgencia + countAntiga;
        if (totalUrgentes > 0 && urgenciaCount < 2 && (nowTime - lastUrgenciaTime) > 4 * 60 * 60 * 1000) {
            localStorage.setItem('verdechat_guia_urgencia_alert_count', String(urgenciaCount + 1));
            localStorage.setItem('verdechat_guia_last_urgencia_alert_time', String(nowTime));
            
            const texto = `⚠️ **Alerta de Urgência:** Existem **${totalUrgentes}** notas pendentes há mais de ${config.diasUrgente} dias.`;
            enviarMensagemGuia(texto);
            enviarNotificacaoNativa('Atenção: Notas Urgentes', texto.replace(/\*\*|⚠️/g, ''));
            return;
        }

        // 3. Alerta de Pendência Geral (2+ dias) - 1x ao dia
        const lastPendencia = localStorage.getItem('verdechat_guia_last_pendencia_alert') || '';
        const totalPendentes2Dias = countPendencia + countUrgencia + countAntiga;
        if (totalPendentes2Dias > 0 && lastPendencia !== hojeStr) {
            localStorage.setItem('verdechat_guia_last_pendencia_alert', hojeStr);
            const texto = `⏳ **Alerta de Pendências:** Temos **${totalPendentes2Dias}** notas paradas há 2+ dias.`;
            enviarMensagemGuia(texto);
            enviarNotificacaoNativa('Pendências no Sistema', texto.replace(/\*\*|⏳/g, ''));
        }
    }

    function verificarEtapasParadas() {
        if (!window.devolucoes || !window.devolucoes.modo()) return;
        
        const todas = window.devolucoes.todos();
        const pendentes = todas.filter(d => d.status === 'pendente');
        if (pendentes.length === 0) return;
        
        const now = Date.now();
        const hojeStr = new Date().toDateString();
        
        let alertadasHoje = [];
        try {
            const cache = localStorage.getItem('verdechat_guia_last_alerta_etapas_paradas_cache');
            const cachedDate = localStorage.getItem('verdechat_guia_last_alerta_etapas_paradas_date') || '';
            if (cachedDate === hojeStr && cache) {
                alertadasHoje = JSON.parse(cache);
            } else {
                localStorage.setItem('verdechat_guia_last_alerta_etapas_paradas_date', hojeStr);
            }
        } catch(e) {}
        
        let mudouCache = false;
        
        pendentes.forEach(d => {
            const dataAlteracao = d.dataAlteracaoEtapa ? new Date(d.dataAlteracaoEtapa) : new Date(d.dataAdicao || d.data);
            const diffMs = now - dataAlteracao.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            if (diffDays >= 2 && !alertadasHoje.includes(d.nota)) {
                const msg = `⚠️ **Nota Parada:** A NF **${d.nota}** está parada na etapa **'${d.etapa || 'Retirada do Palet'}'** há ${diffDays} dias!`;
                enviarMensagemGuia(msg);
                enviarNotificacaoNativa('VerdeChat', `A NF ${d.nota} está parada na etapa '${d.etapa || 'Retirada do Palet'}' há ${diffDays} dias!`);
                
                alertadasHoje.push(d.nota);
                mudouCache = true;
            }
        });
        
        if (mudouCache) {
            localStorage.setItem('verdechat_guia_last_alerta_etapas_paradas_cache', JSON.stringify(alertadasHoje));
        }
    }

    function verificarInatividade() {
        if (!window.devolucoes || !window.devolucoes.modo()) return;

        const now = Date.now();
        if (now - lastActivity > 1 * 60 * 60 * 1000) {
            const hojeStr = new Date().toDateString();
            const lastInactivityAlert = localStorage.getItem('verdechat_guia_last_inactivity_alert') || '';
            
            if (lastInactivityAlert !== hojeStr) {
                localStorage.setItem('verdechat_guia_last_inactivity_alert', hojeStr);
                enviarMensagemGuia(`💤 **Inatividade:** Já faz mais de 1 hora que não vejo atividade no chat de devoluções. Se precisar de algo, digite **"ajuda devoluções"** ou verifique as notas!`);
            }
        }
    }

    function verificarNovasConclusoes() {
        if (!window.devolucoes) return;
        const todas = window.devolucoes.todos();
        const concluidasAtuais = todas.filter(d => d.status === 'concluida').map(d => d.nota);
        
        let novas = 0;
        concluidasAtuais.forEach(nota => {
            if (!cacheConcluidas.includes(nota)) {
                novas++;
                cacheConcluidas.push(nota);
            }
        });
        
        if (novas > 0) {
            localStorage.setItem('verdechat_guia_cache_concluidas', JSON.stringify(cacheConcluidas));
            
            const hojeStr = new Date().toDateString();
            let concluidoHojeCount = parseInt(localStorage.getItem('verdechat_guia_concluido_hoje_count') || '0');
            const lastConcluidoDate = localStorage.getItem('verdechat_guia_last_concluido_date') || '';
            
            if (hojeStr !== lastConcluidoDate) {
                concluidoHojeCount = 0;
                localStorage.setItem('verdechat_guia_last_concluido_date', hojeStr);
            }
            concluidoHojeCount += novas;
            localStorage.setItem('verdechat_guia_concluido_hoje_count', concluidoHojeCount);
            
            const parabensSent = localStorage.getItem('verdechat_guia_parabens_sent_date') || '';
            if (concluidoHojeCount >= 3 && parabensSent !== hojeStr) {
                enviarMensagemGuia(`🎉 **Parabéns!** Você concluiu **${concluidoHojeCount}** devoluções hoje! Excelente progresso! 🚀`);
                localStorage.setItem('verdechat_guia_parabens_sent_date', hojeStr);
            }
        }
    }

    // ============================================
    // CONFIGURAÇÃO INTERATIVA
    // ============================================
    function mostrarConfiguracaoGuia() {
        const html = `
        <div style="padding: 10px; background: var(--input-bg); border-radius: 12px; border: 1px solid var(--border-color); font-size: 0.8rem; line-height: 1.4; color: var(--text-primary); max-width: 320px;">
            <div style="font-weight: bold; color: var(--accent); margin-bottom: 6px;">⚙️ CONFIGURAR VERDECHAT</div>
            <div style="margin-bottom: 4px;"><strong>Intensidade atual:</strong> ${config.intensidade.toUpperCase()}</div>
            <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px;">
                <button onclick="window.salvarConfigGuia('intensidade', 'alta')" style="background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); padding: 3px 6px; border-radius: 6px; cursor: pointer; font-size: 0.72rem;">Alta</button>
                <button onclick="window.salvarConfigGuia('intensidade', 'media')" style="background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); padding: 3px 6px; border-radius: 6px; cursor: pointer; font-size: 0.72rem;">Média</button>
                <button onclick="window.salvarConfigGuia('intensidade', 'baixa')" style="background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); padding: 3px 6px; border-radius: 6px; cursor: pointer; font-size: 0.72rem;">Baixa</button>
                <button onclick="window.salvarConfigGuia('intensidade', 'silencioso')" style="background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); padding: 3px 6px; border-radius: 6px; cursor: pointer; font-size: 0.72rem;">Silencioso</button>
            </div>
            <div style="margin-bottom: 4px;"><strong>Parâmetros de Alertas:</strong></div>
            <div style="font-size: 0.74rem; color: var(--text-secondary); margin-bottom: 6px;">
                • Pendente: ${config.diasPendente} dias<br>
                • Urgente: ${config.diasUrgente} dias<br>
                • Antiga: ${config.diasAntiga} dias
            </div>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                <button onclick="window.salvarConfigGuia('ajustar_alertas')" style="background: var(--accent); color: white; border: none; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 0.72rem; font-weight: bold;">✏️ Ajustar Dias</button>
            </div>
        </div>`;
        if (typeof window.addMessageDirect === 'function') {
            window.addMessageDirect('bot', html, false);
        }
    }

    window.salvarConfigGuia = function(chave, valor) {
        if (chave === 'intensidade') {
            config.intensidade = valor;
            salvarConfig();
            if (typeof window.addMessageDirect === 'function') {
                window.addMessageDirect('bot', `✅ Intensidade do assistente alterada para **${valor.toUpperCase()}**.`, false);
            }
        } else if (chave === 'ajustar_alertas') {
            const p = prompt("Dias para considerar PENDENTE:", config.diasPendente);
            const u = prompt("Dias para considerar URGENTE:", config.diasUrgente);
            const a = prompt("Dias para considerar ANTIGA (30+):", config.diasAntiga);
            
            if (p !== null) config.diasPendente = parseInt(p) || config.diasPendente;
            if (u !== null) config.diasUrgente = parseInt(u) || config.diasUrgente;
            if (a !== null) config.diasAntiga = parseInt(a) || config.diasAntiga;
            
            salvarConfig();
            if (typeof window.addMessageDirect === 'function') {
                window.addMessageDirect('bot', `✅ Parâmetros de alerta atualizados:\n• Pendente: **${config.diasPendente}** dias\n• Urgente: **${config.diasUrgente}** dias\n• Antiga: **${config.diasAntiga}** dias`, false);
            }
        }
    };

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    function iniciarRelogioAssistente() {
        setTimeout(() => {
            verificarAlertasPeriodicos();
            verificarNovasConclusoes();
            verificarEtapasParadas();
        }, 5000);

        setInterval(() => {
            if (!window.devolucoes || !window.devolucoes.modo()) return;
            
            const now = new Date();
            const hojeStr = now.toDateString();
            
            const hr = now.getHours();
            const mn = now.getMinutes();

            let lastMatinal = localStorage.getItem('verdechat_guia_matinal_sent_date') || '';
            let lastCheckpoint = localStorage.getItem('verdechat_guia_checkpoint_sent_date') || '';
            let lastFimDia = localStorage.getItem('verdechat_guia_fimdia_sent_date') || '';
            let lastFimMes = localStorage.getItem('verdechat_guia_fimmes_sent_date') || '';
            let lastIniMes = localStorage.getItem('verdechat_guia_inimes_sent_date') || '';

            // Matinal 09:00 - 09:15
            if (hr === 9 && mn >= 0 && mn < 15 && lastMatinal !== hojeStr) {
                localStorage.setItem('verdechat_guia_matinal_sent_date', hojeStr);
                enviarResumoMatinal();
            }

            // Checkpoint 14:00 - 14:15
            if (hr === 14 && mn >= 0 && mn < 15 && lastCheckpoint !== hojeStr) {
                localStorage.setItem('verdechat_guia_checkpoint_sent_date', hojeStr);
                enviarCheckpointTarde();
            }

            // Fim de dia 17:30 - 17:45
            if (hr === 17 && mn >= 30 && mn < 45 && lastFimDia !== hojeStr) {
                localStorage.setItem('verdechat_guia_fimdia_sent_date', hojeStr);
                enviarFimDia();
            }

            // Fim do mês (último dia útil às 16:00)
            if (isLastBusinessDayOfMonth() && hr === 16 && mn >= 0 && mn < 15 && lastFimMes !== hojeStr) {
                localStorage.setItem('verdechat_guia_fimmes_sent_date', hojeStr);
                enviarResumoFimMes();
            }

            // Mudança de mês (primeiro dia útil às 09:15)
            if (isFirstBusinessDayOfMonth() && hr === 9 && mn >= 15 && mn < 30 && lastIniMes !== hojeStr) {
                localStorage.setItem('verdechat_guia_inimes_sent_date', hojeStr);
                enviarResumoInicioMes();
            }

            verificarInatividade();

            // Verificações periódicas de 15 min
            const lastPeriodic = parseInt(localStorage.getItem('verdechat_guia_last_periodic_check') || '0');
            if (Date.now() - lastPeriodic > 15 * 60 * 1000) {
                localStorage.setItem('verdechat_guia_last_periodic_check', String(Date.now()));
                verificarAlertasPeriodicos();
                verificarEtapasParadas();
            }

            verificarNovasConclusoes();

        }, 60000); // Executa verificação a cada 1 minuto
    }

    function initGuia() {
        carregarConfig();
        
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const originalProcessar = window.processarComandoNatural;
        window.processarComandoNatural = function(mensagem) {
            const lower = mensagem.toLowerCase().trim();
            if (lower === 'configurar guia' || lower === 'configurar verdechat') {
                mostrarConfiguracaoGuia();
                return '__DEV_OK__';
            }
            
            if (typeof originalProcessar === 'function') {
                return originalProcessar(mensagem);
            }
            return null;
        };

        document.addEventListener('input', (e) => {
            if (e.target.id === 'chatMsgInput' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                lastActivity = Date.now();
            }
        });
        document.addEventListener('click', () => {
            lastActivity = Date.now();
        });

        iniciarRelogioAssistente();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGuia);
    } else {
        initGuia();
    }
})();
