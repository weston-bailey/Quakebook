const express = require('express');
const router = express.Router();
const db = require('../models');
// import middleware
const isLoggedIn = require('../middleware/isLoggedIn');
const flash = require('connect-flash');
const passport = require('../config/ppConfig');


router.get('/',  isLoggedIn, function(req, res){
  res.send('render all users')
});


router.get('/:userId', isLoggedIn, function(req, res){
  userId = req.params.userId;
  res.send(`profile for ${userId}`);
});

// export router
module.exports = router;