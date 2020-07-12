const express = require('express');
const router = express.Router();
const db = require('../models');
const flash = require('connect-flash');
const multer = require('multer');
const passport = require('../config/ppConfig');
const cloudinary = require('cloudinary');
const toolbox = require('../private/toolbox');
const fs = require('fs');

const uploads = multer({ dest: './uploads' }); 

// register get route
router.get('/register', function(req, res) {
  res.render('auth/register');
});

// register post route
router.post('/register', uploads.single('profilePic'), function(req, res) {
  //if user is successful on signup
  //let lastPage = req.headers.referer;
  //uploaded pfp
  let pfpUpload;
  //pfp for database
  let pfp;
  //check for file on request, otherwise use defualt pfp
  !req.file ? pfpUpload = 'public/img/defualt-pfp.svg' : pfpUpload = req.file.path;
  //contact cloudinary
  console.log(pfpUpload)
  cloudinary.uploader.upload(pfpUpload, result => {
    // return a rendered page w/ cloudinary link to formatted image
    let cloudId = result.public_id;
    pfp = `https://res.cloudinary.com/dkchpbore/image/upload/${cloudId}.png`; 
    //get rid of uploaded img
    if(pfpUpload != 'public/img/defualt-pfp.svg'){
      fs.unlink(pfpUpload, (error) =>{
        if (error) toolbox.errorHandler(error);
        console.log(`${pfpUpload} Deleted!`);
      });
    }
  })
  .then( () =>{
    db.user.findOrCreate({
      where: {
        email: req.body.email
      }, defaults: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        bio: req.body.bio,
        password: req.body.password,
        pfp: pfp,
        defaults: {
          timeZone: null,
          mapStyle: null,
          searchArea: null
        }
      }
    })
    .then(function([user, created]) {
      // if user was created
      console.log('🍖', user.id);
      if (created) {
        console.log('User created! 🎉');
        passport.authenticate('local', {
          successRedirect: `/users/${user.id}`,
          // successRedirect: lastPage,
          successFlash: 'Thanks for signing up!'
        })(req, res);
      } else {
        console.log('User email already exists 🛑.');
        req.flash('error', 'Error: email already exists for user. Try again.')
        //setTimeout( () => { res.redirect('/auth/register'); }, 5000)
        res.redirect('/auth/register')
      }
    })
    .catch(function(err) {
      console.log(`Error found. \nMessage: ${err.message}. \nPlease review - ${err}`);
      req.flash('error', err.message);
      res.redirect('/auth/register');
    });
  })
  .catch( error => toolbox.errorHandler(error));
});


// login get route
router.get('/login', function(req, res) {
  res.render('auth/login');
});

// login post route
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(error, user, info) {
    if (!user) {
      console.log('not user')
      req.flash('error', 'incorrect id/password');
      return res.redirect('/auth/login');
  }
    if (error) {
      return next(error);
    }

    req.login(user, function(error) {
      // if error move to error
      if (error) next(error);
      // if success flash success message
      req.flash('success', 'You are validated and logged in.');
      // if success save session and redirect user
      req.session.save(function() {
        return res.redirect(`/users/${user.id}`);
      });
    })
  })(req, res, next);
})

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// export router
module.exports = router;