const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');

module.exports = (app) => {
  // serializeUser assign an user to one session
  // user.id been change in the model, usualy .id comes as _id
  passport.serializeUser((user, cb) => { cb(null, user.id )});

  // deserializeUser identify with user belongs the session
  passport.deserializeUser((id, cb) => {
    User.findById(id)
    .then(user => cb(null, user))
    .catch(error => cb(error))
  }); 

  // Local Strategy
  passport.use(new LocalStrategy({ passReqToCallback: true, usernameField: 'email'}, (req, email, password, next) => {
    User.findOne({ email })
    .then(user => {
      if(!user){
        // first param error, second user, third message
        return next(null, false, { message: 'Usuario o contraseña incorrectos.'});
      }

      if(bcrypt.compareSync(password, user.password)){
        // passport is a middleware so it needs 'next' to execute returns
        return next(null, user);
      } else {
        // passport is a middleware so it needs 'next' to execute returns
        return next(null, false, { message: 'Usuario o contraseña incorrectos'});
      }
    }) 
    // passport is a middleware so it needs 'next' to execute returns
    .catch((error) => next(error))
  }))

  app.use(passport.initialize());
  app.use(passport.session());
}