// Using express create a server with that renders the index.html file from public folder that listens to port 8080

const express = require('express');
const app = express();
const ejs = require('ejs');

const bodyParser = require('body-parser');


app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});



// For database

const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '091534',
    database: 'breadbites'
});

// show if there is an error in the connection
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to the database');
});


// Login
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        if (results.length > 0) {
            // User is logged in
            res.sendStatus(200);
        } else {
            // User is not logged in
            res.sendStatus(401);
        }
    });
});

// Register
app.post('/register', (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const contact_number = req.body.contact_number;
    const address = req.body.address;

    const checkUserQuery = `SELECT * FROM users WHERE username = ? OR email = ?`;
    db.query(checkUserQuery, [username, email], (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        if (results.length > 0) {
            // User already exists
            res.status(409).send('User already exists');
            return;
        }

        const insertUserQuery = `INSERT INTO users (username, email, password, contact_number, address) VALUES (?, ?, ?, ?, ?)`;
        db.query(insertUserQuery, [username, email, password, contact_number, address], (err) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }

            res.sendStatus(201);
        });
    });
});
