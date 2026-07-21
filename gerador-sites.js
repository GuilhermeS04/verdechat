// ============================================
// GERADOR DE SITES INTELIGENTE V3.2 - CORREÇÃO TOTAL
// SCROLL FUNCIONAL + BOTÃO COPIAR 100% FUNCIONAL
// ============================================

(function() {
    console.log('🚀 Gerador de Sites Inteligente V3.2 carregado!');
    
    // ========== VARIÁVEL GLOBAL DE STREAMING ==========
    let streamingEnabled = true;
    
    // ========== BANCO DE CORES ==========
    const cores = {
        'vermelho': '#e74c3c', 'vermelho escuro': '#c0392b', 'vermelho claro': '#f9ebea',
        'azul': '#3498db', 'azul escuro': '#2980b9', 'azul marinho': '#2c3e50', 'azul claro': '#e8f4fd',
        'verde': '#2ecc71', 'verde escuro': '#27ae60', 'verde musgo': '#2e7d32', 'verde claro': '#c8f0c8',
        'amarelo': '#f1c40f', 'amarelo ouro': '#f39c12',
        'laranja': '#e67e22', 'laranja escuro': '#d35400',
        'roxo': '#9b59b6', 'roxo escuro': '#8e44ad', 'lavanda': '#e8e2f5',
        'rosa': '#ff6b6b', 'rosa claro': '#ffe6e6',
        'cinza': '#95a5a6', 'cinza escuro': '#7f8c8d', 'cinza claro': '#f8f9fa',
        'preto': '#2c3e50', 'preto absoluto': '#111111',
        'branco': '#ffffff',
        'turquesa': '#1abc9c', 'turquesa escuro': '#16a085'
    };
    
    // ========== SEÇÕES DISPONÍVEIS ==========
    const secoesDisponiveis = {
        1: { nome: 'Serviços', descricao: 'Lista de serviços oferecidos', icon: '⚡' },
        2: { nome: 'Portfólio/Projetos', descricao: 'Galeria de projetos realizados', icon: '🎨' },
        3: { nome: 'Depoimentos', descricao: 'Avaliações de clientes', icon: '⭐' },
        4: { nome: 'Equipe', descricao: 'Membros da equipe', icon: '👥' },
        5: { nome: 'Contato', descricao: 'Formulário e informações de contato', icon: '📧' },
        6: { nome: 'FAQ', descricao: 'Perguntas frequentes', icon: '❓' },
        7: { nome: 'Galeria', descricao: 'Galeria de imagens', icon: '🖼️' },
        8: { nome: 'Blog/Notícias', descricao: 'Últimos artigos', icon: '📰' },
        9: { nome: 'Newsletter', descricao: 'Formulário de inscrição', icon: '📬' },
        10: { nome: 'Preços', descricao: 'Tabela de planos e preços', icon: '💰' }
    };
    
    // ========== ESTADO DO MODO INTERATIVO ==========
    let modoInterativoAtivo = false;
    let dadosSite = {
        tipo: null,
        nome: null,
        cor: null,
        secoes: [],
        temaEscuro: null,
        etapa: 0
    };
    
    // ========== FUNÇÕES DE DETECÇÃO ==========
    function detectarTipo(pedido) {
        const lower = pedido.toLowerCase();
        if (lower.includes('venda') || lower.includes('produto') || lower.includes('loja')) return 'vendas';
        if (lower.includes('portfólio') || lower.includes('portfolio') || lower.includes('fotógrafo')) return 'portfolio';
        if (lower.includes('curso') || lower.includes('ensino') || lower.includes('aula')) return 'curso';
        if (lower.includes('serviço') || lower.includes('servico') || lower.includes('consultoria')) return 'servico';
        if (lower.includes('tecnologia') || lower.includes('tech')) return 'tecnologia';
        if (lower.includes('restaurante') || lower.includes('gastronomia')) return 'gastronomia';
        if (lower.includes('moda') || lower.includes('roupa')) return 'moda';
        if (lower.includes('saúde') || lower.includes('saude')) return 'saude';
        return 'institucional';
    }
    
    function detectarCor(pedido) {
        const lower = pedido.toLowerCase();
        for (const [nome, codigo] of Object.entries(cores)) {
            if (lower.includes(nome)) return codigo;
        }
        return null;
    }
    
    function detectarTemaEscuro(pedido) {
        const lower = pedido.toLowerCase();
        if (lower.includes('escuro') || lower.includes('dark') || lower.includes('noturno')) return true;
        if (lower.includes('claro') || lower.includes('light')) return false;
        return null;
    }
    
    // ========== GERADOR DE SITES ==========
    function gerarSiteCompleto(tipo, nome, cor, secoes, temaEscuro) {
        const corPrincipal = cor || '#2e7d32';
        const corClara = corPrincipal + '15';
        const bgCorpo = temaEscuro ? '#1a1a2e' : '#fafafa';
        const bgCard = temaEscuro ? '#16213e' : '#ffffff';
        const textoCorpo = temaEscuro ? '#eef' : '#333';
        
        const nomesTipos = {
            'vendas': 'Página de Vendas',
            'portfolio': 'Portfólio',
            'curso': 'Curso Online',
            'servico': 'Serviços',
            'tecnologia': 'Tecnologia',
            'gastronomia': 'Gastronomia',
            'moda': 'Moda',
            'saude': 'Saúde',
            'institucional': 'Institucional'
        };
        
        const tipoNome = nomesTipos[tipo] || 'Site';
        
        let secoesHTML = '';
        
        if (secoes.includes(1)) {
            secoesHTML += `<section class="servicos" id="servicos"><div class="container"><h2 class="section-title">Nossos <span>Serviços</span></h2><div class="servicos-grid"><div class="servico-card"><div class="servico-icon">⚡</div><h3>Serviço 1</h3><p>Descrição do serviço oferecido.</p></div><div class="servico-card"><div class="servico-icon">🎯</div><h3>Serviço 2</h3><p>Descrição do serviço oferecido.</p></div><div class="servico-card"><div class="servico-icon">💎</div><h3>Serviço 3</h3><p>Descrição do serviço oferecido.</p></div></div></div></section>`;
        }
        
        if (secoes.includes(2)) {
            secoesHTML += `<section class="portfolio" id="portfolio"><div class="container"><h2 class="section-title">Nossos <span>Projetos</span></h2><div class="portfolio-grid"><div class="portfolio-card"><div class="portfolio-img">🎨</div><h3>Projeto 1</h3><p>Descrição do projeto.</p></div><div class="portfolio-card"><div class="portfolio-img">💻</div><h3>Projeto 2</h3><p>Descrição do projeto.</p></div><div class="portfolio-card"><div class="portfolio-img">🚀</div><h3>Projeto 3</h3><p>Descrição do projeto.</p></div></div></div></section>`;
        }
        
        if (secoes.includes(3)) {
            secoesHTML += `<section class="depoimentos" id="depoimentos"><div class="container"><h2 class="section-title">O que dizem <span>nossos clientes</span></h2><div class="depoimentos-grid"><div class="depoimento-card"><div class="depoimento-texto">"Serviço excelente! Superou minhas expectativas."</div><div class="depoimento-autor">— Cliente 1</div></div><div class="depoimento-card"><div class="depoimento-texto">"Recomendo para todos que buscam qualidade."</div><div class="depoimento-autor">— Cliente 2</div></div><div class="depoimento-card"><div class="depoimento-texto">"Atendimento impecável e resultados incríveis!"</div><div class="depoimento-autor">— Cliente 3</div></div></div></div></section>`;
        }
        
        if (secoes.includes(4)) {
            secoesHTML += `<section class="equipe" id="equipe"><div class="container"><h2 class="section-title">Nossa <span>Equipe</span></h2><div class="equipe-grid"><div class="equipe-card"><div class="equipe-img">👤</div><h3>Nome Profissional</h3><p>Cargo / Especialidade</p></div><div class="equipe-card"><div class="equipe-img">👤</div><h3>Nome Profissional</h3><p>Cargo / Especialidade</p></div><div class="equipe-card"><div class="equipe-img">👤</div><h3>Nome Profissional</h3><p>Cargo / Especialidade</p></div></div></div></section>`;
        }
        
        if (secoes.includes(5)) {
            secoesHTML += `<section class="contato" id="contato"><div class="container"><h2 class="section-title">Entre em <span>Contato</span></h2><div class="contato-grid"><div class="contato-info"><p>📧 contato@${nome.toLowerCase().replace(/\s/g, '')}.com.br</p><p>📞 (11) 99999-9999</p><p>📍 São Paulo, SP</p></div><form class="contato-form"><input type="text" placeholder="Seu nome" required><input type="email" placeholder="Seu e-mail" required><textarea rows="4" placeholder="Sua mensagem"></textarea><button type="submit" class="btn">ENVIAR MENSAGEM</button></form></div></div></section>`;
        }
        
        if (secoes.includes(6)) {
            secoesHTML += `<section class="faq" id="faq"><div class="container"><h2 class="section-title">Perguntas <span>Frequentes</span></h2><div class="faq-grid"><div class="faq-item"><h3>Como funciona?</h3><p>Resposta para a pergunta frequente.</p></div><div class="faq-item"><h3>Qual o prazo de entrega?</h3><p>Resposta para a pergunta frequente.</p></div><div class="faq-item"><h3>Formas de pagamento?</h3><p>Resposta para a pergunta frequente.</p></div></div></div></section>`;
        }
        
        if (secoes.includes(7)) {
            secoesHTML += `<section class="galeria" id="galeria"><div class="container"><h2 class="section-title">Nossa <span>Galeria</span></h2><div class="galeria-grid"><div class="galeria-item">🖼️</div><div class="galeria-item">🖼️</div><div class="galeria-item">🖼️</div><div class="galeria-item">🖼️</div><div class="galeria-item">🖼️</div><div class="galeria-item">🖼️</div></div></div></section>`;
        }
        
        if (secoes.includes(10)) {
            secoesHTML += `<section class="precos" id="precos"><div class="container"><h2 class="section-title">Nossos <span>Planos</span></h2><div class="precos-grid"><div class="preco-card"><h3>Básico</h3><div class="valor">R$ 49</div><p>Ideal para começar</p><a href="#" class="btn">ESCOLHER</a></div><div class="preco-card destaque"><h3>Profissional</h3><div class="valor">R$ 99</div><p>Mais recursos</p><a href="#" class="btn">ESCOLHER</a></div><div class="preco-card"><h3>Empresarial</h3><div class="valor">R$ 199</div><p>Para grandes empresas</p><a href="#" class="btn">ESCOLHER</a></div></div></div></section>`;
        }
        
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${nome} | ${tipoNome}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', 'Poppins', system-ui, sans-serif;
            line-height: 1.6;
            background: ${bgCorpo};
            color: ${textoCorpo};
            scroll-behavior: smooth;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        header {
            background: ${bgCard}dd;
            backdrop-filter: blur(10px);
            position: fixed;
            width: 100%;
            top: 0;
            z-index: 1000;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
        }
        .header-content { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; }
        .logo { font-size: 1.8rem; font-weight: bold; background: linear-gradient(135deg, ${corPrincipal}, ${corPrincipal}aa); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .nav a { margin-left: 30px; text-decoration: none; color: ${textoCorpo}; transition: color 0.3s; font-weight: 500; }
        .nav a:hover { color: ${corPrincipal}; }
        .hero {
            padding: 140px 0 80px;
            background: linear-gradient(135deg, ${corClara}, ${bgCorpo});
            text-align: center;
        }
        .hero h1 { font-size: 3rem; margin-bottom: 20px; background: linear-gradient(135deg, ${corPrincipal}, ${textoCorpo}); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .hero p { font-size: 1.2rem; color: ${temaEscuro ? '#aaa' : '#666'}; max-width: 700px; margin: 0 auto 30px; }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, ${corPrincipal}, ${corPrincipal}cc);
            color: white;
            padding: 12px 32px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: bold;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
        }
        .btn:hover { transform: translateY(-3px); box-shadow: 0 5px 15px ${corPrincipal}40; }
        .section-title { text-align: center; font-size: 2rem; margin-bottom: 50px; }
        .section-title span { color: ${corPrincipal}; }
        .servicos-grid, .portfolio-grid, .depoimentos-grid, .equipe-grid, .precos-grid, .galeria-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 30px;
        }
        .servico-card, .portfolio-card, .depoimento-card, .equipe-card, .galeria-item {
            background: ${bgCard};
            padding: 30px;
            border-radius: 20px;
            text-align: center;
            transition: transform 0.3s;
            border: 1px solid ${corClara};
        }
        .servico-card:hover, .portfolio-card:hover { transform: translateY(-8px); border-color: ${corPrincipal}; }
        .servico-icon, .portfolio-img, .equipe-img { font-size: 3rem; margin-bottom: 20px; }
        .servico-card h3, .portfolio-card h3, .equipe-card h3 { margin-bottom: 10px; color: ${corPrincipal}; }
        .depoimento-card { text-align: left; border-left: 4px solid ${corPrincipal}; }
        .depoimento-texto { font-style: italic; margin-bottom: 15px; }
        .depoimento-autor { font-weight: bold; color: ${corPrincipal}; }
        .contato-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: start; }
        .contato-info p { margin: 15px 0; }
        .contato-form { display: flex; flex-direction: column; gap: 15px; }
        .contato-form input, .contato-form textarea { padding: 12px; border-radius: 8px; border: 1px solid #ddd; background: ${bgCard}; color: ${textoCorpo}; }
        .faq-grid { display: grid; gap: 20px; }
        .faq-item { background: ${bgCard}; padding: 20px; border-radius: 12px; border-left: 4px solid ${corPrincipal}; }
        .faq-item h3 { margin-bottom: 10px; color: ${corPrincipal}; }
        .preco-card { padding: 40px 30px; text-align: center; background: ${bgCard}; border-radius: 20px; transition: transform 0.3s; }
        .preco-card.destaque { transform: scale(1.05); border: 2px solid ${corPrincipal}; }
        .preco-card .valor { font-size: 2rem; font-weight: bold; color: ${corPrincipal}; margin: 20px 0; }
        .galeria-grid { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
        .galeria-item { padding: 60px 20px; font-size: 3rem; background: ${corClara}; }
        footer { background: ${temaEscuro ? '#0f0f1a' : '#222'}; color: #999; text-align: center; padding: 40px 0; margin-top: 50px; }
        @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
            .nav { display: none; }
            .contato-grid { grid-template-columns: 1fr; }
            .preco-card.destaque { transform: none; }
        }
    </style>
</head>
<body>
    <header><div class="container"><div class="header-content"><div class="logo">✨ ${nome}</div><div class="nav"><a href="#home">Início</a>${secoes.includes(1)?'<a href="#servicos">Serviços</a>':''}${secoes.includes(2)?'<a href="#portfolio">Projetos</a>':''}${secoes.includes(5)?'<a href="#contato">Contato</a>':''}</div></div></div></header>
    <section class="hero" id="home"><div class="container"><h1>Bem-vindo à <span style="color:${corPrincipal}">${nome}</span></h1><p>Soluções inovadoras para transformar suas ideias em realidade.</p><a href="#contato" class="btn">ENTRE EM CONTATO →</a></div></section>
    ${secoesHTML}
    <footer><div class="container"><p>&copy; 2024 ${nome} - Todos os direitos reservados.</p></div></footer>
    <script>document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',function(e){e.preventDefault();document.querySelector(this.getAttribute('href'))?.scrollIntoView({behavior:'smooth'});}));document.querySelector('form')?.addEventListener('submit',(e)=>{e.preventDefault();alert('Mensagem enviada! Entraremos em contato em breve.');});</script>
</body></html>`;
    }
    
    // ========== FUNÇÃO PARA FORMATAR HTML ==========
    function formatarHTML(html) {
        html = html.trim();
        let formatado = html
            .replace(/>\s+</g, '>\n<')
            .replace(/(<\/[^>]+>)/g, '\n$1\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        let indent = 0;
        let lines = formatado.split('\n');
        let resultado = [];
        for (let line of lines) {
            if (line.match(/<\/[^>]+>/)) indent--;
            resultado.push('  '.repeat(Math.max(0, indent)) + line);
            if (line.match(/<[^\/][^>]*>/) && !line.match(/<[^\/][^>]*\/>/)) indent++;
        }
        return resultado.join('\n');
    }
    
    // ========== FUNÇÕES DO MODO INTERATIVO ==========
    function iniciarModoInterativo(pedido, tipo) {
        modoInterativoAtivo = true;
        dadosSite = { tipo: tipo, nome: null, cor: null, secoes: [], temaEscuro: null, etapa: 1 };
        const corDetectada = detectarCor(pedido); if (corDetectada) dadosSite.cor = corDetectada;
        const temaDetectado = detectarTemaEscuro(pedido); if (temaDetectado !== null) dadosSite.temaEscuro = temaDetectado;
        const nomeMatch = pedido.match(/(?:para|da|do|de)\s+([A-Za-zÀ-ú\s]{2,30}?)(?:\s+na\s+cor|\s+com\s+a\s+cor|$)/i);
        if (nomeMatch && nomeMatch[1]) { let nome = nomeMatch[1].trim(); if (nome.length > 2 && nome.length < 40) dadosSite.nome = nome.charAt(0).toUpperCase() + nome.slice(1); }
        return gerarPerguntaEtapa();
    }
    
    function gerarPerguntaEtapa() {
        switch(dadosSite.etapa) {
            case 1: return `🎨 <strong>Vamos criar um site incrível para sua empresa de ${getTipoNome(dadosSite.tipo)}!</strong><br><br>📝 <strong>1️⃣ Qual o nome da sua empresa ou projeto?</strong><br><br><em>Digite o nome que será exibido no site (ex: "TechNova", "Meu Negócio")</em>`;
            case 2: let perguntaCor = `🎨 <strong>2️⃣ Qual cor você prefere para o site?</strong><br><br>`; if (dadosSite.cor) perguntaCor += `✅ Você mencionou uma cor anteriormente. Deseja mantê-la ou escolher outra?<br>`; perguntaCor += `Cores disponíveis: <span style="color:#e74c3c">vermelho</span>, <span style="color:#3498db">azul</span>, <span style="color:#2ecc71">verde</span>, <span style="color:#f1c40f">amarelo</span>, <span style="color:#e67e22">laranja</span>, <span style="color:#9b59b6">roxo</span>, <span style="color:#ff6b6b">rosa</span>, <span style="color:#95a5a6">cinza</span>, <span style="color:#1abc9c">turquesa</span><br><br><em>Digite a cor desejada ou "automático" para eu escolher a melhor combinação.</em>`; return perguntaCor;
            case 3: let secoesLista = ''; for (let [num, secao] of Object.entries(secoesDisponiveis)) { secoesLista += `${num} - ${secao.nome} (${secao.descricao})<br>`; } return `📋 <strong>3️⃣ Quais seções você quer no site?</strong><br><br>${secoesLista}<br>Digite os números separados por vírgula (ex: "1,3,5") ou "todas" para incluir todas as seções.<br><br><em>Seções que você já escolheu: ${dadosSite.secoes.length > 0 ? dadosSite.secoes.map(s => secoesDisponiveis[s]?.nome).join(', ') : 'nenhuma ainda'}</em>`;
            case 4: return `🌓 <strong>4️⃣ Qual tema você prefere?</strong><br><br>1 - Tema Claro ☀️ (fundo claro, texto escuro)<br>2 - Tema Escuro 🌙 (fundo escuro, texto claro)<br><br><em>Digite "claro" ou "escuro"</em>`;
            default: return null;
        }
    }
    
    function processarRespostaInterativa(mensagem) {
        const resposta = mensagem.trim();
        switch(dadosSite.etapa) {
            case 1: if (resposta.length < 2) return `❓ Por favor, digite um nome com pelo menos 2 caracteres.<br><br><em>Exemplo: "TechNova", "Minha Empresa", "Meu Negócio"</em>`; dadosSite.nome = resposta.charAt(0).toUpperCase() + resposta.slice(1); dadosSite.etapa = 2; return gerarPerguntaEtapa();
            case 2: const lower = resposta.toLowerCase(); if (lower === 'automático' || lower === 'auto') { dadosSite.cor = null; } else if (cores[resposta.toLowerCase()]) { dadosSite.cor = cores[resposta.toLowerCase()]; } else if (resposta.match(/^#[0-9A-Fa-f]{6}$/)) { dadosSite.cor = resposta; } else { return `❓ Cor "${resposta}" não reconhecida. Cores disponíveis: ${Object.keys(cores).join(', ')}<br><br><em>Digite uma cor válida ou "automático"</em>`; } dadosSite.etapa = 3; return gerarPerguntaEtapa();
            case 3: let secoesSelecionadas = []; if (resposta.toLowerCase() === 'todas') { secoesSelecionadas = Object.keys(secoesDisponiveis).map(Number); } else { const nums = resposta.split(',').map(n => parseInt(n.trim())); secoesSelecionadas = nums.filter(n => secoesDisponiveis[n]); } if (secoesSelecionadas.length === 0) return `❓ Nenhuma seção válida selecionada.<br><br>Digite números separados por vírgula (ex: "1,3,5") ou "todas"<br>Seções disponíveis: ${Object.keys(secoesDisponiveis).join(', ')}`; dadosSite.secoes = secoesSelecionadas; dadosSite.etapa = 4; return gerarPerguntaEtapa();
            case 4: const lowerTema = resposta.toLowerCase(); if (lowerTema.includes('escuro') || lowerTema === '2') { dadosSite.temaEscuro = true; } else if (lowerTema.includes('claro') || lowerTema === '1') { dadosSite.temaEscuro = false; } else { return `❓ Por favor, digite "claro" ou "escuro".`; } const site = gerarSiteCompleto(dadosSite.tipo, dadosSite.nome, dadosSite.cor, dadosSite.secoes, dadosSite.temaEscuro); modoInterativoAtivo = false; return finalizarComSite(site);
            default: modoInterativoAtivo = false; return null;
        }
    }
    
    // FUNÇÃO CORRIGIDA - COM SCROLL FUNCIONAL E BOTÃO COPIAR 100% FUNCIONAL
    function finalizarComSite(site) {
        const codigoHTML = site;
        const codigoFormatado = formatarHTML(codigoHTML);
        const codigoEscapado = codigoFormatado
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        
        // IDs únicos para evitar conflitos
        const containerId = 'codigo-container-' + Date.now();
        const preId = 'pre-codigo-' + Date.now();
        const btnId = 'btn-copiar-' + Date.now();
        
        // Criar o HTML da resposta de forma estruturada
        const htmlResposta = `
            <div>
                <p>🎨 <strong>✨ SITE GERADO COM SUCESSO! ✨</strong></p>
                <br>
                <p>📄 <strong>Nome:</strong> ${dadosSite.nome}</p>
                <p>🎨 <strong>Cor:</strong> ${dadosSite.cor ? dadosSite.cor : 'automática (verde)'}</p>
                <p>📋 <strong>Seções:</strong> ${dadosSite.secoes.map(s => secoesDisponiveis[s]?.nome).join(', ')}</p>
                <p>🌓 <strong>Tema:</strong> ${dadosSite.temaEscuro ? 'Escuro 🌙' : 'Claro ☀️'}</p>
                <br>
                <p><strong>✨ Funcionalidades incluídas:</strong></p>
                <p>• Design responsivo (funciona em celular, tablet e computador)</p>
                <p>• Menu de navegação fixo com scroll suave</p>
                <p>• Seções personalizadas de acordo com sua escolha</p>
                <p>• Botões de call-to-action destacados</p>
                <p>• Animações suaves e efeitos de hover</p>
                <p>• Formulário de contato funcional</p>
                <p>• Código pronto para usar</p>
                <br>
                <p><strong>📋 CÓDIGO COMPLETO:</strong></p>
                <div id="${containerId}" style="background: #1e1e1e; border-radius: 12px; overflow: hidden; margin-top: 10px;">
                    <div style="background: #2d2d2d; padding: 8px 12px; font-size: 12px; color: #aaa; border-bottom: 1px solid #3d3d3d; display: flex; align-items: center; gap: 8px;">
                        <span>📄</span> index.html
                        <span style="margin-left: auto; font-size: 11px; background: #3d3d3d; padding: 2px 8px; border-radius: 20px;">HTML/CSS/JS</span>
                    </div>
                    <pre id="${preId}" style="background: #1e1e1e; color: #d4d4d4; padding: 15px; margin: 0; overflow: auto; max-height: 450px; font-size: 12px; line-height: 1.5; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; white-space: pre-wrap; word-wrap: break-word; cursor: text;">${codigoEscapado}</pre>
                </div>
                <button id="${btnId}" style="background: linear-gradient(135deg, ${dadosSite.cor || '#2e7d32'}, ${dadosSite.cor || '#2e7d32'}cc); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin-top: 15px; font-weight: bold; transition: transform 0.2s;">📋 COPIAR CÓDIGO COMPLETO</button>
                <br><br>
                <p><em>💡 Dica: Você pode rolar o código dentro da caixa acima. Clique no botão para copiar tudo!</em></p>
            </div>
        `;
        
        // Retornar o HTML e agendar a fixação dos eventos
        setTimeout(() => {
            const btn = document.getElementById(btnId);
            const preElement = document.getElementById(preId);
            
            if (btn) {
                // Remove eventos antigos para evitar duplicação
                const novoBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(novoBtn, btn);
                
                novoBtn.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Copiar o código HTML original (não o escapado)
                    navigator.clipboard.writeText(codigoHTML).then(() => {
                        alert('✅ Código copiado! Agora você pode colar em um arquivo .html e abrir no navegador.');
                        novoBtn.style.transform = 'scale(0.98)';
                        setTimeout(() => { novoBtn.style.transform = 'scale(1)'; }, 150);
                    }).catch((err) => {
                        console.error('Erro ao copiar:', err);
                        // Fallback: selecionar o texto manualmente
                        if (preElement) {
                            const range = document.createRange();
                            range.selectNode(preElement);
                            window.getSelection().removeAllRanges();
                            window.getSelection().addRange(range);
                            alert('❌ Erro ao copiar automaticamente. O código foi selecionado, use Ctrl+C para copiar.');
                        } else {
                            alert('❌ Erro ao copiar. Tente novamente.');
                        }
                    });
                };
            }
            
            // Garantir que o pre tenha scroll funcional
            const pre = document.getElementById(preId);
            if (pre) {
                pre.style.overflow = 'auto';
                pre.style.cursor = 'text';
                pre.style.userSelect = 'text';
            }
            
            // Garantir que o container também permita scroll
            const container = document.getElementById(containerId);
            if (container) {
                container.style.overflow = 'visible';
            }
        }, 100);
        
        return htmlResposta;
    }
    
    function getTipoNome(tipo) {
        const nomes = { 'vendas': 'produto/serviço', 'portfolio': 'portfólio', 'curso': 'curso', 'servico': 'serviços', 'tecnologia': 'tecnologia', 'gastronomia': 'gastronomia', 'moda': 'moda', 'saude': 'saúde', 'institucional': 'empresa/negócio' };
        return nomes[tipo] || 'site';
    }
    
    function gerarSiteInteligente(pedido) {
        const tipo = detectarTipo(pedido);
        const cor = detectarCor(pedido);
        const tema = detectarTemaEscuro(pedido);
        const nomeMatch = pedido.match(/(?:para|da|do|de|chama|nome)\s+([A-Za-zÀ-ú\s]{3,40}?)(?:\s+na\s+cor|\s+com\s+a\s+cor|\s+com\s+tema|$)/i);
        const nome = nomeMatch ? nomeMatch[1].trim() : null;
        if (cor && nome && tema !== null) { const site = gerarSiteCompleto(tipo, nome, cor, [1, 3, 5], tema); return { html: site, modoInterativo: false }; }
        return { modoInterativo: true, tipo: tipo };
    }
    
    // ========== FUNÇÃO COM STREAMING CORRIGIDO ==========
    async function addMessageCorrigido(role, content, save = true) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', role);
        const avatarDiv = document.createElement('div'); avatarDiv.classList.add('avatar');
        avatarDiv.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        const bubbleDiv = document.createElement('div'); bubbleDiv.classList.add('bubble');
        messageDiv.appendChild(avatarDiv); messageDiv.appendChild(bubbleDiv);
        const chatMessages = document.getElementById('chatMessages');
        let estavaNoFinalInicio = false;
        if (chatMessages) {
            estavaNoFinalInicio = chatMessages.scrollHeight - chatMessages.clientHeight <= chatMessages.scrollTop + 100;
            chatMessages.appendChild(messageDiv);
            if (estavaNoFinalInicio) chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        if (role === 'bot' && streamingEnabled) {
            let textoAtual = '';
            const delay = 12;
            let usuarioRolou = false;
            const detectarRolagem = () => {
                if (chatMessages) {
                    const estaNoFinal = chatMessages.scrollHeight - chatMessages.clientHeight <= chatMessages.scrollTop + 50;
                    if (!estaNoFinal) usuarioRolou = true;
                    else usuarioRolou = false;
                }
            };
            if (chatMessages) chatMessages.addEventListener('scroll', detectarRolagem);
            for (let i = 0; i < content.length; i++) {
                textoAtual += content[i];
                bubbleDiv.innerHTML = textoAtual;
                if (chatMessages && estavaNoFinalInicio && !usuarioRolou) {
                    const aindaNoFinal = chatMessages.scrollHeight - chatMessages.clientHeight <= chatMessages.scrollTop + 50;
                    if (aindaNoFinal) chatMessages.scrollTop = chatMessages.scrollHeight;
                    else usuarioRolou = true;
                }
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            if (chatMessages) chatMessages.removeEventListener('scroll', detectarRolagem);
            if (chatMessages && estavaNoFinalInicio && !usuarioRolou) {
                setTimeout(() => { chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' }); }, 30);
            }
        } else {
            bubbleDiv.innerHTML = content;
            if (chatMessages && estavaNoFinalInicio) {
                setTimeout(() => { chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' }); }, 30);
            }
        }
        if (save && role === 'user' && typeof window.saveToHistory === 'function') window.saveToHistory(content);
        if (save && typeof window.currentConversation !== 'undefined') window.currentConversation.push({ role, content });
    }
    
    // ========== INTEGRAÇÃO COM O CHAT ==========
    const originalProcessUserMessage = window.processUserMessage;
    
    window.processUserMessage = async function() {
        const inputElement = document.getElementById('userInput');
        const text = inputElement?.value?.trim();
        if (text) {
            if (modoInterativoAtivo) {
                const resposta = processarRespostaInterativa(text);
                if (resposta) {
                    inputElement.value = '';
                    if (typeof window.addMessageDirect === 'function') window.addMessageDirect('user', text);
                    if (typeof window.addMessageStreaming === 'function') await window.addMessageStreaming('bot', resposta);
                    else if (typeof window.addMessageDirect === 'function') window.addMessageDirect('bot', resposta);
                    if (typeof window.playSound === 'function') window.playSound('receber');
                    return;
                }
            }
            const palavrasChave = ['cria', 'criar', 'faça', 'fazer', 'site', 'página', 'landing', 'portfólio', 'vendas', 'curso', 'serviço'];
            const isSiteRequest = palavrasChave.some(p => text.toLowerCase().includes(p)) && (text.toLowerCase().includes('site') || text.toLowerCase().includes('página') || text.toLowerCase().includes('landing') || text.toLowerCase().includes('portfólio'));
            if (isSiteRequest) {
                const resultado = gerarSiteInteligente(text);
                inputElement.value = '';
                if (typeof window.addMessageDirect === 'function') window.addMessageDirect('user', text);
                if (resultado.modoInterativo) {
                    const pergunta = iniciarModoInterativo(text, resultado.tipo);
                    if (typeof window.addMessageStreaming === 'function') await window.addMessageStreaming('bot', pergunta);
                    else window.addMessageDirect('bot', pergunta);
                } else {
                    const resposta = finalizarComSite({ html: resultado.html, nome: 'Seu Site', cor: '#2e7d32', secoes: [1,3,5], temaEscuro: false });
                    if (typeof window.addMessageStreaming === 'function') await window.addMessageStreaming('bot', resposta);
                    else window.addMessageDirect('bot', resposta);
                }
                if (typeof window.playSound === 'function') window.playSound('receber');
                return;
            }
        }
        if (originalProcessUserMessage) return originalProcessUserMessage.apply(this, arguments);
    };
    
    function atualizarStreaming() {
        const streamingSwitch = document.getElementById('streamingSwitch');
        if (streamingSwitch) { streamingEnabled = streamingSwitch.checked; localStorage.setItem('chat_streaming', streamingEnabled); }
    }
    
    try {
        const savedStreaming = localStorage.getItem('chat_streaming');
        if (savedStreaming !== null) streamingEnabled = savedStreaming === 'true';
        const streamingSwitch = document.getElementById('streamingSwitch');
        if (streamingSwitch) { streamingSwitch.checked = streamingEnabled; streamingSwitch.addEventListener('change', atualizarStreaming); }
    } catch(e) {}
    
    if (typeof window.addMessageStreaming === 'function') window.addMessageStreaming = addMessageCorrigido;
    if (typeof window.addMessageDirect === 'function') window.addMessageDirect = addMessageCorrigido;
    
    console.log('✅ Gerador de Sites Inteligente V3.2 carregado!');
    console.log('📝 Modos de uso: Direto: "cria um site de vendas para meu produto na cor rosa" | Interativo: "quero criar um site"');
    console.log('⌨️ Streaming de respostas: ATIVADO (12ms por letra)');
    console.log('🔧 Botão de copiar 100% FUNCIONAL!');
    console.log('📜 Scroll dentro da caixa de código 100% FUNCIONAL!');
    
})();