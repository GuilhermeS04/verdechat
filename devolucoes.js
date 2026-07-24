// ============================================
// SISTEMA DE DEVOLUÇÕES - DEVOLUCOES.JS
// ============================================

(function() {
    'use strict';

    console.log('📦 Sistema de Devoluções carregado!');

    const STORAGE_KEY = 'verdechat_devolucoes';
    const MODO_KEY = 'verdechat_modo_devolucoes';
    
    let modoAtivo = false;
    let devolucoes = [];
    let devolucoesArquivadas = [];

    const ETAPAS_DISPONIVEIS = [
        { nome: "Retirada do Palet", desc: "Retirada do Palet - NF foi trazida para a sala", emoji: "📥" },
        { nome: "OR Cadastrada", desc: "OR Cadastrada - OR cadastrada no sistema", emoji: "📝" },
        { nome: "Esboço SAP Criado", desc: "Esboço SAP Criado - Esboço criado no SAP", emoji: "📤" },
        { nome: "Esboço Vinculado", desc: "Esboço Vinculado - Esboço vinculado na OR", emoji: "🔗" },
        { nome: "Contagem Concluída", desc: "Contagem Concluída - Produtos contados e classificados", emoji: "📋" },
        { nome: "Mapas Impressos", desc: "Mapas Impressos - Mapas de alocação impressos", emoji: "🖨️" },
        { nome: "Aguardando SAP", desc: "Aguardando SAP - Esperando retorno do SAP", emoji: "⏳" },
        { nome: "Chamado Aberto", desc: "Chamado Aberto - Chamado aberto no SAC", emoji: "📞" },
        { nome: "Concluída", desc: "Concluída - Processo finalizado", emoji: "✅" }
    ];
    
    const ETAPAS = ETAPAS_DISPONIVEIS.map(e => e.nome);

    function carregarDados() {
        try {
            const dados = localStorage.getItem(STORAGE_KEY);
            if (dados) {
                devolucoes = JSON.parse(dados);
            } else {
                devolucoes = [];
                salvarDados();
            }

            const arqDados = localStorage.getItem('verdechat_devolucoes_arquivadas');
            if (arqDados) {
                devolucoesArquivadas = JSON.parse(arqDados);
            } else {
                devolucoesArquivadas = [];
            }
            
            // Migração de registros legados
            let migrou = false;
            devolucoes.forEach(d => {
                if (!d.dataAdicao) {
                    d.dataAdicao = d.data || new Date().toISOString();
                    migrou = true;
                }
                if (!d.etapa) {
                    d.etapa = d.status === 'concluida' ? 'Concluída' : 'Retirada do Palet';
                    migrou = true;
                }
                if (!d.dataAlteracaoEtapa) {
                    d.dataAlteracaoEtapa = d.data || new Date().toISOString();
                    migrou = true;
                }
                if (!d.historicoEtapas) {
                    d.historicoEtapas = [
                        { etapa: d.etapa, data: d.dataAlteracaoEtapa }
                    ];
                    migrou = true;
                }
            });
            if (migrou) salvarDados();
            
        } catch (e) {
            devolucoes = [];
            devolucoesArquivadas = [];
        }
        
        // Garante que o modo inicia desativado na inicialização da página
        modoAtivo = false;
        salvarModo();
    }

    function salvarDados() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(devolucoes));
        } catch (e) {}
    }

    function salvarArquivadas() {
        try {
            localStorage.setItem('verdechat_devolucoes_arquivadas', JSON.stringify(devolucoesArquivadas));
        } catch (e) {}
    }

    function salvarModo() {
        try {
            localStorage.setItem(MODO_KEY, String(modoAtivo));
        } catch (e) {}
    }

    function gerarId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }

    function formatarData(data) {
        const d = new Date(data);
        return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    // Converte **negrito** para <strong>negrito</strong>
    function formatarTexto(texto) {
        if (!texto) return '';
        return texto.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

    // ============================================
    // ENVIAR MENSAGEM (SEMPRE DIRETA, SEM STREAMING)
    // ============================================
    function enviarMensagem(conteudo) {
        if (typeof window.addMessageDirect === 'function') {
            window.addMessageDirect('bot', conteudo, false);
            return;
        }
        
        // Fallback manual
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const div = document.createElement('div');
        div.classList.add('message', 'bot');
        
        const avatar = document.createElement('div');
        avatar.classList.add('avatar');
        avatar.innerHTML = '<i class="fas fa-robot"></i>';
        
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        bubble.style.whiteSpace = 'pre-wrap';
        bubble.style.wordBreak = 'break-word';
        bubble.textContent = conteudo;
        
        div.appendChild(avatar);
        div.appendChild(bubble);
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // ============================================
    // EFEITO DE CARREGAMENTO RÁPIDO PARA TABELAS
    // ============================================
    function mostrarTabelaComEfeito(conteudoGeraFunc) {
        const loaderId = 'loader-' + Date.now();
        if (typeof window.addMessageDirect === 'function') {
            window.addMessageDirect('bot', `<div id="${loaderId}">🔄 Gerando tabela...</div>`, false);
        }
        
        setTimeout(() => {
            const loaderEl = document.getElementById(loaderId);
            if (loaderEl) {
                const bubble = loaderEl.closest('.bubble');
                if (bubble) {
                    const conteudoFinal = conteudoGeraFunc();
                    bubble.innerHTML = formatarTexto(conteudoFinal);
                }
            }
        }, 1000);
    }

    // ============================================
    // FORMULÁRIO INTERATIVO (MÉTODOS GLOBAIS)
    // ============================================
    window.setFormVal = function(formId, field, val) {
        const tipoInput = document.getElementById(formId + '-tipo');
        const statusInput = document.getElementById(formId + '-status');
        const transInput = document.getElementById(formId + '-trans');
        
        if (field === 'tipo' && tipoInput) {
            tipoInput.value = val;
            const btnTotal = document.getElementById(formId + '-tipo-total');
            const btnParcial = document.getElementById(formId + '-tipo-parcial');
            
            if (btnTotal && btnParcial) {
                if (val === 'TOTAL') {
                    btnTotal.style.background = 'var(--accent)';
                    btnTotal.style.color = 'white';
                    btnTotal.style.borderColor = 'var(--accent)';
                    btnParcial.style.background = 'var(--input-bg)';
                    btnParcial.style.color = 'var(--text-primary)';
                    btnParcial.style.borderColor = 'var(--border-color)';
                } else {
                    btnParcial.style.background = 'var(--accent)';
                    btnParcial.style.color = 'white';
                    btnParcial.style.borderColor = 'var(--accent)';
                    btnTotal.style.background = 'var(--input-bg)';
                    btnTotal.style.color = 'var(--text-primary)';
                    btnTotal.style.borderColor = 'var(--border-color)';
                }
            }
        } else if (field === 'status' && statusInput) {
            statusInput.value = val;
            const btnPendente = document.getElementById(formId + '-status-pendente');
            const btnConcluida = document.getElementById(formId + '-status-concluida');
            
            if (btnPendente && btnConcluida) {
                if (val === 'pendente') {
                    btnPendente.style.background = '#f39c12';
                    btnPendente.style.color = 'white';
                    btnPendente.style.borderColor = '#f39c12';
                    btnConcluida.style.background = 'var(--input-bg)';
                    btnConcluida.style.color = 'var(--text-primary)';
                    btnConcluida.style.borderColor = 'var(--border-color)';
                } else {
                    btnConcluida.style.background = '#2ecc71';
                    btnConcluida.style.color = 'white';
                    btnConcluida.style.borderColor = '#2ecc71';
                    btnPendente.style.background = 'var(--input-bg)';
                    btnPendente.style.color = 'var(--text-primary)';
                    btnPendente.style.borderColor = 'var(--border-color)';
                }
            }
        } else if (field === 'trans' && transInput) {
            transInput.value = val;
            const btnWn = document.getElementById(formId + '-trans-wn');
            const btnDf = document.getElementById(formId + '-trans-df');
            const btnOutro = document.getElementById(formId + '-trans-outro');
            const outroContainer = document.getElementById(formId + '-outro-container');
            
            if (btnWn && btnDf && btnOutro) {
                [btnWn, btnDf, btnOutro].forEach(btn => {
                    btn.style.background = 'var(--input-bg)';
                    btn.style.color = 'var(--text-primary)';
                    btn.style.borderColor = 'var(--border-color)';
                });
                
                if (val === 'WN') {
                    btnWn.style.background = 'var(--accent)';
                    btnWn.style.color = 'white';
                    btnWn.style.borderColor = 'var(--accent)';
                    if (outroContainer) outroContainer.style.display = 'none';
                } else if (val === 'DF') {
                    btnDf.style.background = 'var(--accent)';
                    btnDf.style.color = 'white';
                    btnDf.style.borderColor = 'var(--accent)';
                    if (outroContainer) outroContainer.style.display = 'none';
                } else if (val === 'OUTRO') {
                    btnOutro.style.background = 'var(--accent)';
                    btnOutro.style.color = 'white';
                    btnOutro.style.borderColor = 'var(--accent)';
                    if (outroContainer) outroContainer.style.display = 'block';
                }
            }
        }
    };

    window.salvarDevolucaoForm = function(formId) {
        const notaEl = document.getElementById(formId + '-nota');
        const tipoEl = document.getElementById(formId + '-tipo');
        const orEl = document.getElementById(formId + '-or');
        const statusEl = document.getElementById(formId + '-status');
        const transEl = document.getElementById(formId + '-trans');
        
        if (!notaEl || !tipoEl || !orEl || !transEl) return;
        
        const nota = notaEl.value.trim();
        const tipo = tipoEl.value;
        const or = orEl.value.trim();
        const status = statusEl ? statusEl.value : 'pendente';
        const trans = transEl.value;
        
        let transportadora = 'Não informada';
        if (trans === 'WN') {
            transportadora = 'WN Transportadora';
        } else if (trans === 'DF') {
            transportadora = 'DF Transportes';
        } else if (trans === 'OUTRO') {
            const outroValEl = document.getElementById(formId + '-trans-outro-val');
            const outroVal = outroValEl ? outroValEl.value.trim() : '';
            transportadora = outroVal ? outroVal : 'Outro';
        }
        
        if (!nota) {
            alert('❌ Informe o número da nota!');
            return;
        }
        if (!or) {
            alert('❌ Informe a O.R.!');
            return;
        }
        
        const resultado = adicionarDevolucao(nota, tipo, or, '-', transportadora, status);
        if (resultado.erro) {
            alert(resultado.erro);
        } else {
            const formEl = document.getElementById(formId);
            if (formEl) {
                const bubble = formEl.closest('.bubble');
                if (bubble) {
                    const d = resultado.devolucao;
                    const statusBadgeText = d.status === 'concluida' ? '✅ CONCLUÍDA' : '⏳ PENDENTE';
                    const mensagem = `✅ **Devolução adicionada com sucesso!**

📋 **Dados registrados:**
┌─────────────────────────────────────┐
│ 📌 Nota: ${d.nota}                  │
│ 📊 Tipo: ${d.tipo}                  │
│ 🔢 O.R.: ${d.or}                    │
│ 📌 Status: ${statusBadgeText}        │
│ 🚛 Transportadora: ${d.transportadora || 'Não informada'}
│ 📅 Data: ${formatarData(d.data)}    │
└─────────────────────────────────────┘

💡 Digite "ver devoluções" para ver a lista completa.`;
                    bubble.innerHTML = formatarTexto(mensagem);
                    return;
                }
            }
            mostrarDevolucoes('✅ Devolução adicionada com sucesso!');
        }
    };

    // ============================================
    // FUNÇÕES DE DEVOLUÇÕES
    // ============================================

    function listarDevolucoes(filtros = {}) {
        let lista = [...devolucoes];
        if (filtros.status) lista = lista.filter(d => d.status === filtros.status);
        if (filtros.tipo) lista = lista.filter(d => d.tipo === filtros.tipo);
        if (filtros.transportadora) lista = lista.filter(d => d.transportadora && d.transportadora.includes(filtros.transportadora));
        if (filtros.busca) {
            const busca = filtros.busca.toLowerCase();
            lista = lista.filter(d => 
                d.nota.toLowerCase().includes(busca) ||
                d.or.toLowerCase().includes(busca) ||
                d.esboco.toLowerCase().includes(busca)
            );
        }
        return lista;
    }

    function adicionarDevolucao(nota, tipo, or, esboco, transportadora, status = 'pendente') {
        if (!nota || nota.trim() === '') return { erro: '❌ Informe o número da nota!' };
        if (!tipo || (tipo !== 'TOTAL' && tipo !== 'PARCIAL')) return { erro: '❌ Informe o tipo (TOTAL ou PARCIAL)!' };
        if (!or || or.trim() === '') return { erro: '❌ Informe a O.R.!' };
        
        const cleanEsboco = esboco ? esboco.trim() : '-';
        const finalStatus = (status === 'concluida' || status === 'concluído') ? 'concluida' : 'pendente';
        
        const existe = devolucoes.some(d => d.nota === nota.trim());
        if (existe) return { erro: `⚠️ Nota ${nota} já está cadastrada!` };
        
        const nowStr = new Date().toISOString();
        const initialEtapa = finalStatus === 'concluida' ? 'Concluída' : 'Retirada do Palet';
        const nova = {
            id: gerarId(),
            nota: nota.trim(),
            tipo: tipo,
            or: or.trim(),
            esboco: cleanEsboco,
            status: finalStatus,
            transportadora: transportadora || 'Não informada',
            data: nowStr,
            dataAdicao: nowStr,
            etapa: initialEtapa,
            dataAlteracaoEtapa: nowStr,
            historicoEtapas: [
                { etapa: initialEtapa, data: nowStr }
            ]
        };
        
        devolucoes.push(nova);
        salvarDados();
        return { sucesso: true, devolucao: nova };
    }

    function concluirDevolucao(nota) {
        const dev = devolucoes.find(d => d.nota === nota);
        if (!dev) return { erro: `❌ Nota ${nota} não encontrada!` };
        if (dev.status === 'concluida') return { erro: `⚠️ Nota ${nota} já está concluída!` };
        dev.status = 'concluida';
        salvarDados();
        return { sucesso: true, devolucao: dev };
    }

    function removerDevolucao(nota) {
        const index = devolucoes.findIndex(d => d.nota === nota);
        if (index === -1) return { erro: `❌ Nota ${nota} não encontrada!` };
        const removida = devolucoes[index];
        devolucoes.splice(index, 1);
        salvarDados();
        return { sucesso: true, devolucao: removida };
    }

    function editarDevolucao(nota, dados) {
        const dev = devolucoes.find(d => d.nota === nota);
        if (!dev) return { erro: `❌ Nota ${nota} não encontrada!` };
        if (dados.tipo) dev.tipo = dados.tipo;
        if (dados.or) dev.or = dados.or;
        if (dados.esboco) dev.esboco = dados.esboco;
        if (dados.transportadora) dev.transportadora = dados.transportadora;
        salvarDados();
        return { sucesso: true, devolucao: dev };
    }

    function buscarDevolucao(nota) {
        const dev = devolucoes.find(d => d.nota === nota);
        if (!dev) return { erro: `❌ Nota ${nota} não encontrada!` };
        return { sucesso: true, devolucao: dev };
    }

    // ============================================
    // GERAR TABELAS
    // ============================================

    function obterIndicadorUrgencia(d) {
        if (d.status === 'concluida') return '🟢';
        const diffMs = new Date() - new Date(d.data);
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays >= 30) return '🔴';
        if (diffDays >= 15) return '🟡';
        return '🟢';
    }

    function gerarTabelaHTML(lista, comAcoes = false) {
        const uniqueId = 'tbl-' + Date.now() + Math.floor(Math.random() * 1000);
        window.__devolucoesTabelas = window.__devolucoesTabelas || {};
        window.__devolucoesTabelas[uniqueId] = { lista, comAcoes };
        
        let html = `
        <div id="${uniqueId}-parent">
            <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 6px; font-size: 0.72rem;">
                <button onclick="window.devolucoesFiltrarTabela('${uniqueId}', 'pendente')" style="background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); padding: 3px 6px; border-radius: 4px; cursor: pointer; font-size:0.72rem;">⏳ Pendentes</button>
                <button onclick="window.devolucoesFiltrarTabela('${uniqueId}', 'concluida')" style="background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); padding: 3px 6px; border-radius: 4px; cursor: pointer; font-size:0.72rem;">✅ Concluídas</button>
                <button onclick="window.devolucoesFiltrarTabela('${uniqueId}', 'TOTAL')" style="background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); padding: 3px 6px; border-radius: 4px; cursor: pointer; font-size:0.72rem;">📈 Totais</button>
                <button onclick="window.devolucoesFiltrarTabela('${uniqueId}', 'PARCIAL')" style="background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); padding: 3px 6px; border-radius: 4px; cursor: pointer; font-size:0.72rem;">📊 Parciais</button>
                <button onclick="window.devolucoesFiltrarTabela('${uniqueId}', 'WN')" style="background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); padding: 3px 6px; border-radius: 4px; cursor: pointer; font-size:0.72rem;">WN</button>
                <button onclick="window.devolucoesFiltrarTabela('${uniqueId}', 'DF')" style="background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); padding: 3px 6px; border-radius: 4px; cursor: pointer; font-size:0.72rem;">DF</button>
                <button onclick="window.devolucoesFiltrarTabela('${uniqueId}', 'limpar')" style="background: var(--accent); border: none; color: white; padding: 3px 6px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size:0.72rem;">🧹 Limpar</button>
            </div>
            <div id="${uniqueId}-content">
                ${gerarTabelaConteudoHTML(lista, comAcoes)}
            </div>
        </div>
        `;
        return html;
    }

    function gerarTabelaConteudoHTML(lista, comAcoes = false) {
        if (!lista || lista.length === 0) {
            return '📋 Nenhuma devolução encontrada.';
        }
        
        let html = `
        <div style="overflow-x: auto; margin: 4px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; background: var(--input-bg); border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <thead>
                <tr style="background: var(--accent); color: white; font-size: 0.82rem; font-weight: 600;">
                    <th style="padding: 6px 8px; text-align: left; white-space: nowrap;">NOTA</th>
                    <th style="padding: 6px 8px; text-align: left; white-space: nowrap;">TIPO</th>
                    <th style="padding: 6px 8px; text-align: left; white-space: nowrap;">O.R.</th>
                    <th style="padding: 6px 8px; text-align: left; white-space: nowrap;">STATUS</th>
                    <th style="padding: 6px 8px; text-align: left; white-space: nowrap;">TRANSPORTADORA</th>
                    <th style="padding: 6px 8px; text-align: center; white-space: nowrap;">AÇÕES</th>
                </tr>
            </thead>
            <tbody>
        `;
        
        lista.forEach(d => {
            const ind = obterIndicadorUrgencia(d);
            const statusBadge = d.status === 'concluida' 
                ? `<span style="padding: 2px 6px; border-radius: 4px; font-size: 0.72rem; font-weight: 600; background: rgba(46, 204, 113, 0.15); color: #2ecc71; white-space: nowrap;">✅ CONCLUÍDA</span>`
                : `<span style="padding: 2px 6px; border-radius: 4px; font-size: 0.72rem; font-weight: 600; background: rgba(243, 156, 18, 0.15); color: #f39c12; white-space: nowrap;">⏳ PENDENTE</span>`;
            
            html += `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 6px 8px; color: var(--text-primary); font-weight: 600; white-space: nowrap;">${ind} ${d.nota}</td>
                    <td style="padding: 6px 8px; color: var(--text-primary); white-space: nowrap;">${d.tipo}</td>
                    <td style="padding: 6px 8px; color: var(--text-primary); white-space: nowrap;">${d.or}</td>
                    <td style="padding: 6px 8px; white-space: nowrap;">${statusBadge}</td>
                    <td style="padding: 6px 8px; color: var(--text-primary); white-space: normal; word-break: keep-all; overflow-wrap: break-word;">${d.transportadora || 'Não informada'}</td>
                    <td style="padding: 6px 8px; text-align: center; white-space: nowrap;">
                        <div style="display: flex; gap: 3px; justify-content: center; align-items: center;">
                            <button onclick="window.devolucoesAcao('detalhes', '${d.nota}')" title="Detalhes" style="background: #2980b9; border: none; color: white; padding: 3px 6px; border-radius: 4px; cursor: pointer; font-size: 0.72rem; font-weight: bold; font-family: inherit;">🔍 Detalhes</button>
                            ${comAcoes ? `
                                ${d.status === 'pendente' ? `<button onclick="window.devolucoesAcao('concluir', '${d.nota}')" title="Concluir" style="background: var(--accent); border: none; color: white; padding: 3px 6px; border-radius: 4px; cursor: pointer; font-size: 0.72rem;">✅</button>` : ''}
                                <button onclick="window.devolucoesAcao('editar', '${d.nota}')" title="Editar" style="background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); padding: 3px 6px; border-radius: 4px; cursor: pointer; font-size: 0.72rem;">✏️</button>
                                <button onclick="window.devolucoesAcao('remover', '${d.nota}')" title="Remover" style="background: #c0392b; border: none; color: white; padding: 3px 6px; border-radius: 4px; cursor: pointer; font-size: 0.72rem;">🗑️</button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        });
        
        html += `
            </tbody>
        </table>
        </div>
        `;
        
        const total = lista.length;
        const concluidas = lista.filter(d => d.status === 'concluida').length;
        const pendentes = lista.filter(d => d.status === 'pendente').length;
        const totais = lista.filter(d => d.tipo === 'TOTAL').length;
        const parciais = lista.filter(d => d.tipo === 'PARCIAL').length;
        
        const transCount = {};
        lista.forEach(d => {
            const key = d.transportadora || 'Não informada';
            let keyShort = key;
            if (key.includes('WN')) keyShort = 'WN';
            else if (key.includes('DF')) keyShort = 'DF';
            transCount[keyShort] = (transCount[keyShort] || 0) + 1;
        });
        
        const transText = Object.entries(transCount)
            .map(([nome, qtd]) => `• ${nome}: ${qtd}`)
            .join(' | ');
        
        html += `
        <div style="margin-top: 6px; font-size: 0.78rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 3px; padding: 0 2px; border-top: 1px dashed var(--border-color); padding-top: 6px;">
            <div style="display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: center;">
                <span>📦 <strong>${total}</strong> devoluções</span>
                <span>|</span>
                <span>✅ <strong>${concluidas}</strong> concluídas</span>
                <span>|</span>
                <span>⏳ <strong>${pendentes}</strong> pendentes</span>
                <span>|</span>
                <span>📈 <strong>${totais}</strong> totais</span>
                <span>|</span>
                <span>📊 <strong>${parciais}</strong> parciais</span>
            </div>
            ${transText ? `
            <div style="font-size: 0.74rem; color: var(--text-secondary); margin-top: 1px;">
                <strong>🚛 Transportadoras:</strong> ${transText}
            </div>` : ''}
        </div>
        `;
        
        return html;
    }

    window.devolucoesFiltrarTabela = function(uniqueId, filtro) {
        const tblInfo = window.__devolucoesTabelas ? window.__devolucoesTabelas[uniqueId] : null;
        if (!tblInfo) return;
        
        let listaFiltrada = [...tblInfo.lista];
        if (filtro === 'pendente') {
            listaFiltrada = listaFiltrada.filter(d => d.status === 'pendente');
        } else if (filtro === 'concluida') {
            listaFiltrada = listaFiltrada.filter(d => d.status === 'concluida');
        } else if (filtro === 'TOTAL') {
            listaFiltrada = listaFiltrada.filter(d => d.tipo === 'TOTAL');
        } else if (filtro === 'PARCIAL') {
            listaFiltrada = listaFiltrada.filter(d => d.tipo === 'PARCIAL');
        } else if (filtro === 'WN') {
            listaFiltrada = listaFiltrada.filter(d => d.transportadora && d.transportadora.toUpperCase().includes('WN'));
        } else if (filtro === 'DF') {
            listaFiltrada = listaFiltrada.filter(d => d.transportadora && d.transportadora.toUpperCase().includes('DF'));
        }
        
        const contentEl = document.getElementById(uniqueId + '-content');
        if (contentEl) {
            contentEl.innerHTML = gerarTabelaConteudoHTML(listaFiltrada, tblInfo.comAcoes);
        }
    };

    function gerarResumoHTML() {
        const total = devolucoes.length;
        const concluidas = devolucoes.filter(d => d.status === 'concluida').length;
        const pendentes = devolucoes.filter(d => d.status === 'pendente').length;
        const totais = devolucoes.filter(d => d.tipo === 'TOTAL').length;
        const parciais = devolucoes.filter(d => d.tipo === 'PARCIAL').length;
        
        const transCount = {};
        devolucoes.forEach(d => {
            const key = d.transportadora || 'Não informada';
            transCount[key] = (transCount[key] || 0) + 1;
        });
        
        let html = `
        <div style="padding: 15px; background: var(--chat-bg); border-radius: 12px; border: 1px solid var(--border-color);">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem;">
                <div style="padding: 8px; background: var(--input-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-primary);">${total}</div>
                    <div style="color: var(--text-secondary);">Total de devoluções</div>
                </div>
                <div style="padding: 8px; background: var(--input-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--accent);">${concluidas}</div>
                    <div style="color: var(--text-secondary);">Concluídas</div>
                </div>
                <div style="padding: 8px; background: var(--input-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #f39c12;">${pendentes}</div>
                    <div style="color: var(--text-secondary);">Pendentes</div>
                </div>
                <div style="padding: 8px; background: var(--input-bg); border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-primary);">${totais} / ${parciais}</div>
                    <div style="color: var(--text-secondary);">Totais / Parciais</div>
                </div>
            </div>
            <div style="margin-top: 12px; padding: 10px; background: var(--input-bg); border-radius: 8px; font-size: 0.85rem; color: var(--text-secondary);">
                <strong>🚛 Por transportadora:</strong><br>
                ${Object.entries(transCount).map(([nome, qtd]) => `• ${nome}: ${qtd}`).join('\n')}
            </div>
        </div>
        `;
        
        return html;
    }

    function buscarEtapa(nomeEtapa) {
        if (!nomeEtapa) return null;
        const s = nomeEtapa.toLowerCase().trim();
        if (s.includes('palet') || s.includes('retirada')) return "Retirada do Palet";
        if (s.includes('or cadastrada') || s.includes('cadastrada') || s === 'or') return "OR Cadastrada";
        if (s.includes('esboco sap') || s.includes('esboço sap') || s.includes('sap criado')) return "Esboço SAP Criado";
        if (s.includes('esboco vinculado') || s.includes('esboço vinculado') || s.includes('vinculado')) return "Esboço Vinculado";
        if (s.includes('contagem')) return "Contagem Concluída";
        if (s.includes('mapas') || s.includes('impressos')) return "Mapas Impressos";
        if (s.includes('aguardando sap') || s.includes('esperando sap')) return "Aguardando SAP";
        if (s.includes('chamado') || s.includes('sac')) return "Chamado Aberto";
        if (s.includes('concluida') || s.includes('concluída') || s.includes('finalizado')) return "Concluída";
        
        const match = ETAPAS.find(e => e.toLowerCase().includes(s));
        return match || null;
    }

    function atualizarEtapa(nota, nomeEtapa, observacao = null) {
        const dev = devolucoes.find(d => d.nota === nota);
        if (!dev) return { erro: `❌ Nota ${nota} não encontrada!` };
        
        const etapaReal = buscarEtapa(nomeEtapa);
        if (!etapaReal) {
            return { erro: `❌ Etapa "${nomeEtapa}" não reconhecida!\n💡 Digite **"ver etapas"** para ver as etapas disponíveis.` };
        }
        
        const nowStr = new Date().toISOString();
        
        if (dev.etapa !== etapaReal) {
            dev.etapa = etapaReal;
            dev.dataAlteracaoEtapa = nowStr;
            if (!dev.historicoEtapas) dev.historicoEtapas = [];
            dev.historicoEtapas.push({ etapa: etapaReal, data: nowStr });
            
            if (etapaReal === "Concluída") {
                dev.status = "concluida";
            } else {
                dev.status = "pendente";
            }
        }
        
        if (observacao !== null) {
            dev.observacao = observacao;
        }
        
        salvarDados();
        return { sucesso: true, devolucao: dev };
    }

    function mostrarDetalhes(nota) {
        const dev = devolucoes.find(d => d.nota === nota);
        if (!dev) {
            alert(`❌ Nota ${nota} não encontrada!`);
            return;
        }
        
        const modalExistente = document.getElementById('devolucao-detalhes-modal');
        if (modalExistente) modalExistente.remove();
        
        const now = new Date();
        const dataAlteracao = dev.dataAlteracaoEtapa ? new Date(dev.dataAlteracaoEtapa) : new Date(dev.dataAdicao || dev.data);
        const diffMs = now - dataAlteracao;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        let tempoParadaText = "";
        if (dev.status === 'pendente') {
            tempoParadaText = diffDays === 0 ? " (parada hoje)" : ` (parada há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'})`;
        }
        
        const emojiEtapa = dev.status === 'concluida' ? '✅' : '⏳';
        
        let histHtml = "";
        if (dev.historicoEtapas && dev.historicoEtapas.length > 0) {
            dev.historicoEtapas.forEach((h, index) => {
                const isUltimo = index === dev.historicoEtapas.length - 1;
                const check = isUltimo ? (dev.status === 'concluida' ? '✅' : '⏳') : '✅';
                const labelUltimo = isUltimo ? ' (ATUAL)' : '';
                histHtml += `<div style="font-size: 0.8rem; margin-bottom: 4px; color: var(--text-primary);">
                    ${check} <strong>${h.etapa}</strong> - ${formatarData(h.data)}${labelUltimo}
                </div>`;
            });
        } else {
            histHtml = `<div style="font-size: 0.8rem; color: var(--text-secondary); font-style: italic;">Nenhum histórico registrado.</div>`;
        }

        const modal = document.createElement('div');
        modal.id = 'devolucao-detalhes-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: inherit;
        `;
        modal.style.zIndex = '99999';
        
        modal.innerHTML = `
            <div style="background: var(--sidebar-bg); border: 2px solid var(--accent); border-radius: 16px; width: 90%; max-width: 440px; box-shadow: 0 4px 20px rgba(0,0,0,0.4); overflow: hidden; display: flex; flex-direction: column; color: var(--text-primary);">
                <div style="background: var(--accent); padding: 12px 16px; color: white; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: bold; font-size: 1rem;">📋 DETALHES - ${dev.nota}</span>
                    <button onclick="document.getElementById('devolucao-detalhes-modal').remove();" style="background: transparent; border: none; color: white; font-size: 1.2rem; cursor: pointer; line-height: 1;">&times;</button>
                </div>
                
                <div style="padding: 16px; display: flex; flex-direction: column; gap: 12px; max-height: 70vh; overflow-y: auto; text-align: left;">
                    <div>
                        <span style="color: var(--text-secondary); font-size: 0.72rem; display: block; font-weight: bold; margin-bottom: 2px;">📌 STATUS:</span>
                        <span style="font-size: 0.88rem; font-weight: bold; color: ${dev.status === 'concluida' ? '#2ecc71' : '#f39c12'};">
                            ${dev.status === 'concluida' ? '✅ Concluída' : '⏳ Pendente'}
                        </span>
                    </div>
                    
                    <div>
                        <span style="color: var(--text-secondary); font-size: 0.72rem; display: block; font-weight: bold; margin-bottom: 2px;">📅 ADICIONADA EM:</span>
                        <span style="font-size: 0.85rem;">${formatarData(dev.dataAdicao || dev.data)}</span>
                    </div>
                    
                    <div>
                        <span style="color: var(--text-secondary); font-size: 0.72rem; display: block; font-weight: bold; margin-bottom: 2px;">🚛 TRANSPORTADORA:</span>
                        <span style="font-size: 0.85rem;">${dev.transportadora || 'Não informada'}</span>
                    </div>
                    
                    <div>
                        <span style="color: var(--text-secondary); font-size: 0.72rem; display: block; font-weight: bold; margin-bottom: 2px;">📋 ETAPA ATUAL:</span>
                        <span style="font-size: 0.88rem; font-weight: bold; color: var(--accent);">
                            ${emojiEtapa} ${dev.etapa || 'Retirada do Palet'}${tempoParadaText}
                        </span>
                    </div>
                    
                    <div>
                        <span style="color: var(--text-secondary); font-size: 0.72rem; display: block; font-weight: bold; margin-bottom: 2px;">📝 OBSERVAÇÃO:</span>
                        <div id="modal-obs-text" style="font-size: 0.85rem; background: var(--input-bg); padding: 8px 10px; border-radius: 8px; border: 1px solid var(--border-color); min-height: 36px; white-space: pre-wrap; font-style: ${dev.observacao ? 'normal' : 'italic'}; color: ${dev.observacao ? 'var(--text-primary)' : 'var(--text-secondary)'};">
                            ${dev.observacao ? `"${dev.observacao}"` : 'Sem observações registradas.'}
                        </div>
                    </div>
                    
                    <div>
                        <span style="color: var(--text-secondary); font-size: 0.72rem; display: block; font-weight: bold; margin-bottom: 4px;">📋 HISTÓRICO DE ETAPAS:</span>
                        <div style="background: var(--input-bg); padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 6px; max-height: 120px; overflow-y: auto;">
                            ${histHtml}
                        </div>
                    </div>
                </div>
                
                <div style="background: var(--input-bg); padding: 12px 16px; border-top: 1px solid var(--border-color); display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap;">
                    <button onclick="window.devolucoesModalAcao('editarObs', '${dev.nota}')" style="background: var(--accent); color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 0.78rem; cursor: pointer; font-family: inherit;">✏️ Editar Observação</button>
                    <button onclick="window.devolucoesModalAcao('atualizarEtapa', '${dev.nota}')" style="background: var(--accent); color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 0.78rem; cursor: pointer; font-family: inherit;">📝 Atualizar Etapa</button>
                    <button onclick="document.getElementById('devolucao-detalhes-modal').remove();" style="background: #c0392b; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 0.78rem; cursor: pointer; font-family: inherit;">❌ Fechar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    window.devolucoesModalAcao = function(acao, nota) {
        const dev = devolucoes.find(d => d.nota === nota);
        if (!dev) return;
        
        if (acao === 'editarObs') {
            const novaObs = prompt(`Digite a observação para a nota ${nota}:`, dev.observacao || '');
            if (novaObs !== null) {
                dev.observacao = novaObs.trim();
                salvarDados();
                
                const obsDiv = document.getElementById('modal-obs-text');
                if (obsDiv) {
                    obsDiv.innerText = dev.observacao ? `"${dev.observacao}"` : 'Sem observações registradas.';
                    obsDiv.style.fontStyle = dev.observacao ? 'normal' : 'italic';
                    obsDiv.style.color = dev.observacao ? 'var(--text-primary)' : 'var(--text-secondary)';
                }
                
                if (typeof window.mostrarNotificacao === 'function') {
                    window.mostrarNotificacao(`📝 Observação da nota ${nota} atualizada!`, 'sucesso');
                }
            }
        } else if (acao === 'atualizarEtapa') {
            const msg = `Escolha o número da nova etapa para a nota ${nota}:\n\n` +
                ETAPAS.map((e, idx) => `${idx + 1}. ${e}`).join('\n');
            const escolha = prompt(msg, "1");
            if (escolha !== null) {
                const idx = parseInt(escolha) - 1;
                if (idx >= 0 && idx < ETAPAS.length) {
                    const novaEtapa = ETAPAS[idx];
                    const res = atualizarEtapa(nota, novaEtapa);
                    if (res.sucesso) {
                        const modal = document.getElementById('devolucao-detalhes-modal');
                        if (modal) modal.remove();
                        mostrarDetalhes(nota);
                        if (typeof window.mostrarNotificacao === 'function') {
                            window.mostrarNotificacao(`📝 Etapa da nota ${nota} atualizada para "${novaEtapa}"!`, 'sucesso');
                        }
                    } else {
                        alert(res.erro);
                    }
                } else {
                    alert("❌ Opção inválida!");
                }
            }
        }
    };

    // ============================================
    // AÇÕES PARA OS BOTÕES
    // ============================================
    window.devolucoesAcao = function(acao, nota) {
        let resultado;
        let mensagem = '';
        
        switch(acao) {
            case 'detalhes':
                mostrarDetalhes(nota);
                break;
            case 'concluir':
                resultado = concluirDevolucao(nota);
                if (resultado.sucesso) {
                    mensagem = `✅ Devolução ${nota} concluída!`;
                } else {
                    mensagem = resultado.erro;
                }
                break;
            case 'remover':
                if (confirm(`Tem certeza que deseja remover a nota ${nota}?`)) {
                    resultado = removerDevolucao(nota);
                    if (resultado.sucesso) {
                        mensagem = `🗑️ Devolução ${nota} removida!`;
                    } else {
                        mensagem = resultado.erro;
                    }
                } else {
                    return;
                }
                break;
            case 'editar':
                const dev = devolucoes.find(d => d.nota === nota);
                if (dev) {
                    const novoTipo = prompt(`Tipo (TOTAL/PARCIAL) [${dev.tipo}]:`, dev.tipo);
                    if (novoTipo && novoTipo !== null) {
                        const novaOR = prompt(`O.R. [${dev.or}]:`, dev.or);
                        if (novaOR && novaOR !== null) {
                            const novoEsboco = prompt(`Esboço [${dev.esboco}]:`, dev.esboco);
                            if (novoEsboco && novoEsboco !== null) {
                                const novaTrans = prompt(`Transportadora [${dev.transportadora || 'Não informada'}]:`, dev.transportadora || '');
                                const dados = {
                                    tipo: novoTipo.toUpperCase(),
                                    or: novaOR,
                                    esboco: novoEsboco,
                                    transportadora: novaTrans || 'Não informada'
                                };
                                resultado = editarDevolucao(nota, dados);
                                if (resultado.sucesso) {
                                    mensagem = `✏️ Devolução ${nota} atualizada!`;
                                } else {
                                    mensagem = resultado.erro;
                                }
                            }
                        }
                    }
                }
                break;
        }
        
        if (mensagem) {
            mostrarTabelaComEfeito(() => mostrarDevolucoes(mensagem));
        }
    };

    // ============================================
    // MOSTRAR DEVOLUÇÕES
    // ============================================
    function mostrarDevolucoes(mensagemAdicional = '', filtros = {}) {
        if (!modoAtivo) return null;
        
        const lista = listarDevolucoes(filtros);
        if (lista.length === 0) {
            return `📋 Nenhuma devolução encontrada.\n💡 *Dica:* Digite **"ajuda devoluções"** para conhecer os comandos.`;
        }
        
        const tabela = gerarTabelaHTML(lista, false);
        
        let resultado = `📦 **DEVOLUÇÕES - VISUALIZAÇÃO**\n`;
        if (mensagemAdicional) resultado += `${mensagemAdicional}\n`;
        
        let filtroTexto = [];
        if (filtros.status) filtroTexto.push(`📌 Status: ${filtros.status === 'concluida' ? 'Concluídas' : 'Pendentes'}`);
        if (filtros.tipo) filtroTexto.push(`📌 Tipo: ${filtros.tipo}`);
        if (filtros.transportadora) filtroTexto.push(`📌 Transportadora: ${filtros.transportadora}`);
        if (filtros.busca) filtroTexto.push(`📌 Busca: ${filtros.busca}`);
        
        if (filtroTexto.length > 0) {
            resultado += `🔍 **Filtros:** ${filtroTexto.join(' | ')}\n`;
        }
        
        resultado += tabela;
        resultado += `
<details style="margin-top: 15px; padding: 8px; background: var(--input-bg); border-radius: 8px; border: 1px solid var(--border-color); font-size: 0.78rem; color: var(--text-secondary); cursor: pointer;">
    <summary style="font-weight: bold; color: var(--text-primary); outline: none;">💡 Clique aqui para ver os comandos de devolução</summary>
    <div style="margin-top: 8px; line-height: 1.4; display: flex; flex-direction: column; gap: 4px; cursor: default;">
        <span>• <strong>"ver devoluções"</strong> - Mostrar todas</span>
        <span>• <strong>"ver pendentes"</strong> - Só pendentes</span>
        <span>• <strong>"ver concluídas"</strong> - Só concluídas</span>
        <span>• <strong>"ver totais"</strong> - Só totais</span>
        <span>• <strong>"ver parciais"</strong> - Só parciais</span>
        <span>• <strong>"ver WN"</strong> - Só WN</span>
        <span>• <strong>"ver DF"</strong> - Só DF</span>
        <span>• <strong>"adicionar devolução"</strong> - Abrir formulário interativo</span>
        <span>• <strong>"concluir NF-xxxxx"</strong> - Concluir devolução</span>
        <span>• <strong>"editar devoluções"</strong> - Gerenciar com botões de ação</span>
    </div>
</details>
        `;
        
        return resultado;
    }

    function mostrarEdicao() {
        if (!modoAtivo) return null;
        
        const lista = listarDevolucoes();
        const tabela = gerarTabelaHTML(lista, true);
        
        let resultado = `✏️ **GERENCIAR DEVOLUÇÕES**\n`;
        resultado += `Botoes: ✅ Concluir | ✏️ Editar | 🗑️ Remover\n`;
        resultado += tabela;
        resultado += `
<details style="margin-top: 15px; padding: 8px; background: var(--input-bg); border-radius: 8px; border: 1px solid var(--border-color); font-size: 0.78rem; color: var(--text-secondary); cursor: pointer;">
    <summary style="font-weight: bold; color: var(--text-primary); outline: none;">💡 Clique aqui para ver os comandos rápidos</summary>
    <div style="margin-top: 8px; line-height: 1.4; display: flex; flex-direction: column; gap: 4px; cursor: default;">
        <span>• <strong>"adicionar devolução"</strong> - Abrir formulário interativo</span>
        <span>• <strong>"concluir NF-xxxxx"</strong> - Concluir devolução</span>
        <span>• <strong>"remover NF-xxxxx"</strong> - Remover devolução</span>
        <span>• <strong>"editar NF-xxxxx"</strong> - Editar dados da devolução</span>
    </div>
</details>
        `;
        
        return resultado;
    }

    function mostrarFormularioAdicao() {
        if (!modoAtivo) return null;
        
        const formId = 'form-' + Date.now();
        return `
<div id="${formId}" style="padding: 10px 12px; background: var(--chat-bg); border-radius: 12px; border: 1px solid var(--border-color); font-family: inherit; width: 100%; max-width: 340px; box-sizing: border-box; font-size: 0.78rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <div style="font-weight: bold; font-size: 0.85rem; margin-bottom: 8px; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
        📝 <span>NOVA DEVOLUÇÃO</span>
    </div>
    
    <div style="display: flex; gap: 8px; margin-bottom: 6px;">
        <div style="flex: 1;">
            <label style="display: block; font-size: 0.7rem; margin-bottom: 2px; color: var(--text-secondary); font-weight: 600;">Nota:</label>
            <input type="text" id="${formId}-nota" placeholder="Ex: NF-12345" style="width: 100%; padding: 5px 7px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--text-primary); box-sizing: border-box; font-family: inherit; font-size: 0.76rem;">
        </div>
        <div style="flex: 1;">
            <label style="display: block; font-size: 0.7rem; margin-bottom: 2px; color: var(--text-secondary); font-weight: 600;">O.R.:</label>
            <input type="text" id="${formId}-or" placeholder="Ex: OR-001" style="width: 100%; padding: 5px 7px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--text-primary); box-sizing: border-box; font-family: inherit; font-size: 0.76rem;">
        </div>
    </div>
    
    <div style="display: flex; gap: 8px; margin-bottom: 6px;">
        <div style="flex: 1;">
            <label style="display: block; font-size: 0.7rem; margin-bottom: 2px; color: var(--text-secondary); font-weight: 600;">Tipo:</label>
            <div style="display: flex; gap: 3px;">
                <button type="button" id="${formId}-tipo-total" onclick="window.setFormVal('${formId}', 'tipo', 'TOTAL');" style="flex: 1; padding: 5px 1px; border-radius: 5px; border: 1px solid var(--accent); background: var(--accent); color: white; cursor: pointer; font-weight: bold; font-size: 0.68rem; transition: all 0.2s; font-family: inherit;">TOTAL</button>
                <button type="button" id="${formId}-tipo-parcial" onclick="window.setFormVal('${formId}', 'tipo', 'PARCIAL');" style="flex: 1; padding: 5px 1px; border-radius: 5px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--text-primary); cursor: pointer; font-size: 0.68rem; transition: all 0.2s; font-family: inherit;">PARCIAL</button>
            </div>
            <input type="hidden" id="${formId}-tipo" value="TOTAL">
        </div>
        <div style="flex: 1.1;">
            <label style="display: block; font-size: 0.7rem; margin-bottom: 2px; color: var(--text-secondary); font-weight: 600;">Status Inicial:</label>
            <div style="display: flex; gap: 3px;">
                <button type="button" id="${formId}-status-pendente" onclick="window.setFormVal('${formId}', 'status', 'pendente');" style="flex: 1; padding: 5px 1px; border-radius: 5px; border: 1px solid #f39c12; background: #f39c12; color: white; cursor: pointer; font-weight: bold; font-size: 0.65rem; transition: all 0.2s; font-family: inherit; white-space: nowrap;">⏳ Pendente</button>
                <button type="button" id="${formId}-status-concluida" onclick="window.setFormVal('${formId}', 'status', 'concluida');" style="flex: 1; padding: 5px 1px; border-radius: 5px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--text-primary); cursor: pointer; font-size: 0.65rem; transition: all 0.2s; font-family: inherit; white-space: nowrap;">✅ Concluída</button>
            </div>
            <input type="hidden" id="${formId}-status" value="pendente">
        </div>
    </div>
    
    <div style="margin-bottom: 6px;">
        <label style="display: block; font-size: 0.7rem; margin-bottom: 2px; color: var(--text-secondary); font-weight: 600;">Transportadora:</label>
        <div style="display: flex; gap: 4px;">
            <button type="button" id="${formId}-trans-wn" onclick="window.setFormVal('${formId}', 'trans', 'WN');" style="flex: 1; padding: 5px 2px; border-radius: 5px; border: 1px solid var(--accent); background: var(--accent); color: white; cursor: pointer; font-weight: bold; font-size: 0.7rem; transition: all 0.2s; font-family: inherit;">WN Transportadora</button>
            <button type="button" id="${formId}-trans-df" onclick="window.setFormVal('${formId}', 'trans', 'DF');" style="flex: 1; padding: 5px 2px; border-radius: 5px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--text-primary); cursor: pointer; font-size: 0.7rem; transition: all 0.2s; font-family: inherit;">DF Transportes</button>
            <button type="button" id="${formId}-trans-outro" onclick="window.setFormVal('${formId}', 'trans', 'OUTRO');" style="flex: 1; padding: 5px 2px; border-radius: 5px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--text-primary); cursor: pointer; font-size: 0.7rem; transition: all 0.2s; font-family: inherit;">Outro</button>
        </div>
        <input type="hidden" id="${formId}-trans" value="WN">
        
        <div id="${formId}-outro-container" style="display: none; margin-top: 5px;">
            <input type="text" id="${formId}-trans-outro-val" placeholder="Nome da transportadora..." style="width: 100%; padding: 5px 7px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--text-primary); box-sizing: border-box; font-size: 0.75rem; font-family: inherit;">
        </div>
    </div>
    
    <button type="button" onclick="window.salvarDevolucaoForm('${formId}');" style="width: 100%; padding: 7px; border-radius: 6px; border: none; background: var(--accent); color: white; font-weight: bold; cursor: pointer; font-size: 0.78rem; margin-top: 4px; transition: opacity 0.2s; font-family: inherit;">💾 SALVAR DEVOLUÇÃO</button>
</div>
`;
    }

    function mostrarAjudaDevolucoes(completo = true) {
        if (!modoAtivo) return null;
        
        if (completo) {
            return `📚 **GUIA COMPLETO - DEVOLUÇÕES**

📋 **VISUALIZAR:**
• **ver devoluções** - Mostra todas as devoluções
• **ver pendentes** - Mostra só pendentes
• **ver concluídas** - Mostra só concluídas
• **ver totais** - Mostra só totais
• **ver parciais** - Mostra só parciais
• **ver WN** - Mostra só WN Transportadora
• **ver DF** - Mostra só DF Transportes
• **ver agrupado** - Mostra agrupado por mês
• **ver antigas** - Mostra pendentes com 30+ dias
• **ver arquivadas** - Mostra notas arquivadas
• **ver etapas** - Lista todas as etapas disponíveis
• **ver etapa "Contagem"** - Filtra devoluções pela etapa

🔍 **BUSCAR E FILTRAR:**
• **buscar NF-12345** - Busca por nota específica
• **buscar OR-001** - Busca por OR específica
• **buscar "palavra"** - Busca por palavra nas observações
• **filtrar hoje** - Devoluções de hoje
• **filtrar semana** - Devoluções da semana
• **filtrar mes** - Devoluções do mês atual
• **filtrar mês 07/2026** - Devoluções de um mês específico
• **filtrar período 01/07 a 15/07** - Devoluções em um intervalo
• **ordenar por data** - Ordena por data (mais recente)
• **ordenar por nota** - Ordena por número da nota

📝 **OBSERVAÇÕES E ETAPAS:**
• **obs NF-12345 "texto"** - Adiciona/edita observação
• **etapa NF-12345 "Esboço SAP"** - Atualiza a etapa da NF
• **etapa NF-12345 "Esboço SAP" "observação"** - Atualiza etapa e obs juntas
• **ver obs NF-12345** - Mostra a observação
• **remover obs NF-12345** - Remove observação

📦 **ARQUIVO:**
• **arquivar NF-12345** - Move NF para o arquivo (se concluída)
• **arquivar todas concluídas** - Move TODAS as concluídas para o arquivo
• **arquivar anteriores a DD/MM/AAAA** - Move concluídas antes da data
• **restaurar NF-12345** - Volta do arquivo para a tabela
• **limpar arquivo** - Remove permanentemente as arquivadas

⚙️ **CONFIGURAÇÕES DO GUIA:**
• **configurar guia** - Mostra configurações atuais
• **configurar guia intensidade:alta** - Altera intensidade (alta/media/baixa/silencioso)
• **configurar guia alerta:2,5,30** - Altera dias para pendente/urgente/antiga

🔐 **MODO:**
• **/dev.goiassaude** - Ativa o modo devoluções
• **/dev.off** - Desativa o modo devoluções

💡 *Dica: Guarde este guia! Use "ajuda devoluções" sempre que precisar lembrar de um comando.*`;
        } else {
            return `🔐 **MODO DEVOLUÇÕES ATIVADO!**
📚 Digite **"ajuda devoluções"** para ver todos os comandos disponíveis.
💡 **Comandos rápidos:** ver devoluções, ver pendentes, adicionar devolução, concluir NF-12345, buscar NF-12345, configurar guia`;
        }
    }

    // Mantido por compatibilidade
    function mostrarAjuda() {
        return mostrarAjudaDevolucoes(true);
    }

    // ============================================
    // INTERPRETAÇÃO DE LINGUAGEM NATURAL
    // ============================================
    function interpretarComando(texto) {
        const lower = texto.toLowerCase().trim();

        // etapa NF-12345 "Esboço SAP" "observação"
        const matchEtapaObs = texto.match(/^etapa\s+(NF-\d+)\s+["'](.*?)["']\s+["'](.*?)["']$/i);
        if (matchEtapaObs) {
            const nota = matchEtapaObs[1].toUpperCase();
            const etapaStr = matchEtapaObs[2].trim();
            const obsStr = matchEtapaObs[3].trim();
            const res = atualizarEtapa(nota, etapaStr, obsStr);
            if (res.sucesso) {
                enviarMensagem(`✅ Etapa da nota **${nota}** atualizada para **${res.devolucao.etapa}** com a observação: "${obsStr}"`);
            } else {
                enviarMensagem(res.erro);
            }
            return '__ENVIADO__';
        }
        
        // etapa NF-12345 "Esboço SAP"
        const matchEtapaSimples = texto.match(/^etapa\s+(NF-\d+)\s+["'](.*?)["']$/i) || texto.match(/^etapa\s+(NF-\d+)\s+(.+)$/i);
        if (matchEtapaSimples) {
            const nota = matchEtapaSimples[1].toUpperCase();
            const etapaStr = matchEtapaSimples[2].trim();
            const res = atualizarEtapa(nota, etapaStr);
            if (res.sucesso) {
                enviarMensagem(`✅ Etapa da nota **${nota}** atualizada para **${res.devolucao.etapa}**`);
            } else {
                enviarMensagem(res.erro);
            }
            return '__ENVIADO__';
        }

        // ver etapas
        if (lower === 'ver etapas') {
            let msg = `📋 **ETAPAS DISPONÍVEIS:**\n\n`;
            ETAPAS_DISPONIVEIS.forEach((e, idx) => {
                msg += `${idx + 1}. ${e.emoji} **${e.nome}**\n   _${e.desc.split(' - ')[1]}_\n`;
            });
            enviarMensagem(msg);
            return '__ENVIADO__';
        }
        
        // ver etapa "Contagem"
        const matchVerEtapa = texto.match(/^ver\s+etapa\s+["'](.*?)["']$/i) || texto.match(/^ver\s+etapa\s+(.+)$/i);
        if (matchVerEtapa) {
            const etapaBusca = matchVerEtapa[1].trim();
            const etapaReal = buscarEtapa(etapaBusca);
            if (!etapaReal) {
                enviarMensagem(`❌ Etapa "${etapaBusca}" não encontrada! Digite **"ver etapas"** para listar.`);
                return '__ENVIADO__';
            }
            
            mostrarTabelaComEfeito(() => {
                const lista = devolucoes.filter(d => d.etapa === etapaReal);
                return `📋 **DEVOLUÇÕES NA ETAPA: ${etapaReal}**\n` + gerarTabelaHTML(lista, false);
            });
            return '__ENVIADO__';
        }

        // Exportar Devoluções
        if (lower === '/exportar devolucoes') {
            exportarDevolucoes();
            return '__ENVIADO__';
        }

        // Importar Devoluções
        if (lower === '/importar devolucoes') {
            importarDevolucoesComando();
            return '__ENVIADO__';
        }

        // Observações: obs NF-12345 "texto"
        const matchObsGravar = texto.match(/^obs\s+(NF-\d+)\s+["'](.*?)["']$/i) || texto.match(/^obs\s+(NF-\d+)\s+(.+)$/i);
        if (matchObsGravar) {
            const nota = matchObsGravar[1].toUpperCase();
            const textoObs = matchObsGravar[2].trim();
            const res = adicionarObservacao(nota, textoObs);
            if (res.sucesso) {
                enviarMensagem(`✅ Observação adicionada à nota **${nota}**: "${textoObs}"`);
            } else {
                enviarMensagem(res.erro);
            }
            return '__ENVIADO__';
        }

        // Ver observação: ver obs NF-12345
        const matchObsVer = texto.match(/^ver\s+obs\s+(NF-\d+)$/i);
        if (matchObsVer) {
            const nota = matchObsVer[1].toUpperCase();
            const res = obterObservacao(nota);
            if (res.sucesso) {
                if (res.observacao) {
                    enviarMensagem(`📋 Observação da nota **${nota}**:\n"${res.observacao}"`);
                } else {
                    enviarMensagem(`📋 A nota **${nota}** não possui observações.`);
                }
            } else {
                enviarMensagem(res.erro);
            }
            return '__ENVIADO__';
        }

        // Remover observação: remover obs NF-12345
        const matchObsRemover = texto.match(/^remover\s+obs\s+(NF-\d+)$/i);
        if (matchObsRemover) {
            const nota = matchObsRemover[1].toUpperCase();
            const res = removerObservacao(nota);
            if (res.sucesso) {
                enviarMensagem(`🗑️ Observação da nota **${nota}** foi removida.`);
            } else {
                enviarMensagem(res.erro);
            }
            return '__ENVIADO__';
        }

        // Arquivamento
        if (lower === 'arquivar todas concluídas' || lower === 'arquivar todas concluidas') {
            const res = arquivarTodasConcluidas();
            if (res.sucesso) {
                enviarMensagem(`📁 **Arquivo:** ${res.total} devoluções concluídas foram arquivadas.`);
            } else {
                enviarMensagem(res.erro);
            }
            return '__ENVIADO__';
        }

        const matchAnt = texto.match(/arquivar anteriores a\s+(\d{2}\/\d{2}\/\d{4})/i);
        if (matchAnt) {
            const dateStr = matchAnt[1];
            const res = arquivarAnterioresA(dateStr);
            if (res.sucesso) {
                enviarMensagem(`📁 **Arquivo:** ${res.total} devoluções concluídas anteriores a ${dateStr} foram arquivadas.`);
            } else {
                enviarMensagem(res.erro);
            }
            return '__ENVIADO__';
        }

        const matchArq = texto.match(/arquivar\s+(NF-\d+)/i);
        if (matchArq) {
            const nota = matchArq[1].toUpperCase();
            const res = arquivarDevolucao(nota);
            if (res.sucesso) {
                enviarMensagem(`📁 A devolução ${nota} foi movida para o arquivo.`);
            } else {
                enviarMensagem(res.erro);
            }
            return '__ENVIADO__';
        }

        if (lower === 'ver arquivadas') {
            mostrarTabelaComEfeito(() => {
                if (devolucoesArquivadas.length === 0) return '📁 O arquivo de concluídas está vazio.';
                return gerarTabelaArquivadasHTML(devolucoesArquivadas);
            });
            return '__ENVIADO__';
        }

        const matchRest = texto.match(/restaurar\s+(NF-\d+)/i);
        if (matchRest) {
            const nota = matchRest[1].toUpperCase();
            const res = restaurarDevolucao(nota);
            if (res.sucesso) {
                enviarMensagem(`✅ A devolução ${nota} foi restaurada do arquivo para a lista ativa.`);
            } else {
                enviarMensagem(res.erro);
            }
            return '__ENVIADO__';
        }

        if (lower === 'limpar arquivo') {
            const res = limparArquivo();
            if (res.sucesso) {
                enviarMensagem(`🗑️ O arquivo de concluídas foi completamente esvaziado. (${res.total} registros removidos)`);
            }
            return '__ENVIADO__';
        }

        // Agrupamento por Mês
        if (lower === 'ver agrupado' || lower === 'ver agrupadas') {
            mostrarTabelaComEfeito(() => verAgrupado());
            return '__ENVIADO__';
        }

        // Destaque antigas
        if (lower === 'ver antigas') {
            mostrarTabelaComEfeito(() => {
                const listaFiltrada = devolucoes.filter(d => {
                    if (d.status !== 'pendente') return false;
                    const diffMs = new Date() - new Date(d.data);
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    return diffDays >= 30;
                });
                return gerarTabelaHTML(listaFiltrada, true);
            });
            return '__ENVIADO__';
        }

        // Buscar Inteligente
        const matchBusca = texto.match(/^buscar\s+["']?([^"']+)["']?$/i);
        if (matchBusca) {
            const termo = matchBusca[1].trim().toLowerCase();
            mostrarTabelaComEfeito(() => {
                const resultado = devolucoes.filter(d => 
                    d.nota.toLowerCase().includes(termo) ||
                    (d.or && d.or.toLowerCase().includes(termo)) ||
                    (d.transportadora && d.transportadora.toLowerCase().includes(termo)) ||
                    (d.observacao && d.observacao.toLowerCase().includes(termo))
                );
                return resultado.length > 0 ? gerarTabelaHTML(resultado, true) : `📋 Nenhuma devolução encontrada para o termo "${termo}".`;
            });
            return '__ENVIADO__';
        }

        // Ordenar Inteligente
        const matchOrdena = lower.match(/^ordenar\s+por\s+(data|nota|status)/i);
        if (matchOrdena) {
            const campo = matchOrdena[1];
            mostrarTabelaComEfeito(() => {
                const listaOrdenada = [...devolucoes];
                if (campo === 'data') {
                    listaOrdenada.sort((a, b) => new Date(b.data) - new Date(a.data));
                } else if (campo === 'nota') {
                    listaOrdenada.sort((a, b) => a.nota.localeCompare(b.nota));
                } else if (campo === 'status') {
                    listaOrdenada.sort((a, b) => a.status.localeCompare(b.status));
                }
                return gerarTabelaHTML(listaOrdenada, true);
            });
            return '__ENVIADO__';
        }

        // Filtrar Inteligente
        if (lower.startsWith('filtrar')) {
            const args = lower.substring(7).trim();
            
            let filterStatus = null;
            let filterTipo = null;
            let startDate = null;
            let endDate = null;
            
            if (args.includes('pendente')) filterStatus = 'pendente';
            else if (args.includes('concluid')) filterStatus = 'concluida';
            
            if (args.includes('total') || args.includes('totais')) filterTipo = 'TOTAL';
            else if (args.includes('parcial') || args.includes('parciais')) filterTipo = 'PARCIAL';
            
            const now = new Date();
            if (args.includes('hoje')) {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            } else if (args.includes('semana')) {
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                endDate = now;
            } else if (args.includes('mes') || args.includes('mês')) {
                const matchMonth = args.match(/(?:mês|mes)\s+(\d{2})\/(\d{4})/i);
                if (matchMonth) {
                    const m = parseInt(matchMonth[1]) - 1;
                    const y = parseInt(matchMonth[2]);
                    startDate = new Date(y, m, 1);
                    endDate = new Date(y, m + 1, 0, 23, 59, 59, 999);
                } else {
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                }
            }
            
            const matchPeriodo = args.match(/(?:periodo|período)\s+(\d{2})\/(\d{2})\s+a\s+(\d{2})\/(\d{2})/i);
            if (matchPeriodo) {
                const d1 = parseInt(matchPeriodo[1]);
                const m1 = parseInt(matchPeriodo[2]) - 1;
                const d2 = parseInt(matchPeriodo[3]);
                const m2 = parseInt(matchPeriodo[4]) - 1;
                const y = now.getFullYear();
                startDate = new Date(y, m1, d1);
                endDate = new Date(y, m2, d2, 23, 59, 59, 999);
            }
            
            mostrarTabelaComEfeito(() => {
                let lista = [...devolucoes];
                if (filterStatus) lista = lista.filter(d => d.status === filterStatus);
                if (filterTipo) lista = lista.filter(d => d.tipo === filterTipo);
                if (startDate && endDate) {
                    lista = lista.filter(d => {
                        const dTime = new Date(d.data).getTime();
                        return dTime >= startDate.getTime() && dTime <= endDate.getTime();
                    });
                }
                return gerarTabelaHTML(lista, true);
            });
            return '__ENVIADO__';
        }
        
        // Ajuda
        if (lower.includes('ajuda devoluções') || lower.includes('como usar devoluções') || lower.includes('comandos devoluções')) {
            enviarMensagem(mostrarAjudaDevolucoes(true));
            return '__ENVIADO__';
        }
        
        // Editar tabela de devoluções
        if (lower.includes('editar devoluções') || lower.includes('gerenciar devoluções') || lower.includes('editar tabela')) {
            mostrarTabelaComEfeito(() => mostrarEdicao());
            return '__ENVIADO__';
        }
        
        // Visualizar devoluções
        if (lower.includes('ver') || lower.includes('mostrar') || lower.includes('listar') || lower.includes('devoluções') || lower.includes('tabela')) {
            
            const buscaMatch = texto.match(/(?:buscar|procurar|mostra a|detalhes da)\s+(NF-\d+)/i);
            if (buscaMatch) {
                const nota = buscaMatch[1];
                const resultado = buscarDevolucao(nota);
                if (resultado.sucesso) {
                    const d = resultado.devolucao;
                    const mensagem = `📋 **DETALHES DA DEVOLUÇÃO**

┌─────────────────────────────────────┐
│ 📌 Nota: ${d.nota}                  │
│ 📊 Tipo: ${d.tipo}                  │
│ 🔢 O.R.: ${d.or}                    │
│ 📄 Esboço: ${d.esboco}              │
│ 📌 Status: ${d.status === 'concluida' ? '✅ CONCLUÍDA' : '⏳ PENDENTE'}
│ 🚛 Transportadora: ${d.transportadora || 'Não informada'}
│ 📅 Data: ${formatarData(d.data)}    │
└─────────────────────────────────────┘`;
                    enviarMensagem(mensagem);
                    return '__ENVIADO__';
                } else {
                    enviarMensagem(resultado.erro);
                    return '__ENVIADO__';
                }
            }
            
            let filtros = {};
            
            if (lower.includes('concluída') || lower.includes('concluídas') || lower.includes('prontas') || lower.includes('finalizadas')) {
                filtros.status = 'concluida';
            } else if (lower.includes('pendente') || lower.includes('pendentes') || lower.includes('faltam')) {
                filtros.status = 'pendente';
            }
            
            if (lower.includes('total') || lower.includes('totais')) {
                filtros.tipo = 'TOTAL';
            } else if (lower.includes('parcial') || lower.includes('parciais')) {
                filtros.tipo = 'PARCIAL';
            }
            
            if (lower.includes('wn')) {
                filtros.transportadora = 'WN';
            } else if (lower.includes('df')) {
                filtros.transportadora = 'DF';
            }
            
            mostrarTabelaComEfeito(() => {
                const res = mostrarDevolucoes('', filtros);
                return res ? res : '📋 Nenhuma devolução encontrada.';
            });
            return '__ENVIADO__';
        }
        
        // Resumo
        if (lower.includes('resumo') || lower.includes('estatística') || lower.includes('quantas') || lower.includes('estatisticas')) {
            enviarMensagem(`📊 **RESUMO DE DEVOLUÇÕES**\n\n${gerarResumoHTML()}`);
            return '__ENVIADO__';
        }
        
        // Adicionar / Cadastrar / Registrar
        if (lower.includes('adicionar') || lower.includes('nova') || lower.includes('cadastrar') || lower.includes('registrar')) {
            const notaMatch = texto.match(/NF-\d+/i);
            const tipoMatch = texto.match(/\b(TOTAL|PARCIAL)\b/i);
            const orMatch = texto.match(/OR-\d+/i);
            const esbocoMatch = texto.match(/ESB-\d+/i);
            const transMatch = texto.match(/\b(WN|DF)\b/i);
            
            // Se tiver todos os dados no comando de texto, cadastra diretamente (retrocompatibilidade)
            if (notaMatch && tipoMatch && orMatch && esbocoMatch) {
                const nota = notaMatch[0];
                const tipo = tipoMatch[0].toUpperCase();
                const or = orMatch[0];
                const esboco = esbocoMatch[0];
                let transportadora = 'Não informada';
                
                if (transMatch) {
                    if (transMatch[0].toUpperCase() === 'WN') transportadora = 'WN Transportadora';
                    else if (transMatch[0].toUpperCase() === 'DF') transportadora = 'DF Transportes';
                } else {
                    const outroMatch = texto.match(/Outro\s*[-:]\s*([^,]+)/i);
                    if (outroMatch) transportadora = `Outro - ${outroMatch[1].trim()}`;
                }
                
                const resultado = adicionarDevolucao(nota, tipo, or, esboco, transportadora);
                if (resultado.sucesso) {
                    const d = resultado.devolucao;
                    const mensagem = `✅ **Devolução adicionada com sucesso!**

📋 **Dados registrados:**
┌─────────────────────────────────────┐
│ 📌 Nota: ${d.nota}                  │
│ 📊 Tipo: ${d.tipo}                  │
│ 🔢 O.R.: ${d.or}                    │
│ 📄 Esboço: ${d.esboco}              │
│ 🚛 Transportadora: ${d.transportadora || 'Não informada'}
│ 📅 Data: ${formatarData(d.data)}    │
└─────────────────────────────────────┘

💡 Digite "ver devoluções" para ver a lista completa.`;
                    enviarMensagem(mensagem);
                    return '__ENVIADO__';
                } else {
                    enviarMensagem(resultado.erro);
                    return '__ENVIADO__';
                }
            } else {
                // Caso contrário (como ao digitar apenas "adicionar devolução" ou "nova devolução"), abre o formulário
                enviarMensagem(mostrarFormularioAdicao());
                return '__ENVIADO__';
            }
        }
        
        // Concluir
        if (lower.includes('concluir') || lower.includes('terminar') || lower.includes('finalizar') || lower.includes('pronta')) {
            const notaMatch = texto.match(/NF-\d+/i);
            if (notaMatch) {
                const nota = notaMatch[0];
                const resultado = concluirDevolucao(nota);
                if (resultado.sucesso) {
                    const d = resultado.devolucao;
                    const mensagem = `✅ **Devolução ${nota} concluída!**

📋 **Dados atualizados:**
┌─────────────────────────────────────┐
│ 📌 Nota: ${d.nota}                  │
│ 📊 Tipo: ${d.tipo}                  │
│ 🔢 O.R.: ${d.or}                    │
│ 📄 Esboço: ${d.esboco}              │
│ 📌 Status: ✅ CONCLUÍDA             │
│ 🚛 Transportadora: ${d.transportadora || 'Não informada'}
│ 📅 Data: ${formatarData(d.data)}    │
└─────────────────────────────────────┘

💡 Digite "ver devoluções" para ver a lista atualizada.`;
                    enviarMensagem(mensagem);
                    return '__ENVIADO__';
                } else {
                    enviarMensagem(resultado.erro);
                    return '__ENVIADO__';
                }
            } else {
                enviarMensagem(`❌ Informe o número da nota para concluir.\nExemplo: "concluir NF-12345"`);
                return '__ENVIADO__';
            }
        }
        
        // Remover
        if (lower.includes('remover') || lower.includes('apagar') || lower.includes('excluir') || lower.includes('deletar')) {
            const notaMatch = texto.match(/NF-\d+/i);
            if (notaMatch) {
                const nota = notaMatch[0];
                const resultado = removerDevolucao(nota);
                if (resultado.sucesso) {
                    enviarMensagem(`🗑️ Devolução ${nota} removida com sucesso!`);
                    return '__ENVIADO__';
                } else {
                    enviarMensagem(resultado.erro);
                    return '__ENVIADO__';
                }
            } else {
                enviarMensagem(`❌ Informe o número da nota para remover.\nExemplo: "remover NF-12345"`);
                return '__ENVIADO__';
            }
        }
        
        // Editar
        if (lower.includes('editar') || lower.includes('corrigir') || lower.includes('alterar') || lower.includes('mudar')) {
            const notaMatch = texto.match(/NF-\d+/i);
            if (notaMatch) {
                const nota = notaMatch[0];
                const dev = devolucoes.find(d => d.nota === nota);
                if (dev) {
                    const mensagem = `✏️ **Editando devolução ${nota}**

📋 **Dados atuais:**
┌─────────────────────────────────────┐
│ 📌 Nota: ${dev.nota}                │
│ 📊 Tipo: ${dev.tipo}                │
│ 🔢 O.R.: ${dev.or}                  │
│ 📄 Esboço: ${dev.esboco}            │
│ 🚛 Transportadora: ${dev.transportadora || 'Não informada'}
│ 📅 Data: ${formatarData(dev.data)}  │
└─────────────────────────────────────┘

💡 Para editar, digite os novos dados:
"editar NF-12345 TOTAL OR-002 ESB-789 WN"

**Campos disponíveis:**
• Tipo: TOTAL ou PARCIAL
• O.R.: OR-xxx
• Esboço: ESB-xxx
• Transportadora: WN, DF ou Outro

Exemplo: "editar NF-12345 PARCIAL OR-002 ESB-890 DF"`;
                    enviarMensagem(mensagem);
                    return '__ENVIADO__';
                } else {
                    enviarMensagem(`❌ Nota ${nota} não encontrada!`);
                    return '__ENVIADO__';
                }
            } else {
                enviarMensagem(`❌ Informe o número da nota para editar.\nExemplo: "editar NF-12345"`);
                return '__ENVIADO__';
            }
        }
        
        return null;
    }

    // ============================================
    // INTEGRAÇÃO COM O CHAT
    // ============================================
    function integrarComChat() {
        const originalProcessar = window.processarComandoNatural;
        
        window.processarComandoNatural = function(mensagem) {
            // Comandos especiais (sempre funcionam)
            if (mensagem.trim() === '/dev.goiassaude') {
                modoAtivo = true;
                salvarModo();
                enviarMensagem(mostrarAjudaDevolucoes(false));
                return '__DEV_OK__';
            }
            
            if (mensagem.trim() === '/dev.off') {
                modoAtivo = false;
                salvarModo();
                enviarMensagem('🔐 Modo Devoluções desativado.');
                return '__DEV_OK__';
            }
            
            // Se modo não está ativo, passa para o conhecimento.js
            if (!modoAtivo) {
                if (typeof originalProcessar === 'function') {
                    return originalProcessar(mensagem);
                }
                return null;
            }
            
            // Modo ativo: tenta processar como comando de devolução
            const resultado = interpretarComando(mensagem);
            
            // Se for comando de devolução, bloqueia o conhecimento.js
            if (resultado === '__ENVIADO__') {
                return '__DEV_OK__';
            }
            
            // Se não for comando de devolução, passa para o conhecimento.js
            if (resultado === null) {
                if (typeof originalProcessar === 'function') {
                    return originalProcessar(mensagem);
                }
                return null;
            }
            
            return resultado;
        };
        
        console.log('✅ Sistema de Devoluções integrado ao chat!');
    }

    // ============================================
    // EXPORTAÇÃO E IMPORTAÇÃO DE DEVOLUÇÕES
    // ============================================
    function exportarDevolucoes() {
        const total = devolucoes.length;
        const concluidas = devolucoes.filter(d => d.status === 'concluida' || d.status === 'concluída').length;
        const pendentes = devolucoes.filter(d => d.status === 'pendente').length;
        const totais = devolucoes.filter(d => d.tipo === 'TOTAL').length;
        const parciais = devolucoes.filter(d => d.tipo === 'PARCIAL').length;

        const devolucoesMapeadas = devolucoes.map(d => ({
            id: d.id,
            nota: d.nota,
            tipo: d.tipo,
            or: d.or,
            esboco: d.esboco || '-',
            status: d.status,
            transportadora: d.transportadora || 'Não informada',
            data: d.data,
            dataFormatada: formatarData(d.data)
        }));

        const exportData = {
            versao: "1.0",
            dataExportacao: new Date().toISOString(),
            totalRegistros: total,
            devolucoes: devolucoesMapeadas
        };

        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const filename = `devolucoes_${day}-${month}-${year}.json`;

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", filename);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        const msgResumo = `📤 **Exportando devoluções...** Resumo: Total: **${total}**, Pendentes: **${pendentes}**, Concluídas: **${concluidas}**, Totais: **${totais}**, Parciais: **${parciais}**. 📥 Arquivo baixado: \`${filename}\``;
        enviarMensagem(msgResumo);
    }

    function validarArquivoDevolucoes(dados) {
        if (!dados || typeof dados !== 'object') return false;
        if (dados.versao !== "1.0" && dados.versao !== 1.0) return false;
        if (!Array.isArray(dados.devolucoes)) return false;
        
        for (let i = 0; i < dados.devolucoes.length; i++) {
            const d = dados.devolucoes[i];
            if (!d || typeof d !== 'object') return false;
            if (!d.nota || !d.tipo || !d.or) return false;
        }
        return true;
    }

    function mostrarOpcoesImportacao(dados, fileName) {
        const dataId = 'import-' + Date.now();
        window.__tempImportData = window.__tempImportData || {};
        window.__tempImportData[dataId] = { dados, fileName };

        const dataExportacaoFmt = formatarData(dados.dataExportacao || new Date());
        const total = dados.totalRegistros || dados.devolucoes.length;

        const htmlOpcoes = `
        <div style="padding: 10px; background: var(--input-bg); border-radius: 12px; border: 1px solid var(--border-color); font-size: 0.8rem; line-height: 1.4; color: var(--text-primary); max-width: 380px;">
            <div>🔍 Arquivo: <strong>"${fileName}"</strong></div>
            <div>📊 Contém: <strong>${total}</strong> devoluções</div>
            <div>📅 Exportado em: <strong>${dataExportacaoFmt}</strong></div>
            <div style="margin-top: 6px; font-weight: bold; color: var(--text-secondary);">Como deseja importar?</div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;">
                <button onclick="window.confirmarImportacaoAction('${dataId}', 'substituir')" style="background: #c0392b; color: white; border: none; padding: 4px 10px; border-radius: 8px; cursor: pointer; font-size: 0.72rem; font-weight: bold;">🔄 Substituir</button>
                <button onclick="window.confirmarImportacaoAction('${dataId}', 'mesclar')" style="background: var(--accent); color: white; border: none; padding: 4px 10px; border-radius: 8px; cursor: pointer; font-size: 0.72rem; font-weight: bold;">📋 Mesclar</button>
                <button onclick="window.confirmarImportacaoAction('${dataId}', 'cancelar')" style="background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-secondary); padding: 4px 10px; border-radius: 8px; cursor: pointer; font-size: 0.72rem;">❌ Cancelar</button>
            </div>
        </div>`;

        if (window.chatLocal && window.chatLocal.estado().chatAberto) {
            const state = window.chatLocal.estado();
            const idAmigo = state.amigoAtual;
            if (idAmigo) {
                state.conversas[idAmigo].push({
                    tipo: 'sistema_opcoes',
                    nome: 'Sistema',
                    conteudo: htmlOpcoes,
                    hora: new Date().toLocaleTimeString(),
                    origem: 'bot'
                });
                window.chatLocal.atualizarInterface();
            }
        } else {
            enviarMensagem(htmlOpcoes);
        }
    }

    function processarImportacao(dados, modo) {
        let adicionadas = 0;
        let mantidas = 0;
        let ignoradas = 0;

        if (modo === 'substituir') {
            devolucoes = [];
            dados.devolucoes.forEach(d => {
                const id = d.id || gerarId();
                devolucoes.push({
                    id: id,
                    nota: d.nota,
                    tipo: d.tipo,
                    or: d.or,
                    esboco: d.esboco || '-',
                    status: d.status,
                    transportadora: d.transportadora || 'Não informada',
                    data: d.data || new Date().toISOString()
                });
                adicionadas++;
            });
            salvarDados();
        } else if (modo === 'mesclar') {
            dados.devolucoes.forEach(d => {
                const index = devolucoes.findIndex(existente => existente.nota === d.nota);
                if (index === -1) {
                    const id = d.id || gerarId();
                    devolucoes.push({
                        id: id,
                        nota: d.nota,
                        tipo: d.tipo,
                        or: d.or,
                        esboco: d.esboco || '-',
                        status: d.status,
                        transportadora: d.transportadora || 'Não informada',
                        data: d.data || new Date().toISOString()
                    });
                    adicionadas++;
                } else {
                    const substituir = confirm(`A nota ${d.nota} já está cadastrada. Deseja substituir os dados existentes? (Ok = Substituir, Cancelar = Manter atual e ignorar importado)`);
                    if (substituir) {
                        devolucoes[index] = {
                            id: devolucoes[index].id,
                            nota: d.nota,
                            tipo: d.tipo,
                            or: d.or,
                            esboco: d.esboco || '-',
                            status: d.status,
                            transportadora: d.transportadora || 'Não informada',
                            data: d.data || devolucoes[index].data
                        };
                        mantidas++;
                    } else {
                        ignoradas++;
                    }
                }
            });
            salvarDados();
        }

        return { adicionadas, mantidas, ignoradas };
    }

    function importarDevolucoesComando() {
        enviarMensagem("📂 **Selecione o arquivo de devoluções**");
        
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        
        fileInput.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    try {
                        const dados = JSON.parse(evt.target.result);
                        if (validarArquivoDevolucoes(dados)) {
                            mostrarOpcoesImportacao(dados, file.name);
                        } else {
                            enviarMensagem("❌ Arquivo inválido. Certifique-se de que é um arquivo de devoluções válido.");
                        }
                    } catch(err) {
                        enviarMensagem("❌ Erro ao ler arquivo JSON.");
                    }
                };
                reader.readAsText(file);
            }
        };
        
        document.body.appendChild(fileInput);
        fileInput.click();
        fileInput.remove();
    }

    window.importarDevolucaoDirect = function(fileDataUrl, fileName) {
        try {
            const base64Part = fileDataUrl.split(',')[1];
            const jsonStr = decodeURIComponent(escape(atob(base64Part)));
            const dados = JSON.parse(jsonStr);
            if (validarArquivoDevolucoes(dados)) {
                mostrarOpcoesImportacao(dados, fileName);
            } else {
                alert("❌ Arquivo de devoluções inválido!");
            }
        } catch(e) {
            alert("❌ Erro ao processar o arquivo.");
        }
    };

    window.confirmarImportacaoAction = function(dataId, action) {
        const item = window.__tempImportData ? window.__tempImportData[dataId] : null;
        if (!item) {
            alert("❌ Dados de importação expirados ou não encontrados.");
            return;
        }

        const { dados } = item;
        
        if (action === 'cancelar') {
            const msgResult = "❌ Importação cancelada pelo usuário.";
            exibirResultadoImportacao(msgResult);
            delete window.__tempImportData[dataId];
            return;
        }

        const resultado = processarImportacao(dados, action);
        
        const msgResult = `✅ Importação concluída! | 📊 Resumo: **${resultado.adicionadas}** adicionadas, **${resultado.mantidas}** já existiam (mantidas/substituídas), **${resultado.ignoradas}** ignoradas (duplicadas) | Total agora: **${devolucoes.length}** devoluções`;
        
        exibirResultadoImportacao(msgResult);
        delete window.__tempImportData[dataId];
    };

    function exibirResultadoImportacao(msgResult) {
        if (window.chatLocal && window.chatLocal.estado().chatAberto) {
            const state = window.chatLocal.estado();
            const idAmigo = state.amigoAtual;
            if (idAmigo) {
                state.conversas[idAmigo].push({
                    tipo: 'sistema_resultado',
                    nome: 'Sistema',
                    conteudo: msgResult,
                    hora: new Date().toLocaleTimeString(),
                    origem: 'bot'
                });
                window.chatLocal.atualizarInterface();
            }
        } else {
            enviarMensagem(msgResult);
        }
    }

    // ============================================
    // OBSERVAÇÕES
    // ============================================
    function adicionarObservacao(nota, texto) {
        const dev = devolucoes.find(d => d.nota === nota);
        if (!dev) return { erro: `❌ Nota ${nota} não encontrada!` };
        dev.observacao = texto;
        salvarDados();
        return { sucesso: true, devolucao: dev };
    }

    function obterObservacao(nota) {
        const dev = devolucoes.find(d => d.nota === nota);
        if (!dev) return { erro: `❌ Nota ${nota} não encontrada!` };
        return { sucesso: true, observacao: dev.observacao || '' };
    }

    function removerObservacao(nota) {
        const dev = devolucoes.find(d => d.nota === nota);
        if (!dev) return { erro: `❌ Nota ${nota} não encontrada!` };
        dev.observacao = '';
        salvarDados();
        return { sucesso: true, devolucao: dev };
    }

    // ============================================
    // ARQUIVAMENTO
    // ============================================
    function arquivarDevolucao(nota) {
        const index = devolucoes.findIndex(d => d.nota === nota);
        if (index === -1) return { erro: `❌ Nota ${nota} não encontrada!` };
        const dev = devolucoes[index];
        if (dev.status !== 'concluida') return { erro: `⚠️ A nota ${nota} precisa estar concluída para ser arquivada!` };
        
        devolucoes.splice(index, 1);
        devolucoesArquivadas.push(dev);
        salvarDados();
        salvarArquivadas();
        return { sucesso: true, devolucao: dev };
    }

    function arquivarTodasConcluidas() {
        const concluidas = devolucoes.filter(d => d.status === 'concluida');
        if (concluidas.length === 0) return { erro: '⚠️ Nenhuma devolução concluída para arquivar.' };
        
        devolucoes = devolucoes.filter(d => d.status !== 'concluida');
        devolucoesArquivadas = devolucoesArquivadas.concat(concluidas);
        salvarDados();
        salvarArquivadas();
        return { sucesso: true, total: concluidas.length };
    }

    function arquivarAnterioresA(dateStr) {
        const parts = dateStr.split('/');
        if (parts.length !== 3) return { erro: '❌ Formato de data inválido. Use DD/MM/AAAA.' };
        const limitDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        
        const anteriores = devolucoes.filter(d => d.status === 'concluida' && new Date(d.data) < limitDate);
        if (anteriores.length === 0) return { erro: `⚠️ Nenhuma devolução concluída antes de ${dateStr} para arquivar.` };
        
        devolucoes = devolucoes.filter(d => !(d.status === 'concluida' && new Date(d.data) < limitDate));
        devolucoesArquivadas = devolucoesArquivadas.concat(anteriores);
        salvarDados();
        salvarArquivadas();
        return { sucesso: true, total: anteriores.length };
    }

    function restaurarDevolucao(nota) {
        const index = devolucoesArquivadas.findIndex(d => d.nota === nota);
        if (index === -1) return { erro: `❌ Nota ${nota} não encontrada no arquivo!` };
        const dev = devolucoesArquivadas[index];
        devolucoesArquivadas.splice(index, 1);
        devolucoes.push(dev);
        salvarDados();
        salvarArquivadas();
        return { sucesso: true, devolucao: dev };
    }

    function limparArquivo() {
        const total = devolucoesArquivadas.length;
        devolucoesArquivadas = [];
        salvarArquivadas();
        return { sucesso: true, total: total };
    }

    function gerarTabelaArquivadasHTML(lista) {
        let html = `
        <div style="overflow-x: auto; margin: 6px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; background: var(--input-bg); border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <thead>
                <tr style="background: #7f8c8d; color: white; font-size: 0.82rem; font-weight: 600;">
                    <th style="padding: 6px 8px; text-align: left; white-space: nowrap;">NOTA</th>
                    <th style="padding: 6px 8px; text-align: left; white-space: nowrap;">TIPO</th>
                    <th style="padding: 6px 8px; text-align: left; white-space: nowrap;">O.R.</th>
                    <th style="padding: 6px 8px; text-align: left; white-space: nowrap;">TRANSPORTADORA</th>
                    <th style="padding: 6px 8px; text-align: center; white-space: nowrap;">AÇÃO</th>
                </tr>
            </thead>
            <tbody>
        `;
        lista.forEach(d => {
            html += `
                <tr style="border-bottom: 1px solid var(--border-color); opacity: 0.8;">
                    <td style="padding: 6px 8px; color: var(--text-primary); font-weight: 600; white-space: nowrap;">${d.nota}</td>
                    <td style="padding: 6px 8px; color: var(--text-primary); white-space: nowrap;">${d.tipo}</td>
                    <td style="padding: 6px 8px; color: var(--text-primary); white-space: nowrap;">${d.or}</td>
                    <td style="padding: 6px 8px; color: var(--text-primary); white-space: nowrap;">${d.transportadora}</td>
                    <td style="padding: 6px 8px; text-align: center; white-space: nowrap;">
                        <button onclick="window.processarComandoNatural('restaurar ${d.nota}')" title="Restaurar para Lista Ativa" style="background: var(--accent); border: none; color: white; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 0.72rem;">🔄 Restaurar</button>
                    </td>
                </tr>
            `;
        });
        html += `</tbody></table></div>`;
        return html;
    }

    // ============================================
    // AGRUPAMENTO
    // ============================================
    function verAgrupado() {
        if (devolucoes.length === 0) return '📋 Nenhuma devolução registrada.';
        
        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const grupos = {};
        
        devolucoes.forEach(d => {
            const date = new Date(d.data);
            const ano = date.getFullYear();
            const mesIndex = date.getMonth();
            const chave = `${ano}-${String(mesIndex).padStart(2, '0')}`;
            const label = `${meses[mesIndex]} de ${ano}`;
            
            if (!grupos[chave]) {
                grupos[chave] = { label: label, itens: [] };
            }
            grupos[chave].itens.push(d);
        });
        
        const chavesOrdenadas = Object.keys(grupos).sort().reverse();
        
        let html = '<div style="display:flex; flex-direction:column; gap:12px; margin: 8px 0;">';
        chavesOrdenadas.forEach(key => {
            const grupo = grupos[key];
            html += `
            <div style="border: 1px solid var(--border-color); border-radius: 12px; padding: 10px; background: rgba(255,255,255,0.02);">
                <div style="font-weight: bold; font-size: 0.92rem; color: var(--accent); margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                    <span>📅 ${grupo.label}</span>
                    <span style="font-size: 0.76rem; background: var(--input-bg); padding: 2px 8px; border-radius: 10px; color: var(--text-secondary);">${grupo.itens.length} devoluções</span>
                </div>
                ${gerarTabelaConteudoHTML(grupo.itens, false)}
            </div>`;
        });
        html += '</div>';
        return html;
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    function init() {
        carregarDados();

        // Sobrescreve o addMessageDirect para garantir exibição direta e instantânea
        window.addMessageDirect = function(role, content, save = true) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', role);
            
            const avatarDiv = document.createElement('div');
            avatarDiv.classList.add('avatar');
            avatarDiv.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-leaf" style="color: var(--accent);" title="VerdeChat"></i>';
            
            const bubbleDiv = document.createElement('div');
            bubbleDiv.classList.add('bubble');
            bubbleDiv.style.whiteSpace = 'pre-wrap';
            bubbleDiv.style.wordBreak = 'break-word';
            bubbleDiv.style.display = 'inline-block';
            
            const now = new Date();
            const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const label = role === 'user' ? '👤 Você' : '🤖 VerdeChat';
            
            if (role === 'bot') {
                const trimmed = content.trim();
                if (trimmed.startsWith('<div') || trimmed.startsWith('<table') || trimmed.startsWith('<span') || trimmed.startsWith('<p') || trimmed.startsWith('<style') || trimmed.startsWith('<!DOCTYPE')) {
                    bubbleDiv.innerHTML = `<div style="font-size: 0.72rem; color: var(--text-secondary); margin-bottom: 4px;">[${timeStr}] 🤖 VerdeChat:</div>` + content;
                    bubbleDiv.style.whiteSpace = 'normal';
                } else {
                    bubbleDiv.innerHTML = `[${timeStr}] 🤖 VerdeChat: ` + formatarTexto(content);
                }
            } else {
                bubbleDiv.textContent = `[${timeStr}] ${label}: ${content}`;
            }
            
            messageDiv.appendChild(avatarDiv);
            messageDiv.appendChild(bubbleDiv);
            
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTo({ behavior: 'smooth', top: chatMessages.scrollHeight });
            }
            
            if (save && role === 'user' && typeof window.saveToHistory === 'function') {
                window.saveToHistory(content);
            }
            if (save && typeof window.currentConversation !== 'undefined') {
                window.currentConversation.push({ role, content });
            }
        };

        // Sobrescreve o addMessageStreaming para interceptar mensagens de bloqueio
        const originalAddMessageStreaming = window.addMessageStreaming;
        window.addMessageStreaming = async function(role, content, save = true) {
            if (content === '__DEV_OK__') {
                return; // Bloqueia a mensagem de fallback fantasma
            }
            if (typeof originalAddMessageStreaming === 'function') {
                return await originalAddMessageStreaming(role, content, save);
            }
        };

        integrarComChat();
        console.log(`📦 Sistema de Devoluções pronto!`);
        console.log(`📊 ${devolucoes.length} devoluções carregadas.`);
        console.log(`🔐 Modo ativo: ${modoAtivo ? 'SIM' : 'NÃO'}`);
        console.log(`💡 Digite "/dev.goiassaude" para ativar o modo.`);
    }
 
    window.devolucoes = {
        listar: listarDevolucoes,
        adicionar: adicionarDevolucao,
        concluir: concluirDevolucao,
        remover: removerDevolucao,
        editar: editarDevolucao,
        buscar: buscarDevolucao,
        atualizarEtapa: atualizarEtapa,
        todos: () => devolucoes,
        arquivadas: () => devolucoesArquivadas,
        modo: () => modoAtivo,
        ativar: () => { modoAtivo = true; salvarModo(); },
        desativar: () => { modoAtivo = false; salvarModo(); }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();