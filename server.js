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


const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(8080, () => {
    console.log('Server is running on port https://localhost:8080');
});

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
    // uri: 'mysql://avnadmin:AVNS__I1qTDQJdXjTU4WAgRX@breadbites-breadbites.a.aivencloud.com:10293/defaultdb?ssl-mode=REQUIRED',
    host: 'breadbites-breadbites.a.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS__I1qTDQJdXjTU4WAgRX',
    database: 'breadbites',
    port: 10293,
});
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '091534',
//     database: 'breadbites'
// })

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
            req.session.userId = results[0].id; // Store user ID in session
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

        res.render('products', { products: results, loggedIn: req.session.loggedIn, role: req.session.role, username: req.session.username, id: req.session.userId});
    });
});





// Admin routes
const adminRoutes = require('./adminRoutes');
const router = require('./adminRoutes');
app.use('/admin', adminRoutes);



const twilio = require('twilio')

const twilioClient = twilio('ACc3a77413478ef8013a39a3b7ef784230','db163d8f103e3eca9c6bf42457e4d441')

app.post('/checkout', (req, res) => {
    const order = req.body;

    db.beginTransaction((err) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        const insertOrderQuery = `INSERT INTO orders (user_id, delivery_date, delivery_time) VALUES (?, ?, ?)`;
        db.query(insertOrderQuery, [order.userId, order.deliveryDate, order.deliveryTime], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    console.error(err);
                    res.sendStatus(500);
                });
            }

            const orderId = result.insertId;

            const productOrdersPromises = order.productOrders.map((productOrder) => {
                const findProductQuery = `SELECT product_id FROM products WHERE product_name = ?`;
                return new Promise((resolve, reject) => {
                    db.query(findProductQuery, [productOrder.productName], (err, results) => {
                        if (err) {
                            return reject(err);
                        }

                        const productId = results[0].product_id;
                        const insertOrderItemQuery = `INSERT INTO order_items (order_id, product_id, price, quantity) VALUES (?, ?, ?, ?)`;
                        db.query(insertOrderItemQuery, [orderId, productId, productOrder.price, productOrder.quantity], (err) => {
                            if (err) {
                                return reject(err);
                            }

                            resolve();
                        });
                    });
                });
            });

            Promise.all(productOrdersPromises)
                .then(() => {
                    // Fetch the user's contact number
                    const fetchUserContactQuery = `SELECT contact_number FROM users WHERE id = ?`;
                    db.query(fetchUserContactQuery, [order.userId], (err, results) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error(err);
                                res.sendStatus(500);
                            });
                        }

                        const userContactNumber = results[0].contact_number;
                        console.log(userContactNumber)
                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error(err);
                                    res.sendStatus(500);
                                });
                            }

                            // Send an SMS using Twilio
                            twilioClient.messages.create({
                                body: 'Your order has been processed successfully.',
                                from: '+14157693314',
                                to: `${userContactNumber}`
                            })
                            .then(message => console.log(message.sid))
                            .catch(err => console.error(err));

                            res.sendStatus(200);
                        });
                    });
                })
                .catch((err) => {
                    db.rollback(() => {
                        console.error(err);
                        res.sendStatus(500);
                    });
                });
        });
    });
});

// Route for displaying user's orders
app.get('/orders', (req, res) => {
    // Check if user is logged in
    if (!req.session.loggedIn) {
        res.redirect('/');
        return;
    }

    // Query to fetch all products
    const productsQuery = `SELECT * FROM products`;
    db.query(productsQuery, (err, productsResults) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        const ordersQuery = `
            SELECT orders.id, users.fullname, orders.delivery_date, orders.delivery_time, order_items.product_id, order_items.price, order_items.quantity
            FROM orders
            JOIN users ON orders.user_id = users.id
            JOIN order_items ON orders.id = order_items.order_id
            WHERE users.id = ?
        `;

        db.query(ordersQuery, [req.session.userId], (err, ordersResults) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }

            const transactions = ordersResults.reduce((acc, order) => {
                let transaction = acc.find(t => t.id === order.id);
                if (!transaction) {
                    transaction = {
                        id: order.id,
                        fullname: order.fullname,
                        delivery_date: order.delivery_date,
                        delivery_time: order.delivery_time,
                        productOrders: [],
                        totalPrice: 0
                    };
                    acc.push(transaction);
                }
                const totalPrice = order.price * order.quantity;
                transaction.productOrders.push({
                    productName: productsResults.find(p => p.product_id === order.product_id).product_name,
                    price: order.price,
                    quantity: order.quantity,
                    totalPrice: totalPrice
                });
                transaction.totalPrice += totalPrice;
                return acc;
            }, []);

            // Render the orders view and pass the orders data to it
            res.render('orders', { transactions: transactions });
        });
    });
});



// Route for editing an order
// Route for fetching order details
app.get('/orders/:orderId', (req, res) => {
    const orderId = req.params.orderId;

    // Query to get the order details
    const query = `SELECT * FROM orders WHERE id = ?`;
    db.query(query, [orderId], (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        // Send the order data as a JSON response
        res.json(results[0]);
    });
});

// Route for canceling an order
app.get('/orders/cancel/:orderId', (req, res) => {
    const orderId = req.params.orderId;

    // Query to delete the order items
    const query1 = `DELETE FROM order_items WHERE order_id = ?`;
    db.query(query1, [orderId], (err) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        // Query to delete the order
        const query2 = `DELETE FROM orders WHERE id = ?`;
        db.query(query2, [orderId], (err) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }

            // Redirect back to the orders page
            res.redirect('/orders');
        });
    });
});


// Route for updating an order
app.put('/orders/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    const { deliveryDate, deliveryTime } = req.body;

    // Query to update the order details
    const query = 'UPDATE orders SET delivery_date = ?, delivery_time = ? WHERE id = ?';
    db.query(query, [deliveryDate, deliveryTime, orderId], (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        // Send a success message as a JSON response
        res.json({ success: true });
    });
});