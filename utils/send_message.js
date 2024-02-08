const fs = require('fs');
const genChart = require('./gen_chart');


process.env["NTBA_FIX_350"] = 1;


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function sendMessage(bot, chatId, candles, token, lastprice, lastVol, sma) {

    const address = token.address;
    const pair = token.symbol + "/USD";
    const val = 10;
    const fdv = Number(token.mc).toFixed(2);
    const liquidity = Number(token.liquidity).toFixed(2);

    const markdownMessage = `
💵 Pair detected: *${pair}*
📊 Address: \`${address}\`

Price USD: *${lastprice} $*
FDV: *${fdv} $*
Total liquidity: *${liquidity}*

Last volume (2H): *${Number(lastVol).toFixed(2)}*
2H Volume MA(21): *${Number(sma).toFixed(2)}*`;

    let file = "./charts/" + address + (new Date()).getTime() + ".png";

    genChart(candles, file);

    await sleep(1500);


    bot.sendPhoto(chatId, file, {
        caption: markdownMessage, parse_mode: 'Markdown', reply_markup: {
            inline_keyboard: [
                [
                    { text: '🦉 BirdEye', url: `https://birdeye.so/token/${address}?chain=solana` },
                    { text: '🦅 DexScreenr', url: `https://dexscreener.com/solana/${address}` }
                ]
            ]
        }
    });
}





