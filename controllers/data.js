const express = require('express');
const router = express.Router();
const db = require('../models');
// import middleware
const isLoggedIn = require('../middleware/isLoggedIn');
const flash = require('connect-flash');
const passport = require('../config/ppConfig');

router.get('/', (req, res) => {
  console.log(req.query);
  //search db based on req.query
  //send back features for map
  res.send('features data from api')
});


// export router
module.exports = router;