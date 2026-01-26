// This is sample file but still don't change anything in it
const mysql = require("mysql2");
const pool = mysql.createPool({
  host: "localhost",
  user: "root",          //  MySQL username
  password: "Mysql1234", // MySQL password
  database: "blogverse", // your DB name
});

module.exports = pool.promise();