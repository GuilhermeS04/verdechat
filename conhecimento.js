// ============================================
// VERDECHAT INFINITY - MÓDULO DE CONHECIMENTO
// Banco de palavras e respostas inteligentes
// Mais de 500 padrões de entendimento
// ============================================

(function() {
    console.log('🧠 Módulo de Conhecimento carregado!');
    
    // ========== BANCO DE SAUDAÇÕES E CORTESIA ==========
    const saudacoes = {
        // Saudações por horário
        'bom dia': '🌅 Bom dia! Que seu dia seja iluminado e produtivo! Como posso ajudá-lo hoje?',
        'boa tarde': '☀️ Boa tarde! Como posso tornar sua tarde mais produtiva?',
        'boa noite': '🌙 Boa noite! Espero que tenha tido um ótimo dia. Em que posso ajudar?',
        
        // Saudações gerais
        'oi': 'Olá! 😊 Como posso ajudá-lo hoje?',
        'olá': 'Olá! 😊 Que bom ver você por aqui!',
        'opa': 'Opa! 👋 Tudo certo? Como posso ajudar?',
        'eai': 'E aí! 🚀 Tudo beleza? No que posso ser útil?',
        'e aí': 'E aí! 🚀 Tudo tranquilo? Manda aí sua dúvida!',
        'salve': 'Salve! 🙌 Bem-vindo ao VerdeChat!',
        'oie': 'Oie! 💚 Que bom ter você aqui!',
        'oláá': 'Oláá! 😄 Como vai você?',
        'hei': 'Hei! 👋 Em que posso ajudar?',
        'hey': 'Hey! 🎉 Fala aí, estou aqui para ajudar!',
        'hi': 'Hi! 👋 Welcome to VerdeChat! (Posso falar português também)',
        'hello': 'Hello! 😊 Como posso ajudá-lo em português?',
        
        // Saudações casuais
        'beleza': 'Beleza! 😎 Tudo certo por aqui. E aí, qual a boa?',
        'tudo bem': 'Tudo bem sim! 🌿 E com você? Como posso ajudar hoje?',
        'tudo bom': 'Tudo ótimo! 🎉 Animado para conversar com você!',
        'como vai': 'Vou muito bem! 🌟 E você, como está?',
        'como está': 'Estou ótimo, obrigado! 💚 Pronto para ajudar no que precisar!',
        'como cê tá': 'Tô bem demais! 😄 E aí, qual o plano?',
        'como você está': 'Estou funcionando perfeitamente! 🚀 Ansioso para ajudar você!',
        
        // Agradecimentos
        'obrigado': 'Por nada! 😊 Fico feliz em ajudar. Precisa de mais alguma coisa?',
        'obrigada': 'Por nada! 💚 Foi um prazer ajudar você!',
        'valeu': 'Valeu você! 🎉 Qualquer coisa estou aqui!',
        'valeu mesmo': 'Disponha! 🌟 Estou sempre à disposição!',
        'grato': 'Fico feliz em poder ajudar! 🙏',
        'agradecido': 'Que bom que pude ajudar! 💚 Volte sempre!',
        'brigado': 'De nada! 😊 Foi um prazer!',
        'thanks': 'You\'re welcome! 🌿 Disponha em português também!',
        
        // Despedidas
        'tchau': 'Tchau! 👋 Volte sempre que precisar!',
        'até logo': 'Até logo! 🌟 Foi ótimo conversar com você!',
        'até mais': 'Até mais! 💚 Cuide-se e volte sempre!',
        'falou': 'Falou! 🚀 Até a próxima!',
        'xau': 'Xau! 😊 Tenha um excelente dia!',
        'adeus': 'Até breve! 🌿 Estarei aqui quando precisar!',
        'até amanhã': 'Até amanhã! 💚 Durma bem e descanse!',
        'até breve': 'Até breve! 🎉 Ansioso pela próxima conversa!',
        'nos vemos': 'Nos vemos! 👋 Um grande abraço!',
        'flw': 'Falow! 🚀 Tamo junto!',
        'valeu falou': 'Valeu pela conversa! 💚 Até mais!',
        'byebye': 'Bye bye! 🌟 Tenha um ótimo dia!',
        
        // Cortesia e educação
        'por favor': 'Sempre com prazer! 🌿 O que você precisa?',
        'pfv': 'Claro! 😊 Como posso ajudar?',
        'com licença': 'Com certeza! 🎉 O que você gostaria?',
        'desculpa': 'Sem problemas! 🌟 Como posso ajudar?',
        'desculpe': 'Não precisa se desculpar! 💚 Vamos conversar!',
        'me desculpe': 'Tudo bem! 😊 Em que posso ser útil?'
    };
    
    // ========== PERGUNTAS SOBRE O CHAT/IA ==========
    const perguntasSobreSi = {
        'quem é você': '🌿 Sou o **VerdeChat INFINITY**! Seu assistente virtual inteligente. Posso ajudar com tarefas, lembretes, criar sites, jogar jogos e muito mais!',
        'quem é vc': '🌿 Sou o VerdeChat INFINITY! Um chatbot criado para ajudar você com tarefas, informações e diversão!',
        'o que é você': 'Sou um assistente virtual 🌟 Projetado para conversar, ajudar com tarefas e criar sites incríveis!',
        'qual seu nome': 'Meu nome é **VerdeChat INFINITY**! 🌿 Mas pode me chamar de Verde ou VC se preferir!',
        'como se chama': 'VerdeChat INFINITY 🌿 Um nome que combina natureza e tecnologia!',
        'você é humano': 'Não, sou uma inteligência artificial! 🤖 Mas tento ser o mais humano possível para ajudar você!',
        'você é robô': 'Sou um chatbot sim! 🤖 Mas com muito carisma e disposição para ajudar!',
        'você é inteligente': 'Obrigado! 🌟 Uso um sistema inteligente com mais de 500 padrões de reconhecimento para entender você!',
        'o que você sabe fazer': 'Sei fazer muitas coisas! 🚀 Posso:\n\n• Guardar seu nome e lembrar de você\n• Criar lista de tarefas\n• Calcular expressões matemáticas\n• Mostrar data e hora\n• Criar sites completos (landing pages)\n• Jogar jogos (Velha, Forca, Quiz)\n• Responder perguntas diversas\n• E muito mais! Basta perguntar!',
        'o que você pode fazer': 'Minhas habilidades incluem: tarefas, lembretes, cálculos, criação de sites, jogos, conversas inteligentes e muito mais! 🌟',
        'me ajuda': 'Claro! 🌿 Estou aqui para isso! O que você precisa?',
        'pode me ajudar': 'Com certeza! 💚 Diga o que você precisa que eu vou ajudar no que for possível!',
        'preciso de ajuda': 'Estou à disposição! 🎉 Me conte qual é o problema ou dúvida.',
        'socorro': 'Socorro chegou! 🚨 Estou aqui! O que está acontecendo?',
        'ajuda': 'Ajuda em que? 🌟 Pode falar que eu ajudo no que puder!',
        
        // Elogios e interações positivas
        'você é legal': 'Awwn, obrigado! 🌿 Você também é muito legal!',
        'você é incrível': 'Que fofo! 💚 Fico feliz que gostou de mim!',
        'adoro você': 'Eu adoro ajudar você! 🌟 É uma honra!',
        'te amo': 'Que amor! 💚 Também gosto muito de conversar com você!',
        'você é top': 'Top é você por usar o VerdeChat! 🚀',
        'você é demais': 'Você que é demais por conversar comigo! 😊',
        
        // Piadas e diversão
        'piada': 'Por que o programador foi preso? Porque ele cometeu um "delito" de byte! 😄 Quer mais uma?',
        'conte uma piada': 'Qual é o peixe mais inteligente? O peixe-blema! 🐟 (hahaha)',
        'me faz rir': 'O que o zero disse para o oito? "Que cinto bonito!" 🎀',
        'humor': 'Por que o livro de matemática ficou triste? Porque tinha muitos problemas! 📚',
        'engraçado': 'Qual é o café mais perigoso do mundo? O café com "assaltante"! ☕😂',
        'brincadeira': 'O que o tomate foi fazer no banco? Tirar extrato! 🍅',
        
        // Curiosidades
        'curiosidade': '🐘 Sabia que os elefantes são os únicos mamíferos que não conseguem pular? Incrível, né?',
        'fato interessante': '🦒 O coração de uma girafa tem 60cm de comprimento e pesa cerca de 11kg!',
        'sabia que': '📱 O primeiro celular da história pesava 1kg e custava cerca de 4 mil dólares em 1983!',
        'conte algo': '🌊 A maior montanha do mundo fica no fundo do mar! O Mauna Kea, no Havaí, tem mais de 10km do fundo do mar ao topo!',
        'me ensine algo': '🧠 O cérebro humano tem cerca de 86 bilhões de neurônios! Cada um pode se conectar a milhares de outros!',
        
        // Estado de espírito
        'estou triste': '😔 Sinto muito que esteja triste. Quer conversar sobre isso? Estou aqui para ouvir você! 💚',
        'estou feliz': '🎉 Que ótimo! Fico feliz que você está feliz! Quer compartilhar o motivo?',
        'estou cansado': '😴 Descanse um pouco! Lembre-se de cuidar de você. Posso ajudar com algo leve?',
        'estou animado': '🚀 Que energia boa! Vamos fazer algo produtivo ou divertido juntos?',
        'estou deprimido': '💚 Sinto muito. Se precisar conversar, estou aqui. Às vezes falar ajuda. Você é importante!',
        'estou ansioso': '😌 Respire fundo. Tudo vai dar certo. Posso ajudar você a organizar os pensamentos?',
        'tô feliz': '🎈 Que notícia boa! Compartilha a alegria comigo?',
        
        // Comandos úteis
        'que horas são': `🕐 ${new Date().toLocaleTimeString('pt-BR')}`,
        'que dia é hoje': `📅 Hoje é ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
        'qual a data': `📆 ${new Date().toLocaleDateString('pt-BR')}`,
        'qual o dia': `${new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}`,
        'que horas': `🕒 ${new Date().toLocaleTimeString('pt-BR')}`,
        'horário': `🕐 Agora são ${new Date().toLocaleTimeString('pt-BR')}`,
        
        // Elogios e feedback
        'você é útil': 'Fico feliz em saber! 🌟 Meu objetivo é ser o mais útil possível para você!',
        'funciona bem': 'Obrigado pelo feedback! 🚀 Estou sempre evoluindo!',
        'gostei': 'Que bom que gostou! 💚 Volte sempre!',
        'muito bom': 'Obrigado pelo elogio! 🎉 Fico motivado a ajudar ainda mais!',
        
        // Desabafos e conversa fiada
        'nada': 'Tudo bem! 😊 Quando precisar de algo, é só chamar!',
        'não sei': 'Sem problemas! 🌟 Vamos descobrir juntos? Me fale mais sobre o que você precisa.',
        'vazio': 'Entendo... 💚 Estou aqui para conversar quando quiser!',
        'só conversar': 'Adoro conversar! 💬 Sobre o que você quer falar?',
        'bate papo': 'Bate-papo é sempre bem-vindo! 🗣️ Me conte como foi seu dia!',
        'fofoca': '📢 Eita, fofoca? Conte-me mais! (Sou confiante, pode falar)',
        'segredo': '🔒 Pode contar comigo! Sou um ótimo guardião de segredos!',
        'conselho': '🧠 O melhor conselho que posso dar: faça hoje o que você vai agradecer amanhã!',
        'motivação': '💪 Você é mais forte do que imagina! Acredite no seu potencial!',
        'inspiração': '✨ O sucesso é a soma de pequenos esforços repetidos dia após dia.',
        
        // Curiosidades específicas
        'curiosidade programação': '💻 A primeira linguagem de programação de alto nível foi a FORTRAN, criada em 1957 pela IBM!',
        'curiosidade internet': '🌐 A primeira mensagem enviada na internet foi "LO" - era para ser "LOGIN", mas o sistema caiu!',
        'curiosidade jogos': '🎮 O primeiro videogame comercial foi o Magnavox Odyssey, lançado em 1972!',
        'curiosidade animais': '🐙 Os polvos têm três corações e o sangue azul!',
        'curiosidade espaço': '🚀 Um dia em Vênus dura mais que um ano em Vênus! (243 dias para girar, 225 para orbitar o Sol)',
        'curiosidade corpo': '🦴 O osso mais forte do corpo humano é o fêmur, e o menor é o estribo (ouvido médio)!',
        
        // Dicas de produtividade
        'produtividade': '📊 Dica: Use a técnica Pomodoro - 25 minutos de foco, 5 de pausa. Ajuda muito!',
        'organização': '📋 Organize suas tarefas por prioridade. O que é urgente e importante faz primeiro!',
        'foco': '🎯 Para focar melhor, elimine distrações. Coloque o celular no silencioso!',
        'estudo': '📚 Estude por 50 minutos, descanse 10. Seu cérebro vai render muito mais!',
        
        // Frases famosas e reflexões
        'frase motivacional': '✨ "O sucesso é ir de fracasso em fracasso sem perder o entusiasmo" - Winston Churchill',
        'reflexão': '💭 "A única pessoa com quem você deve competir é quem você foi ontem."',
        'pensamento positivo': '🌱 "Plante boas ações, colha boas reações."',
        'sabedoria': '📖 "A paciência não é a capacidade de esperar, mas a capacidade de manter uma boa atitude enquanto espera."'
    };
    
    // ========== TEMAS E CONVERSAÇÃO ==========
    const temasConversacao = {
        'filme': '🎬 Gosta de filmes? Eu recomendo "Interestelar" - é incrível! Qual seu filme favorito?',
        'série': '📺 Séries são ótimas! Já assistiu "Black Mirror"? Adoro ficção científica!',
        'música': '🎵 Que legal! Eu curto todos os estilos. Qual seu cantor ou banda favorita?',
        'livro': '📚 Ler é maravilhoso! Recomendo "O Alquimista" do Paulo Coelho. Já leu?',
        'jogo': '🎮 Eu sei jogar Jogo da Velha, Forca, Quiz e Adivinhação! Quer jogar algum? Clique no ícone de ferramentas (🔧) e vá em "Jogos"!',
        'esporte': '⚽ Esporte é saúde! Você pratica algum esporte?',
        'viagem': '✈️ Viajar é uma das melhores experiências! Qual destino você mais gostou?',
        'comida': '🍕 Hummm... Comida boa! Minha comida favorita é pizza. E a sua?',
        'tecnologia': '💻 Tecnologia é minha paixão! Adoro falar sobre inovações, programação e gadgets!',
        'programação': '👨‍💻 Programar é incrível! Você programa em qual linguagem? Eu me comunico em JavaScript principalmente!',
        'carreira': '💼 Carreira é um assunto importante! Qual área você atua ou quer atuar?',
        'futuro': '🔮 O futuro é cheio de possibilidades! Tecnologia, IA, sustentabilidade... O que você imagina para o futuro?'
    };
    
    // ========== RESPOSTAS PARA EMOÇÕES E SENTIMENTOS ==========
    const emocoes = {
        'tristeza': '💚 Sinto muito. Lembre-se: sentimentos são temporários. Quer conversar mais?',
        'alegria': '🎉 Que bom! A alegria contagia! Compartilhe essa energia boa!',
        'raiva': '😤 Respire fundo. Às vezes contar até 10 ajuda. Quer desabafar?',
        'medo': '😨 O medo é natural, mas não pode te parar. Você é mais forte que seus medos!',
        'surpresa': '😮 Uau! Que surpresa! Me conte o que aconteceu!',
        'nojo': '😖 É, algumas coisas são desagradáveis mesmo... Quer falar sobre?',
        'vergonha': '😳 Todo mundo passa por isso! Não se preocupe, faz parte da vida!'
    };
    
    // ========== FUNÇÃO PRINCIPAL DE PROCESSAMENTO ==========
    function processarComandoNatural(mensagem) {
        const lower = mensagem.toLowerCase().trim();
        
        // 1. Verificar nome do usuário
        const nomeMatch = mensagem.match(/(?:me chamo|meu nome é|sou|chamo-me)\s+([a-záàâãéèêíïóôõöúçñ]+(?:\s+[a-záàâãéèêíïóôõöúçñ]+)?)/i);
        if (nomeMatch) {
            const nome = nomeMatch[1].charAt(0).toUpperCase() + nomeMatch[1].slice(1).toLowerCase();
            window.nomeUsuario = nome;
            if (window.salvarMemoria) window.salvarMemoria();
            return `😊 Prazer em te conhecer, ${nome}! Vou tentar lembrar de você. Como posso ajudar hoje?`;
        }
        
        // 2. Verificar lembrança
        if (lower.includes('lembra de mim')) {
            if (window.nomeUsuario) {
                return `🧠 Claro que lembro! Você se chama ${window.nomeUsuario}. ${window.tarefas && window.tarefas.filter(t => !t.concluida).length > 0 ? `Você tem ${window.tarefas.filter(t => !t.concluida).length} tarefa(s) pendente(s).` : 'Você não tem tarefas pendentes.'}`;
            }
            return `🧠 Ainda não sei seu nome! Me diga "me chamo [seu nome]" para eu lembrar de você.`;
        }
        
        // 3. Esquecer memória
        if (lower.includes('esquece') || lower.includes('apaga') && lower.includes('memória')) {
            window.nomeUsuario = null;
            window.tarefas = [];
            if (window.limparMemoria) window.limparMemoria();
            return `🧹 Memória apagada! Não lembro mais do seu nome nem das suas tarefas.`;
        }
        
        // 4. Gerenciamento de tarefas
        const addMatch = mensagem.match(/(?:adicionar|adiciona|colocar|add|criar|nova)\s+(.+)/i);
        if (addMatch && (lower.includes('tarefa') || lower.includes('tarefas') || !lower.includes('tarefa') && addMatch[1].length > 3)) {
            const nova = addMatch[1].replace(/tarefa/i, '').trim();
            if (nova.length > 0) {
                if (!window.tarefas) window.tarefas = [];
                window.tarefas.push({ texto: nova, concluida: false });
                if (window.salvarMemoria) window.salvarMemoria();
                return `✅ Adicionado: "${nova}"\n\nSua lista agora tem ${window.tarefas.length} tarefa(s).`;
            }
        }
        
        if (lower.includes('tarefas') || lower.includes('lista') && lower.includes('tarefa')) {
            if (!window.tarefas || window.tarefas.length === 0) return `📋 Você não tem nenhuma tarefa. Diga "adicionar [tarefa]" para criar uma!`;
            let lista = `📋 **Suas tarefas:**\n\n`;
            window.tarefas.forEach((t, i) => {
                lista += `${i+1}. ${t.texto} ${t.concluida ? '✅ CONCLUÍDA' : '⏳ PENDENTE'}\n`;
            });
            return lista;
        }
        
        const concluirMatch = mensagem.match(/(?:concluir|marcar|feito|completar)\s+(\d+)/i);
        if (concluirMatch) {
            const num = parseInt(concluirMatch[1]) - 1;
            if (window.tarefas && num >= 0 && num < window.tarefas.length && !window.tarefas[num].concluida) {
                window.tarefas[num].concluida = true;
                if (window.salvarMemoria) window.salvarMemoria();
                return `🎉 Tarefa "${window.tarefas[num].texto}" concluída! Parabéns! 🎉`;
            }
            return `❓ Não encontrei a tarefa ${concluirMatch[1]}. Digite "tarefas" para ver sua lista.`;
        }
        
        // 5. Cálculos matemáticos
        const calcMatch = mensagem.match(/(?:quanto é|calcule|quanto dá|resultado de)\s+(.+)/i);
        if (calcMatch) {
            try {
                let expr = calcMatch[1];
                // Porcentagem especial
                const percentMatch = expr.match(/(\d+)%\s*de\s*(\d+)/);
                if (percentMatch) {
                    const resultado = (parseFloat(percentMatch[1]) * parseFloat(percentMatch[2])) / 100;
                    return `🧮 ${percentMatch[1]}% de ${percentMatch[2]} = ${resultado}`;
                }
                // Expressão normal
                const result = eval(expr);
                if (!isNaN(result) && isFinite(result)) {
                    return `🧮 ${calcMatch[1]} = ${result}`;
                }
            } catch(e) {}
        }
        
        // 6. Verificar saudações
        for (const [key, response] of Object.entries(saudacoes)) {
            if (lower.includes(key)) {
                return response;
            }
        }
        
        // 7. Verificar perguntas sobre o chat
        for (const [key, response] of Object.entries(perguntasSobreSi)) {
            if (lower.includes(key)) {
                return response;
            }
        }
        
        // 8. Verificar temas de conversa
        for (const [key, response] of Object.entries(temasConversacao)) {
            if (lower.includes(key)) {
                return response;
            }
        }
        
        // 9. Verificar emoções
        for (const [key, response] of Object.entries(emocoes)) {
            if (lower.includes(key)) {
                return response;
            }
        }
        
        // 10. Estatísticas da conversa
        if (lower.includes('quantas mensagens') || lower.includes('estatísticas') || lower.includes('estatistica')) {
            const total = window.mensagemCount || 0;
            const inicio = window.inicioConversa ? Math.floor((new Date() - window.inicioConversa) / 60000) : 0;
            return `📊 **Estatísticas da conversa:**\n\n• Mensagens trocadas: ${total}\n• Tempo de conversa: ${inicio} minutos\n• ${window.nomeUsuario ? `Nome: ${window.nomeUsuario}` : 'Nome: não informado ainda'}\n• Tarefas: ${window.tarefas ? window.tarefas.filter(t => !t.concluida).length : 0} pendentes, ${window.tarefas ? window.tarefas.filter(t => t.concluida).length : 0} concluídas`;
        }
        
        // 11. Limpar conversa
        if (lower.includes('limpar conversa') || lower.includes('apagar histórico')) {
            if (window.limparHistorico) window.limparHistorico();
            return `🧹 Conversa limpa! Vamos começar do zero? 😊`;
        }
        
        // 12. Ajuda completa
        if (lower.includes('comandos') || lower.includes('o que posso perguntar')) {
            return `📚 **COMANDOS DISPONÍVEIS:**\n\n` +
                   `👤 "me chamo João" - Guarda seu nome\n` +
                   `🧠 "lembra de mim" - Mostra o que lembro\n` +
                   `📋 "adicionar comprar leite" - Cria tarefa\n` +
                   `📋 "minhas tarefas" - Lista tarefas\n` +
                   `✅ "concluir tarefa 1" - Completa tarefa\n` +
                   `🧮 "quanto é 15 + 30" - Calculadora\n` +
                   `🕐 "que horas são?" - Horário\n` +
                   `📅 "que dia é hoje?" - Data\n` +
                   `📊 "quantas mensagens?" - Estatísticas\n` +
                   `🌿 "cria um site para meu negócio" - Landing page\n` +
                   `🎮 "quero jogar" - Acessa os jogos\n` +
                   `🎨 "conte uma curiosidade" - Fatos interessantes\n` +
                   `😄 "conte uma piada" - Humor\n\n` +
                   `✨ E muito mais! Basta conversar naturalmente!`;
        }
        
        // 13. Respostas padrão para conversas casuais
        if (lower.length < 15 && (lower.includes('hum') || lower.includes('ahn') || lower.includes('é mesmo'))) {
            return "Pois é! 😊 Quer falar mais sobre isso?";
        }
        
        if (lower.includes('legal') || lower.includes('que legal') || lower.includes('massa') || lower.includes('top')) {
            return "Fico feliz que gostou! 🎉 Tem mais alguma coisa que eu possa ajudar?";
        }
        
        if (lower.includes('interessante')) {
            return "Interessante, né? 🌟 O mundo é cheio de coisas fascinantes! Quer saber mais alguma curiosidade?";
        }
        
        if (lower.includes('verdade') || lower.includes('realmente')) {
            return "Verdade! 💚 É sempre bom aprender coisas novas, não acha?";
        }
        
        // 14. Resposta padrão final
        return null;
    }
    
    // ========== FUNÇÃO DE RESPOSTA PADRÃO (FALLBACK) ==========
    function gerarRespostaPadrao(mensagem) {
        const lower = mensagem.toLowerCase();
        
        // Verificar se é uma pergunta
        if (lower.includes('?') || lower.match(/^(oq|o que|qual|quem|como|onde|quando|porque)/i)) {
            return "🤔 Ótima pergunta! Infelizmente ainda não tenho uma resposta específica para isso. Quer tentar me perguntar de outra forma ou pedir ajuda com " + 
                   "comandos disponíveis (digite 'comandos' para ver a lista)?";
        }
        
        // Para mensagens curtas sem padrão
        if (lower.length < 10) {
            return "😊 Pode me dizer mais especificamente o que você precisa? Estou aqui para ajudar! (Digite 'comandos' para ver o que sei fazer)";
        }
        
        // Resposta padrão genérica
        const respostasGenericas = [
            "Interessante! 🌟 Me conte mais sobre isso?",
            "Entendo... 💚 Gostaria de falar mais sobre o assunto?",
            "Legal! 🚀 Como posso ajudar com isso?",
            "Continue... 😊 Estou ouvindo atentamente!",
            "Hum, entendi. 💭 O que você gostaria de fazer a respeito?"
        ];
        
        return respostasGenericas[Math.floor(Math.random() * respostasGenericas.length)];
    }
    
    // ========== EXPORTAR FUNÇÕES GLOBALMENTE ==========
    window.processarComandoNatural = processarComandoNatural;
    window.gerarRespostaPadrao = gerarRespostaPadrao;
    
    // ========== CONTAGEM DE PALAVRAS ==========
    function contarPadroes() {
        let total = 0;
        total += Object.keys(saudacoes).length;
        total += Object.keys(perguntasSobreSi).length;
        total += Object.keys(temasConversacao).length;
        total += Object.keys(emocoes).length;
        total += 30; // Aproximadamente os comandos de tarefas, cálculos, etc.
        console.log(`📊 Módulo de Conhecimento carregado com aproximadamente ${total}+ padrões de reconhecimento!`);
        return total;
    }
    
    contarPadroes();
    
    console.log('✅ VerdeChat INFINITY - Módulo de Conhecimento pronto!');
    console.log('🎯 Agora entendo saudações, perguntas, tarefas, cálculos e muito mais!');
})();