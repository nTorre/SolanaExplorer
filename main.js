const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const getTokensAndDbSave = require("./utils/getlist");
const { getTokensHistory } = require("./utils/save_token_info");
const cron = require('node-cron');
const moment = require('moment');
const TelegramBot = require('node-telegram-bot-api');

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
let chatIds = [488436824];

let connection;

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

    // if ((lastVol > sma*1.5) && (lastCandle.open<lastCandle.close)){
    //     console.log(candles[1]);
    //     console.log(sma, lastVol);
    // }


    return ((lastVol > sma * 1.5) && (lastCandle.open < lastCandle.close));
}

async function buildSignal(candles, tokenId) {
    // get token info
    //console.log(tokenId);
    let sql = 'SELECT * from token_details td ' +
        'WHERE td.id = ?';

    try {
        const [results, fields] = await connection.execute(sql, [tokenId]);
        let token = results[0];
        console.log(new Date(), token);
        chatIds.forEach(chatId => {
            bot.sendMessage(chatId, JSON.stringify(token));
        });

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
        if (results.length >= 22 && checkFormula(results)) {
            //console.log(tokenId);
            await buildSignal(results, tokenId);
            // costruisci e manda segnale

        } else {
            //console.log("No signal for", tokenId);
        }
    } catch (err) {
        console.log(err);
    }

}

async function checkTokensFormula() {
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

    await checkTokensFormula();


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