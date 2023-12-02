// Npm run start then browser-sync start --proxy 'localhost:8080' --serveStatic 'public' --files 'public,views'





const express = require('express');
const app = express();
const ejs = require('ejs');
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const MySQLStore = require('express-mysql-session')(session);
const helmet = require('helmet');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');


// Configure Content Security Policy
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        },
    })
);


// Create a connection to the MySQL database
const db = mysql.createConnection({
    // uri: 'mysql://avnadmin:AVNS__I1qTDQJdXjTU4WAgRX@breadbites-breadbites.a.aivencloud.com:10293/breadbites?ssl-mode=REQUIRED',
    host: 'localhost',
    user: 'root',
    password: '091534',
    database: 'breadbites',
});


const sessionStore = new MySQLStore({}, db);
// Configure session middleware
app.use(session({
    secret: 'Jonaly', // Secret key used to sign the session ID cookie
    resave: false, // Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store
    cookie: { secure: false }, // Configures the session cookie settings
    store: sessionStore // Use the MySQL session store
}));

// Route for the home page
app.get('/', (req, res) => {
    res.render('index', { loggedIn: req.session.loggedIn, role: req.session.role });
});

// Start the server
app.listen(8080, () => {
    console.log('Server is running on port http://localhost:8080');
});


// Connect to the database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to the database');
});

// Route for user login
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Query to check if the username and password match in the database
    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        if (results.length > 0) {
            // Set session variables to indicate that the user is logged in
            req.session.loggedIn = true;
            req.session.username = username;
            const role = results[0].role; // Get the role from the database results
            req.session.role = role; // Set the role in the session variables
            if (role === 'admin') {
                res.redirect('/');
            } else {
                res.redirect('/products');
            }
        } else {
            res.redirect('/');
        }
    });
});

// Route for user logout
app.get('/logout', (req, res) => {
    // Clear session variables to indicate that the user is logged out
    req.session.loggedIn = false;
    res.redirect('/');
});

// Route for user registration
app.post('/register', (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const contact_number = req.body.contact_number;
    const address = req.body.address;
    const fullname = req.body.fullname;
    const role = 'user'; // Set the role to "user"

    // Query to check if the username or email already exists in the database
    const checkUserQuery = `SELECT * FROM users WHERE username = ? OR email = ?`;
    db.query(checkUserQuery, [username, email], (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        if (results.length > 0) {
            // Redirect to the home page if the username or email already exists
            res.redirect('/');
            return;
        }

        // Insert the new user into the database
        const insertUserQuery = `INSERT INTO users (username, email, password, contact_number, address, fullname, role) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.query(insertUserQuery, [username, email, password, contact_number, address, fullname, role], (err) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }

            res.redirect('/');
        });
    });
});

// Route for displaying products
app.get('/products', (req, res) => {
    // Query to retrieve all products from the database
    const query = `SELECT * FROM products`;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        res.render('products', { products: results, loggedIn: req.session.loggedIn, role: req.session.role, username: req.session.username });
    });
});





// Admin routes
const adminRoutes = require('./adminRoutes');
const router = require('./adminRoutes');
app.use('/admin', adminRoutes);

