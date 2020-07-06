const express = require('express');
const router = express.Router();
const db = require('../models');
// import middleware
const isLoggedIn = require('../middleware/isLoggedIn');
const flash = require('connect-flash');
const passport = require('../config/ppConfig');
const earthquake = require('../models/earthquake');
const toolbox = require('../private/toolbox');
const { response } = require('express');

router.get('/', (req, res) => {
  let search = req.query.search;
  console.log(req.query);
  //for response time test
  console.log('data request recieved, searching database');
  let responseTimeout;
  let responseInc = 0;
  responseTimeout = setInterval( () => {
    responseInc += 1;
  }, 1);
  //check if there even is a search
  if(search){
    db.earthquake.findAll()
    .then( earthquakes => {
      let transmitData = [];
      earthquakes.forEach( earthquake => {
        //boolean test for search query
        let searchTest = earthquake.searchMagGreaterThan(search);
        if(searchTest){ 
          transmitData.push(earthquake);
        }
      })
      //for response time test
      clearTimeout(responseTimeout);
      console.log('data response time:', responseInc);
      //tranmist data
      res.send(transmitData);
    })
    .catch(error => toolbox.errorHandler(error));
  }
});


// export router
module.exports = router;