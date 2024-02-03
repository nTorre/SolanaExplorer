const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();


// Funzione per connettersi al database
async function connectToDatabase() {
    let connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT
    });

    return connection;
}

async function closeConnection(connection) {
    if (connection) {
        await connection.end();
        console.log('Connessione al database chiusa.');
    }
}

module.exports = { connectToDatabase, closeConnection };
