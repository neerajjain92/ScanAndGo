const express = require('express');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const e = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
// Set views directory
app.set('views', path.join(__dirname, 'views'));

// In-memory storage for tokens and users
const tokens = new Map()

// Secret key for JWT
const JWT_SECRET = 'your_jwt_secret_key';

// This is dummy it should ideally be via OTP validation
app.post('/mobileLogin', (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
        return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const token = jwt.sign({ phoneNumber }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token });
});

app.get('/', (req, res) => {
    res.redirect('/login')
})


app.get('/login', (req, res) => {
    const token = uuidv4();
    tokens.set(token, { status: 'pending', userId: null })

    // Read the HTML file
    const htmlContent = fs.readFileSync(path.join(__dirname, 'views', 'login.html'), 'utf8');
    
    // Replace a placeholder with the token
    const modifiedHtml = htmlContent.replace('REPLACE_WITH_TOKEN', token);
    
    res.send(modifiedHtml);

    // res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/checkLogin', (req, res) => {
    const { token } = req.body
    if (!token || !tokens.has(token)) {
        return res.status(404).json({ success: false, message: 'Invalid QR code token' });
    }

    const { status, phoneNumber } = tokens.get(token);
    if (status == 'loggedIn' && phoneNumber) {
        res.json({ loggedIn: true, phoneNumber });
    } else {
        res.json({ loggedIn: false })
    }


});

function verifyJWT(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    // Extract the token from the "Bearer <token>" format
    const token = authHeader.split(' ')[1]; // Split by space and take the second part
    if (!token) {
        return res.status(401).json({ success: false, message: 'Invalid token format' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log(err)
            return res.status(401).json({ success: false, message: 'Invalid JWT token' });
        }
        req.user = decoded;
        next();
    })
}

app.post('/validateToken', verifyJWT, (req, res) => {
    const { token } = req.body;
    if (!token || !tokens.has(token) || !tokens.get(token).status == 'pending') {
        return res.status(404).json({ success: false, message: 'Invalid QR code token' });
    }

    const { phoneNumber } = req.user;
    tokens.set(token, { status: 'loggedIn', phoneNumber });
    res.json({ success: true });
})

app.get('/homepage', (req, res) => {
    const {phoneNumber} = req.query;
    if (!phoneNumber) {
        return res.redirect('/login');
    }
    res.send(`<h1>Welcome, ${phoneNumber}!</h1>`);
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});