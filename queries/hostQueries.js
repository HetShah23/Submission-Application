const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://MKinghill:markkinghill@weblication-w3qgp.mongodb.net/test?retryWrites=true&w=majority";

module.exports.createCollection = function(data, collectionName, callback){
    // Connect to the db
    MongoClient.connect(url, (err, db) => {
        if(err) throw err;
        
        const dbo = db.db("Submissions");

        //Creating collection
        dbo.createCollection(collectionName, (err, res) => {
            if(err){
                callback(null, false);
                throw err;
            } else{
                console.log('COLLECTION CREATED.');

                const myobj = {
                    infoCollection : 'main information',
                    submissionName : data.subname,
                    submissionInfo : data.subinfo,
                    host : {
                        name: data.hostname,
                        email: data.hostemail
                    }
                }
                //Inserting initial data
                dbo.collection(collectionName).insertOne(myobj, (err, res) => {
                    if (err) throw err;
                    console.log("INITIAL DATA ENTERED.");
                });
                callback(null, true);
            }
        });

        const dbUsers = db.db('test');
        const query = { email: data.hostemail };
        const newvalues = { 
            $addToSet: { 
                submissionsCreated:{ 
                    submissionName : data.subname,
                    submissionCode : collectionName,
                    submissionInfo : data.subinfo
                }  
            }
        };
        dbUsers.collection('users').update(query, newvalues, (err, res) => {
            if (err) throw err;
        });
    });
}