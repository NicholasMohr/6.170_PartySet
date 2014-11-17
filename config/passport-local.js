// Primary Author: Hyungie Sung

var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var User = require('../mongoose/users');

module.exports = function(passport){
  passport.use('local-signup', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    function(req, email, password, done) {
      process.nextTick(function() {
        var em = email.toLowerCase();
        
        // check if username is actual email format
        var re = /^(([^<>()[]\.,;:s@"]+(.[^<>()[]\.,;:s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/igm;
        if (em == '' || !re.test(em)) { return done(null, false, 'Please enter a valid MIT email address.'); }

        // check to see if username is MIT email address
        if (em.split("@").pop() != "mit.edu") { return done(null, false, 'Please enter a valid MIT email address.'); }

        User.findOne({'local.username': em}, function(err, user) {
          // if there are any errors, return the error
          if (err) { return done({error: err}); }
          // if user with given email already exists in database
          if (user) { return done(null, false, 'This email is already in use.'); }
          // if no user with given email, create new user
          else {
            var p = password;
            bcrypt.genSalt(10, function(err, salt) {
              bcrypt.hash(p, salt, function(err, hash) {
                var name = req.body.name;
                if (!name || /^\s*$/.test(location)) { return done(null, false, 'Please write your name.'); }

                var newUser = new User({local: {password: hash, email: em}, name: req.body.name, verified: false});
                newUser.save(function(err, product, numberAffected) {
                  if (err) {
                    return done(null, false, err);
                  } else {
                    return done(null, newUser);
                  }
                });
              });
            });
          }
        });
      });

  }));
  
  passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) { 
      var em = email.toLowerCase();

      User.findOne({'local.username': em}, function(err, user) {
        // check if account with email address exists
        if (err) { return done({error: err}); }
        if (!user) { return done(null, false, {error: 'Your username or password is incorrect.'}); }
        else {
          bcrypt.compare(password, user.local.password, function(err, matches) {
            // check if password matches for account
            if (err) { return done({error: err}); }
            if (matches) { return done(null, user); }
            else { return done(null, false, {error: 'Your username or password is incorrect.'}); }
          });
        }
      });
  }
));

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
};