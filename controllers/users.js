const express = require('express');
const router = express.Router();
const db = require('../models');
// import middleware
const isLoggedIn = require('../middleware/isLoggedIn');
const flash = require('connect-flash');
const passport = require('../config/ppConfig');

//todo change to /users/:index/profile
router.get('/profile', isLoggedIn, function(req, res){
  res.render('profile');
});

// export router
module.exports = router;