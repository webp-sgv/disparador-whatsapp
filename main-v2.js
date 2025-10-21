const wppconnect = require('@wppconnect-team/wppconnect');
// Otimização: Usa a versão 'promises' do fs para async/await nativo
const fs = require('fs').promises; 
const path = require('path');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let stateAppRun = false;
let forSender = false;

// Configurações de diretórios
const DIRS = {
    NUMEROS: 'disparar/numeros/',
    ENVIADOS: 'disparar/enviados/',
    TEXTO: 'disparar/texto/',
    CONFIG: 'config/',
    LOGS: 'logs/'
};

wppconnect.create({ session: 'disparo' }).then((client) => start(client));

// --------------------------------------------------
// ## Inicialização
// --------------------------------------------------

function start(client) {
    client.onMessage((message) => {
        console.log(message);
        if (message.body === 'Hello') {
            sendText(client, message.from, 'Teste');
        }
    });
    loopApp(client);
}

// --------------------------------------------------
// ## Disparo e Envio
// --------------------------------------------------

async function verificDir(client) {
    try {
        // Otimização: await fs.readdir substitui callback
        const files = await fs.readdir(DIRS.NUMEROS);

        if (files.length === 0) {
            stateAppRun = false;
            return;
        } else {
            readFile(client, files[0]);
        }
    } catch (error) {
        // Captura e loga erros como diretório inexistente
        saveLog(error);
        stateAppRun = false;
    }
}

async function readFile(client, fileName) {
    try {
        // Otimização: await fs.readFile substitui callback
        const data = await fs.readFile(path.join(DIRS.NUMEROS, fileName), 'utf-8');
        prepareWhats(client, data, fileName);
    } catch (error) {
        saveLog(error);
    }
}

async function prepareWhats(client, data, fileName) {
    try {
        let linesData = data.split(/[\n\r]/g);

        // Otimização: Remoção de duplicatas mais concisa
        let ArrayNotDuplicate = Array.from(new Set(linesData));

        // Otimização: Remoção de strings vazias mais concisa
        ArrayNotDuplicate = ArrayNotDuplicate.filter(line => line.trim() !== '');

        // Otimização: await fs.readFile substitui callback aninhado
        const messageData = await fs.readFile(path.join(DIRS.TEXTO, 'mensagem.txt'), 'utf-8');
        startedSend(client, ArrayNotDuplicate, messageData, fileName);

    } catch (error) {
        saveLog(error);
        stateAppRun = false;
    }
}

async function startedSend(client, user, msg, fileName) {
    try {
        let temporizador = 5000;
        
        // Otimização: Array para mapeamento de variáveis, mais limpo
        const replacements = [
            "@val1", "@val2", "@val3", "@val4", "@val5",
            "@val6", "@val7", "@val8", "@val9", "@val10"
        ];

        forSender = true;

        for (let x = 0; x < user.length; x++) {
            try {
                // Otimização: await para leitura de temporizador
                const timerData = await fs.readFile(path.join(DIRS.CONFIG, 'temporizador'), 'utf-8').catch(() => '5000');
                temporizador = parseInt(timerData) || 5000;
                
                let userCurrent = user[x].split(/[,]/g);
                let msgUserCurrent = msg;

                // Otimização: Loop para substituição, tornando o código mais escalável
                for (let i = 0; i < replacements.length; i++) {
                    const placeholder = replacements[i];
                    const value = userCurrent[i + 1] || ''; // +1 porque a primeira coluna é o número
                    msgUserCurrent = msgUserCurrent.replace(new RegExp(placeholder, 'g'), value);
                }

                console.log('Enviando:', userCurrent[0], '| Mensagem:', msgUserCurrent.substring(0, 50) + '...');

                await delay(temporizador);
                // Otimização: sendText agora usa async/await
                await sendText(client, userCurrent[0], msgUserCurrent); 
            } catch (innerError) {
                console.error(`Erro ao processar linha ${x} (${user[x]}):`, innerError.message);
                saveLog(`Erro linha ${x}: ${innerError}`);
            }
        }
        
        forSender = false;
        moveFileFinally(fileName);
    } catch (error) {
        saveLog(error);
    }
}

// --------------------------------------------------
// ## Funções de Utilitários
// --------------------------------------------------

async function sendPreview(client, destinatario, link, content) {
    // Otimização: Estrutura padrão async/await para lidar com Promises
    try {
        const result = await client.sendLinkPreview(destinatario, link, content);
        console.log('Preview enviada com sucesso:', result.id);
    } catch (erro) {
        console.error('Erro ao enviar Link Preview:', erro.message || erro);
        saveLog(erro);
    }
}

async function sendText(client, from, msg) {
    // Otimização: Estrutura padrão async/await para lidar com Promises
    try {
        const result = await client.sendText(from, msg);
        saveLog(result);
    } catch (erro) {
        saveLog(erro);
    }
}

async function moveFileFinally(fileName) {
    try {
        const lastPath = path.join(DIRS.NUMEROS, fileName);
        const newPath = path.join(DIRS.ENVIADOS, fileName);

        // Otimização: await fs.rename substitui callback
        await fs.rename(lastPath, newPath);
        stateAppRun = false;
    } catch (error) {
        saveLog(error);
    }
}

async function saveLog(value) {
    try {
        const logPath = path.join(DIRS.LOGS, 'log.txt');
        let logValue = (typeof value === 'object') ? JSON.stringify(value, null, 2) : String(value);

        const now = new Date();
        const dateHuman = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

        let currentLog = '';
        try {
            currentLog = await fs.readFile(logPath, 'utf-8');
        } catch (e) {
            // Ignora erro se o arquivo de log não existir e o cria no próximo passo.
        }
        
        const newLogContent = `${currentLog}${logValue}, [${dateHuman}]\n`;
        await fs.writeFile(logPath, newLogContent);
        
        stateAppRun = false;
    } catch (x) {
        console.error('Erro ao tentar salvar o log:', x);
    }
}

async function loopApp(client) {
    try {
        // Otimização: Loop infinito mais simples
        while (true) {
            if (!stateAppRun && !forSender) {
                stateAppRun = true;
                verificDir(client);
            }
            await delay(4000);
        }
    } catch (error) {
        saveLog(error);
    }
}