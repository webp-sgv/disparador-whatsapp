const wppconnect = require('@wppconnect-team/wppconnect');
const fs = require('fs').promises;
const path = require('path');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

let estadoAppEmExecucao = false; // Tradução de stateAppRun
let aguardandoDisparo = false;    // Tradução de forSender

// Nome do arquivo do banco de dados (será criado se não existir)
const DB_FILE = path.resolve(__dirname, 'data/database.sqlite');

// Configurações de diretórios
const DIRS = {
    NUMEROS: 'disparar/numeros/',
    ENVIADOS: 'disparar/enviados/',
    TEXTO: 'disparar/texto/',
    CONFIG: 'config/',
    LOGS: 'logs/'
};

wppconnect.create({ session: 'disparo' }).then((client) => iniciar(client));
// Levels: 'error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'
// All logs: 'silly'
wppconnect.defaultLogger.level = 'error';
// If you want stop console logging
// wppconnect.defaultLogger.transports.forEach((t) => (t.silent = true));

// --------------------------------------------------
// ## Conecta ao banco de dados
// --------------------------------------------------

async function conectarDB() {
    try {
        const db = await sqlite.open({
            filename: DB_FILE,
            driver: sqlite3.Database // Usa o driver sqlite3
        });
        console.log(`Conectado ao banco de dados: ${DB_FILE}`);
        return db;
    } catch (error) {
        console.error("Erro ao conectar ao banco de dados:", error);
        throw error; // Propaga o erro
    }
}

// --------------------------------------------------
// ## Inicialização e Loop
// --------------------------------------------------

// Tradução de 'start'
function iniciar(client) {
    client.onMessage((message) => {
        console.log(message)
        if (message.body === 'Hello') {
            enviarTexto(client, message.from, 'Teste');
        }
    });
    executarLoop(client); // Chama a função traduzida
}

// Tradução de 'loopApp'
async function executarLoop(client) {
    try {
        while (true) {
            if (!estadoAppEmExecucao && !aguardandoDisparo) {
                estadoAppEmExecucao = true;
                verificarDiretorio(client); // Chama a função traduzida
            }
            await delay(4000);
        }
    } catch (error) {
        salvarLog(error); // Chama a função traduzida
    }
}

// --------------------------------------------------
// ## Gerenciamento de Arquivos e Disparo
// --------------------------------------------------

// Tradução de 'verificDir'
async function verificarDiretorio(client) {
    try {
        // Verifica a existência de arquivos de números
        const files = await fs.readdir(DIRS.NUMEROS);

        if (files.length === 0) {
            estadoAppEmExecucao = false;
            return;
        } else {
            lerArquivo(client, files[0]); // Chama a função traduzida
        }
    } catch (error) {
        salvarLog(error);
        estadoAppEmExecucao = false;
    }
}

// Tradução de 'readFile'
async function lerArquivo(client, fileName) {
    try {
        // Lê o conteúdo do arquivo de números
        const data = await fs.readFile(path.join(DIRS.NUMEROS, fileName), 'utf-8');
        prepararDisparo(client, data, fileName); // Chama a função traduzida
    } catch (error) {
        salvarLog(error);
    }
}

// Tradução de 'prepareWhats'
async function prepararDisparo(client, data, fileName) {
    try {
        let linhasDados = data.split(/[\n\r]/g);

        // Remoção de duplicatas e linhas vazias
        let arraySemDuplicatas = Array.from(new Set(linhasDados))
            .filter(line => line.trim() !== '');

        // Lê a mensagem para o disparo
        const dadosMensagem = await fs.readFile(path.join(DIRS.TEXTO, 'mensagem.txt'), 'utf-8');
        iniciarEnvio(client, arraySemDuplicatas, dadosMensagem, fileName); // Chama a função traduzida

    } catch (error) {
        salvarLog(error);
        estadoAppEmExecucao = false;
    }
}

// Tradução de 'startedSend'
async function iniciarEnvio(client, usuarios, mensagem, fileName) {
    try {
        let temporizador = 5000;

        const substituicoes = [
            "@val1", "@val2", "@val3", "@val4", "@val5",
            "@val6", "@val7", "@val8", "@val9", "@val10"
        ];

        aguardandoDisparo = true;

        for (let x = 0; x < usuarios.length; x++) {
            try {
                // Lê o temporizador ou usa o padrão
                const dadosTemporizador = await fs.readFile(path.join(DIRS.CONFIG, 'temporizador'), 'utf-8').catch(() => '5000');
                temporizador = parseInt(dadosTemporizador) || 5000;

                let usuarioAtual = usuarios[x].split(/[,]/g);
                let mensagemUsuarioAtual = mensagem;

                // Loop para substituição das variáveis
                for (let i = 0; i < substituicoes.length; i++) {
                    const placeholder = substituicoes[i];
                    const valor = usuarioAtual[i + 1] || '';
                    mensagemUsuarioAtual = mensagemUsuarioAtual.replace(new RegExp(placeholder, 'g'), valor);
                }

                // console.log('Enviando:', usuarioAtual[0], '| Mensagem:', mensagemUsuarioAtual.substring(0, 50) + '...');

                await delay(temporizador);
                await enviarTexto(client, usuarioAtual[0], mensagemUsuarioAtual); // Chama a função traduzida
            } catch (innerError) {
                console.error(`Erro ao processar linha ${x}:`, innerError.message);
                salvarLog(`Erro linha ${x}: ${innerError}`);
            }
        }

        aguardandoDisparo = false;
        moverArquivoFinalizado(fileName); // Chama a função traduzida
    } catch (error) {
        salvarLog(error);
    }
}

