const express = require('express');
const router = express.Router();
const db = require('../models');
const toolbox = require('../private/toolbox');

router.get('/', (req, res) => {
  //incoming search
  let searchTerms = JSON.parse(req.query.searchTerms);
  //data array to send back
  let transmitData = [];
  //for response time test
  console.log('data request recieved, searching database');
  let responseTimeout;
  let responseInc = 0;
  responseTimeout = setInterval( () => {
    responseInc += 1;
  }, 1);
  //search database
  db.earthquake.findAll()
  .then( earthquakes => {
    earthquakes.forEach( earthquake => {
      //boolean test for search query
      let searchTest = earthquake.search(searchTerms);
      if(searchTest){ 
        transmitData.push(earthquake);
      }
    })
    //for response time test
    clearTimeout(responseTimeout);
    console.log('data response time:', responseInc);
    //limit results to 1500
   if(transmitData.length > 2000) {
     transmitData = transmitData.splice(0, 2000)
   }
    //tranmist data
    res.send(transmitData);
  })
  .catch(error => toolbox.errorHandler(error));
});

router.get('/details', (req, res) => {
  //id of earthquake to find
  let search = req.query.search;
  console.log(search)
  //data to send back
  let earthquakeData;
  db.earthquake.findOne({
    where: {
      id: search
    }
  })
  .then( earthquake => {
    //just being explicit
    earthquakeData = earthquake;
    //send data
    res.send(earthquakeData)
  })
  .catch( error => toolbox.errorHandler(error));
});


// export router
module.exports = router;