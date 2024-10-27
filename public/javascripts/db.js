
const mariadb = require('mariadb');
const dotenv = require('dotenv');
dotenv.config();

const pool = mariadb.createPool({
    host: process.env.MARIADB_HOST,      
    port: process.env.MARIADB_PORT,             
    user: process.env.MARIADB_USER,       
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_DATABASE,       
    connectionLimit: 5      
  });

module.exports = {
    "pool": pool,
}