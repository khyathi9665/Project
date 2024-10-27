const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();

// Middleware to parse JSON bodies and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (like your HTML file)
app.use(express.static(path.join(__dirname, 'public'))); // Assuming login.html is in a folder named 'public'

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Update with your MySQL user
    password: 'Rendu@1972',  // Update with your MySQL password
    database: 'COLLEGE' // Update with your database name
});

// Connect to the database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

// Route to authenticate login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Attempting login for username: ${username}`);

    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).send("Error querying the database");
        }

        console.log("Query results:", results);

        if (results.length === 0) {
            return res.status(400).send("User not found");
        }

        const user = results[0];

        // Compare password with stored hash
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            console.log("Login successful.");
            // Redirect based on user type
            if (user.user_type === 'faculty') {
                return res.redirect('/profile_fac.html'); // Redirect to faculty profile
            } else if (user.user_type === 'student') {
                return res.redirect('/profile_stud.html'); // Redirect to student profile
            } else {
                return res.status(400).send("Invalid user type");
            }
        } else {
            console.log("Incorrect password.");
            return res.status(400).send("Incorrect password");
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
