{/*// This is sample file but still don't change anything in it
const mysql = require("mysql2");
const pool = mysql.createPool({
  host: "localhost",
  user: "root",          //  MySQL username
  password: "aangi05", // MySQL password
  database: "blogverse", // your DB name
});

module.exports = pool.promise();*/}

require("dotenv").config();
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

module.exports = pool.promise();
