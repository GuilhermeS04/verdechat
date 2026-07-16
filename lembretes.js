// chat-local.js - Sistema de Chat Local (Nível 2)
// Adicione este arquivo na mesma pasta do index.html
// NÃO precisa alterar nada no index.html!

(function() {
    'use strict';

    // ============================================
    // CONFIGURAÇÕES
    // ============================================
    const CONFIG = {
        gruposPadrao: [
            { id: 'devs', nome: '💻 Devs' },
            { id: 'trabalho', nome: '🏢 Trabalho' },
            { id: 'familia', nome: '👨‍👩‍👧‍👦 Família' },
            { id: 'amigos', nome: '🎮 Amigos' },
            { id: 'estudos', nome: '📚 Estudos' }
        ],
        pessoasPadrao: ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Lucas', 'Fernanda', 'Rafael'],
        CHAT_KEY: 'verdechat_dados',
        NOME_KEY: 'verdechat_nome'
    };

    // ============================================
    // ESTADO DO CHAT
    // ============================================
    let chatState = {
        nome: '',
        grupos: [],
        conversas: [],
        mensagens: {},
        grupoAtual: null,
        privadoAtual: null,
        abaAtiva: 'grupos'
    };

    // ============================================
    // ELEMENTOS DOM
    // ============================================
    let elementos = {};
    let chatAberto = false;

    // ============================================
    // CARREGAR DADOS SALVOS
    // ============================================
    function carregarDados() {
        try {
            const saved = localStorage.getItem(CONFIG.CHAT_KEY);
            if (saved) {
                const dados = JSON.parse(saved);
                chatState.grupos = dados.grupos || CONFIG.gruposPadrao;
                chatState.conversas = dados.conversas || [];
                chatState.mensagens = dados.mensagens || {};
            } else {
                chatState.grupos = CONFIG.gruposPadrao;
                chatState.conversas = [];
                chatState.mensagens = {};
            }
        } catch (e) {
            chatState.grupos = CONFIG.gruposPadrao;
            chatState.conversas = [];
            chatState.mensagens = {};
        }
    }

    function salvarDados() {
        try {
            localStorage.setItem(CONFIG.CHAT_KEY, JSON.stringify({
                grupos: chatState.grupos,
                conversas: chatState.conversas,
                mensagens: chatState.mensagens
            }));
        } catch (e) {}
    }

    function carregarNome() {
        try {
            const nome = localStorage.getItem(CONFIG.NOME_KEY);
            if (nome) chatState.nome = nome;
        } catch (e) {}
    }

    function salvarNome(nome) {
        try {
            localStorage.setItem(CONFIG.NOME_KEY, nome);
            chatState.nome = nome;
        } catch (e) {}
    }

    // ============================================
    // SISTEMA DE COMUNICAÇÃO (BroadcastChannel)
    // ============================================
    let channel = null;

    function iniciarBroadcast() {
        try {
            channel = new BroadcastChannel('verdechat');
            channel.onmessage = (e) => {
                const msg = e.data;
                if (msg.tipo === 'mensagem') {
                    receberMensagemRemota(msg);
                } else if (msg.tipo === 'usuario_online') {
                    atualizarUsuariosOnline(msg.usuario);
                }
            };
            // Anunciar que está online
            if (chatState.nome) {
                setTimeout(() => {
                    channel.postMessage({
                        tipo: 'usuario_online',
                        usuario: chatState.nome
                    });
                }, 500);
            }
        } catch (e) {
            console.log('BroadcastChannel não suportado, chat apenas local');
        }
    }

    function enviarMensagemBroadcast(mensagem) {
        if (channel) {
            try {
                channel.postMessage({
                    tipo: 'mensagem',
                    ...mensagem
                });
            } catch (e) {}
        }
    }

    function receberMensagemRemota(msg) {
        const { destino, origem, conteudo, tipo, grupo } = msg;
        
        // Se for mensagem de grupo
        if (tipo === 'grupo' && grupo) {
            if (!chatState.mensagens[grupo]) {
                chatState.mensagens[grupo] = [];
            }
            chatState.mensagens[grupo].push({
                origem: origem,
                conteudo: conteudo,
                hora: new Date().toLocaleTimeString(),
                tipo: 'grupo'
            });
            salvarDados();
            if (chatAberto) {
                renderizarChat();
            }
        }
        // Se for mensagem privada
        else if (tipo === 'privado') {
            const chave = [origem, destino].sort().join('_');
            if (!chatState.mensagens[chave]) {
                chatState.mensagens[chave] = [];
            }
            chatState.mensagens[chave].push({
                origem: origem,
                conteudo: conteudo,
                hora: new Date().toLocaleTimeString(),
                tipo: 'privado'
            });
            salvarDados();
            if (chatAberto) {
                renderizarChat();
            }
        }
    }

    function atualizarUsuariosOnline(usuario) {
        // Simplesmente atualiza a lista de online
        if (chatAberto) {
            renderizarChat();
        }
    }

    // ============================================
    // FUNÇÕES DO CHAT
    // ============================================
    function enviarMensagem(conteudo, tipo, destino, grupo) {
        if (!conteudo.trim()) return;

        const mensagem = {
            origem: chatState.nome,
            conteudo: conteudo.trim(),
            hora: new Date().toLocaleTimeString(),
            tipo: tipo,
            destino: destino,
            grupo: grupo
        };

        // Salvar localmente
        let chave = '';
        if (tipo === 'grupo' && grupo) {
            chave = grupo;
            if (!chatState.mensagens[chave]) {
                chatState.mensagens[chave] = [];
            }
            chatState.mensagens[chave].push({
                origem: chatState.nome,
                conteudo: conteudo.trim(),
                hora: new Date().toLocaleTimeString(),
                tipo: 'grupo'
            });
        } else if (tipo === 'privado' && destino) {
            chave = [chatState.nome, destino].sort().join('_');
            if (!chatState.mensagens[chave]) {
                chatState.mensagens[chave] = [];
            }
            chatState.mensagens[chave].push({
                origem: chatState.nome,
                conteudo: conteudo.trim(),
                hora: new Date().toLocaleTimeString(),
                tipo: 'privado'
            });
        }

        salvarDados();

        // Enviar via broadcast
        enviarMensagemBroadcast({
            origem: chatState.nome,
            conteudo: conteudo.trim(),
            tipo: tipo,
            destino: destino,
            grupo: grupo
        });

        renderizarChat();
    }

    function criarGrupo(nome) {
        const id = nome.toLowerCase().replace(/\s/g, '_') + '_' + Date.now();
        const novoGrupo = { id: id, nome: nome };
        chatState.grupos.push(novoGrupo);
        chatState.mensagens[id] = [];
        salvarDados();
        renderizarChat();
    }

    function entrarGrupo(id) {
        chatState.grupoAtual = id;
        chatState.privadoAtual = null;
        renderizarChat();
    }

    function entrarPrivado(pessoa) {
        chatState.privadoAtual = pessoa;
        chatState.grupoAtual = null;
        renderizarChat();
    }

    function voltarLista() {
        chatState.grupoAtual = null;
        chatState.privadoAtual = null;
        renderizarChat();
    }

    function getMensagensGrupo(id) {
        return chatState.mensagens[id] || [];
    }

    function getMensagensPrivado(pessoa) {
        const chave = [chatState.nome, pessoa].sort().join('_');
        return chatState.mensagens[chave] || [];
    }

    // ============================================
    // INTERFACE DO CHAT
    // ============================================
    function criarPainelChat() {
        // Criar overlay do chat
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
            max-width: 900px;
            height: 90vh;
            max-height: 700px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0,0,0,0.5);
            border: 1px solid var(--border-color);
        `;

        overlay.appendChild(painel);
        document.body.appendChild(overlay);

        return painel;
    }

    function renderizarChat() {
        const painel = document.getElementById('chatPanel');
        if (!painel) return;

        // Se não tem nome, mostrar tela de boas-vindas
        if (!chatState.nome) {
            painel.innerHTML = renderizarBoasVindas();
            return;
        }

        // Se está em um grupo ou conversa privada
        if (chatState.grupoAtual) {
            painel.innerHTML = renderizarConversaGrupo();
            return;
        }
        if (chatState.privadoAtual) {
            painel.innerHTML = renderizarConversaPrivada();
            return;
        }

        // Tela principal
        painel.innerHTML = renderizarPrincipal();
    }

    function renderizarBoasVindas() {
        return `
            <div style="padding:40px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;">
                <div style="font-size:4rem;margin-bottom:20px;">💬</div>
                <h2 style="color:var(--text-primary);margin-bottom:10px;">Bem-vindo ao Chat Local!</h2>
                <p style="color:var(--text-secondary);margin-bottom:30px;">Digite seu nome ou apelido para começar</p>
                <div style="display:flex;gap:10px;max-width:400px;width:100%;">
                    <input type="text" id="chatNomeInput" placeholder="Seu nome..." style="flex:1;padding:12px 20px;border-radius:30px;border:1px solid var(--border-color);background:var(--input-bg);color:var(--text-primary);font-size:1rem;">
                    <button id="chatEntrarBtn" style="padding:12px 30px;border-radius:30px;border:none;background:var(--accent);color:white;cursor:pointer;font-weight:bold;">Entrar</button>
                </div>
            </div>
        `;
    }

    function renderizarPrincipal() {
        const gruposLista = chatState.grupos.map(g => `
            <div class="chat-grupo-item" data-id="${g.id}" style="padding:12px 16px;border-radius:12px;border:1px solid var(--border-color);cursor:pointer;margin-bottom:8px;transition:all 0.2s;background:var(--chat-bg);">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="color:var(--text-primary);font-weight:500;">${g.nome}</span>
                    <span style="color:var(--text-secondary);font-size:0.8rem;">🔓 Público</span>
                </div>
            </div>
        `).join('');

        const privadosLista = CONFIG.pessoasPadrao
            .filter(p => p !== chatState.nome)
            .map(p => {
                const chave = [chatState.nome, p].sort().join('_');
                const msgs = chatState.mensagens[chave] || [];
                const novas = msgs.filter(m => m.origem !== chatState.nome && !m.lida).length;
                return `
                    <div class="chat-privado-item" data-pessoa="${p}" style="padding:12px 16px;border-radius:12px;border:1px solid var(--border-color);cursor:pointer;margin-bottom:8px;transition:all 0.2s;background:var(--chat-bg);">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <span style="color:var(--text-primary);font-weight:500;">👤 ${p}</span>
                            ${novas > 0 ? `<span style="background:var(--accent);color:white;padding:2px 10px;border-radius:20px;font-size:0.8rem;">${novas} nova${novas > 1 ? 's' : ''}</span>` : '<span style="color:var(--text-secondary);font-size:0.8rem;">🔒 Privado</span>'}
                        </div>
                    </div>
                `;
            }).join('');

        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Header -->
                <div style="padding:16px 20px;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-size:1.2rem;color:var(--text-primary);font-weight:bold;">💬 Chat Local</span>
                        <span style="color:var(--text-secondary);font-size:0.9rem;">👤 ${chatState.nome}</span>
                    </div>
                    <button id="chatFecharBtn" style="background:var(--input-bg);border:1px solid var(--border-color);color:var(--text-secondary);padding:8px 16px;border-radius:20px;cursor:pointer;font-size:0.9rem;transition:0.2s;">
                        ❌ Fechar Chat
                    </button>
                </div>

                <!-- Tabs -->
                <div style="display:flex;gap:4px;padding:12px 20px;border-bottom:1px solid var(--border-color);flex-shrink:0;flex-wrap:wrap;">
                    <button class="chat-tab-btn ${chatState.abaAtiva === 'grupos' ? 'active' : ''}" data-tab="grupos" style="padding:8px 20px;border-radius:20px;border:1px solid var(--border-color);background:${chatState.abaAtiva === 'grupos' ? 'var(--accent)' : 'var(--input-bg)'};color:${chatState.abaAtiva === 'grupos' ? 'white' : 'var(--text-secondary)'};cursor:pointer;transition:0.2s;">
                        📁 Grupos
                    </button>
                    <button class="chat-tab-btn ${chatState.abaAtiva === 'privados' ? 'active' : ''}" data-tab="privados" style="padding:8px 20px;border-radius:20px;border:1px solid var(--border-color);background:${chatState.abaAtiva === 'privados' ? 'var(--accent)' : 'var(--input-bg)'};color:${chatState.abaAtiva === 'privados' ? 'white' : 'var(--text-secondary)'};cursor:pointer;transition:0.2s;">
                        👤 Privado
                    </button>
                    <button id="chatCriarGrupoBtn" style="padding:8px 20px;border-radius:20px;border:1px dashed var(--accent);background:transparent;color:var(--accent);cursor:pointer;transition:0.2s;">
                        ➕ Criar Grupo
                    </button>
                </div>

                <!-- Conteúdo -->
                <div style="flex:1;overflow-y:auto;padding:16px 20px;">
                    ${chatState.abaAtiva === 'grupos' ? `
                        <div style="margin-bottom:12px;color:var(--text-secondary);font-size:0.9rem;">📁 Grupos Públicos (todos podem entrar)</div>
                        ${gruposLista || '<div style="color:var(--text-secondary);text-align:center;padding:20px;">Nenhum grupo criado ainda</div>'}
                    ` : `
                        <div style="margin-bottom:12px;color:var(--text-secondary);font-size:0.9rem;">👤 Conversas Privadas</div>
                        ${privadosLista || '<div style="color:var(--text-secondary);text-align:center;padding:20px;">Nenhuma conversa privada</div>'}
                    `}
                </div>

                <div style="padding:12px 20px;border-top:1px solid var(--border-color);flex-shrink:0;color:var(--text-secondary);font-size:0.8rem;text-align:center;">
                    🌐 Conectado à rede local • ${chatState.nome}
                </div>
            </div>
        `;
    }

    function renderizarConversaGrupo() {
        const grupo = chatState.grupos.find(g => g.id === chatState.grupoAtual);
        if (!grupo) return renderizarPrincipal();

        const mensagens = getMensagensGrupo(grupo.id);
        const msgsHtml = mensagens.map(m => `
            <div style="margin-bottom:8px;${m.origem === chatState.nome ? 'text-align:right;' : ''}">
                <div style="display:inline-block;max-width:80%;padding:8px 14px;border-radius:12px;background:${m.origem === chatState.nome ? 'var(--accent)' : 'var(--input-bg)'};color:${m.origem === chatState.nome ? 'white' : 'var(--text-primary)'};">
                    <div style="font-size:0.7rem;opacity:0.7;margin-bottom:2px;">${m.origem}</div>
                    <div>${m.conteudo}</div>
                    <div style="font-size:0.6rem;opacity:0.5;margin-top:2px;">${m.hora}</div>
                </div>
            </div>
        `).join('');

        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Header -->
                <div style="padding:12px 20px;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <button id="chatVoltarBtn" style="background:var(--input-bg);border:1px solid var(--border-color);color:var(--text-secondary);padding:6px 14px;border-radius:20px;cursor:pointer;font-size:0.8rem;">← Voltar</button>
                        <span style="color:var(--text-primary);font-weight:bold;">${grupo.nome}</span>
                        <span style="color:var(--text-secondary);font-size:0.8rem;">🔓 Público</span>
                    </div>
                    <span style="color:var(--text-secondary);font-size:0.8rem;">👤 ${chatState.nome}</span>
                </div>

                <!-- Mensagens -->
                <div style="flex:1;overflow-y:auto;padding:16px 20px;">
                    ${msgsHtml || '<div style="color:var(--text-secondary);text-align:center;padding:20px;">Nenhuma mensagem ainda. Seja o primeiro!</div>'}
                </div>

                <!-- Input -->
                <div style="padding:12px 20px;border-top:1px solid var(--border-color);display:flex;gap:10px;flex-shrink:0;">
                    <input type="text" id="chatMsgInput" placeholder="Digite sua mensagem..." style="flex:1;padding:10px 16px;border-radius:30px;border:1px solid var(--border-color);background:var(--input-bg);color:var(--text-primary);font-size:0.95rem;">
                    <button id="chatEnviarMsgBtn" style="padding:10px 24px;border-radius:30px;border:none;background:var(--accent);color:white;cursor:pointer;font-weight:bold;">Enviar</button>
                </div>
            </div>
        `;
    }

    function renderizarConversaPrivada() {
        const pessoa = chatState.privadoAtual;
        const mensagens = getMensagensPrivado(pessoa);
        const msgsHtml = mensagens.map(m => `
            <div style="margin-bottom:8px;${m.origem === chatState.nome ? 'text-align:right;' : ''}">
                <div style="display:inline-block;max-width:80%;padding:8px 14px;border-radius:12px;background:${m.origem === chatState.nome ? 'var(--accent)' : 'var(--input-bg)'};color:${m.origem === chatState.nome ? 'white' : 'var(--text-primary)'};">
                    <div style="font-size:0.7rem;opacity:0.7;margin-bottom:2px;">${m.origem}</div>
                    <div>${m.conteudo}</div>
                    <div style="font-size:0.6rem;opacity:0.5;margin-top:2px;">${m.hora}</div>
                </div>
            </div>
        `).join('');

        return `
            <div style="display:flex;flex-direction:column;height:100%;">
                <!-- Header -->
                <div style="padding:12px 20px;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <button id="chatVoltarBtn" style="background:var(--input-bg);border:1px solid var(--border-color);color:var(--text-secondary);padding:6px 14px;border-radius:20px;cursor:pointer;font-size:0.8rem;">← Voltar</button>
                        <span style="color:var(--text-primary);font-weight:bold;">👤 ${pessoa}</span>
                        <span style="color:var(--text-secondary);font-size:0.8rem;">🔒 Privado</span>
                    </div>
                    <span style="color:var(--text-secondary);font-size:0.8rem;">👤 ${chatState.nome}</span>
                </div>

                <!-- Mensagens -->
                <div style="flex:1;overflow-y:auto;padding:16px 20px;">
                    ${msgsHtml || '<div style="color:var(--text-secondary);text-align:center;padding:20px;">Nenhuma mensagem ainda. Comece a conversar!</div>'}
                </div>

                <!-- Input -->
                <div style="padding:12px 20px;border-top:1px solid var(--border-color);display:flex;gap:10px;flex-shrink:0;">
                    <input type="text" id="chatMsgInput" placeholder="Digite sua mensagem privada..." style="flex:1;padding:10px 16px;border-radius:30px;border:1px solid var(--border-color);background:var(--input-bg);color:var(--text-primary);font-size:0.95rem;">
                    <button id="chatEnviarMsgBtn" style="padding:10px 24px;border-radius:30px;border:none;background:var(--accent);color:white;cursor:pointer;font-weight:bold;">Enviar</button>
                </div>
            </div>
        `;
    }

    // ============================================
    // EVENTOS DO CHAT
    // ============================================
    function configurarEventos() {
        // Botão de fechar
        document.addEventListener('click', (e) => {
            if (e.target.id === 'chatFecharBtn' || e.target.closest('#chatFecharBtn')) {
                fecharChat();
            }
        });

        // Botão de voltar
        document.addEventListener('click', (e) => {
            if (e.target.id === 'chatVoltarBtn' || e.target.closest('#chatVoltarBtn')) {
                voltarLista();
            }
        });

        // Entrar no chat
        document.addEventListener('click', (e) => {
            if (e.target.id === 'chatEntrarBtn' || e.target.closest('#chatEntrarBtn')) {
                const input = document.getElementById('chatNomeInput');
                if (input && input.value.trim()) {
                    salvarNome(input.value.trim());
                    renderizarChat();
                    iniciarBroadcast();
                }
            }
        });

        // Enter no nome
        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'chatNomeInput' && e.key === 'Enter') {
                const btn = document.getElementById('chatEntrarBtn');
                if (btn) btn.click();
            }
        });

        // Tabs
        document.addEventListener('click', (e) => {
            const tab = e.target.closest('.chat-tab-btn');
            if (tab) {
                const tabName = tab.getAttribute('data-tab');
                if (tabName) {
                    chatState.abaAtiva = tabName;
                    renderizarChat();
                }
            }
        });

        // Entrar em grupo
        document.addEventListener('click', (e) => {
            const item = e.target.closest('.chat-grupo-item');
            if (item) {
                const id = item.getAttribute('data-id');
                if (id) entrarGrupo(id);
            }
        });

        // Entrar em conversa privada
        document.addEventListener('click', (e) => {
            const item = e.target.closest('.chat-privado-item');
            if (item) {
                const pessoa = item.getAttribute('data-pessoa');
                if (pessoa) entrarPrivado(pessoa);
            }
        });

        // Criar grupo
        document.addEventListener('click', (e) => {
            if (e.target.id === 'chatCriarGrupoBtn' || e.target.closest('#chatCriarGrupoBtn')) {
                const nome = prompt('Digite o nome do novo grupo:');
                if (nome && nome.trim()) {
                    criarGrupo(nome.trim());
                }
            }
        });

        // Enviar mensagem
        document.addEventListener('click', (e) => {
            if (e.target.id === 'chatEnviarMsgBtn' || e.target.closest('#chatEnviarMsgBtn')) {
                enviarMensagemChat();
            }
        });

        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'chatMsgInput' && e.key === 'Enter') {
                enviarMensagemChat();
            }
        });

        // Fechar clicando no overlay
        document.addEventListener('click', (e) => {
            if (e.target.id === 'chatOverlay') {
                fecharChat();
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && chatAberto) {
                fecharChat();
            }
        });
    }

    function enviarMensagemChat() {
        const input = document.getElementById('chatMsgInput');
        if (!input) return;
        const conteudo = input.value.trim();
        if (!conteudo) return;

        if (chatState.grupoAtual) {
            enviarMensagem(conteudo, 'grupo', null, chatState.grupoAtual);
        } else if (chatState.privadoAtual) {
            enviarMensagem(conteudo, 'privado', chatState.privadoAtual, null);
        }
        input.value = '';
    }

    // ============================================
    // ABRIR E FECHAR CHAT
    // ============================================
    function abrirChat() {
        if (chatAberto) return;
        chatAberto = true;

        const overlay = document.getElementById('chatOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }

        // Esconder a área da IA
        const chatMain = document.querySelector('.chat-main');
        if (chatMain) {
            chatMain.style.display = 'none';
        }

        renderizarChat();
    }

    function fecharChat() {
        chatAberto = false;

        const overlay = document.getElementById('chatOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }

        // Mostrar a área da IA
        const chatMain = document.querySelector('.chat-main');
        if (chatMain) {
            chatMain.style.display = 'flex';
        }
    }

    // ============================================
    // ADICIONAR BOTÃO NA BARRA SUPERIOR
    // ============================================
    function adicionarBotaoChat() {
        const actionButtons = document.querySelector('.action-buttons');
        if (!actionButtons) {
            console.log('❌ Botões de ação não encontrados!');
            return;
        }

        const btn = document.createElement('div');
        btn.className = 'action-btn';
        btn.id = 'chatToggleBtn';
        btn.title = 'Abrir Chat Local';
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

        // Inserir antes do botão de configuração
        const settingsBtn = document.getElementById('settingsToggle');
        if (settingsBtn) {
            actionButtons.insertBefore(btn, settingsBtn);
        } else {
            actionButtons.appendChild(btn);
        }

        console.log('✅ Botão Chat adicionado!');
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    function init() {
        console.log('🔄 Inicializando Chat Local...');
        
        carregarDados();
        carregarNome();

        // Criar estrutura do chat
        criarPainelChat();

        // Adicionar botão
        adicionarBotaoChat();

        // Configurar eventos
        configurarEventos();

        // Se já tem nome, iniciar broadcast
        if (chatState.nome) {
            iniciarBroadcast();
        }

        console.log('✅ Chat Local carregado!');
        console.log(`👤 Usuário: ${chatState.nome || 'não definido'}`);
        console.log(`📁 Grupos: ${chatState.grupos.length}`);
        console.log('💡 Clique no ícone 💬 para abrir o chat!');
    }

    // Aguardar DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ============================================
    // EXPORTAR PARA USO GLOBAL
    // ============================================
    window.chatLocal = {
        abrir: abrirChat,
        fechar: fecharChat,
        estado: () => chatState,
        enviarMensagem: enviarMensagem,
        criarGrupo: criarGrupo
    };

    console.log('✅ Módulo Chat Local carregado! Use window.chatLocal para controlar.');
})();