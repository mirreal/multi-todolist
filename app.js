var express = require('express');
var http = require('http');
var path = require('path');
var db = require('./database');

var app = express();
var server = http.createServer(app);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret: 'gotodo'}));
app.use(function(req, res, next) {
  if (req.session.loggedIn) {
    res.locals.authenticated = true;
    db.users.findOne({name: req.session.loggedIn}, function(err, doc) {
      if (err) return next(err);
      res.locals({'me': doc});
      next();
    });
  } else {
    res.locals.authenticated = false;
    next();
  }
});
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.get('/', function(req, res) {
  res.render('list');
});
app.get('/login', function(req, res) {
  res.render('login');
});
app.get('/signup', function(req, res) {
  res.render('signup');
});

app.post('/signup', function(req, res, next) {
  db.users.findOne({name: req.body.user.name}, function(err, doc) {
    if (err) return next(err);
    if (doc) {
      res.render('signup', {info: 'Username already exist...'});
    } else {
      var user = req.body.user;
      user.currentProject = {name: 'default', author: user.name};
      user.projects = [user.currentProject];
      var project = {
        name: 'default',
        author: user.name,
        owner: [user.name]
      };
      db.projects.insert(project, function(err, doc) {
        if (err) return nect(err);
        db.users.insert(user, function(err, doc) {
          if (err) return next(err);
          res.redirect('/login/' + doc[0].name);
        });
      });
    }
  });
})
app.get('/login/:signupName', function(req, res) {
  res.render('login', {signupName: req.params.signupName});
});
app.post('/login', function(req, res, next) {
  db.users.findOne({name: req.body.user.name, password: req.body.user.password}, function(err, doc) {
    if (err) return next(err);
    if (!doc) return res.send('<p>User not found. <a href=\"/\">Go back</a> and try again.</p>');
    req.session.loggedIn = doc.name.toString();
    res.redirect('/');
  });
});
app.get('/logout', function(req, res) {
  req.session.loggedIn = null;
  res.redirect('/');
});


var io = require('socket.io').listen(server);
var socketio = require('./socketio');
socketio.list(io, db);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
