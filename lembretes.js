// ============================================
// SISTEMA DE LEMBRETES - CORRIGIDO
// Apenas este arquivo! NÃO mexe no conhecimento.js
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

    // ============================================
    // CARREGAR E SALVAR
    // ============================================
    function carregarLembretes() {
        try {
            const dados = localStorage.getItem(STORAGE_KEY);
            if (dados) {
                lembretes = JSON.parse(dados);
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
    // PARSEAR DATA/HORA - CORRIGIDO!
    // ============================================
    function parsearDataHora(texto) {
        const lower = texto.toLowerCase().trim();
        
        console.log('🔍 Parseando:', texto);

        // ============================================
        // "daqui a X segundos"
        // ============================================
        let match = texto.match(/daqui\s+a\s+(\d+)\s+segundo(s)?/i);
        if (match) {
            const data = new Date();
            data.setSeconds(data.getSeconds() + parseInt(match[1]));
            console.log('✅ Parseado: daqui a', match[1], 'segundos');
            return data;
        }

        // ============================================
        // "em X segundos"
        // ============================================
        match = texto.match(/em\s+(\d+)\s+segundo(s)?/i);
        if (match) {
            const data = new Date();
            data.setSeconds(data.getSeconds() + parseInt(match[1]));
            console.log('✅ Parseado: em', match[1], 'segundos');
            return data;
        }

        // ============================================
        // "daqui a X minutos"
        // ============================================
        match = texto.match(/daqui\s+a\s+(\d+)\s+minuto(s)?/i);
        if (match) {
            const data = new Date();
            data.setMinutes(data.getMinutes() + parseInt(match[1]));
            console.log('✅ Parseado: daqui a', match[1], 'minutos');
            return data;
        }

        // ============================================
        // "em X minutos"
        // ============================================
        match = texto.match(/em\s+(\d+)\s+minuto(s)?/i);
        if (match) {
            const data = new Date();
            data.setMinutes(data.getMinutes() + parseInt(match[1]));
            console.log('✅ Parseado: em', match[1], 'minutos');
            return data;
        }

        // ============================================
        // "daqui a X horas"
        // ============================================
        match = texto.match(/daqui\s+a\s+(\d+)\s+hora(s)?/i);
        if (match) {
            const data = new Date();
            data.setHours(data.getHours() + parseInt(match[1]));
            console.log('✅ Parseado: daqui a', match[1], 'horas');
            return data;
        }

        // ============================================
        // "em X horas"
        // ============================================
        match = texto.match(/em\s+(\d+)\s+hora(s)?/i);
        if (match) {
            const data = new Date();
            data.setHours(data.getHours() + parseInt(match[1]));
            console.log('✅ Parseado: em', match[1], 'horas');
            return data;
        }

        // ============================================
        // "hoje às 14:30"
        // ============================================
        match = texto.match(/hoje\s+às?\s*(\d{1,2}):(\d{2})/i);
        if (match) {
            const data = new Date();
            data.setHours(parseInt(match[1]));
            data.setMinutes(parseInt(match[2]));
            data.setSeconds(0);
            console.log('✅ Parseado: hoje às', match[1], ':', match[2]);
            return data;
        }

        // ============================================
        // "amanhã às 14:30"
        // ============================================
        match = texto.match(/amanh[ãa]\s+às?\s*(\d{1,2}):(\d{2})/i);
        if (match) {
            const data = new Date();
            data.setDate(data.getDate() + 1);
            data.setHours(parseInt(match[1]));
            data.setMinutes(parseInt(match[2]));
            data.setSeconds(0);
            console.log('✅ Parseado: amanhã às', match[1], ':', match[2]);
            return data;
        }

        // ============================================
        // "14:30" (sozinho)
        // ============================================
        match = texto.match(/(\d{1,2}):(\d{2})/);
        if (match) {
            const data = new Date();
            data.setHours(parseInt(match[1]));
            data.setMinutes(parseInt(match[2]));
            data.setSeconds(0);
            if (data.getTime() <= Date.now()) {
                data.setDate(data.getDate() + 1);
            }
            console.log('✅ Parseado:', match[1], ':', match[2]);
            return data;
        }

        // ============================================
        // "dd/mm/yyyy HH:MM"
        // ============================================
        match = texto.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
        if (match) {
            const data = new Date(
                parseInt(match[3]),
                parseInt(match[2]) - 1,
                parseInt(match[1]),
                parseInt(match[4]),
                parseInt(match[5])
            );
            console.log('✅ Parseado: data completa');
            return data;
        }

        console.log('❌ Nenhum padrão reconhecido para:', texto);
        return null;
    }

    // ============================================
    // FUNÇÕES PRINCIPAIS
    // ============================================

    function adicionarLembrete(texto, dataHora) {
        if (!texto || !dataHora) {
            return { erro: '❌ Preciso do texto e da data/hora!' };
        }

        let data = dataHora instanceof Date ? dataHora : new Date(dataHora);
        if (isNaN(data.getTime())) {
            return { erro: '❌ Data/hora inválida!' };
        }

        if (data.getTime() <= Date.now()) {
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

        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return {
            sucesso: true,
            mensagem: `✅ Lembrete criado!\n\n📌 ${texto}\n⏰ ${novoLembrete.dataFormatada}\n🆔 ID: ${String(novoLembrete.id).slice(-6)}`
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
            return { erro: '❌ Lembrete não encontrado!' };
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
    // VERIFICADOR - CORRIGIDO!
    // ============================================
    function verificarLembretes() {
        const agora = new Date();

        lembretes.forEach(lembrete => {
            if (lembrete.concluido || lembrete.notificado) return;

            const dataLembrete = new Date(lembrete.dataHora);
            const diffMs = dataLembrete.getTime() - agora.getTime();
            const diffSegundos = diffMs / 1000;

            console.log(`⏰ "${lembrete.texto}" - falta ${Math.round(diffSegundos)}s`);

            // Só dispara quando faltar MENOS de 5 segundos
            if (diffSegundos <= 5 && diffSegundos > -10) {
                lembrete.notificado = true;
                salvarLembretes();
                dispararAlarme(lembrete);
                console.log('🔔 ALARME DISPARADO!');
            }
        });
    }

    // ============================================
    // DISPARAR ALARME
    // ============================================
    function dispararAlarme(lembrete) {
        const corpo = lembrete.texto;
        const hora = lembrete.dataFormatada;
        
        const mensagem = `🔔 **LEMBRETE!**\n\n📌 ${corpo}\n⏰ ${hora}\n\n✅ Digite "concluir lembrete ${String(lembrete.id).slice(-6)}" para marcar como feito.`;
        
        if (typeof window.addMessageDirect === 'function') {
            window.addMessageDirect('bot', mensagem, false);
        } else {
            alert(`🔔 LEMBRETE!\n\n📌 ${corpo}\n⏰ ${hora}`);
        }

        if (Notification.permission === 'granted') {
            try {
                new Notification('🔔 Lembrete!', {
                    body: `📌 ${corpo}`,
                    icon: '🔔',
                    requireInteraction: true
                });
            } catch (e) {}
        }

        // Som
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioCtx();
            [880, 1100, 880, 1100].forEach((freq, i) => {
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

    // ============================================
    // PROCESSAR COMANDO
    // ============================================
    function processarComandoLembrete(mensagem) {
        const lower = mensagem.toLowerCase();
        
        const palavrasChave = ['lembrar', 'lembre', 'lembra', 'alarme', 'me lembre', 'me lembra', 'avise', 'avisa', 'notificar'];
        if (!palavrasChave.some(p => lower.includes(p))) return null;

        // Listar
        if (lower.includes('listar') || lower.includes('meus lembretes')) {
            return listarLembretes();
        }

        // Concluir
        const concluirMatch = mensagem.match(/concluir\s+lembrete\s+([a-zA-Z0-9]+)/i);
        if (concluirMatch) {
            const r = concluirLembrete(concluirMatch[1]);
            return r.erro || r.mensagem;
        }

        // Cancelar
        const cancelarMatch = mensagem.match(/cancelar\s+lembrete\s+([a-zA-Z0-9]+)/i);
        if (cancelarMatch) {
            const r = cancelarLembrete(cancelarMatch[1]);
            return r.erro || r.mensagem;
        }

        // Ajuda
        if (lower.includes('como usar lembrete') || lower.includes('ajuda lembrete')) {
            return `📚 **COMO USAR LEMBRETES**\n\n` +
                   `📌 "lembrar de testar daqui a 5 minutos"\n` +
                   `📌 "lembrar de reunir hoje às 14:00"\n` +
                   `📌 "lembrar de pagar amanhã às 10:00"\n` +
                   `📌 "lembrar de algo em 1 hora"\n\n` +
                   `📋 "meus lembretes"\n` +
                   `✅ "concluir lembrete [ID]"\n` +
                   `🗑️ "cancelar lembrete [ID]"`;
        }

        // ============================================
        // EXTRAIR TEXTO E DATA
        // ============================================
        let textoLembrete = '';
        let dataDetectada = null;

        // Padrão: "lembrar de X [data]"
        const padraoCompleto = mensagem.match(/(?:lembrar|lembre|me\s+lembre|me\s+lembra|alarme|avise|avisa|notificar)\s+(?:de|para|sobre)?\s*(.+?)(?:\s+(daqui\s+a\s+\d+\s+\w+|em\s+\d+\s+\w+|hoje\s+às?\s*\d{1,2}:\d{2}|amanh[ãa]\s+às?\s*\d{1,2}:\d{2}|\d{1,2}:\d{2}|\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}))$/i);
        
        if (padraoCompleto) {
            textoLembrete = padraoCompleto[1].trim();
            dataDetectada = parsearDataHora(padraoCompleto[2].trim());
        } else {
            const apenasTexto = mensagem.match(/(?:lembrar|lembre|me\s+lembre|me\s+lembra|alarme|avise|avisa|notificar)\s+(?:de|para|sobre)?\s*(.+?)$/i);
            if (apenasTexto && apenasTexto[1]) {
                textoLembrete = apenasTexto[1].trim();
                dataDetectada = parsearDataHora(mensagem);
            }
        }

        if (!textoLembrete) {
            return `📝 **O que você quer lembrar?**\n\n📌 Exemplos:\n• "lembrar de tomar água daqui a 5 minutos"\n• "lembrar de reunir hoje às 14:00"`;
        }

        if (!dataDetectada) {
            return `📝 **Faltou a data/hora!**\n\nSobre: "${textoLembrete}"\n\n📌 Exemplos:\n• "lembrar de ${textoLembrete} daqui a 5 minutos"\n• "lembrar de ${textoLembrete} hoje às 14:30"`;
        }

        const r = adicionarLembrete(textoLembrete, dataDetectada);
        return r.erro || r.mensagem;
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    function iniciar() {
        carregarLembretes();
        verificarLembretes();
        
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(verificarLembretes, CHECK_INTERVAL);
        
        console.log(`🔔 Verificador de lembretes iniciado! (a cada ${CHECK_INTERVAL/1000}s)`);
        console.log(`🔔 ${lembretes.filter(l => !l.concluido).length} lembretes ativos.`);

        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Integrar com o processador do chat
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

        console.log('✅ Lembretes integrados!');
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
        todos: () => lembretes,
        parsear: parsearDataHora
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }

})();