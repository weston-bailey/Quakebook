const express = require('express');
const router = express.Router();
const db = require('../models');
// import middleware
const isLoggedIn = require('../middleware/isLoggedIn');
const flash = require('connect-flash');
const passport = require('../config/ppConfig');
const toolbox = require('../private/toolbox');


router.get('/', isLoggedIn, function(req, res){
  // user data to send
  let userData = [];
  //find every user
  db.user.findAll().then( users => {
    users.forEach(user => {
      userData.push(user.getPublicData());
    })
    console.log(userData)
    res.render('users/users', { userData });
  })
  .catch(error => toolbox.errorHandler(error));
});


router.get('/:userId', isLoggedIn, function(req, res){
  userId = req.params.userId;
  //user data to transmit
  let userData;
  db.user.findOne({
    where: {
      id: userId
    }
  })
  .then( user => {
    //update user data to transmit and make and array for comments
    userData = user.getPublicData();
    userData.comments = [];
    console.log(userData)
    user.getComments().then( comments => {
      comments.forEach( comment => {
        userData.comments.push(comment.dataValues)
      });
      res.render('users/profile', { userData })
    })
    .catch(error => toolbox.errorHandler(error));
  })
  .catch(error => toolbox.errorHandler(error));
});

// export router
module.exports = router;