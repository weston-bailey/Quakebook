const express = require('express');
const router = express.Router();
const db = require('../models');
// import middleware
const isLoggedIn = require('../middleware/isLoggedIn');
const flash = require('connect-flash');
const passport = require('../config/ppConfig');

router.get('/', (req, res) => {
  res.send('hit');
})

router.get('/:earthquakeIndex/comment', (req, res) => {
  console.log(req.params);
  console.log(req.body);
  let earthquakeIndex = req.params.earthquakeIndex;
  //make comment for this event in databse, redirect to details
  res.send(`creating a comment for ${earthquakeIndex}`);
});

router.get('/:earthquakeIndex', (req, res) => {
  //render details
  console.log(req.params);
  let earthquakeIndex = req.params.earthquakeIndex;
  let commentData = [];
  db.earthquake.findOne({
    where: {
      id: earthquakeIndex
    }
  })
  .then( earthquake => {
    //find associated comments
    earthquake.getComments().then( comments => {
      //push comments to comment data array
      comments.forEach( comment => {
        commentData.push(comment);
      })
    })
    //send data
    console.log(earthquake.dataValues)
    res.render('details/details', { earthquake: earthquake.dataValues, comments: commentData, mapKey: process.env.MAPBOX_TOKEN })
  })
  .catch( error => toolbox.errorHandler(error));
  //res.send(`details for ${earthquakeIndex}`);
});



// export router
module.exports = router;