const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

let connection;

async function insertTokenCandle(tokenData) {
    try {
        const [results] = await connection.execute(
            'INSERT INTO token_historical_data (token_id, close, high, low, open, type, unixTime, volume) ' +
            'SELECT id, ?, ?, ?, ?, ?, ?, ? ' +
            'FROM token_details ' +
            'WHERE address = ? ',
            [
                tokenData.c,
                tokenData.h,
                tokenData.l,
                tokenData.o,
                tokenData.type,
                tokenData.unixTime,
                tokenData.v,
                tokenData.address
            ]
        );

        if (results.insertId) {
            //console.log('Token inserito con successo! ID del token:', results.insertId);
        } else {
            console.log('Token già presente. Dati aggiornati.');
        }
    } catch (error) {
        console.error('Errore durante l\'inserimento del token:', error.message);
    }
}

async function getTokenHistory(address, periods = 21, timeframe = '2H') {

    // calcolo il time from
    const to = Math.floor(+new Date() / 1000);
    const from = to - 60 * 60 * 2 * periods;


    const headers = {
        "X-API-KEY": process.env.BIRD_EYE_TOKEN
    };

    try {
        const response = await axios.get(`https://public-api.birdeye.so/defi/ohlcv?address=${address}&type=${timeframe}&time_from=${from}&time_to=${to}`,
            {
                headers,
                timeout: 10000, // Timeout in milliseconds (ad esempio 10 secondi)
            });

        if (response.data.success === true) {

            response.data.data.items.forEach(item => {
                insertTokenCandle(item);

            });

            return { success: true, code: 0 };
        }
        else {
            return { success: false, code: 1, message: "Uknown API error" };
        }
    } catch (error) {
        return { success: false, code: 2, message: "Too much requests" };
    }
}

async function getTokensHistory(db_connection) {
    if (!db_connection) {
        console.log("Error DB not connected");
        return;
    }

    connection = db_connection;
    try {
        // Eseguire una query SELECT
        const [rows, fields] = await connection.execute('SELECT * FROM token_details WHERE mc > 100000');

        // I risultati della query sono disponibili nella variabile "rows"
        for (let i = 0; i < rows.length; i++) {
            let element = rows[i];
            let retry = 0;
            while (true) {
                let result = await getTokenHistory(element.address);
                //console.log(result);
                if (result.success === true) {
                    break;
                }
                retry++;
                if (retry == 10) {
                    console.log("Max retry reached");
                    break;
                }
            }
        }
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
    }
}

async function getCustomTokenHistory(address, timeframe = '2H', from, to) {

    const headers = {
        "X-API-KEY": process.env.BIRD_EYE_TOKEN
    };

    try {
        const response = await axios.get(`https://public-api.birdeye.so/defi/ohlcv?address=${address}&type=${timeframe}&time_from=${from}&time_to=${to}`,
            {
                headers,
                timeout: 10000, // Timeout in milliseconds (ad esempio 10 secondi)
            });

        if (response.data.success === true) {
            response.data.data.items.forEach(item => {
                insertTokenCandle(item);

            });
            return { success: true, code: 0 };
        }
        else {
            return { success: false, code: 1, message: "Uknown API error" };
        }
    } catch (error) {
        return { success: false, code: 2, message: "Too much requests" };
    }
}

async function getCustomTokensHistory(db_connection, from, to) {
    if (!db_connection) {
        console.log("Error DB not connected");
        return;
    }

    connection = db_connection;
    try {
        // Eseguire una query SELECT
        const [rows, fields] = await connection.execute('SELECT * FROM token_details WHERE mc > 100000');

        // I risultati della query sono disponibili nella variabile "rows"
        for (let i = 0; i < rows.length; i++) {
            let element = rows[i];
            let retry = 0;
            while (true) {
                let result = await getCustomTokenHistory(element.address, "2H", from, to);
                //console.log(result);
                if (result.success === true) {
                    break;
                }
                retry++;
                if (retry == 10) {
                    console.log("Max retry reached");
                    break;
                }
            }
        }
    } catch (error) {
        console.error('Errore durante l\'esecuzione della query:', error);
    }
}

module.exports = { getTokensHistory, getCustomTokensHistory };