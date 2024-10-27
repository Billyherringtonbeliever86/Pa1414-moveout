const express = require('express')
var session = require('express-session')
// const bodyParser = require('body-parser');
// const nodemailer = require('nodemailer');
// const jwt = require('jsonwebtoken');
const modules = require('./public/javascripts/modules.js');
const cookieParser = require('cookie-parser');

const app = express()

require('dotenv').config();
const port = 3000

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));


const usersRouter = require('./routes/routes.js');
app.use('/', usersRouter);



// app.get('/', (req, res) => {
//     if (!req.session.views) {
//         req.session.views = 0;
//     }
//     req.session.views++;
//     res.send(`Hello World! ${req.session.views}`)
// })

const path = require("path");
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})