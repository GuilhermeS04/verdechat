// chat-local.js - Chat P2P com PeerJS
// Funciona entre computadores diferentes!
// Com notificações e histórico salvo!

(function() {
    'use strict';

    // ============================================
    // CONFIGURAÇÕES
    // ============================================
    const CONFIG = {
        CHAT_KEY: 'verdechat_dados',
        NOME_KEY: 'verdechat_nome',
        AMIGOS_KEY: 'verdechat_amigos'
    };

    // ============================================
    // ESTADO
    // ============================================
    let state = {
        nome: '',
        amigos: [],
        conversas: {},
        peer: null,
        conexoes: {},
        amigoAtual: null,
        notificacoes: 0,
        chatAberto: false
    };

    // ============================================
    // CARREGAR DADOS SALVOS
    // ============================================
    function carregarDados() {
        try {
            const nome = localStorage.getItem(CONFIG.NOME_KEY);
            if (nome) state.nome = nome;

            const amigos = localStorage.getItem(CONFIG.AMIGOS_KEY);
            if (amigos) state.amigos = JSON.parse(amigos);

            const conversas = localStorage.getItem(CONFIG.CHAT_KEY);
            if (conversas) state.conversas = JSON.parse(conversas);
        } catch (e) {}
    }

    function salvarDados() {
        try {
            localStorage.setItem(CONFIG.NOME_KEY, state.nome);
            localStorage.setItem(CONFIG.AMIGOS_KEY, JSON.stringify(state.amigos));
            localStorage.setItem(CONFIG.CHAT_KEY, JSON.stringify(state.conversas));
        } catch (e) {}
    }

    function salvarNome(nome) {
        state.nome = nome;
        salvarDados();
    }

    // ============================================
    // CARREGAR PEERJS
    // ============================================
    function carregarPeerJS() {
        return new Promise((resolve, reject) => {
            if (typeof Peer !== 'undefined') {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // ============================================
    // CRIAR PEER
    // ============================================
    function criarPeer() {
        if (state.peer) return;

        const nome = state.nome || 'anonimo';
        const id = nome.toLowerCase().replace(/\s/g, '') + '-' + Math.random().toString(36).substring(2, 6);

        state.peer = new Peer(id, { debug: 0 });

        state.peer.on('open', (id) => {
            console.log('✅ Peer criado! ID:', id);
            const display = document.getElementById('meuIdDisplay');
            if (display) {
                display.value = id;
                display.style.color = 'var(--accent)';
            }
            const status = document.getElementById('statusConexao');
            if (status) {
                status.innerHTML = '🟢 Online';
                status.style.color = 'var(--accent)';
            }
            atualizarInterface();
        });

        state.peer.on('connection', (conn) => {
            console.log('🔗 Conexão recebida de:', conn.peer);
            const idAmigo = conn.peer;
            
            state.conexoes[idAmigo] = conn;
            
            let amigo = state.amigos.find(a => a.id === idAmigo);
            if (!amigo) {
                amigo = { id: idAmigo, nome: idAmigo.split('-')[0] || 'Amigo', online: true };
                state.amigos.push(amigo);
                salvarDados();
            } else {
                amigo.online = true;
            }

            configurarConexao(conn, idAmigo);
            atualizarInterface();
            mostrarNotificacao('🔗 ' + amigo.nome + ' se conectou!');
        });

        state.peer.on('error', (err) => {
            console.error('Erro Peer:', err);
            if (err.type === 'unavailable-id') {
                setTimeout(criarPeer, 2000);
            }
        });
    }

    // ============================================
    // CONFIGURAR CONEXÃO
    // ============================================
    function configurarConexao(conn, idAmigo) {
        conn.on('data', (dados) => {
            if (dados.tipo === 'mensagem') {
                receberMensagem(idAmigo, dados);
            } else if (dados.tipo === 'nome') {
                const amigo = state.amigos.find(a => a.id === idAmigo);
                if (amigo) {
                    amigo.nome = dados.nome;
                    salvarDados();
                    atualizarInterface();
                }
            } else if (dados.tipo === 'digitando') {
                mostrarDigitando(idAmigo, dados.estaDigitando);
            }
        });

        conn.on('close', () => {
            console.log('🔌 Conexão fechada:', idAmigo);
            const amigo = state.amigos.find(a => a.id === idAmigo);
            if (amigo) {
                amigo.online = false;
                salvarDados();
                atualizarInterface();
            }
            delete state.conexoes[idAmigo];
        });
    }

    // ============================================
    // CONECTAR A UM AMIGO
    // ============================================
    function conectarAmigo(idAmigo) {
        if (!state.peer) {
            alert('Aguardando criação do ID... Tente novamente em alguns segundos.');
            return;
        }

        if (state.conexoes[idAmigo]) {
            alert('Já conectado a este amigo!');
            return;
        }

        if (idAmigo === state.peer.id) {
            alert('Não pode conectar a si mesmo!');
            return;
        }

        const status = document.getElementById('statusConexao');
        if (status) status.innerHTML = '🔄 Conectando...';

        try {
            const conn = state.peer.connect(idAmigo, { reliable: true });
            
            conn.on('open', () => {
                console.log('✅ Conectado a:', idAmigo);
                state.conexoes[idAmigo] = conn;
                
                let amigo = state.amigos.find(a => a.id === idAmigo);
                if (!amigo) {
                    const nomeAmigo = idAmigo.split('-')[0] || 'Amigo';
                    amigo = { id: idAmigo, nome: nomeAmigo, online: true };
                    state.amigos.push(amigo);
                    salvarDados();
                } else {
                    amigo.online = true;
                    salvarDados();
                }

                conn.send({
                    tipo: 'nome',
                    nome: state.nome
                });

                configurarConexao(conn, idAmigo);
                atualizarInterface();
                mostrarNotificacao('✅ Conectado a ' + amigo.nome + '!');
                if (status) {
                    status.innerHTML = '🟢 Conectado';
                    status.style.color = 'var(--accent)';
                }
            });

            conn.on('error', (err) => {
                console.error('Erro de conexão:', err);
                if (status) status.innerHTML = '❌ Falha na conexão';
                alert('Não foi possível conectar. Verifique o ID e tente novamente.');
            });

        } catch (e) {
            console.error(e);
            alert('Erro ao conectar. Tente novamente.');
            if (status) status.innerHTML = '❌ Erro';
        }
    }

    // ============================================
    // ENVIAR MENSAGEM
    // ============================================
    function enviarMensagem(conteudo) {
        if (!state.amigoAtual) {
            alert('Selecione um amigo para conversar!');
            return;
        }

        const idAmigo = state.amigoAtual;
        const conn = state.conexoes[idAmigo];

        if (!conn) {
            alert('Amigo não está online!');
            return;
        }

        if (!conteudo.trim()) return;

        const msg = {
            tipo: 'mensagem',
            nome: state.nome,
            conteudo: conteudo.trim(),
            hora: new Date().toLocaleTimeString(),
            de: state.nome
        };

        if (!state.conversas[idAmigo]) {
            state.conversas[idAmigo] = [];
        }
        state.conversas[idAmigo].push({
            ...msg,
            origem: 'eu'
        });
        salvarDados();

        try {
            conn.send(msg);
        } catch (e) {
            console.error('Erro ao enviar:', e);
            alert('Erro ao enviar mensagem.');
        }

        atualizarInterface();
        const input = document.getElementById('chatMsgInput');
        if (input) input.value = '';
    }

    // ============================================
    // RECEBER MENSAGEM
    // ============================================
    function receberMensagem(idAmigo, dados) {
        console.log('📨 Mensagem de', idAmigo, ':', dados.conteudo);

        if (!state.conversas[idAmigo]) {
            state.conversas[idAmigo] = [];
        }

        state.conversas[idAmigo].push({
            nome: dados.nome,
            conteudo: dados.conteudo,
            hora: dados.hora,
            origem: 'amigo'
        });

        const amigo = state.amigos.find(a => a.id === idAmigo);
        if (amigo) {
            amigo.ultimaMsg = dados.conteudo;
            salvarDados();
        }

        salvarDados();
        atualizarInterface();

        if (state.amigoAtual !== idAmigo) {
            state.notificacoes++;
            mostrarNotificacao('💬 ' + (amigo ? amigo.nome : idAmigo) + ': ' + dados.conteudo);
            atualizarBadge();
        }
    }

    // ============================================
    // NOTIFICAÇÕES
    // ============================================
    function mostrarNotificacao(texto) {
        if (Notification.permission === 'granted') {
            new Notification('💬 Chat Local', { body: texto });
        }

        const notif = document.getElementById('notificacaoToast');
        if (notif) {
            notif.textContent = texto;
            notif.style.display = 'block';
            notif.style.opacity = '1';
            setTimeout(() => {
                notif.style.opacity = '0';
                setTimeout(() => { notif.style.display = 'none'; }, 300);
            }, 4000);
        }
    }

    function atualizarBadge() {
        const badge = document.getElementById('notificacaoBadge');
        if (badge) {
            const total = state.amigos.reduce((acc, a) => {
                const msgs = state.conversas[a.id] || [];
                return acc + msgs.filter(m => m.origem === 'amigo' && !m.lida).length;
            }, 0);
            if (total > 0) {
                badge.textContent = total > 9 ? '9+' : total;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    function mostrarDigitando(idAmigo, estaDigitando) {
        const status = document.getElementById('amigoStatus');
        if (status && state.amigoAtual === idAmigo) {
            status.innerHTML = estaDigitando ? '✍️ Digitando...' : '🟢 Online';
        }
    }

    // ============================================
    // INTERFACE
    // ============================================
    function criarPainelChat() {
        const overlay = document.createElement('div');
        overlay.id = 'chatOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999;
            display: none;
            justify-content: center;
            align-items: center;
        `;

        const painel = document.createElement('div');
        painel.id = 'chatPanel';
        painel.style.cssText = `
            background: var(--app-bg);
            border-radius: 20px;
            width: 95%;
            max-width: 800px;
            height: 90vh;
            max-height: 650px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0,0,0,0.5);
            border: 1px solid var(--border-color);
            position: relative;
        `;

        overlay.appendChild(painel);
        document.body.appendChild(overlay);
        return painel;
    }

    function atualizarInterface() {
        const painel = document.getElementById('chatPanel');
        if (!painel) return;

        if (!state.nome) {
            painel.innerHTML = renderizarBoasVindas();
            return;
        }

        if (state.amigoAtual) {
            painel.innerHTML = renderizarConversa();
        } else {
            painel.innerHTML = renderizarListaAmigos();
        }
    }

    function renderizarBoasVindas() {
        return `
            <div style="padding:30px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;">
                <div style="font-size:3rem;margin-bottom:15px;">💬</div>
                <h2 style="color:var(--text-primary);margin-bottom:10px;">Chat entre Amigos</h2>
                <p style="color:var(--text-secondary);margin-bottom:8px;font-size:0.9rem;">Digite seu nome para começar</p>
                <p style="color:var(--accent);font-size:0.8rem;margin-bottom:20px;">📡 Comunicação direta entre computadores!</p>
                <div style="display:flex;gap:10px;max-width:350px;width:100%;">
                    <input type="text" id="chatNomeInput" placeholder="Seu nome..." style="flex:1;padding:12px 18px;border-radius:30px;border:1px solid var(--border-color);background:var(--input-bg);color:var(--text-primary);font-size:1rem;">
                    <button id="chatEntrarBtn" style="padding:12px 25px;border-radius:30px;border:none;background:var(--accent);color:white;cursor:pointer;font-weight:bold;">Entrar</button>
                </div>
                <div id="notificacaoToast" style="margin-top:15px;padding:10px 20px;background:var(--accent);color:white;border-radius:12px;display:none;transition:opacity 0.3s;font-size:0.9rem;"></div>
            </div>
        `;
    }

    function renderizarListaAmigos() {
        const amigosLista = state.amigos.map(a => {
            const msgs = state.conversas[a.id] || [];
            const ultima = msgs.length > 0 ? msgs[msgs.length - 1].conteudo : '';
            const novas = msgs.filter(m => m.origem === 'amigo' && !m.lida).length;
            return `
                <div class="amigo-item" data-id="${a.id}" style="padding:12px 16px;border-radius:12px;border:1px solid var(--border-color);cursor:pointer;margin-bottom:8px;transition:all 0.2s;background:var(--chat-bg);">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <span style="color:var(--text-primary);font-weight:500;">${a.nome}</span>
                            <span style="color:${a.online ? 'var(--accent)' : 'var(--text-secondary)'};font-size:0.7rem;margin-left:8px;">${a.online ? '🟢 Online' : '⚫ Offline'}</span>
                            ${ultima ? `<div style="font-size:0.75rem;color:var(--text-secondary);margin-top:2px;">${ultima.substring(0,30)}${ultima.length > 30 ? '...' : ''}</div>` : ''}
                        </div>
                        ${novas > 0 ? `<span style="background:var(--accent);color:white;padding:2px 10px;border-radius:20px;font-size:0.7rem;font-weight:bold;">${novas}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Header -->
                <div style="padding:12px 16px;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="font-size:1.1rem;color:var(--text-primary);font-weight:bold;">💬 Amigos</span>
                        <span style="color:var(--text-secondary);font-size:0.8rem;">👤 ${state.nome}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span id="statusConexao" style="color:var(--text-secondary);font-size:0.75rem;">${state.peer ? '🟢 Online' : '🔄 Carregando...'}</span>
                        <button id="chatFecharBtn" style="background:var(--input-bg);border:1px solid var(--border-color);color:var(--text-secondary);padding:6px 14px;border-radius:20px;cursor:pointer;font-size:0.8rem;">❌ Fechar</button>
                    </div>
                </div>

                <!-- Meu ID -->
                <div style="padding:8px 16px;background:var(--topbar-bg);border-bottom:1px solid var(--border-color);display:flex;gap:8px;align-items:center;flex-shrink:0;flex-wrap:wrap;">
                    <span style="color:var(--text-secondary);font-size:0.75rem;">Seu ID:</span>
                    <input type="text" id="meuIdDisplay" value="${state.peer ? state.peer.id : 'carregando...'}" readonly style="flex:1;min-width:100px;background:var(--input-bg);border:1px solid var(--border-color);border-radius:8px;padding:4px 10px;color:var(--text-primary);font-size:0.8rem;">
                    <button id="copiarIdBtn" style="background:var(--input-bg);border:1px solid var(--border-color);color:var(--text-secondary);padding:4px 12px;border-radius:8px;cursor:pointer;font-size:0.75rem;">📋 Copiar</button>
                </div>

                <!-- Conectar -->
                <div style="padding:8px 16px;background:var(--topbar-bg);border-bottom:1px solid var(--border-color);display:flex;gap:8px;align-items:center;flex-shrink:0;flex-wrap:wrap;">
                    <span style="color:var(--text-secondary);font-size:0.75rem;">Conectar a:</span>
                    <input type="text" id="conectarIdInput" placeholder="ID do amigo..." style="flex:1;min-width:120px;background:var(--input-bg);border:1px solid var(--border-color);border-radius:8px;padding:6px 10px;color:var(--text-primary);font-size:0.8rem;">
                    <button id="conectarBtn" style="background:var(--accent);border:none;color:white;padding:6px 16px;border-radius:8px;cursor:pointer;font-size:0.8rem;">🔗 Conectar</button>
                </div>

                <!-- Lista de amigos -->
                <div style="flex:1;overflow-y:auto;padding:12px 16px;" id="listaAmigosContainer">
                    ${amigosLista || '<div style="color:var(--text-secondary);text-align:center;padding:20px;font-size:0.9rem;">Nenhum amigo ainda.<br>Compartilhe seu ID e conecte-se a alguém!</div>'}
                </div>

                <!-- Notificação Toast -->
                <div id="notificacaoToast" style="position:absolute;bottom:70px;left:50%;transform:translateX(-50%);padding:8px 16px;background:var(--accent);color:white;border-radius:12px;display:none;transition:opacity 0.3s;font-size:0.85rem;z-index:10;max-width:90%;text-align:center;"></div>
            </div>
        `;
    }

    function renderizarConversa() {
        const idAmigo = state.amigoAtual;
        const amigo = state.amigos.find(a => a.id === idAmigo);
        const mensagens = state.conversas[idAmigo] || [];

        // Marcar mensagens como lidas
        mensagens.forEach(m => { if (m.origem === 'amigo') m.lida = true; });
        salvarDados();
        state.notificacoes = 0;
        atualizarBadge();

        const msgsHtml = mensagens.map(m => `
            <div style="margin-bottom:8px;${m.origem === 'eu' ? 'text-align:right;' : ''}">
                <div style="display:inline-block;max-width:80%;padding:8px 14px;border-radius:12px;background:${m.origem === 'eu' ? 'var(--accent)' : 'var(--input-bg)'};color:${m.origem === 'eu' ? 'white' : 'var(--text-primary)'};">
                    <div style="font-size:0.65rem;opacity:0.7;margin-bottom:2px;">${m.nome}</div>
                    <div style="font-size:0.9rem;word-wrap:break-word;">${m.conteudo}</div>
                    <div style="font-size:0.55rem;opacity:0.5;margin-top:2px;">${m.hora}</div>
                </div>
            </div>
        `).join('');

        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Header -->
                <div style="padding:12px 16px;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <button id="voltarBtn" style="background:var(--input-bg);border:1px solid var(--border-color);color:var(--text-secondary);padding:4px 12px;border-radius:20px;cursor:pointer;font-size:0.8rem;">← Voltar</button>
                        <span style="font-size:1rem;color:var(--text-primary);font-weight:bold;">${amigo ? amigo.nome : idAmigo}</span>
                        <span id="amigoStatus" style="color:${amigo && amigo.online ? 'var(--accent)' : 'var(--text-secondary)'};font-size:0.7rem;">${amigo && amigo.online ? '🟢 Online' : '⚫ Offline'}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <button id="chatFecharBtn" style="background:var(--input-bg);border:1px solid var(--border-color);color:var(--text-secondary);padding:6px 14px;border-radius:20px;cursor:pointer;font-size:0.8rem;">❌ Fechar</button>
                    </div>
                </div>

                <!-- Mensagens -->
                <div style="flex:1;overflow-y:auto;padding:12px 16px;" id="chatMensagensContainer">
                    ${msgsHtml || '<div style="color:var(--text-secondary);text-align:center;padding:20px;font-size:0.9rem;">Nenhuma mensagem ainda.<br>Comece a conversar!</div>'}
                </div>

                <!-- Input -->
                <div style="padding:10px 16px;border-top:1px solid var(--border-color);display:flex;gap:8px;flex-shrink:0;">
                    <input type="text" id="chatMsgInput" placeholder="Digite sua mensagem..." style="flex:1;padding:8px 14px;border-radius:30px;border:1px solid var(--border-color);background:var(--input-bg);color:var(--text-primary);font-size:0.9rem;">
                    <button id="chatEnviarMsgBtn" style="padding:8px 18px;border-radius:30px;border:none;background:var(--accent);color:white;cursor:pointer;font-weight:bold;font-size:0.9rem;">Enviar</button>
                </div>

                <!-- Notificação Toast -->
                <div id="notificacaoToast" style="position:absolute;bottom:70px;left:50%;transform:translateX(-50%);padding:8px 16px;background:var(--accent);color:white;border-radius:12px;display:none;transition:opacity 0.3s;font-size:0.85rem;z-index:10;max-width:90%;text-align:center;"></div>
            </div>
        `;
    }

    // ============================================
    // EVENTOS
    // ============================================
    function configurarEventos() {
        // Fechar chat
        document.addEventListener('click', (e) => {
            if (e.target.id === 'chatFecharBtn' || e.target.closest('#chatFecharBtn')) {
                fecharChat();
            }
        });

        // Voltar
        document.addEventListener('click', (e) => {
            if (e.target.id === 'voltarBtn' || e.target.closest('#voltarBtn')) {
                state.amigoAtual = null;
                atualizarInterface();
            }
        });

        // Entrar
        document.addEventListener('click', (e) => {
            if (e.target.id === 'chatEntrarBtn' || e.target.closest('#chatEntrarBtn')) {
                const input = document.getElementById('chatNomeInput');
                if (input && input.value.trim()) {
                    salvarNome(input.value.trim());
                    carregarPeerJS().then(() => {
                        criarPeer();
                        atualizarInterface();
                    }).catch(() => {
                        alert('Erro ao carregar o PeerJS. Verifique sua internet.');
                    });
                }
            }
        });

        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'chatNomeInput' && e.key === 'Enter') {
                document.getElementById('chatEntrarBtn')?.click();
            }
        });

        // Conectar a amigo
        document.addEventListener('click', (e) => {
            if (e.target.id === 'conectarBtn' || e.target.closest('#conectarBtn')) {
                const input = document.getElementById('conectarIdInput');
                if (input && input.value.trim()) {
                    conectarAmigo(input.value.trim());
                    input.value = '';
                } else {
                    alert('Digite o ID do seu amigo!');
                }
            }
        });

        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'conectarIdInput' && e.key === 'Enter') {
                document.getElementById('conectarBtn')?.click();
            }
        });

        // ====== CORREÇÃO PRINCIPAL: CLIQUE NO AMIGO ======
        // Usamos event delegation no container da lista
        document.addEventListener('click', (e) => {
            const item = e.target.closest('.amigo-item');
            if (item) {
                const id = item.getAttribute('data-id');
                if (id) {
                    console.log('🖱️ Clicou no amigo:', id);
                    state.amigoAtual = id;
                    state.notificacoes = 0;
                    atualizarBadge();
                    atualizarInterface();
                }
            }
        });

        // Também suporte para duplo clique (garantia)
        document.addEventListener('dblclick', (e) => {
            const item = e.target.closest('.amigo-item');
            if (item) {
                const id = item.getAttribute('data-id');
                if (id) {
                    console.log('🖱️ Duplo clique no amigo:', id);
                    state.amigoAtual = id;
                    state.notificacoes = 0;
                    atualizarBadge();
                    atualizarInterface();
                }
            }
        });

        // Copiar ID
        document.addEventListener('click', (e) => {
            if (e.target.id === 'copiarIdBtn' || e.target.closest('#copiarIdBtn')) {
                const input = document.getElementById('meuIdDisplay');
                if (input) {
                    navigator.clipboard.writeText(input.value).then(() => {
                        mostrarNotificacao('✅ ID copiado!');
                    }).catch(() => {
                        input.select();
                        document.execCommand('copy');
                        mostrarNotificacao('✅ ID copiado!');
                    });
                }
            }
        });

        // Enviar mensagem
        document.addEventListener('click', (e) => {
            if (e.target.id === 'chatEnviarMsgBtn' || e.target.closest('#chatEnviarMsgBtn')) {
                enviarMensagemDoInput();
            }
        });

        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'chatMsgInput' && e.key === 'Enter') {
                enviarMensagemDoInput();
            }
        });

        // Fechar overlay
        document.addEventListener('click', (e) => {
            if (e.target.id === 'chatOverlay') {
                fecharChat();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.chatAberto) {
                fecharChat();
            }
        });

        // Detectar digitação
        let timeoutDigitando = null;
        document.addEventListener('input', (e) => {
            if (e.target.id === 'chatMsgInput' && state.amigoAtual) {
                const conn = state.conexoes[state.amigoAtual];
                if (conn) {
                    clearTimeout(timeoutDigitando);
                    conn.send({ tipo: 'digitando', estaDigitando: true });
                    timeoutDigitando = setTimeout(() => {
                        conn.send({ tipo: 'digitando', estaDigitando: false });
                    }, 1000);
                }
            }
        });
    }

    function enviarMensagemDoInput() {
        const input = document.getElementById('chatMsgInput');
        if (input) {
            enviarMensagem(input.value);
        }
    }

    // ============================================
    // ABRIR E FECHAR CHAT
    // ============================================
    function abrirChat() {
        if (state.chatAberto) return;
        state.chatAberto = true;

        const overlay = document.getElementById('chatOverlay');
        if (overlay) overlay.style.display = 'flex';

        const chatMain = document.querySelector('.chat-main');
        if (chatMain) chatMain.style.display = 'none';

        carregarDados();

        if (state.nome && !state.peer) {
            carregarPeerJS().then(() => {
                criarPeer();
                atualizarInterface();
            });
        }

        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        atualizarInterface();
    }

    function fecharChat() {
        state.chatAberto = false;
        state.amigoAtual = null;

        const overlay = document.getElementById('chatOverlay');
        if (overlay) overlay.style.display = 'none';

        const chatMain = document.querySelector('.chat-main');
        if (chatMain) chatMain.style.display = 'flex';
    }

    // ============================================
    // BOTÃO NA BARRA
    // ============================================
    function adicionarBotaoChat() {
        const actionButtons = document.querySelector('.action-buttons');
        if (!actionButtons) return;

        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:relative;display:inline-flex;';

        const btn = document.createElement('div');
        btn.className = 'action-btn';
        btn.id = 'chatToggleBtn';
        btn.title = 'Abrir Chat';
        btn.style.cssText = `
            background: var(--input-bg);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            width: 38px;
            height: 38px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            cursor: pointer;
            transition: 0.2s;
            flex-shrink: 0;
        `;
        btn.innerHTML = '<i class="fas fa-comments"></i>';
        btn.onmouseover = () => { btn.style.background = 'var(--accent)'; btn.style.color = 'white'; };
        btn.onmouseout = () => { btn.style.background = 'var(--input-bg)'; btn.style.color = 'var(--text-secondary)'; };
        btn.onclick = abrirChat;

        const badge = document.createElement('span');
        badge.id = 'notificacaoBadge';
        badge.style.cssText = `
            position: absolute;
            top: -4px;
            right: -4px;
            background: red;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            font-size: 10px;
            font-weight: bold;
            display: none;
            align-items: center;
            justify-content: center;
            border: 2px solid var(--app-bg);
        `;
        badge.textContent = '0';

        wrapper.appendChild(btn);
        wrapper.appendChild(badge);
        actionButtons.appendChild(wrapper);

        console.log('✅ Botão Chat adicionado!');
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    function init() {
        carregarDados();
        criarPainelChat();
        adicionarBotaoChat();
        configurarEventos();

        if (state.nome) {
            carregarPeerJS().then(() => {
                criarPeer();
            }).catch(() => {});
        }

        console.log('✅ Chat Local carregado!');
        console.log('📡 Funciona entre computadores diferentes!');
        console.log('💡 Clique em um amigo para conversar!');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.chatLocal = {
        abrir: abrirChat,
        fechar: fecharChat,
        estado: () => state
    };
})();