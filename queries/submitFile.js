const path = require('path');
const mongoose = require('mongoose');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

const mongoURI = "mongodb+srv://MKinghill:markkinghill@weblication-w3qgp.mongodb.net/test?retryWrites=true&w=majority";

module.exports.fileToDB = function(data, callback){
  
}

//CREATES CONNECTION
const conn = mongoose.createConnection(mongoURI);

//Init gfs
let gfs;

conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('FileSubmissions'); //collection name
});

//Create storage engine
const storage = new GridFsStorage({
    url: mongoURI, 
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        const desc = 'text xyz'
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          //const filename = buf.toString('hex') + path.extname(file.originalname);
          const filename = file.originalname;
          const fileInfo = {
            filename: filename,
            bucketName: 'FileSubmissions',
            metadata: req.body
          };
          resolve(fileInfo, desc);
        });
      });
    }
});

module.exports.upload = multer({ storage });

