const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// 1. HELMET — Secure HTTP headers
//    Protects against: Clickjacking, MIME 
//    sniffing, XSS, and more via headers
//    Also sets Content Security Policy (CSP)

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data', 'https'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https://gstatic.com'],
        objectSrc: ["'self'"],
        upgradeInsecureRequests: []

    }
}))

// 2. CORS — Cross Origin Resource Sharing
//    Only allow requests from trusted origins

const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ?
        process.env.ALLOWED_ORIGINS.split(",") : '*',
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}
app.use(cors(corsOptions));

// 3. RATE LIMITING — DDoS and brute force
//    Max 100 requests per IP per 15 minutes

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        status: 'error',
        message: 'too many requests from this IP, please try again after 15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
}));

// 4. Stricter limiter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: {
        status: 'error',
        message: 'too many requests from this IP, please try again after 15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
})

//5. Body parser
// Limit request body size to 10kb

app.use(express.json({ limit: "10kb" }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//6. Mongo sanitize for sql injection attack
// strips $ and . from request body, qyery params and route params

app.use(mongoSanitize());

//7. XSS clean - cross site scripting
// sanitizes user input in body, params and query strings

app.use(xss());

//8. prevent parameter pollution
// prevent duplicate query parameters
// example: /api/products?category=electronics&category=clothing => only first one will be used

app.use(hpp());

// 9. HIDE POWERED BY
//    Don't reveal we are using Express
// ─────────────────────────────────────────
app.disable('x-powered-by');

// Routes

//health check

app.get('/', (req, res) => {
    res.json({
        message: 'Platform api is running',
        status: 'ok'
    })
})

// Unhandled routes
app.all('/*path', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.originalUrl} not found`
    })
})

module.exports = app;


