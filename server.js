const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
                return res.redirect('/homepage_fac.html'); // Redirect to faculty profile
            } else if (user.user_type === 'student') {
                return res.redirect('/homepage_stud.html'); // Redirect to student profile
            } else {
                return res.status(400).send("Invalid user type");
            }
        } else {
            console.log("Incorrect password.");
            return res.status(400).send("Incorrect password");
        }
    });
});

app.post('/submit-task', (req, res) => {
    const { department, facultyName, title, description, deadline, teamSize, additionalRequirements } = req.body;

    // Prepare an SQL query to insert data into the tasks table
    const query = "INSERT INTO tasks (department, facultyName, title, description, deadline, teamSize, additionalRequirements) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(query, [department, facultyName, title, description, deadline, teamSize, additionalRequirements], (err, result) => {
        if (err) {
            console.error("Error saving task:", err);
            return res.status(500).send("Error saving task");
        }

        console.log('Task Submitted:', {
            department,
            facultyName,
            title,
            description,
            deadline,
            teamSize,
            additionalRequirements
        });

        // Send a response
        res.send('Task has been submitted successfully!');
    });
});

app.post('/submit-task', (req, res) => {
    console.log('Received data:', req.body); // Log incoming data

    const { department, facultyName, title, description, deadline, teamSize, additionalRequirements } = req.body;

    // Check if any required fields are missing
    if (!department || !facultyName || !title || !description || !deadline || !teamSize || !additionalRequirements) {
        return res.status(400).send("Missing required fields");
    }

    const query = "INSERT INTO tasks (department, facultyName, title, description, deadline, teamSize, additionalRequirements) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(query, [department, facultyName, title, description, deadline, teamSize, additionalRequirements], (err, result) => {
        if (err) {
            console.error("Error saving task:", err.code, err.sqlMessage);
            return res.status(500).send("Error saving task");
        }

        res.send('Task has been submitted successfully!');
    });
});


app.get('/tasks', (req, res) => {
    const query = "SELECT * FROM tasks"; // Adjust this query if you want to filter by user or department
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching tasks:", err);
            return res.status(500).send("Error fetching tasks");
        }

        // Send the tasks data as JSON
        res.json(results);
    });
});



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
