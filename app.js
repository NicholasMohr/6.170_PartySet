var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('R5D9QYNU1F0Iae-uzaa1uA'); // personal mandrill API key

// default to a 'localhost' configuration:
//var connection_string = 'localhost:27017/fritter';
var connection_string = 'mongodb://localhost/partyset';
// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
    connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
        process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
        process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
        process.env.OPENSHIFT_APP_NAME;
}
mongoose.connect(connection_string);

var routes = require('./routes/index');
var users = require('./routes/users');
var parties = require('./routes/parties');
var courses = require('./routes/courses')

var app = express();

var db = mongoose.connection;
db.collection("parties", function(err, coll){
    coll.ensureIndex({expireAt: 1}, {expireAfterSeconds: 0});
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// set up passport
require('./config/passport-local')(passport);
app.use(session({ secret: 'partysetallnight' })); // session secret
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/users', users);
app.use('/parties', parties);
app.use('/courses', courses)
/*
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
*/
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: {}
    });
});

module.exports = app;
