const wppconnect = require('@wppconnect-team/wppconnect');
const fs = require('fs'); /* DEPENDENCE FILESYSTEM */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms)); /* AWAIT TIMER */
let stateAppRun = false; // STATE APP RUN SET START = false
let forSender = false;
wppconnect.create({session: 'disparo'}).then((client) => start(client)); /* START SESSION */

/* VERIFIC EXIST FILE FOR READ */
async function verificDir(client){

    try{
        fs.readdir('disparar/pendente/numeros/', (err, files) => {
            if (err)
                console.log(err);
            else {
                console.clear();
                if(!files[0]){
                    stateAppRun = false;
                    return;
                }else{
                    readFile(client, files[0]);
                }
                
                // files.forEach(file => {
                //     console.log(file);
                // })
            }
        });
    }catch(x){
        saveLog(x);
    }

}

/* MAIN APP BOT/ZAP */
function start(client) {
    client.onMessage((message) => {
        if (message.body === 'Hello') {
            sendText(client, message.from, 'Teste');
        }
    });
    loopApp(client);
}

async function sendText(client, from, msg){

    try{
        client
        .sendText(from, msg)
        .then((result) => {saveLog(result);})
        .catch((erro) => {saveLog(erro)});
    }catch(x){
        saveLog(x);
    }

}

/* VERIFIC IF FILE EXIST */
async function readFile(client, fileName){

    try{
        fs.readFile(`disparar/pendente/numeros/${fileName}`, 'utf-8', function(err, data){ 
            prepareWhats(client, data, fileName);
        });
    }catch(x){
        saveLog(x);
    }

}

async function prepareWhats(client, data, fileName){

    try{
        /* SPLICE ITEM INTO ARRAY */
        let linesData = data.split(/[\n\r]/g);

        /* REMOVE DUPLICATE */
        const ArrayNotDuplicate = linesData.filter(function(ele , pos){
            return linesData.indexOf(ele) == pos;
        });

        /* REMOVE SPACE IN ARRAY */
        for(let x=0;x<ArrayNotDuplicate.length;x++){
            if(ArrayNotDuplicate[x] == ''){
                ArrayNotDuplicate.splice(x, 1);
            }
        }

        /* GET MESSAGE FOR SEND WHATSSAPP */
        fs.readFile('disparar/pendente/mensagem.txt', 'utf-8', function(err, data){
            if(err){
                saveLog(err);
                stateAppRun = false;
                return false;
            }else{
                startedSend(client, ArrayNotDuplicate, data, fileName);
            }
        });
        //console.log(ArrayNotDuplicate);
        
    }catch(x){
        saveLog(x);
    }

}

/* START SEND WHATSAPP */
async function startedSend(client, user, msg, fileName){

    try{
        let temporizador = 5000; // TIMER SEND WHATSAPP
        let objReplace = {
            1:"@val1",2:"@val2",3:"@val3",4:"@val4",5:"@val5",
            6:"@val6",7:"@val7",8:"@val8",9:"@val9",10:"@val10"
        }
        let totalKeyJson = Object.keys(objReplace).length;
        let valueJosn = Object.values(objReplace);

        /* LOOP WHILE LINE AND SPLIT [,] */
        for(let x=0;x<user.length;x++){
            /* SET STATE FOR IN RUN */
            forSender = true;
            /* GET TIMER SLEEP AWAIT */
            fs.readFile('config/temporizador', 'utf-8', function(err, data){
                if(err){temporizador=5000}else{
                    parseInt(data);
                }
            });
            let userCurrent = user[x].split(/[,]/g);
            let msgUserCurrent = "";
            msgUserCurrent = 
            msg.replace(valueJosn[0], userCurrent[1])
            .replace(valueJosn[1], userCurrent[2])
            .replace(valueJosn[2], userCurrent[3])
            .replace(valueJosn[3], userCurrent[4])
            .replace(valueJosn[4], userCurrent[5])
            .replace(valueJosn[5], userCurrent[6])
            .replace(valueJosn[6], userCurrent[7])
            .replace(valueJosn[7], userCurrent[8])
            .replace(valueJosn[8], userCurrent[9])
            .replace(valueJosn[9], userCurrent[10])
            console.log(userCurrent, msgUserCurrent);
            
            await delay(temporizador);
            sendText(client, userCurrent[0], msgUserCurrent);
        }
        /* SET STATE FOR IN RUN */
        forSender = false;
        moveFileFinally(fileName);
    }catch(x){
        saveLog(x);
    }

}

/* MOVE FILE FOR PATH FINALLY */
async function moveFileFinally(fileName){

    try{
        var lastPath = `disparar/pendente/numeros/${fileName}`;
        var newPath = `disparar/enviado/${fileName}`;
        
        fs.rename(lastPath, newPath, function (err) {
            if (err) {
                saveLog(err);
            }else{
                stateAppRun = false;
            }
        })
    }catch(x){
        saveLog(x);
    }

}

/* SAVE LOG ERRO LOG */
async function saveLog(value){
    try{
        let back = value;
        if(typeof(value) == 'object'){value = JSON.stringify(value)}else{
            value = back;
        }
        let now = new Date();
        let day = `${now.getDate()<10?`0${now.getDate()}`:now.getDate()}`,
        month = `${now.getMonth()+1<10?`0${now.getMonth()+1}`:now.getMonth()+1}`,
        hours = `${now.getHours()<10?`0${now.getHours()}`:now.getHours()}`,
        minutes = `${now.getMinutes()<10?`0${now.getMinutes()}`:now.getMinutes()}`,
        fullYear = `${now.getFullYear()}`,
        dateHuman = `${day}/${month}/${fullYear} ${hours}:${minutes}`;

        fs.readFile('logs/log.txt', function(err, data){
            if(err){
                fs.writeFile("logs/log.txt", `${value}, [${dateHuman}]\n`, (err) => {});
            }else{
                fs.writeFile("logs/log.txt", `${data}${value}, [${dateHuman}]\n`, (err) => {});
            }
        })
        stateAppRun = false;
    }catch(x){
        console.log('Error in save log, [function>saveLog()>[file]>main.js]', x);
    }

}

/* FUNCTION LOOP APP */
async function loopApp(client){

    try{
        for(let x=0;x<2;x++){

            if(!stateAppRun && !forSender){
                console.log('O programa iniciou', stateAppRun);
                stateAppRun = true;
                verificDir(client);
            }
            //console.clear();
            console.log('O programa está pausado', stateAppRun);
            await delay(4000);
            x--;
        }
    }catch(x){
        saveLog(x);
    }

}