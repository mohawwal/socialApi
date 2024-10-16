const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Awwal1234.",
    database: "social",
    multipleStatements: true
});


db.connect((err) => {
    if (err) {
        console.log('Database connection failed: ', err);
        throw err;
    }
    console.log('Connected to MySQL database.');
});

module.exports = { db };
