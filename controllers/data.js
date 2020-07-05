const express = require('express');
const router = express.Router();
const db = require('../models');
// import middleware
const isLoggedIn = require('../middleware/isLoggedIn');
const flash = require('connect-flash');
const passport = require('../config/ppConfig');
const earthquake = require('../models/earthquake');
const toolbox = require('../private/toolbox');

router.get('/', (req, res) => {
  console.log(req.query);
  console.log('starting test');
  let tesTimeout;
  let testInc = 0;
  tesTimeout = setInterval( () => {
    testInc += 1;
  }, 1);
  if(req.query.search){
    db.earthquake.findAll()
    .then( earthquakes => {
      let transmitData = [];
      earthquakes.forEach( earthquake => {
        let test = earthquake.searchMagGreaterThan(4.5);
        if(test){ 
          console.log(test);
          transmitData.push(earthquake);
        }
      })
      clearTimeout(tesTimeout);
      console.log('test complete', testInc);
      res.send(transmitData);
    })
    .catch(error => toolbox.errorHandler(error));
  }
});


// export router
module.exports = router;