const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

// Nome do arquivo do banco de dados (será criado se não existir)
const DB_FILE = path.resolve(__dirname, 'data/database.sqlite');


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

/**
 * Cria a tabela de 'mensagens' se ela não existir.
 * @param {sqlite.Database} db Objeto de conexão com o DB.
 */
async function criarTabela(db) {
    const sql = `
        CREATE TABLE IF NOT EXISTS mensagens (
            -- Chave Primária, única e auto-incrementada.
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            -- ID de Mensagem Único do WhatsApp. Crucial para evitar duplicatas e buscas rápidas.
            id_mensagem TEXT NOT NULL UNIQUE,

            -- Remetente (ex: '556281992374@c.us').
            origem TEXT NOT NULL,
            
            -- Destinatário (ex: '556281056908@c.us').
            destinatario TEXT NOT NULL,
            
            -- Conteúdo principal da mensagem (body).
            conteudo TEXT,
            
            -- Tipo da mensagem (ex: 'chat').
            tipo TEXT NOT NULL,
            
            -- Coluna 't' (Timestamp Unix em segundos). Usar INTEGER é mais eficiente que TEXT.
            timestamp_unix INTEGER NOT NULL,
            
            -- Indicador se é mensagem de grupo (BOOLEAN em SQLite é armazenado como INTEGER 0 ou 1).
            eh_grupo INTEGER NOT NULL,
            
            -- Status de Ack da mensagem (ex: 1).
            status_ack INTEGER NOT NULL,

            -- Status de controle interno da aplicação (ex: 'PENDENTE', 'ENVIADO', 'FALHA').
            status_controle TEXT NOT NULL 
        );
    `;
    await db.exec(sql);
    console.log("Tabela 'mensagens' verificada/criada.");
}

/**
 * Funções CRUD
 */

async function inserirMensagem(db, msgData, statusControle = 'PENDENTE') {
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

// READ (R) - Lendo todos
async function buscarTodasMensagens(db) {
    // O 'all' é usado para SELECT que retorna múltiplas linhas
    const mensagens = await db.all(`SELECT * FROM mensagens ORDER BY id DESC`);
    return mensagens;
}

// READ (R) - Lendo uma
async function buscarMensagemPorID(db, id) {
    // O 'get' é usado para SELECT que retorna uma única linha
    const mensagem = await db.get(`SELECT * FROM mensagens WHERE id = ?`, [id]);
    return mensagem;
}

// UPDATE (U)
async function atualizarStatus(db, id, novoStatus) {
    const result = await db.run(
        `UPDATE mensagens SET status = ? WHERE id = ?`,
        [novoStatus, id]
    );
    console.log(`Status da mensagem ID ${id} atualizado. Linhas afetadas: ${result.changes}`);
    return result.changes;
}

// DELETE (D)
async function deletarMensagem(db, id) {
    const result = await db.run(`DELETE FROM mensagens WHERE id = ?`, [id]);
    console.log(`Mensagem ID ${id} deletada. Linhas afetadas: ${result.changes}`);
    return result.changes;
}

/**
 * Função Principal de Demonstração
 */
async function main() {
    let db;
    try {
        db = await conectarDB();
        await criarTabela(db);

        // 1. INSERIR
        const id1 = await inserirMensagem(db, '5511987654321@c.us', 'Teste de disparo 1');
        const id2 = await inserirMensagem(db, '5521912345678@c.us', 'Teste de disparo 2');

        // 2. LER TUDO
        console.log("\n--- Todas as Mensagens (Antes do Update) ---");
        let todas = await buscarTodasMensagens(db);
        console.log(todas);

        // 3. ATUALIZAR
        await atualizarStatus(db, id1, 'ENVIADO');

        // 4. LER UMA ESPECÍFICA
        console.log("\n--- Mensagem 1 (Após o Update) ---");
        let mensagemAtualizada = await buscarMensagemPorID(db, id1);
        console.log(mensagemAtualizada);

        // 5. DELETAR
        await deletarMensagem(db, id2);

        // 6. LER TUDO (Final)
        console.log("\n--- Todas as Mensagens (Após o Delete) ---");
        todas = await buscarTodasMensagens(db);
        console.log(todas);

    } catch (error) {
        console.error("Um erro ocorreu na execução principal:", error);
    } finally {
        // Garante que a conexão seja fechada
        if (db) {
            await db.close();
            console.log("\nConexão com o DB fechada.");
        }
    }
}

// Executar a função principal
main();