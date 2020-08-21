const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const Submission = require('../models/fileUpload');
const config = require('../config/database');
const HostQueries = require('../queries/hostQueries');
const StudentQueries = require('../queries/studentQueries');
const SubmitFile = require('../queries/submitFile');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://MKinghill:markkinghill@weblication-w3qgp.mongodb.net/test?retryWrites=true&w=majority";


//REGISTER
router.post('/register', (req, res, next) => {
    let newUser = new User({
        name : req.body.name,
        email : req.body.email,
        usertype: req.body.usertype,
        username : req.body.username,
        password : req.body.password
    });
    
    User.addUser(newUser, (err, user) => {
        if(err){
            res.json({success: false, msg: 'Failed to register.'});
        } else{
            if(user){
                res.json({success: true, msg: 'New user registered.'});
            } else{
                res.json({success: false, msg: 'Username or Email Already Exists.'});
            }
            
        }
    });
    
});

//AUTHENTICATE
router.post('/authenticate', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if(err) throw err;
        if(!user){
            console.log(!user);
            return res.json({ success: false, msg: 'User not found.' });
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch){
                const token = jwt.sign(user.toJSON(), config.secret, { 
                    expiresIn: 604800  //1 Week 
                });

                res.json({
                    success: true,
                    token: 'JWT ' + token,
                    user: {
                        id: user._id,
                        name: user.name,
                        usertype: user.usertype,
                        username: user.username,
                        email: user.email
                    }
                });
            } else{
                return res.json({ success: false, msg: 'Incorrect Password.' })
            }
        });
    });
});

//PROFILE
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    res.json({user: req.user});
});

//CREATE SUBMISSION
router.post('/createSubmission', passport.authenticate('jwt', { session: false }), (req, res, next) => {

    const data = {
        hostname : req.user.name,
        hostemail : req.user.email,
        subname : req.body.subname,
        subinfo : req.body.subinfo
    }

    const newsub =  data.subname + Math.floor(1000 + Math.random() * 9000);

    HostQueries.createCollection(data, newsub, (err, sub)=> {
        if(err){
            res.json({success: false, msg: 'Failed to create new submission.'});
        } else{
            res.json({
                success: true, 
                msg: `New submission create.`,
                host: {
                    name: data.hostname,
                    email: data.hostemail
                },
                subname: data.subname,
                subcode: newsub
            });
        }
    });
});

//JOIN SUBMISSION
router.post('/joinSubmission', passport.authenticate('jwt', { session: false }), (req, res, next) => {

    const data = {
        studentname : req.user.name,
        studentemail : req.user.email,
        subname : req.body.subname
    }

    StudentQueries.joinSubmission(data, (err, sub)=> {
        if(err){
            res.json({success: false, msg: 'Failed to create new submission.'});
        } else{
            if(sub == false){
                res.json({
                    success: false, 
                    msg: `You have already joined this Submission.`
                });
            } else{
                res.json({
                    success: true, 
                    msg: `Joined new submission ${data.subname}.`,
                    studentInfo: {
                        name: data.studentname,
                        email: data.studentemail
                    }
                });
            }
        }
    });
});

//GETTING SUBMISSIONS CREATED BY HOST
router.get('/submissionsCreated', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    
    const hostemail = req.user.email;

    MongoClient.connect(url, (err, db) => {
        if(err) throw err;
        
        const dbo = db.db("test");
        const collection = dbo.collection('users')
        const query = { email: hostemail }
        collection.find(query).toArray( (err, hostdata) => {
            if(err) throw err;
            res.json(hostdata[0].submissionsCreated);
        });
        db.close();
    });
});

//GETTING SUBMISSIONS JOINED BY STUDENTS
router.get('/submissionsJoined', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    
    const studentemail = req.user.email;

    MongoClient.connect(url, (err, db) => {
        if(err) throw err;
        
        const dbo = db.db("test");
        const collection = dbo.collection('users')
        const query = { email: studentemail }
        collection.find(query).toArray( (err, hostdata) => {
            if(err) throw err;
            res.json(hostdata[0].submissionsJoined);
        });
        db.close();
    });
});

//GETTING SUBMISSIONS DETAILS
router.post('/submissionsDetails', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    
    const data = {
        subcode : req.body.subcode
    }

    MongoClient.connect(url, (err, db) => {
        if(err) throw err;
        
        const dbo = db.db("Submissions");
        const collection = dbo.collection(data.subcode);
        const query = { infoCollection: "main information" }
        collection.find(query).toArray( (err, hostdata) => {
            if(err) throw err;
            res.json(hostdata[0]);
        });
        db.close();
    });

});

router.post('/submitFile', SubmitFile.upload.any(), (req, res, next) => {
    //console.log(req);
    res.json({success: true, msg: 'File Uploaded.'});
});

module.exports = router;