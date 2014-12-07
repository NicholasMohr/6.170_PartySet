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

var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/partyset';

console.log("mongo on ", uristring);

mongoose.connect(uristring, function (err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log ('Succeeded connected to: ' + uristring);
    }
});

var routes = require('./routes/index');
var sessions = require('./routes/sessions');
var users = require('./routes/users');
var parties = require('./routes/parties');
var courses = require('./routes/courses')

var app = express();

app.set('port', process.env.PORT || 3000);
var debug = require('debug')('cjholz_jessmand_hyun94_nmohr_finalProj');
var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});

var io = require('socket.io')({
    "transports": ["xhr-polling"],
    "polling duration": 10
}).listen(server);

/*var http = require('http').Server(app);
var io = require('socket.io').listen(http);*/

//app.get('/', function(req, res){
  //res.sendfile('index.html');
//});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('new party', function(party){
    socket.broadcast.emit('new party', party);
  });
  socket.on('remove party', function(partyId){
    socket.broadcast.emit('remove party', partyId);
  });
  socket.on('join party', function(partyId){
    socket.broadcast.emit('join party', partyId);
  });
  socket.on('leave party', function(partyId){
    socket.broadcast.emit('leave party', partyId);
  });

});

/*http.listen(3001, function(){
  console.log('listening on *:3001');
});*/

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
app.use('/sessions', sessions);
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
