// ============================================
// SISTEMA DE LEMBRETES - VERSÃO QUE FUNCIONA!
// ============================================

(function() {
    'use strict';

    console.log('🔔 Sistema de Lembretes carregado!');

    // ============================================
    // CONFIGURAÇÕES
    // ============================================
    const STORAGE_KEY = 'verdechat_lembretes';
    const CHECK_INTERVAL = 10000; // 10 segundos

    // ============================================
    // ESTADO
    // ============================================
    let lembretes = [];
    let intervalId = null;
    let notificacaoAtivada = false;

    // ============================================
    // CARREGAR E SALVAR
    // ============================================
    function carregarLembretes() {
        try {
            const dados = localStorage.getItem(STORAGE_KEY);
            if (dados) {
                lembretes = JSON.parse(dados);
                // Limpar lembretes antigos
                const seteDias = 7 * 24 * 60 * 60 * 1000;
                const agora = Date.now();
                lembretes = lembretes.filter(l => {
                    if (l.concluido) return true;
                    return (agora - new Date(l.dataHora).getTime()) < seteDias;
                });
                salvarLembretes();
            }
        } catch (e) {
            lembretes = [];
        }
    }

    function salvarLembretes() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(lembretes));
        } catch (e) {}
    }

    // ============================================
    // FUNÇÃO PARA ADICIONAR MENSAGEM NO CHAT (SEGURA)
    // ============================================
    function adicionarMensagemNoChat(texto) {
        console.log('📝 Tentando adicionar mensagem no chat:', texto);
        
        // Tenta usar a função global do chat
        if (typeof window.addMessageDirect === 'function') {
            try {
                window.addMessageDirect('bot', texto, false);
                console.log('✅ Mensagem adicionada via addMessageDirect');
                return true;
            } catch(e) {
                console.warn('❌ Erro no addMessageDirect:', e);
            }
        }

        // Tenta usar a função de streaming
        if (typeof window.addMessageStreaming === 'function') {
            try {
                window.addMessageStreaming('bot', texto, false);
                console.log('✅ Mensagem adicionada via addMessageStreaming');
                return true;
            } catch(e) {
                console.warn('❌ Erro no addMessageStreaming:', e);
            }
        }

        // ÚLTIMO RECURSO: Adicionar manualmente no DOM
        try {
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                const div = document.createElement('div');
                div.classList.add('message', 'bot');
                
                const avatar = document.createElement('div');
                avatar.classList.add('avatar');
                avatar.innerHTML = '<i class="fas fa-robot"></i>';
                
                const bubble = document.createElement('div');
                bubble.classList.add('bubble');
                bubble.innerHTML = texto.replace(/\n/g, '<br>');
                bubble.style.whiteSpace = 'normal';
                bubble.style.wordBreak = 'break-word';
                
                div.appendChild(avatar);
                div.appendChild(bubble);
                chatMessages.appendChild(div);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                console.log('✅ Mensagem adicionada manualmente no DOM');
                return true;
            }
        } catch(e) {
            console.warn('❌ Erro ao adicionar manualmente:', e);
        }

        console.warn('❌ Nenhum método funcionou para adicionar mensagem!');
        return false;
    }

    // ============================================
    // FUNÇÕES PRINCIPAIS
    // ============================================

    function adicionarLembrete(texto, dataHora) {
        if (!texto || !dataHora) {
            return { erro: '❌ Preciso do texto e da data/hora!' };
        }

        let data;
        if (typeof dataHora === 'string') {
            data = new Date(dataHora);
        } else if (dataHora instanceof Date) {
            data = dataHora;
        } else {
            return { erro: '❌ Data/hora inválida!' };
        }

        if (isNaN(data.getTime())) {
            return { erro: '❌ Data/hora inválida!' };
        }

        const agora = new Date();
        if (data.getTime() <= agora.getTime()) {
            return { erro: '⏰ A data/hora precisa ser no futuro!' };
        }

        const novoLembrete = {
            id: Date.now() + Math.random() * 1000,
            texto: texto.trim(),
            dataHora: data.toISOString(),
            dataFormatada: formatarDataHora(data),
            criadoEm: new Date().toISOString(),
            concluido: false,
            notificado: false
        };

        lembretes.push(novoLembrete);
        salvarLembretes();

        // Tenta ativar notificações
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Retorna a mensagem de sucesso
        return {
            sucesso: true,
            mensagem: `✅ Lembrete criado!\n\n📌 ${texto}\n⏰ ${novoLembrete.dataFormatada}\n🆔 ID: ${String(novoLembrete.id).slice(-6)}\n\n🔔 Quando chegar a hora, você será notificado no chat!`
        };
    }

    function listarLembretes(apenasPendentes = true) {
        const lista = apenasPendentes 
            ? lembretes.filter(l => !l.concluido)
            : lembretes;

        if (lista.length === 0) {
            return apenasPendentes 
                ? '📋 Nenhum lembrete pendente! 🎉' 
                : '📋 Nenhum lembrete encontrado.';
        }

        let resultado = `📋 **${apenasPendentes ? 'LEMBRETES PENDENTES' : 'TODOS OS LEMBRETES'}**\n\n`;
        
        lista.forEach((l, i) => {
            const status = l.concluido ? '✅ CONCLUÍDO' : '⏳ PENDENTE';
            resultado += `${i+1}. ${l.texto}\n`;
            resultado += `   ⏰ ${l.dataFormatada}\n`;
            resultado += `   📊 ${status} (ID: ${String(l.id).slice(-6)})\n\n`;
        });

        return resultado;
    }

    function concluirLembrete(id) {
        const idStr = String(id);
        const lembrete = lembretes.find(l => 
            String(l.id) === idStr || 
            String(l.id).endsWith(idStr) ||
            String(l.id).includes(idStr)
        );

        if (!lembrete) {
            return { erro: '❌ Lembrete não encontrado! Use o ID que aparece na lista.' };
        }

        if (lembrete.concluido) {
            return { erro: '⚠️ Este lembrete já foi concluído!' };
        }

        lembrete.concluido = true;
        salvarLembretes();
        
        return {
            sucesso: true,
            mensagem: `✅ Lembrete concluído: "${lembrete.texto}"`
        };
    }

    function cancelarLembrete(id) {
        const idStr = String(id);
        const index = lembretes.findIndex(l => 
            String(l.id) === idStr || 
            String(l.id).endsWith(idStr) ||
            String(l.id).includes(idStr)
        );

        if (index === -1) {
            return { erro: '❌ Lembrete não encontrado!' };
        }

        const removido = lembretes[index];
        lembretes.splice(index, 1);
        salvarLembretes();
        
        return {
            sucesso: true,
            mensagem: `🗑️ Lembrete removido: "${removido.texto}"`
        };
    }

    // ============================================
    // FORMATAÇÃO
    // ============================================
    function formatarDataHora(data) {
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        const horas = String(data.getHours()).padStart(2, '0');
        const minutos = String(data.getMinutes()).padStart(2, '0');
        return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
    }

    // ============================================
    // VERIFICADOR DE LEMBRETES
    // ============================================
    function verificarLembretes() {
        const agora = new Date();
        let alarmeDisparado = false;

        lembretes.forEach(lembrete => {
            if (lembrete.concluido || lembrete.notificado) return;

            const dataLembrete = new Date(lembrete.dataHora);
            const diffMs = dataLembrete.getTime() - agora.getTime();
            const diffMin = diffMs / (1000 * 60);

            // Disparar quando faltar 1 minuto ou já tiver passado (até 5 minutos)
            if (diffMin <= 1 && diffMin > -5) {
                lembrete.notificado = true;
                salvarLembretes();
                dispararAlarme(lembrete);
                alarmeDisparado = true;
            }
        });

        return alarmeDisparado;
    }

    // ============================================
    // DISPARAR ALARME - FUNÇÃO PRINCIPAL
    // ============================================
    function dispararAlarme(lembrete) {
        const corpo = lembrete.texto;
        const hora = lembrete.dataFormatada;
        const id = String(lembrete.id).slice(-6);
        
        console.log('🔔🔔🔔 ALARME DISPARADO! 🔔🔔🔔');
        console.log('📌', corpo);
        console.log('⏰', hora);

        // ============================================
        // 1. MENSAGEM NO CHAT (MÉTODO SEGURO)
        // ============================================
        const mensagem = `🔔 **🔔🔔 LEMBRETE! 🔔🔔**\n\n` +
                         `📌 **${corpo}**\n` +
                         `⏰ ${hora}\n\n` +
                         `✅ Digite "concluir lembrete ${id}" para marcar como feito.\n` +
                         `🗑️ Digite "cancelar lembrete ${id}" para cancelar.`;

        // Tenta 3 vezes com intervalos
        let tentativas = 0;
        const tentarAdicionar = () => {
            tentativas++;
            console.log(`📝 Tentativa ${tentativas} de adicionar mensagem...`);
            
            if (adicionarMensagemNoChat(mensagem)) {
                console.log('✅ Mensagem adicionada com sucesso!');
                return true;
            }
            
            if (tentativas < 3) {
                console.log(`⏳ Tentando novamente em 1 segundo...`);
                setTimeout(tentarAdicionar, 1000);
                return false;
            }
            
            console.warn('❌ Falha ao adicionar mensagem após 3 tentativas!');
            // Último recurso: alert
            alert(`🔔 LEMBRETE!\n\n📌 ${corpo}\n⏰ ${hora}`);
            return false;
        };

        // Inicia as tentativas imediatamente
        tentarAdicionar();

        // ============================================
        // 2. SOM DE ALARME
        // ============================================
        tocarAlarme();

        // ============================================
        // 3. NOTIFICAÇÃO NATIVA
        // ============================================
        if (Notification.permission === 'granted') {
            try {
                const notificacao = new Notification('🔔 Lembrete!', {
                    body: `📌 ${corpo}\n⏰ ${hora}`,
                    icon: '🔔',
                    requireInteraction: true,
                    silent: true
                });

                notificacao.onclick = function() {
                    window.focus();
                    this.close();
                };

                setTimeout(() => {
                    notificacao.close();
                }, 30000);

            } catch (e) {
                console.log('Erro na notificação nativa:', e);
            }
        } else if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    // ============================================
    // SOM DE ALARME
    // ============================================
    function tocarAlarme() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioCtx();
            
            const notas = [880, 1100, 880, 1100, 880];
            notas.forEach((freq, i) => {
                setTimeout(() => {
                    try {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.type = 'square';
                        osc.frequency.value = freq;
                        gain.gain.value = 0.1;
                        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start();
                        osc.stop(ctx.currentTime + 0.15);
                    } catch(e) {}
                }, i * 200);
            });
        } catch (e) {
            console.log('🔇 Áudio não disponível.');
        }
    }

    // ============================================
    // DETECTAR COMANDOS
    // ============================================
    function detectarComandoLembrete(mensagem) {
        const lower = mensagem.toLowerCase();
        
        const palavrasChave = [
            'lembrar', 'lembre', 'lembra', 'alarme', 'alarm', 
            'me lembre', 'me lembra', 'me recorde', 'recordar',
            'notificar', 'avise', 'avisa', 'despertar'
        ];
        
        let temPalavraChave = false;
        for (const palavra of palavrasChave) {
            if (lower.includes(palavra)) {
                temPalavraChave = true;
                break;
            }
        }
        
        if (!temPalavraChave) {
            return null;
        }

        // ============================================
        // PADRÕES DE DATA/HORA
        // ============================================
        
        // "daqui a X minutos"
        let match = mensagem.match(/(?:lembrar|lembre|me\s+lembre|me\s+lembra|alarme|avise|avisa|notificar)\s+(?:de|para|sobre)?\s*(.+?)(?:\s+daqui\s+a\s+(\d+)\s+(minuto|minutos|segundo|segundos))/i);
        if (match) {
            const texto = match[1].trim();
            const numero = parseInt(match[2]);
            const unidade = match[3].toLowerCase();
            
            const data = new Date();
            if (unidade.startsWith('minuto')) {
                data.setMinutes(data.getMinutes() + numero);
            } else if (unidade.startsWith('segundo')) {
                data.setSeconds(data.getSeconds() + numero);
            }
            
            return adicionarLembrete(texto, data);
        }

        // "em X minutos"
        match = mensagem.match(/(?:lembrar|lembre|me\s+lembre|me\s+lembra|alarme|avise|avisa|notificar)\s+(?:de|para|sobre)?\s*(.+?)(?:\s+em\s+(\d+)\s+(minuto|minutos|segundo|segundos))/i);
        if (match) {
            const texto = match[1].trim();
            const numero = parseInt(match[2]);
            const unidade = match[3].toLowerCase();
            
            const data = new Date();
            if (unidade.startsWith('minuto')) {
                data.setMinutes(data.getMinutes() + numero);
            } else if (unidade.startsWith('segundo')) {
                data.setSeconds(data.getSeconds() + numero);
            }
            
            return adicionarLembrete(texto, data);
        }

        // "hoje às HH:MM"
        match = mensagem.match(/(?:lembrar|lembre|me\s+lembre|me\s+lembra|alarme|avise|avisa|notificar)\s+(?:de|para|sobre)?\s*(.+?)(?:\s+hoje\s+às?\s+(\d{2}):(\d{2}))/i);
        if (match) {
            const texto = match[1].trim();
            const horas = parseInt(match[2]);
            const minutos = parseInt(match[3]);
            
            const data = new Date();
            data.setHours(horas);
            data.setMinutes(minutos);
            data.setSeconds(0);
            
            return adicionarLembrete(texto, data);
        }

        // "amanhã às HH:MM"
        match = mensagem.match(/(?:lembrar|lembre|me\s+lembre|me\s+lembra|alarme|avise|avisa|notificar)\s+(?:de|para|sobre)?\s*(.+?)(?:\s+amanh[ãa]\s+às?\s+(\d{2}):(\d{2}))/i);
        if (match) {
            const texto = match[1].trim();
            const horas = parseInt(match[2]);
            const minutos = parseInt(match[3]);
            
            const data = new Date();
            data.setDate(data.getDate() + 1);
            data.setHours(horas);
            data.setMinutes(minutos);
            data.setSeconds(0);
            
            return adicionarLembrete(texto, data);
        }

        // "dd/mm/yyyy HH:MM"
        match = mensagem.match(/(?:lembrar|lembre|me\s+lembre|me\s+lembra|alarme|avise|avisa|notificar)\s+(?:de|para|sobre)?\s*(.+?)(?:\s+(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}))/i);
        if (match) {
            const texto = match[1].trim();
            const dia = parseInt(match[2]);
            const mes = parseInt(match[3]) - 1;
            const ano = parseInt(match[4]);
            const horas = parseInt(match[5]);
            const minutos = parseInt(match[6]);
            
            const data = new Date(ano, mes, dia, horas, minutos);
            return adicionarLembrete(texto, data);
        }

        // ============================================
        // FALTOU DATA/HORA - DAR EXEMPLOS
        // ============================================
        const temTexto = mensagem.match(/(?:lembrar|lembre|me\s+lembre|me\s+lembra|alarme|avise|avisa|notificar)\s+(?:de|para|sobre)?\s*(.+?)$/i);
        if (temTexto && temTexto[1] && temTexto[1].trim().length > 0) {
            const textoDetectado = temTexto[1].trim();
            if (!textoDetectado.match(/\d{1,2}\/\d{1,2}|\d{2}:\d{2}|hoje|amanhã|amanha|daqui|em\s+\d+/i)) {
                return {
                    erro: `📝 **Faltou a data/hora!**\n\n` +
                          `Você quer ser lembrado sobre: **"${textoDetectado}"**\n\n` +
                          `📌 **Exemplos:**\n` +
                          `• "lembrar de ${textoDetectado} daqui a 5 minutos"\n` +
                          `• "lembrar de ${textoDetectado} hoje às 14:30"\n` +
                          `• "lembrar de ${textoDetectado} amanhã às 09:00"`
                };
            }
        }

        // ============================================
        // SÓ "LEMBRAR" SEM TEXTO
        // ============================================
        if (mensagem.match(/^(lembrar|lembre|me\s+lembre|me\s+lembra|alarme|avise|avisa|notificar)$/i)) {
            return {
                erro: `📝 **O que você quer lembrar?**\n\n` +
                      `📌 **Exemplos:**\n` +
                      `• "lembrar de tomar água daqui a 30 minutos"\n` +
                      `• "lembrar de reunir hoje às 14:00"\n` +
                      `• "lembrar de pagar conta amanhã às 10:00"`
            };
        }

        return null;
    }

    // ============================================
    // PROCESSAR COMANDO
    // ============================================
    function processarComandoLembrete(mensagem) {
        const resultado = detectarComandoLembrete(mensagem);
        
        if (resultado) {
            if (resultado.erro) return resultado.erro;
            if (resultado.mensagem) return resultado.mensagem;
            if (resultado.sucesso) return resultado.mensagem;
            return null;
        }

        // Comandos secundários
        const lower = mensagem.toLowerCase();
        
        if (lower.includes('listar') || lower.includes('meus lembretes') || lower.includes('lembretes pendentes')) {
            const apenasPendentes = !lower.includes('todos');
            return listarLembretes(apenasPendentes);
        }

        const concluirMatch = mensagem.match(/concluir\s+lembrete\s+([a-zA-Z0-9]+)/i);
        if (concluirMatch) {
            const resultado = concluirLembrete(concluirMatch[1]);
            if (resultado.erro) return resultado.erro;
            return resultado.mensagem;
        }

        const cancelarMatch = mensagem.match(/cancelar\s+lembrete\s+([a-zA-Z0-9]+)/i);
        if (cancelarMatch) {
            const resultado = cancelarLembrete(cancelarMatch[1]);
            if (resultado.erro) return resultado.erro;
            return resultado.mensagem;
        }

        if (lower.includes('como usar lembrete') || lower.includes('ajuda lembrete')) {
            return `📚 **COMO USAR LEMBRETES**\n\n` +
                   `📌 **Daqui a X minutos:**\n` +
                   `   "lembrar de testar daqui a 5 minutos"\n` +
                   `   "me lembre de testar daqui a 5 minutos"\n\n` +
                   `📌 **Hoje às HH:MM:**\n` +
                   `   "lembrar de reunir hoje às 14:00"\n` +
                   `   "alarme para reunir hoje às 14:00"\n\n` +
                   `📌 **Amanhã às HH:MM:**\n` +
                   `   "lembrar de pagar conta amanhã às 10:00"\n\n` +
                   `📋 **Listar:** "meus lembretes"\n` +
                   `✅ **Concluir:** "concluir lembrete [ID]"\n` +
                   `🗑️ **Cancelar:** "cancelar lembrete [ID]"`;
        }

        return null;
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    function iniciar() {
        carregarLembretes();
        
        // Verifica lembretes imediatamente
        verificarLembretes();
        
        // Inicia o verificador periódico
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(verificarLembretes, CHECK_INTERVAL);
        
        console.log(`🔔 Verificador de lembretes iniciado! (a cada ${CHECK_INTERVAL/1000} segundos)`);
        console.log(`🔔 ${lembretes.filter(l => !l.concluido).length} lembretes ativos.`);
        
        // Tenta ativar notificações
        if (Notification.permission === 'default') {
            setTimeout(() => {
                Notification.requestPermission();
            }, 2000);
        }

        // ============================================
        // INTEGRAÇÃO COM PRIORIDADE
        // ============================================
        const originalProcessar = window.processarComandoNatural;

        window.processarComandoNatural = function(mensagem) {
            const resultadoLembrete = processarComandoLembrete(mensagem);
            
            if (resultadoLembrete) {
                return resultadoLembrete;
            }

            if (typeof originalProcessar === 'function') {
                return originalProcessar(mensagem);
            }

            return null;
        };

        console.log('✅ Lembretes integrados com sucesso!');
    }

    // ============================================
    // EXPORTAR
    // ============================================
    window.lembretes = {
        adicionar: adicionarLembrete,
        listar: listarLembretes,
        concluir: concluirLembrete,
        cancelar: cancelarLembrete,
        verificar: verificarLembretes,
        todos: () => lembretes
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }

})();