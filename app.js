const express = require('express');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const e = require('express');
const jwt = require('jsonwebtoken');

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

    QRCode.toDataURL(token, (err, url) => {
        if (err) throw err;
        res.send(`
             <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code Login</title>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
            </head>
            <body>
                <h1>Scan the QR Code to Login</h1>
                <div id="qrcode"></div>
                <script>
                    // Generate QR code
                    var token = "${token}";
                    new QRCode(document.getElementById("qrcode"), {
                        text: token,
                        width: 256,
                        height: 256
                    });

                    // Function to check login status using Fetch API
                    async function checkLogin() {
                        try {
                            const response = await fetch('/checkLogin', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ token }),
                            });
                            const data = await response.json();

                            if (data.loggedIn) {
                                window.location.href = '/homepage?phoneNumber=' + data.phoneNumber;
                            } else {
                                setTimeout(checkLogin, 2000); // Poll every 2 seconds
                            }
                        } catch (error) {
                            console.error('Error checking login status:', error);
                            setTimeout(checkLogin, 2000); // Retry on error
                        }
                    }

                    // Start polling
                    checkLogin();
                </script>
            </body>
            </html>
            `);
    });
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