    // ============================================
    // ============================================
    // ===== SISTEMA DE LEMBRETES =====
    // ============================================
    // ============================================

    // Configurações dos lembretes
    const CONFIG_LEMBRETES = {
        STORAGE_KEY: 'verdechat_lembretes',
        CHECK_INTERVAL: 15000 // 15 segundos
    };

    // Carregar lembretes salvos
    let lembretes = [];
    let verificadorInterval = null;

    function carregarLembretes() {
        try {
            const dados = localStorage.getItem(CONFIG_LEMBRETES.STORAGE_KEY);
            if (dados) {
                lembretes = JSON.parse(dados);
                // Limpar lembretes antigos (mais de 7 dias)
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
            localStorage.setItem(CONFIG_LEMBRETES.STORAGE_KEY, JSON.stringify(lembretes));
        } catch (e) {}
    }

    function formatarDataHora(data) {
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        const horas = String(data.getHours()).padStart(2, '0');
        const minutos = String(data.getMinutes()).padStart(2, '0');
        return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
    }

    function parsearDataHora(texto) {
        const lower = texto.toLowerCase().trim();
        
        // PADRÃO 1: "hoje às 14:30" ou "hoje 14:30"
        const hojeMatch = texto.match(/hoje\s+às?\s*(\d{1,2}):(\d{2})/i);
        if (hojeMatch) {
            const data = new Date();
            data.setHours(parseInt(hojeMatch[1]));
            data.setMinutes(parseInt(hojeMatch[2]));
            data.setSeconds(0);
            return data;
        }

        // PADRÃO 2: "amanhã às 14:30" ou "amanhã 14:30"
        const amanhaMatch = texto.match(/amanh[ãa]\s+às?\s*(\d{1,2}):(\d{2})/i);
        if (amanhaMatch) {
            const data = new Date();
            data.setDate(data.getDate() + 1);
            data.setHours(parseInt(amanhaMatch[1]));
            data.setMinutes(parseInt(amanhaMatch[2]));
            data.setSeconds(0);
            return data;
        }

        // PADRÃO 3: "em X hora(s)" ou "em X minuto(s)"
        const emMatch = texto.match(/em\s+(\d+)\s+(hora|horas|minuto|minutos|segundo|segundos)/i);
        if (emMatch) {
            const numero = parseInt(emMatch[1]);
            const unidade = emMatch[2].toLowerCase();
            const data = new Date();
            
            if (unidade.startsWith('hora')) {
                data.setHours(data.getHours() + numero);
            } else if (unidade.startsWith('minuto')) {
                data.setMinutes(data.getMinutes() + numero);
            } else if (unidade.startsWith('segundo')) {
                data.setSeconds(data.getSeconds() + numero);
            }
            return data;
        }

        // PADRÃO 4: "daqui a X hora(s)" ou "daqui a X minuto(s)"
        const daquiMatch = texto.match(/daqui\s+a\s+(\d+)\s+(hora|horas|minuto|minutos|segundo|segundos)/i);
        if (daquiMatch) {
            const numero = parseInt(daquiMatch[1]);
            const unidade = daquiMatch[2].toLowerCase();
            const data = new Date();
            
            if (unidade.startsWith('hora')) {
                data.setHours(data.getHours() + numero);
            } else if (unidade.startsWith('minuto')) {
                data.setMinutes(data.getMinutes() + numero);
            } else if (unidade.startsWith('segundo')) {
                data.setSeconds(data.getSeconds() + numero);
            }
            return data;
        }

        // PADRÃO 5: "daqui X minutos" (sem a palavra "a")
        const daqui2Match = texto.match(/daqui\s+(\d+)\s+(hora|horas|minuto|minutos|segundo|segundos)/i);
        if (daqui2Match) {
            const numero = parseInt(daqui2Match[1]);
            const unidade = daqui2Match[2].toLowerCase();
            const data = new Date();
            
            if (unidade.startsWith('hora')) {
                data.setHours(data.getHours() + numero);
            } else if (unidade.startsWith('minuto')) {
                data.setMinutes(data.getMinutes() + numero);
            } else if (unidade.startsWith('segundo')) {
                data.setSeconds(data.getSeconds() + numero);
            }
            return data;
        }

        // PADRÃO 6: "HH:MM" (horário exato - hoje ou amanhã)
        const horaExataMatch = texto.match(/(\d{1,2}):(\d{2})/);
        if (horaExataMatch) {
            const horas = parseInt(horaExataMatch[1]);
            const minutos = parseInt(horaExataMatch[2]);
            
            const data = new Date();
            data.setHours(horas);
            data.setMinutes(minutos);
            data.setSeconds(0);
            
            // Se já passou, é amanhã
            if (data.getTime() <= Date.now()) {
                data.setDate(data.getDate() + 1);
            }
            return data;
        }

        // PADRÃO 7: "dd/mm/yyyy HH:MM"
        const dataCompletaMatch = texto.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
        if (dataCompletaMatch) {
            const dia = parseInt(dataCompletaMatch[1]);
            const mes = parseInt(dataCompletaMatch[2]) - 1;
            const ano = parseInt(dataCompletaMatch[3]);
            const horas = parseInt(dataCompletaMatch[4]);
            const minutos = parseInt(dataCompletaMatch[5]);
            
            return new Date(ano, mes, dia, horas, minutos);
        }

        return null;
    }

    function adicionarLembrete(texto, dataHora) {
        if (!texto || !dataHora) {
            return '❌ Preciso do texto e da data/hora!';
        }

        let data;
        if (typeof dataHora === 'string') {
            data = new Date(dataHora);
        } else if (dataHora instanceof Date) {
            data = dataHora;
        } else {
            return '❌ Data/hora inválida!';
        }

        if (isNaN(data.getTime())) {
            return '❌ Data/hora inválida!';
        }

        const agora = new Date();
        if (data.getTime() <= agora.getTime()) {
            return '⏰ A data/hora precisa ser no futuro!';
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

        // Pedir permissão de notificação
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return `✅ Lembrete criado!\n\n📌 ${texto}\n⏰ ${novoLembrete.dataFormatada}\n🆔 ID: ${String(novoLembrete.id).slice(-6)}`;
    }

    function listarLembretes() {
        const pendentes = lembretes.filter(l => !l.concluido);
        if (pendentes.length === 0) {
            return '📋 Nenhum lembrete pendente! 🎉';
        }

        let resultado = '📋 **LEMBRETES PENDENTES**\n\n';
        pendentes.forEach((l, i) => {
            resultado += `${i+1}. ${l.texto}\n`;
            resultado += `   ⏰ ${l.dataFormatada}\n`;
            resultado += `   ID: ${String(l.id).slice(-6)}\n\n`;
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
            return '❌ Lembrete não encontrado! Use o ID que aparece na lista.';
        }

        if (lembrete.concluido) {
            return '⚠️ Este lembrete já foi concluído!';
        }

        lembrete.concluido = true;
        salvarLembretes();
        
        return `✅ Lembrete concluído: "${lembrete.texto}"`;
    }

    function cancelarLembrete(id) {
        const idStr = String(id);
        const index = lembretes.findIndex(l => 
            String(l.id) === idStr || 
            String(l.id).endsWith(idStr) ||
            String(l.id).includes(idStr)
        );

        if (index === -1) {
            return '❌ Lembrete não encontrado!';
        }

        const removido = lembretes[index];
        lembretes.splice(index, 1);
        salvarLembretes();
        
        return `🗑️ Lembrete removido: "${removido.texto}"`;
    }

    function verificarLembretes() {
        const agora = new Date();

        lembretes.forEach(lembrete => {
            if (lembrete.concluido || lembrete.notificado) return;

            const dataLembrete = new Date(lembrete.dataHora);
            const diffMs = dataLembrete.getTime() - agora.getTime();
            const diffMin = diffMs / (1000 * 60);

            if (diffMin <= 1 && diffMin > -5) {
                lembrete.notificado = true;
                salvarLembretes();
                dispararAlarme(lembrete);
            }
        });
    }

    function dispararAlarme(lembrete) {
        const corpo = lembrete.texto;
        const hora = lembrete.dataFormatada;
        
        console.log('🔔 ALARME!', lembrete.texto);

        // Mensagem no chat (sempre)
        const mensagem = `🔔 **LEMBRETE!**\n\n📌 ${corpo}\n⏰ ${hora}\n\n✅ Digite "concluir lembrete ${String(lembrete.id).slice(-6)}" para marcar como feito.`;
        
        // Adicionar no chat
        if (typeof window.addMessageDirect === 'function') {
            window.addMessageDirect('bot', mensagem, false);
        } else {
            // Fallback: alert
            alert(`🔔 LEMBRETE!\n\n📌 ${corpo}\n⏰ ${hora}`);
        }

        // Notificação nativa
        if (Notification.permission === 'granted') {
            try {
                const notificacao = new Notification('🔔 Lembrete!', {
                    body: `📌 ${corpo}`,
                    icon: '🔔',
                    requireInteraction: true,
                    silent: false
                });

                notificacao.onclick = function() {
                    window.focus();
                    this.close();
                };

                setTimeout(() => {
                    notificacao.close();
                }, 30000);
            } catch (e) {}
        }

        // Som de alarme
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
        } catch (e) {}
    }

    // Função para processar comandos de lembrete
    function processarComandoLembrete(mensagem) {
        const lower = mensagem.toLowerCase();
        
        // ============================================
        // PALAVRAS-CHAVE
        // ============================================
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
        // LISTAR LEMBRETES
        // ============================================
        if (lower.includes('listar') || lower.includes('meus lembretes') || lower.includes('lembretes pendentes')) {
            return listarLembretes();
        }

        // ============================================
        // CONCLUIR LEMBRETE
        // ============================================
        const concluirMatch = mensagem.match(/concluir\s+lembrete\s+([a-zA-Z0-9]+)/i);
        if (concluirMatch) {
            return concluirLembrete(concluirMatch[1]);
        }

        // ============================================
        // CANCELAR LEMBRETE
        // ============================================
        const cancelarMatch = mensagem.match(/cancelar\s+lembrete\s+([a-zA-Z0-9]+)/i);
        if (cancelarMatch) {
            return cancelarLembrete(cancelarMatch[1]);
        }

        // ============================================
        // AJUDA
        // ============================================
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
                   `📌 **Em X horas:**\n` +
                   `   "lembrar de algo em 1 hora"\n\n` +
                   `📋 **Listar:** "meus lembretes"\n` +
                   `✅ **Concluir:** "concluir lembrete [ID]"\n` +
                   `🗑️ **Cancelar:** "cancelar lembrete [ID]"`;
        }

        // ============================================
        // EXTRAIR TEXTO E DATA
        // ============================================
        
        // Tentar extrair o texto e a data
        let textoLembrete = '';
        let dataDetectada = null;

        // Padrão: "lembrar de X [data]"
        const padraoCompleto = mensagem.match(/(?:lembrar|lembre|me\s+lembre|me\s+lembra|alarme|avise|avisa|notificar)\s+(?:de|para|sobre)?\s*(.+?)(?:\s+(hoje|amanh[ãa]|em\s+\d+\s+\w+|daqui\s+a\s+\d+\s+\w+|\d{1,2}:\d{2}|\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}))$/i);
        
        if (padraoCompleto) {
            textoLembrete = padraoCompleto[1].trim();
            const parteData = padraoCompleto[2].trim();
            dataDetectada = parsearDataHora(parteData);
        } else {
            // Tentar detectar apenas o texto
            const apenasTexto = mensagem.match(/(?:lembrar|lembre|me\s+lembre|me\s+lembra|alarme|avise|avisa|notificar)\s+(?:de|para|sobre)?\s*(.+?)$/i);
            if (apenasTexto && apenasTexto[1]) {
                textoLembrete = apenasTexto[1].trim();
                // Tentar detectar data no texto todo
                dataDetectada = parsearDataHora(mensagem);
            }
        }

        // Se não tem texto, pede
        if (!textoLembrete || textoLembrete.length === 0) {
            return `📝 **O que você quer lembrar?**\n\n📌 Exemplos:\n• "lembrar de tomar água daqui a 30 minutos"\n• "lembrar de reunir hoje às 14:00"\n• "lembrar de pagar conta amanhã às 10:00"`;
        }

        // Se não tem data, pede
        if (!dataDetectada) {
            return `📝 **Faltou a data/hora!**\n\nVocê quer ser lembrado sobre: **"${textoLembrete}"**\n\n📌 Exemplos:\n• "lembrar de ${textoLembrete} daqui a 5 minutos"\n• "lembrar de ${textoLembrete} hoje às 14:30"\n• "lembrar de ${textoLembrete} amanhã às 09:00"`;
        }

        // Criar o lembrete
        return adicionarLembrete(textoLembrete, dataDetectada);
    }

    // ============================================
    // INICIAR VERIFICADOR
    // ============================================
    function iniciarVerificadorLembretes() {
        if (verificadorInterval) {
            clearInterval(verificadorInterval);
        }
        
        carregarLembretes();
        verificarLembretes();
        
        verificadorInterval = setInterval(verificarLembretes, CONFIG_LEMBRETES.CHECK_INTERVAL);
        console.log('🔔 Verificador de lembretes iniciado!');
    }

    // ============================================
    // INTEGRAR COM O PROCESSADOR PRINCIPAL
    // ============================================
    // Salvar a função original
    const processarOriginal = window.processarComandoNatural;

    // Substituir com prioridade para lembretes
    window.processarComandoNatural = function(mensagem) {
        // PRIMEIRO: Tentar processar como lembrete
        const resultadoLembrete = processarComandoLembrete(mensagem);
        if (resultadoLembrete) {
            return resultadoLembrete;
        }

        // SEGUNDO: Usar o processador original
        if (typeof processarOriginal === 'function') {
            return processarOriginal(mensagem);
        }

        return null;
    };

    // Iniciar verificador
    iniciarVerificadorLembretes();

    console.log('✅ Sistema de lembretes integrado no conhecimento.js!');
    console.log('📌 Exemplos: "lembrar de testar daqui a 5 minutos"');
    console.log('📌 Exemplos: "lembrar de reunir hoje às 14:30"');