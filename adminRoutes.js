const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const helmet = require('helmet');
const crypto = require('crypto'); // Add crypto module for generating nonce
const bodyParser = require('body-parser');
// Set Content Security Policy (CSP) headers to allow inline scripts with nonce
router.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('base64'); // Generate a nonce value
    res.setHeader('Content-Security-Policy', `script-src 'self' 'nonce-${nonce}'`);
    res.setHeader('X-Content-Security-Policy', `script-src 'self' 'nonce-${nonce}'`); // For older browsers
    res.locals.nonce = nonce; // Make the nonce value available in templates
    next();
});
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

router.use(express.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Route for the admin page with admin authentication
router.get('/', isAdmin, (req, res) => {
    res.render('admin');
});

// Route for admin login
router.post('/login', isAdmin, (req, res) => {
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
            res.redirect('/admin/dashboard');
        } else {
            res.redirect('/');
        }
    });
});

const os = require('os');


function calculateSystemUptime() {
    const uptime = os.uptime();
    const days = Math.floor(uptime / (24 * 60 * 60));
    const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((uptime % (60 * 60)) / 60);
    const seconds = Math.floor(uptime % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

router.get('/uptime', (req, res) => {
    res.send(calculateSystemUptime());
});

router.get('/dashboard', isAdmin, (req, res) => {
    const usersQuery = `SELECT * FROM users`;
    const productsQuery = `SELECT * FROM products`;

    db.query(usersQuery, (usersErr, usersResults) => {
        if (usersErr) {
            console.error(usersErr);
            res.sendStatus(500);
            return;
        }

        db.query(productsQuery, (productsErr, productsResults) => {
            if (productsErr) {
                console.error(productsErr);
                res.sendStatus(500);
                return;
            }

            const totalUsers = usersResults.length;
            const totalProducts = productsResults.length;
            const activeUsers = usersResults.filter(user => user.isActive).length;
            const systemUptime = calculateSystemUptime();

            res.render('dashboard', {
                users: usersResults,
                products: productsResults,
                totalUsers: totalUsers,
                totalProducts: totalProducts,
                activeUsers: activeUsers,
                systemUptime: systemUptime
            });
        });
    });
});



router.post('/admin-add', isAdmin, (req, res) => {
    const { fullname, username, email, password, contact_number, address, role } = req.body;

    // Query to insert a new user into the database
    const query = `INSERT INTO users (fullname, username, email, password, contact_number, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(query, [fullname, username, email, password, contact_number, address, role], (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        res.redirect('admin/dashboard#users-section');
    });
});

// Route for editing a user
router.post('/admin-edit', isAdmin, (req, res) => {
    
    const { 'edit-user-id': userid, 'edit-fullname': fullname, 'edit-username': username, 'edit-email': email, 'edit-password': password, 'edit-contact_number': contact_number, 'edit-address': address, 'edit-role': role } = req.body;
    // Query to update the user in the database
    const query = `UPDATE users SET fullname = ?, username = ?, email = ?, password = ?, contact_number = ?, address = ?, role = ? WHERE id = ?`;
    db.query(query, [fullname, username, email, password, contact_number, address, role, userid], (err, results) => {
        console.log(results);
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        res.redirect('admin/dashboard#users-section');
    });
});

router.delete('/admin-delete', isAdmin, (req, res) => {
    const userId = req.body.userId;

    // Query to get the username of the user
    const userQuery = `SELECT username FROM users WHERE id = ?`;
    db.query(userQuery, [userId], (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        const username = results[0].username;
        if (username === 'admin') {
            res.status(403).json({ message: 'Admin account cannot be deleted.' });
            return;
        }

        // Query to delete the user from the database
        const deleteQuery = `DELETE FROM users WHERE id = ?`;
        db.query(deleteQuery, [userId], (err, results) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }

            res.redirect('admin/dashboard#users-section');
           
        });
    });
});

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/images/PRODUCTS'),
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/admin-add-product', isAdmin, upload.single('image_loc'), (req, res) => {
    const { product_name, category, qty_stocks, product_description, price } = req.body;
    const filename = path.basename(req.file.path);
    const image_loc = '/images/PRODUCTS/' + filename;
    // Query to insert the new product into the database
    const insertQuery = `INSERT INTO products (product_name, image_loc, category, qty_stocks, product_description, price) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(insertQuery, [product_name, image_loc, category, qty_stocks, product_description, price], (err, results) => {
        if (err) {
            console.error(err);
            return;
        }
        res.redirect('/admin/dashboard#products-section');
    });
});


router.delete('/admin-delete-product', isAdmin, (req, res) => {
    const productId = req.body.productId;

    // Query to delete the product from the database
    const deleteQuery = `DELETE FROM products WHERE product_id = ?`;
    db.query(deleteQuery, [productId], (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        res.redirect('/admin/dashboard#products-section');
    });
});



module.exports = router;