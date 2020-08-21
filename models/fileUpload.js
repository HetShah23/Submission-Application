const mongoose = require('mongoose');
const conn = mongoose.Collection;

const SubmissionSchema = new mongoose.Schema({
    SubmittedFileName : {
        type: String,
        required: true
    }   
});

const submissionModel = module.exports = mongoose.model('Submission', SubmissionSchema);

module.exports.addSubFile = function(subFile, callback){
    subFile.save(callback);
}