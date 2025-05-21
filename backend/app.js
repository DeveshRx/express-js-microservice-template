require('dotenv').config()

const express = require('express');
const { initializeApp } = require('firebase-admin/app');
const { credential } = require("firebase-admin");
var logger = require('morgan');
var cookieParser = require('cookie-parser');
const path = require('path')
var cors = require('cors');
const { APP_NAME } = require('./const');


const app = express();


var authRouter = require('./routes/auth');
var usersRouter = require('./routes/users');

const port = 3000;


var whitelist = [
  'http://example.com',
  'http://example1.com',
  
];
var corsOptions = {
  origin: whitelist,
  methods: ['GET', 'PUT', 'POST']
}

// Firebase Init
initializeApp({
  credential: credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
});


app.use(cors(corsOptions))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);
app.use('/user', usersRouter);

app.get('/', (req, res) => {
  res.send(`${APP_NAME} App Backend`)
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error');
});

app.listen(port, () => {
  console.log(`${APP_NAME} app listening on port ${port}`)
});
