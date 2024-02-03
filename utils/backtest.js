const { connectToDatabase, closeConnection } = require('./../db/connection');
const { getCustomTokensHistory } = require('./save_token_info');
const checkTokensFormula = require('./check_formula');
const getTokensAndDbSave = require("./getlist");
var prompt = require('prompt-sync')();
const fs = require('fs');


async function buildCandles(connection, candles, path_to_file){

    const header = ["Symbol", "Name", "Address", "Mc", "Date", "Open", "Close", "High", "Low", "Volume"];
    const stream = fs.createWriteStream(path_to_file, { flags: 'a' });

    stream.write(header.join(",").toString() + "\n");


    for (let i=0; i<candles.length; i++){
        let candle = candles[i];
        // Token name, symbol, address, fdv, unixtime, ochlv
        // space
        // Token name, symbol, address, fdv, unixtime, ochlv

        try {
            // Eseguire una query SELECT
            const sql = "SELECT *, " +
            "(SELECT td.address from token_details td WHERE td.id = thd2.token_id) as address, " + 
            "(SELECT td.name from token_details td WHERE td.id = thd2.token_id) as name," +
            "(SELECT td.symbol from token_details td WHERE td.id = thd2.token_id) as symbol, " + 
            "(SELECT td.mc from token_details td WHERE td.id = thd2.token_id) as mc " +
            "from token_historical_data thd2 " +
            "WHERE thd2.token_id = " + 
                "(SELECT token_id " + 
                "FROM token_historical_data thd " +
                "WHERE thd.id = ?) and thd2.unixTime < (SELECT unixTime " +
                "FROM token_historical_data thd " +
                "WHERE thd.id = ?) "+
            "ORDER by thd2.unixTime " +
            "LIMIT 21; ";

            const [rows, fields] = await connection.execute(sql, [candle, candle]);
    
            // I risultati della query sono disponibili nella variabile "rows"
            for (let j = 0; j < rows.length; j++) {
                let element = rows[j];
                let data = [element.symbol, element.name, element.address, element.mc, element.unixTime, element.open, element.close, element.high, element.low, element.volume];
                stream.write(data.join(",").toString() + "\n");
            }

            stream.write("\n");


            //console.log("Segnali inviati da " + new Date(from*1000 + 60 * 60 * 21 * 2 * 1000), "a", new Date(to*1000) + ":", signals);
        } catch (error) {
            console.error('Errore durante l\'esecuzione della query:', error);
        }
    }

    stream.close();
}

async function main() {
    console.log("Backtest starting. It tests tokens which has 100k+ fdv nowaday");
    console.log("Connection to DB");
    let connection = await connectToDatabase();
    if (!connection) {
        console.log("Errore di connessione al DB");
        exit();
    }
    console.log("Connessione riuscita");

    console.log("------------------------------------");

    // get dates 
    let from_str = prompt("Backtest da [mm/dd/yyyy]: ");
    let from = new Date(from_str);
    if (Object.prototype.toString.call(from) === "[object Date]" && isNaN(from.getTime())) {
        let from_default = "01/26/2024";
        console.log("Date not well formatted. Using default", from_default);
        from = (new Date(from_default));
    }

    let to_str = prompt("Backtest a [mm/dd/yyyy]: ");
    let to = new Date(to_str);
    if (Object.prototype.toString.call(to) === "[object Date]" && isNaN(to.getTime())) {
        let to_default = "01/28/2024";
        console.log("Date not well formatted. Using default", to_default);
        to = (new Date(to_default));
    }

    from = from.getTime() - 60 * 60 * 21 * 2 * 1000; // tiro via 21 candele da 2 ore
    

    // update token list (TODO: save history ok fdv, is now overwrite every n hours)
    // when switching to bot, save last 

    // process.stdout.write("Updating token list, it may take two minutes... ");
    // await getTokensAndDbSave(connection);
    // console.log("Done");


    // get tokens data
    // process.stdout.write("Retrieving token data, it may takes 4 minutes... ");
    // await getCustomTokensHistory(connection, Math.floor(from/1000), Math.floor(to.getTime()/1000));
    // console.log("Done");


    // scrivo funzione che per ogni token vede i volumi e decide se c'è stata necessità di un segnale
    // versione per eventuale bot: devo itereare tutti i token ogni candela e non tutte le candele su ogni token (non necessario al momento)
    let candles = await checkTokensFormula(connection, Math.floor(from/1000), Math.floor(to.getTime()/1000));
    let path_to_file = "test/prova1.csv";
    buildCandles(connection, candles, path_to_file);
    console.log("Done");
}

async function backtest(from, to, path_to_file){
    console.log("Backtest starting. It tests tokens which has 100k+ fdv nowaday");
    console.log("Connection to DB");
    let connection = await connectToDatabase();
    if (!connection) {
        console.log("Errore di connessione al DB");
        exit();
    }
    console.log("Connessione riuscita");

    console.log(from, to);


    from = from.getTime() - 60 * 60 * 21 * 2 * 1000; // tiro via 21 candele da 2 ore
    

    // update token list (TODO: save history ok fdv, is now overwrite every n hours)
    // when switching to bot, save last 

    process.stdout.write("Updating token list, it may take two minutes... ");
    await getTokensAndDbSave(connection);
    console.log("Done");


    // get tokens data
    process.stdout.write("Retrieving token data, it may takes 4 minutes... ");
    await getCustomTokensHistory(connection, Math.floor(from/1000), Math.floor(to.getTime()/1000));
    console.log("Done");


    // scrivo funzione che per ogni token vede i volumi e decide se c'è stata necessità di un segnale
    // versione per eventuale bot: devo itereare tutti i token ogni candela e non tutte le candele su ogni token (non necessario al momento)
    let candles = await checkTokensFormula(connection, Math.floor(from/1000), Math.floor(to.getTime()/1000));
    console.log(candles);
    await buildCandles(connection, candles, path_to_file);
    console.log("Done");
}

module.exports = backtest;