// Tradução de 'moveFileFinally'
async function moverArquivoFinalizado(fileName) {
    try {
        const lastPath = path.join(DIRS.NUMEROS, fileName);
        const newPath = path.join(DIRS.ENVIADOS, fileName);

        // Move o arquivo
        await fs.rename(lastPath, newPath);
        estadoAppEmExecucao = false;
    } catch (error) {
        salvarLog(error);
    }
}

// --------------------------------------------------
// ## Funções de Envio
// --------------------------------------------------

// Tradução de 'sendPreview'
async function enviarPreview(client, destinatario, link, content) {
    try {
        const result = await client.sendLinkPreview(destinatario, link, content);
        console.log('Preview enviada com sucesso:', result.id);
    } catch (erro) {
        console.error('Erro ao enviar Link Preview:', erro.message || erro);
        salvarLog(erro);
    }
}

// Tradução de 'sendText'
async function enviarTexto(client, from, msg) {
    try {
        const result = await client.sendText(from, msg).then((envio) => {
            inserirMensagemEnviada(envio, 'ENVIADO')
            console.log(envio)
        });
        salvarLog(result);
    } catch (erro) {
        salvarLog(erro);
    }
}

// --------------------------------------------------
// ## Funções do banco de dados
// --------------------------------------------------

async function inserirMensagemEnviada(msgData, statusControle) {

    const db = await conectarDB()

    // 1. Mapeamento e Conversão dos Dados
    const idMensagem = msgData.id;
    const origem = msgData.from;
    const destinatario = msgData.to || msgData.chatId; // Prioriza 'to', mas aceita 'chatId' como fallback
    const conteudo = msgData.body || msgData.content || ''; // Pega o corpo ou conteúdo
    const tipo = msgData.type;
    const timestampUnix = msgData.t; // O 't' é o timestamp Unix em segundos
    const ehGrupo = msgData.isGroupMsg ? 1 : 0; // Converte boolean para INTEGER (1 ou 0)
    const statusAck = msgData.ack || 0; // Usa 'ack' como status de confirmação

    const sql = `
        INSERT INTO mensagens (
            id_mensagem, origem, destinatario, conteudo, tipo,
            timestamp_unix, eh_grupo, status_ack, status_controle
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        idMensagem,
        origem,
        destinatario,
        conteudo,
        tipo,
        timestampUnix,
        ehGrupo,
        statusAck,
        statusControle
    ];

    try {
        // 2. Execução da Query
        const result = await db.run(sql, params);

        console.log(`Mensagem inserida. ID: ${result.lastID} | ID Mensagem: ${idMensagem}`);
        return result.lastID;

    } catch (error) {
        // 3. Tratamento de Erro
        // Verifica se é um erro de restrição UNIQUE (código de erro 19 para SQLite)
        if (error.errno === 19 || error.code === 'SQLITE_CONSTRAINT') {
            // Este é um caso comum (WPPConnect pode reenviar o evento). Apenas logamos e ignoramos.
            console.warn(`[AVISO DB] Mensagem duplicada encontrada e ignorada: ${idMensagem}`);
            return null;
        }

        // Loga e relança qualquer outro erro (conexão, sintaxe, etc.)
        console.error(`[ERRO DB] Falha ao inserir mensagem ${idMensagem}:`, error.message);
        throw error;
    }
}

// --------------------------------------------------
// ## Utilitários
// --------------------------------------------------

// Tradução de 'saveLog'
async function salvarLog(valor) {
    try {
        const caminhoLog = path.join(DIRS.LOGS, 'log.txt');
        let valorLog = (typeof valor === 'object') ? JSON.stringify(valor, null, 2) : String(valor);

        const now = new Date();
        const dataHumanizada = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

        let conteudoLogAtual = '';
        try {
            conteudoLogAtual = await fs.readFile(caminhoLog, 'utf-8');
        } catch (e) {
            // Se o arquivo de log não existir, continua com string vazia
        }

        const novoConteudoLog = `${conteudoLogAtual}${valorLog}, [${dataHumanizada}]\n`;
        await fs.writeFile(caminhoLog, novoConteudoLog);

        estadoAppEmExecucao = false;
    } catch (x) {
        console.error('Erro ao tentar salvar o log:', x);
    }
}
