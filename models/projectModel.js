var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var projectSchema = new Schema({
    projectName:String,
    repoUrl:String,
    active:Boolean
});

var Prpoject = mongoose.model('Project',projectSchema);

module.exports = Prpoject;