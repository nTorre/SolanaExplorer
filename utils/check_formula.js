// UTILS FOR BACKTEST
//TODO MOVE TO backtest.js


function calcMedia(vec){
    let i = 0;
    let sum = 0.0;
    vec.forEach(element => {
        i+=1;
        sum += parseFloat(element);
    });

    return sum/i;
}

function checkToken(vec){
    let last21candels = [];
    let signals = [];
    vec.forEach(candle => {
        let currentVol = candle.volume;

        // if (candle.open > candle.close)
        //     currentVol = candle.volume;
        // else
        //     currentVol = -candle.volume;


        last21candels.push(currentVol)

    
        if (last21candels.length > 21){
            last21candels.shift();
            let media = calcMedia(last21candels);
            if (candle.open > candle.close){
                if (currentVol > media*1.5){
                    signals.push(candle.id);
                }
            }
        }

    });

    return signals;
}

async function checkTokenFormula(connection, tokenId, from, to) {

    let signals = [];

    let sql = 'SELECT * from token_historical_data thd ' +
        'WHERE thd.token_id = ? and (thd.unixTime <= ? and thd.unixTime >= ?)'


    try {
        const [results, fields] = await connection.execute(sql, [tokenId, to, from]);
        signals = signals.concat(checkToken(results));
    } catch (err) {
        console.log(err);
    }

    return signals;
}

async function checkTokensFormula(connection, from, to) {
    // per ogni token
    if (!connection) {
        console.log("Error DB not connected");
        return;
    }
    let signals = [];

    try {
        // Eseguire una query SELECT
        const [rows, fields] = await connection.execute('SELECT * FROM token_details WHERE mc > 100000');

        // I risultati della query sono disponibili nella variabile "rows"
        for (let i = 0; i < rows.length; i++) {
            let element = rows[i];
            signals = signals.concat(await checkTokenFormula(connection, element.id, from, to));
        }
        //console.log("Segnali inviati da " + new Date(from*1000 + 60 * 60 * 21 * 2 * 1000), "a", new Date(to*1000) + ":", signals);
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
    }

    return signals;
}

module.exports = checkTokensFormula