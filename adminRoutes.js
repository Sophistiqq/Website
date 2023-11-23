const express = require('express');
const router = express.Router();
const mysql = require('mysql2');


// Create a connection to the MySQL database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '091534',
    database: 'breadbites'
});


// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (req.session.loggedIn && req.session.username === 'admin') {
        next();
    } else {
        res.redirect('/');
    }
};

// Route for the admin page with admin authentication
router.get('/', isAdmin, (req, res) => {
    res.render('admin');
});

// Route for admin login
router.post('/login',isAdmin, (req, res) => {
    const { username, password } = req.body;

    // Query to check if the admin username and password match in the database
    const query = `SELECT * FROM admin WHERE username = ? AND password = ?`;
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        if (results.length > 0) {
            // Set session variables to indicate that the admin is logged in
            req.session.loggedIn = true;
            req.session.username = username;
            res.redirect('/dashboard');
        } else {
            res.redirect('/');
        }
    });
});


module.exports = router;