const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://MKinghill:markkinghill@weblication-w3qgp.mongodb.net/test?retryWrites=true&w=majority";

module.exports.joinSubmission = function(data, callback){
    // Connect to the db
    MongoClient.connect(url, (err, db) => {
        if(err) throw err;
        
        const dbo = db.db("Submissions");

        const myobj = {
            studentInfo : {
                name: data.studentname,
                email: data.studentemail
            },
            checkSub: false
        }

        const queryEmail = { studentInfo: { name:data.studentname, email:data.studentemail } }

        dbo.collection(data.subname).findOne(queryEmail, (err, user) => {
            if(err) throw err;
            if(!user){
                //Inserting student data in submission DB
                dbo.collection(data.subname).insertOne(myobj, (err, res) => {
                    if (err){ 
                        callback(null, false);
                        throw err; 
                    } else {
                        callback(null, true);
                    }
                });
            } else callback(err, false);
        }); 
        
        const dbUsers = db.db('test');
        const query = { email: data.studentemail };
        const newvalues = { 
            $addToSet: { 
                submissionsJoined:{ 
                    submissionName : data.subname
                }  
            }
        };
        dbUsers.collection('users').update(query, newvalues, (err, res) => {
            if (err) throw err;
        });
    });
}