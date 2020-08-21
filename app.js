//ENTRY POINT FILE FOR THE APP
//DEFINING ALL MODULES
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors =require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
const MongoClient = require('mongodb').MongoClient;

//CONNECTING TO DB
mongoose.connect(config.mongoURI);

//ON CONNECTION
mongoose.connection.on('connected', () =>{
    console.log('CONNECTED TO MONGOOSE DB.');
});
//CONNECTION ERROR
mongoose.connection.on('error', (err) =>{
    console.log('MONGOOSE DB CONNECTION ERROR : \n' + err);
});

const app = express();

const users = require('./routes/users');

//PORT NO.
const port = process.env.PORT || 3000;

//CORS MIDDLEWARE
app.use(cors());

//SET STATIC FOLDER
app.use(express.static(path.join(__dirname, 'public')));

//BODY PARSER MIDDLEWARE
app.use(bodyParser.json());

//PASSPORT MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.use('/users', users);


//STARTING SERVER
app.listen(port, () => {
    console.log(`SERVER RUNNING ON PORT ${port}`);
});