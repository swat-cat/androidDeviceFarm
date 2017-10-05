//require('dotenv').config();
var express = require("express");
var app = express();
var path = require('path');
var port = process.env.PORT||3000;
var bodyParser = require("body-parser")
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var config = require('./config/index');
var apiController = require('./controllers/apiController');
var viewController = require('./controllers/viewController');

app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var databaseUri = config.dbConnectionString();
mongoose.connect(databaseUri, { useMongoClient: true })
.then(() => console.log(`Database connected at ${databaseUri}`))
.catch(err => console.log(`Database connection error: ${err.message}`));

apiController(app);
viewController(app);

app.listen(port);