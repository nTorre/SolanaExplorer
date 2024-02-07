const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const getTokensAndDbSave = require("./utils/getlist");
const { getTokensHistory } = require("./utils/save_token_info");
const cron = require('node-cron');
const moment = require('moment');
const TelegramBot = require('node-telegram-bot-api');
const sendMessage = require('./utils/send_message');
const fs = require('fs');
const path = require('path');

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
let chatIds = [488436824];

let connection;

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


// Funzione per connettersi al database
async function connectToDatabase() {
    connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT
    });
}


// Funzione per chiudere la connessione al database
async function closeConnection() {
    if (connection) {
        await connection.end();
        console.log('Connessione al database chiusa.');
    }
}

function checkFormula(candles) {
    let i = 0;
    let volSum = 0;
    let lastCandle = candles[1];
    candles.forEach(element => {
        if (i == 0) {
            i++;
        } else {
            let currVol = parseFloat(element.volume);
            volSum += currVol;
            i++;
        }
    });

    let sma = volSum / i;
    let lastVol = lastCandle.volume;
    let lastPrice = lastCandle.close;

    // if ((lastVol > sma*1.5) && (lastCandle.open<lastCandle.close)){
    //     console.log(candles[1]);
    //     console.log(sma, lastVol);
    // }


    return {
        isValid: ((lastVol > sma * 1.5) && (lastCandle.open < lastCandle.close)),
        sma: sma,
        lastVol: lastVol,
        lastPrice: lastPrice
    };
}

async function buildSignal(candles, tokenId, sma, lastVol, lastPrice) {
    // get token info
    let sql = 'SELECT * from token_details td ' +
        'WHERE td.id = ?';

    try {
        const [results, fields] = await connection.execute(sql, [tokenId]);
        let token = results[0];
        //console.log(new Date(), token);
        for (let i=0; i<chatIds.length; i++){
            let chatId = chatIds[i];
            await sendMessage(bot, chatId, candles, token, lastPrice, lastVol, sma)
        }

    } catch (err) {
        console.log(err);
    }
}

async function checkTokenFormula(tokenId) {

    let sql = 'SELECT * from token_historical_data thd ' +
        'WHERE thd.token_id = ? ' +
        'ORDER BY thd.unixTime DESC ' +
        'LIMIT 22';

    try {
        const [results, fields] = await connection.execute(sql, [tokenId]);
        let {isValid, sma, lastVol, lastPrice} = checkFormula(results);
        if (results.length >= 22 && isValid) {
            //console.log(tokenId);
            await buildSignal(results, tokenId, sma, lastVol, lastPrice);
            console.log("Sent Signal", tokenId);
            // costruisci e manda segnale

        } else {
            //console.log("No signal for", tokenId);
        }
    } catch (err) {
        console.log(err);
    }

}

async function checkTokensFormula() {
    // pulisco la cartella dei grafici
    deleteFilesInDirectory("./charts")
    let sql = 'SELECT * from token_details td ' +
        'WHERE td.mc > 100000';

    try {
        const [results, fields] = await connection.execute(sql, []);
        for (let i = 0; i < results.length; i++) {
            let element = results[i];
            await checkTokenFormula(element.id);
        }

    } catch (err) {
        console.log(err);
    }
}

async function main() {
    console.log("Starting Solana Scanning");

    console.log("1) Connecting to Database");
    await connectToDatabase();
    console.log("Done");

    // console.log("3) Retrieving last 21 periods");
    //     await getTokensHistory(connection);
    //     console.log("Done");

    //await checkTokensFormula();


    // await closeConnection();
    // process.exit();
}

main();


cron.schedule('0 * * * *', async () => {
    const oraCorrente = moment().hour();
    if (oraCorrente % 2 === 0) {
        console.log("2) Retrieving Tokens fdv 100k min");
        await getTokensAndDbSave(connection);
        console.log("Done");

        console.log("3) Retrieving last 21 periods");
        await getTokensHistory(connection);
        console.log("Done");

        // ora applico la formula per tutti i token
        await checkTokensFormula();

    }
});


bot.on('message', (msg) => {
    if (!chatIds.includes(msg.chat.id)){
        chatIds.push(msg.chat.id);
        console.log(msg.chat.id);
    }
});

function deleteFilesInDirectory(directoryPath) {
    // Ottieni un elenco dei file nella cartella
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.error('Errore durante la lettura della cartella:', err);
        return;
      }
  
      // Elimina ciascun file nella cartella
      files.forEach((file) => {
        const filePath = path.join(directoryPath, file);
  
        // Verifica se è un file
        fs.stat(filePath, (statErr, stats) => {
          if (statErr) {
            console.error('Errore durante il recupero delle informazioni sul file:', statErr);
            return;
          }
  
          if (stats.isFile()) {
            // Elimina il file
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error('Errore durante l\'eliminazione del file:', unlinkErr);
                return;
              }
  
              console.log('File eliminato con successo:', filePath);
            });
          }
        });
      });
    });
  }