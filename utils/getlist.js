const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

let connection;

async function insertOrUpdateToken(tokenData) {
    try {
        // Inserire o aggiornare i dettagli del token nella tabella token_details
        const [results] = await connection.execute(
            'INSERT INTO token_details (address, decimals, logoURI, symbol, name, liquidity, last_update, mc) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ' +
            'ON DUPLICATE KEY UPDATE decimals=?, logoURI=?, symbol=?, name=?, liquidity=?, last_update=?, mc=?',
            [
                tokenData.address,
                tokenData.decimals,
                tokenData.logoURI,
                tokenData.symbol,
                tokenData.name,
                tokenData.liquidity,
                tokenData.last_update,
                tokenData.mc,
                tokenData.decimals,
                tokenData.logoURI,
                tokenData.symbol,
                tokenData.name,
                tokenData.liquidity,
                tokenData.last_update,
                tokenData.mc

            ]
        );

        if (results.insertId) {
            //console.log('Token inserito con successo! ID del token:', results.insertId);
        } else {
            //console.log('Token già presente. Dati aggiornati.');
        }
    } catch (error) {
        //console.error('Errore durante l\'inserimento o l\'aggiornamento del token:', tokenData, error.message);
    }
}


async function getToken(offset = 0) {
    const headers = {
        "X-API-KEY": process.env.BIRD_EYE_TOKEN
    };

    try {
        const response = await axios.get(`https://public-api.birdeye.so/public/tokenlist?sort_by=mc&sort_type=desc&offset=${offset}`, { headers });

        if (response.data.success === true) {
            let datetime = response.data.data.updateUnixTime;
            let tokens = response.data.data.tokens;
            let last_mc = 0;
            tokens.forEach(token => {
                // se liquidità bassa scompensa market cap
                if (token.liquidity > 1000){
                    insertOrUpdateToken({
                        address: token.address,
                        decimals: token.decimals,
                        logoURI: token.logoURI,
                        symbol: token.symbol,
                        name: token.name,
                        liquidity: token.liquidity,
                        last_update: datetime,
                        mc: token.mc,
                    })
                    last_mc = token.mc;
                }
            });

            return { success: true, code: 0, last_mc: last_mc };
        }
        else {
            return { success: false, code: 1, message: "Uknown API error" };
        }
    } catch (error) {
        return { success: false, code: 2, message: "Too much requests" };
    }
}

async function getTokensAndDbSave(db_connection){
    if (!db_connection) {
        console.log("Error DB not connected");
        return;
    }

    connection = db_connection;


    let i = 0;

    while (true){
        let result = await getToken(i*50);             // max offset
        if (result.success === true){
            // richiesta andata a buon fine, incremento i e vado avanti
            // controllo prima market cap > 100000
            if (result.last_mc < 100000){
                break;
            }
            i++;
        } else if (result.code === 1){
            // errore sconosciuto, da gestire in futuro
        } else if (result.code === 2){
            console.log("Overload, sleeping...");
            sleep(5000);
            // attendo n millesimi e rifaccio la richiesta (Too much requests)
        }
    }

    return i;           // ritorno numero di richieste effettuate (* 50 ottengo i token inseriti)
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


module.exports = getTokensAndDbSave