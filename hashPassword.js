const bcrypt = require('bcrypt');
const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Rendu@1972',
    database: 'COLLEGE'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL...');
});

const updatePassword = async (username, plainPassword) => {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    db.query('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, username], (err, result) => {
        if (err) throw err;
        console.log(`Password for ${username} updated to hashed version.`);
        db.end();
    });
};

updatePassword('22251A05C8', '22251A05C8');