testData = [
    {
        id: 590615,
        token_id: 731,
        close: '0.1405993930',
        high: '0.1405993930',
        low: '0.1405993930',
        open: '0.1405993930',
        type: '2H',
        unixTime: '1706781600',
        volume: '0.00000000000000000000'
    },
    {
        id: 590614,
        token_id: 731,
        close: '0.1405993930',
        high: '0.1405993930',
        low: '0.1243680558',
        open: '0.1280351495',
        type: '2H',
        unixTime: '1706774400',
        volume: '22960.61548000000000000000'
    },
    {
        id: 590613,
        token_id: 731,
        close: '0.1280351495',
        high: '0.1280351495',
        low: '0.1240189039',
        open: '0.1236609594',
        type: '2H',
        unixTime: '1706767200',
        volume: '1397.54645300000000000000'
    },
    {
        id: 590612,
        token_id: 731,
        close: '0.1236609594',
        high: '0.1307909379',
        low: '0.1236609594',
        open: '0.1326600470',
        type: '2H',
        unixTime: '1706760000',
        volume: '5693.73530400000000000000'
    },
    {
        id: 590611,
        token_id: 731,
        close: '0.1326600470',
        high: '0.1332216262',
        low: '0.1302925550',
        open: '0.1292763427',
        type: '2H',
        unixTime: '1706752800',
        volume: '2440.69899400000000000000'
    },
    {
        id: 590610,
        token_id: 731,
        close: '0.1292763427',
        high: '0.1331106271',
        low: '0.1292763427',
        open: '0.1339285288',
        type: '2H',
        unixTime: '1706745600',
        volume: '6045.99054900000100000000'
    },
    {
        id: 590609,
        token_id: 731,
        close: '0.1339285288',
        high: '0.1447119940',
        low: '0.1339285288',
        open: '0.1456877467',
        type: '2H',
        unixTime: '1706738400',
        volume: '7711.98473100000000000000'
    },
    {
        id: 590608,
        token_id: 731,
        close: '0.1456877467',
        high: '0.1470837960',
        low: '0.1235966151',
        open: '0.1353316743',
        type: '2H',
        unixTime: '1706731200',
        volume: '19607.14014600000000000000'
    },
    {
        id: 590607,
        token_id: 731,
        close: '0.1353316743',
        high: '0.1506490382',
        low: '0.1353316743',
        open: '0.1456124386',
        type: '2H',
        unixTime: '1706724000',
        volume: '9243.21521300000000000000'
    },
    {
        id: 590606,
        token_id: 731,
        close: '0.1456124386',
        high: '0.1548078045',
        low: '0.1426568333',
        open: '0.1463488185',
        type: '2H',
        unixTime: '1706716800',
        volume: '11925.69069599999800000000'
    },
    {
        id: 590605,
        token_id: 731,
        close: '0.1463488185',
        high: '0.1613362139',
        low: '0.1171411447',
        open: '0.1164746174',
        type: '2H',
        unixTime: '1706709600',
        volume: '31126.32667699999700000000'
    },
    {
        id: 590604,
        token_id: 731,
        close: '0.1164746174',
        high: '0.1226938704',
        low: '0.1164746174',
        open: '0.1217893463',
        type: '2H',
        unixTime: '1706702400',
        volume: '4269.16148100000000000000'
    },
    {
        id: 590603,
        token_id: 731,
        close: '0.1217893463',
        high: '0.1217893463',
        low: '0.1170607810',
        open: '0.1166332448',
        type: '2H',
        unixTime: '1706695200',
        volume: '4897.42304900000000000000'
    },
    {
        id: 590602,
        token_id: 731,
        close: '0.1166332448',
        high: '0.1191065728',
        low: '0.1131109831',
        open: '0.1099301340',
        type: '2H',
        unixTime: '1706688000',
        volume: '7096.72830099999900000000'
    },
    {
        id: 590601,
        token_id: 731,
        close: '0.1099301340',
        high: '0.1122408731',
        low: '0.1057819151',
        open: '0.1118795031',
        type: '2H',
        unixTime: '1706680800',
        volume: '6672.73020200000100000000'
    },
    {
        id: 590600,
        token_id: 731,
        close: '0.1118795031',
        high: '0.1118795031',
        low: '0.1061553891',
        open: '0.1039886785',
        type: '2H',
        unixTime: '1706673600',
        volume: '6469.56674700000000000000'
    },
    {
        id: 590599,
        token_id: 731,
        close: '0.1039886785',
        high: '0.1112284796',
        low: '0.1039886785',
        open: '0.1035386576',
        type: '2H',
        unixTime: '1706666400',
        volume: '11559.31766300000000000000'
    },
    {
        id: 590598,
        token_id: 731,
        close: '0.1035386576',
        high: '0.1251400298',
        low: '0.1021642579',
        open: '0.1246759207',
        type: '2H',
        unixTime: '1706659200',
        volume: '35038.98660400000000000000'
    },
    {
        id: 590597,
        token_id: 731,
        close: '0.1246759207',
        high: '0.1409841699',
        low: '0.1214218535',
        open: '0.1380490486',
        type: '2H',
        unixTime: '1706652000',
        volume: '18932.16220900000000000000'
    },
    {
        id: 590596,
        token_id: 731,
        close: '0.1380490486',
        high: '0.1548626059',
        low: '0.1380490486',
        open: '0.1551100621',
        type: '2H',
        unixTime: '1706644800',
        volume: '7870.12791200000000000000'
    },
    {
        id: 590595,
        token_id: 731,
        close: '0.1551100621',
        high: '0.1554232013',
        low: '0.1180261575',
        open: '0.1208808699',
        type: '2H',
        unixTime: '1706637600',
        volume: '22194.61981700000300000000'
    },
    {
        id: 211439,
        token_id: 731,
        close: '0.1549794278',
        high: '0.1717500005',
        low: '0.1549794278',
        open: '0.1704561462',
        type: '2H',
        unixTime: '1706392800',
        volume: '18954.10610300000000000000'
    }
];

tokenData = { "id": 24762, "address": "8W1NCxq8z9JuudGHhNJG6edjTJAQVi5fmaYBW8Bth3KS", "decimals": 4, "logoURI": "https://bafkreiccw4bpwi57w24fls2sklavowwccny23l5x3be44kspygkqv75zmy.ipfs.nftstorage.link", "symbol": "MYTOKEN", "name": "mytokennnnnn", "liquidity": "19841.04444963579000000000", "last_update": "1707314582", "mc": "128458.09394117618000000000" }

async function main() {
    bot.on('message', async (msg) => {
        let sma = 21212;
        let lastVol = 33223;
        let lastPrice = 332;
        // await sendMessage(testData, tokenData, lastPrice, lastVol, sma);
        console.log(msg.chat.id)

    });

}

module.exports = sendMessage;