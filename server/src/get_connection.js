const mysql = require("mysql");
require('dotenv').config({path : 'src/.env'});
const fs = require('fs/promises');
// create a connection to the database
const pool = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// connect to the database
pool.connect((err) => {
    if (err) {console.error(err); throw err};
    console.log("Connected to the database");
    
});

async function initDB () {
// Read the SQL file
const initQueries = await fs.readFile('./src/databaseInit.txt', 'utf-8');

// Split the file content by semicolon and execute each query
const queries = initQueries.split(';');

queries.forEach((query) => {
    if (query.trim()) {
        pool.query(query, (err) => {
            if (err) {
                console.error('Failed to execute query:', err);
            } else {
                console.log('Table initialized successfully');
            }
        });
    }
});
};
initDB();
module.exports = {initDB,pool};