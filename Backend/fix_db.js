const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mysql1234',
    database: 'blogverse'
});

db.connect((err) => {
    if (err) {
        console.error('DB connection error:', err);
        process.exit(1);
    }
    console.log('MySQL connected');

    // Modify Password column to VARCHAR(255) to support bcrypt hash
    // Also ensuring otp columns are there (IF NOT EXISTS is not supported for columns in standard ALTER, but modify works)
    const sql = "ALTER TABLE users MODIFY COLUMN Password VARCHAR(255) NOT NULL;";
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error altering table:', err);
            process.exit(1);
        } else {
            console.log('Password column modified to VARCHAR(255)');
        }
        db.end();
    });
});
