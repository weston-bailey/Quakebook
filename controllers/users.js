const express = require('express');
const router = express.Router();
const db = require('../models');
// import middleware
const isLoggedIn = require('../middleware/isLoggedIn');
const flash = require('connect-flash');
const passport = require('../config/ppConfig');


router.get('/', isLoggedIn, function(req, res){
  // user data to send
  let userData = [];
  //find every user
  db.user.findAll().then( users => {
    users.forEach(user => {
      userData.push(user.getPublicData())
    })
    console.log(userData)
    res.render('users/users', { userData })
  })
});


router.get('/:userId', isLoggedIn, function(req, res){
  userId = req.params.userId;
  res.send(`profile for ${userId}`);
});

// export router
module.exports = router;