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

    function carregarDados() {
        try {
            const dados = localStorage.getItem(STORAGE_KEY);
            if (dados) {
                devolucoes = JSON.parse(dados);
            } else {
                devolucoes = [];
                salvarDados();
            }
        } catch (e) {
            devolucoes = [];
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
        
        const nova = {
            id: gerarId(),
            nota: nota.trim(),
            tipo: tipo,
            or: or.trim(),
            esboco: cleanEsboco,
            status: finalStatus,
            transportadora: transportadora || 'Não informada',
            data: new Date().toISOString()
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

    function gerarTabelaHTML(lista, comAcoes = false) {
        if (!lista || lista.length === 0) {
            return '📋 Nenhuma devolução encontrada.';
        }
        
        let html = `
        <div style="overflow-x: auto; margin: 6px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; background: var(--input-bg); border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <thead>
                <tr style="background: var(--accent); color: white; font-size: 0.82rem; font-weight: 600;">
                    <th style="padding: 6px 8px; text-align: left; white-space: nowrap;">NOTA</th>
                    <th style="padding: 6px 8px; text-align: left; white-space: nowrap;">TIPO</th>
                    <th style="padding: 6px 8px; text-align: left; white-space: nowrap;">O.R.</th>
                    <th style="padding: 6px 8px; text-align: left; white-space: nowrap;">STATUS</th>
                    <th style="padding: 6px 8px; text-align: left; white-space: nowrap;">TRANSPORTADORA</th>
                    ${comAcoes ? '<th style="padding: 6px 8px; text-align: center; white-space: nowrap;">AÇÕES</th>' : ''}
                </tr>
            </thead>
            <tbody>
        `;
        
        lista.forEach(d => {
            const statusBadge = d.status === 'concluida' 
                ? `<span style="padding: 2px 6px; border-radius: 4px; font-size: 0.72rem; font-weight: 600; background: rgba(46, 204, 113, 0.15); color: #2ecc71; white-space: nowrap;">✅ CONCLUÍDA</span>`
                : `<span style="padding: 2px 6px; border-radius: 4px; font-size: 0.72rem; font-weight: 600; background: rgba(243, 156, 18, 0.15); color: #f39c12; white-space: nowrap;">⏳ PENDENTE</span>`;
            
            html += `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 6px 8px; color: var(--text-primary); font-weight: 600; white-space: nowrap;">${d.nota}</td>
                    <td style="padding: 6px 8px; color: var(--text-primary); white-space: nowrap;">${d.tipo}</td>
                    <td style="padding: 6px 8px; color: var(--text-primary); white-space: nowrap;">${d.or}</td>
                    <td style="padding: 6px 8px; white-space: nowrap;">${statusBadge}</td>
                    <td style="padding: 6px 8px; color: var(--text-primary); white-space: normal; word-break: keep-all; overflow-wrap: break-word;">${d.transportadora || 'Não informada'}</td>
                    ${comAcoes ? `
                        <td style="padding: 6px 8px; text-align: center; white-space: nowrap;">
                            <div style="display: flex; gap: 3px; justify-content: center; align-items: center;">
                                ${d.status === 'pendente' ? `<button onclick="window.devolucoesAcao('concluir', '${d.nota}')" title="Concluir" style="background: var(--accent); border: none; color: white; padding: 3px 6px; border-radius: 4px; cursor: pointer; font-size: 0.72rem;">✅</button>` : ''}
                                <button onclick="window.devolucoesAcao('editar', '${d.nota}')" title="Editar" style="background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); padding: 3px 6px; border-radius: 4px; cursor: pointer; font-size: 0.72rem;">✏️</button>
                                <button onclick="window.devolucoesAcao('remover', '${d.nota}')" title="Remover" style="background: #c0392b; border: none; color: white; padding: 3px 6px; border-radius: 4px; cursor: pointer; font-size: 0.72rem;">🗑️</button>
                            </div>
                        </td>
                    ` : ''}
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

    // ============================================
    // AÇÕES PARA OS BOTÕES
    // ============================================
    window.devolucoesAcao = function(acao, nota) {
        let resultado;
        let mensagem = '';
        
        switch(acao) {
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

    function mostrarAjuda() {
        if (!modoAtivo) return null;
        
        return `📚 **AJUDA - MODO DEVOLUÇÕES**

📊 **VISUALIZAR:**
• "ver devoluções" - Mostrar todas
• "ver pendentes" - Só pendentes
• "ver concluídas" - Só concluídas
• "ver totais" - Só totais
• "ver parciais" - Só parciais
• "ver WN" - Só WN Transportadora
• "ver DF" - Só DF Transportes
• "resumo devoluções" - Resumo estatístico
• "buscar NF-xxxxx" - Buscar nota

✏️ **GERENCIAR:**
• "adicionar devolução" - Abrir formulário
• "concluir NF-xxxxx" - Concluir
• "editar NF-xxxxx" - Editar
• "remover NF-xxxxx" - Remover
• "editar devoluções" - Tabela com ações

🔐 **SAIR:**
• "/dev.off" - Desativar modo

💡 **Dica:** Você pode combinar filtros!
"ver totais pendentes" - Mostra totais pendentes
"ver WN concluídas" - Mostra WN concluídas`;
    }

    // ============================================
    // INTERPRETAÇÃO DE LINGUAGEM NATURAL
    // ============================================
    function interpretarComando(texto) {
        const lower = texto.toLowerCase().trim();
        
        // Ajuda
        if (lower.includes('ajuda devoluções') || lower.includes('como usar devoluções') || lower.includes('comandos devoluções')) {
            enviarMensagem(mostrarAjuda());
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
                enviarMensagem(`🔐 **MODO DEVOLUÇÕES ATIVADO!**

📦 Agora você pode usar todos os comandos de devolução em linguagem natural.

📚 Digite **"ajuda devoluções"** para ver todos os comandos disponíveis.

💡 **Exemplos:**

• "ver devoluções" - Mostrar todas
• "ver pendentes" - Só pendentes
• "adicionar devolução" - Abrir formulário
• "concluir NF-12345" - Concluir
• "editar devoluções" - Gerenciar com ações

🔐 Digite **"/dev.off"** para desativar.`);
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
            avatarDiv.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
            
            const bubbleDiv = document.createElement('div');
            bubbleDiv.classList.add('bubble');
            bubbleDiv.style.whiteSpace = 'pre-wrap';
            bubbleDiv.style.wordBreak = 'break-word';
            bubbleDiv.style.display = 'inline-block';
            
            if (role === 'bot') {
                bubbleDiv.innerHTML = formatarTexto(content);
            } else {
                bubbleDiv.textContent = content;
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
        todos: () => devolucoes,
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