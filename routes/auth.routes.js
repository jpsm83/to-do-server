// authentication routes login, signup, logout, edit, loggedin

const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User.model');

// Bcrypt config to encrypt passwords
const bcrypt = require('bcryptjs');
const uploader = require('../configs/cloudinary.config');
const bcryptSalt = 10;

router.post('/signup', (req, res, next) => {
  const { username, email, password } = req.body;

  // validators have to be equal to validators from frontend
  if(password.length < 3){
    // error 400 - bad request
    return res.status(400).json({ message: 'Please make your password at least 3 characters long'});
  }

  if(!username || !email){
    return res.status(400).json({ message: 'Please fill all the fields in the form'});
  }

  User.findOne({ email })
  .then(user => {
    if(user){
      return res.status(400).json({ message: 'User already exists. Please change your email'});
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    User.create({
      username, 
      email,
      // encrypted password
      password: hashPass
    })
    .then((newUser) => {
      // Passport req.login permite iniciar sesión tras crear el usuario
      req.login(newUser, (error) => {
        if(error){
          return res.status(500).json(error)
        }

        return res.status(200).json(newUser);
      })
    })
    // error 500 - server error
    .catch(error => res.status(500).json(error))
  })
})

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (error, theUser, failureDetails) => {
    if(error){
      return res.status(500).json(error);
    }

    if(!theUser){
      // error message (failureDetails) comes from passport.config
      // error 401 - unauthorized
      return res.status(401).json(failureDetails);
    }

    req.login(theUser, (error) => {
      if(error){
        return res.status(500).json(error);
      }
      return res.status(200).json(theUser);
    })
  })
  // in this line, we are calling the function we just created for login
  (req, res, next)
})

router.post('/logout', (req, res, next) => {
  // req.logout is a function defined by passport
  // replaces req.session.destroy
  req.logout();
  return res.status(200).json({ message: 'Logout success!'});
})

// cloudnary router for upload photo???
router.put('/edit', uploader.single('photo'), (req, res, next) => {
  console.log(req.file);
  User.findOneAndUpdate({ _id: req.user.id }, { ...req.body, photo: req.file ? req.file.path : req.user.photo }, { new: true })
  .then(user => res.status(200).json(user))
  .catch(error => res.status(500).json(error))
})

router.get('/loggedin', (req, res, next) => {
  // req.isAuthenticated & req.user are defined by passport
  if(req.isAuthenticated()){
    return res.status(200).json(req.user);
  } else {
    // error 403 - forbbiden
    return res.status(403).json({ message: 'Forbbiden' });
  }
})

module.exports = router;