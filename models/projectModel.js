var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var projectSchema = new Schema({
    projectName:String,
    repoUrl:String,
    appId:String,
    workBranch:String,
    active:Boolean
});

var Prpoject = mongoose.model('Project',projectSchema);

module.exports = Prpoject;