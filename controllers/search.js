const express = require('express');
const router = express.Router();
const db = require('../models');
// import middleware
const isLoggedIn = require('../middleware/isLoggedIn');
const flash = require('connect-flash');
const passport = require('../config/ppConfig');

//todo change to /users/:index/profile
router.get('/', function(req, res){
  console.log(req.query)
  res.send('search query and redirect');
  //redirect to / after search
});

// export router
module.exports = router;