const TelegramBot = require('node-telegram-bot-api');
const backtest = require("./utils/backtest");
const fs = require('fs');

process.env["NTBA_FIX_350"] = 1;


const token = '6861219889:AAEuoCy95mMxRrwSeRGLIXQikf0SWELchLo';
const bot = new TelegramBot(token, { polling: true });

const MAX_TESTS = 2;

const commandsList = [
    '/start - Start backtest',
    '/auth <codice> - Authorize',
];


let userState = {};
let authorizationCodes = { "OrbisTest1": "VALID", "Test1": "EXPIRED" };

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function middlwareAuthorization(chatId) {
    if (userState[chatId] == null || userState[chatId]["authorized"] == false) {
        return false
    }
    return true;
}


async function main() {
    bot.on('message', (msg) => {
        const chatId = msg.chat.id;

        //TODO: clean this if chain

        // parsing del messaggio per ottenere i dati
        console.log(userState);
        if (userState[chatId] != null && userState[chatId]["state"] == "input_waiting") {
            let commands = msg.text.split(" ");
            if (commands.length == 2) {
                // potrebbe essere un backtest
                let datefrom = new Date(commands[0]);
                let dateto = new Date(commands[1]);
                if (Object.prototype.toString.call(datefrom) === "[object Date]" && isNaN(datefrom.getTime())) {
                    bot.sendMessage(chatId, "Command error");
                } else {
                    if (datefrom > dateto) {
                        bot.sendMessage(chatId, "Check the dates");
                    } else if (datefrom.getFullYear < 2022) {
                        bot.sendMessage(chatId, "Backtest allowed only from 2023");
                    } else {
                        userState[chatId]["state"] = "result_waiting";
                        userState[chatId]["nBacktest"] += 1;
                        let leftTests = MAX_TESTS - userState[chatId]["nBacktest"];
                        bot.sendMessage(chatId, `Backtest started, you will receive the result in 5 minutes. Remaining ${leftTests} tests`);
                        let path_to_file = "test/" + chatId + (new Date()).getTime() + ".csv";
                        backtest(datefrom, dateto, path_to_file).then(async () => {
                            await sleep(5000);
                            console.log(path_to_file);
                            bot.sendDocument(chatId, path_to_file).then(()=>{
                                console.log("Andata");
                            }).catch((err)=>{
                                console.log(err);
                            });
                        })

                        // send result file
                    }
                }
            } else {
                bot.sendMessage(chatId, "Command error");
            }
        }

        else if (msg.text.substring(0, 1) != '/') {
            bot.sendMessage(chatId, commandsList.join("\n").toString());
            return;
        }
    });

    // backtest
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        if (!middlwareAuthorization(chatId)) {
            bot.sendMessage(chatId, "To login digit: /auth YOUR_CODE. Command list 'list'");
            return;
        };

        // authorized, continue with backtest
        if (userState[chatId]["nBacktest"] < MAX_TESTS) {
            bot.sendMessage(chatId,
                "Provide backtest info as follow:\n" +
                "date_from[mm/dd/yyyy] date_to[mm/dd/yyyy]\n\n" +
                "Example:\n" +
                "09/27/2023 01/30/2024"
            );
            userState[chatId]["state"] = "input_waiting";

        } else {
            userState[chatId]["state"] = "limit_reached";
            bot.sendMessage(chatId, "You finished your tests, contact amministrator");
        }
    });

    // authorization phase
    bot.onText(/\/auth (.+)/, (msg, match) => {
        const chatId = msg.chat.id;
        const code = match[1]; // Il codice inviato dall'utente

        if (middlwareAuthorization(chatId)) {
            bot.sendMessage(chatId, "Already logged");
            return;
        }

        if (authorizationCodes[code] == null) {
            bot.sendMessage(chatId, "Your code is invalid, try with another one")
        } else if (authorizationCodes[code] != "VALID") {
            bot.sendMessage(chatId, "Your code is expired, contact amministrator")
        } else {
            bot.sendMessage(chatId, "Code valid, authorized");
            // auth
            userState[chatId] = { "authorized": true };
            userState[chatId]["nBacktest"] = 0;

            authorizationCodes[code] = "EXPIRED";
        }

    });

}

main();
