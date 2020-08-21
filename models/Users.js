const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

//USER SCHEMA
const UserSchema = mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    usertype : {
        type: String,
        required: true
    },
    username : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    }   
});

const User = module.exports = mongoose.model('User', UserSchema);

//FINDING USERS BY ID
module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
}
//FINDING USER BY USERNAME
module.exports.getUserByUsername = function(username, callback){
    const query = { username: username }
    User.findOne(query, callback);
}

//ENCRYPTING PASSWORD AND ADDING NEW USER TO DB 
module.exports.addUser = function(newUser, callback){

    const queryUsername = { username: newUser.username }
    const queryEmail = { email:newUser.email }

    User.findOne(queryUsername, (err, user) => {
        if(err) throw err;
        if(!user){
            User.findOne(queryEmail, (err, user) => {
                if(err) throw err;
                if(!user){
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) throw err;
                            newUser.password = hash;
                            newUser.save(callback);
                        });
                    });
                } else callback(null,false);
            });
        } else callback(null, false);
    });
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    });
}