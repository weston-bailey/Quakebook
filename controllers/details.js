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

router.post('/:earthquakeIndex/comment', (req, res) => {
  //the id of the earthquake
  let earthquakeIndex = req.params.earthquakeIndex;
  //the comment text
  let text = req.body.text;
  //the id of the current user
  let userId = req.user.dataValues.id;
  //find earthquake
  db.earthquake.findOne({
    where: {
      id: earthquakeIndex
    }
  })
  .then( earthquake => {
    //get user's full name
    let fullName;
    db.user.findOne({
      where: {
        id: userId
      }
    }).then( user =>{
      //get user's full name
      fullName = user.getFullName();
      //create a comment
      earthquake.createComment({
        text: text,    
        userId: userId,
        userName: fullName
    })
    })

  }).catch(error => errorHandler(error));
  //make comment for this event in databse, redirect to details
  res.redirect(`/details/${earthquakeIndex}`);
});

router.get('/:earthquakeIndex', (req, res) => {
  //render details
  //console.log('user: ', req.user);
  //to send over non-sensitive user data
  let userData;
  if(req.user){
    //console.log(user.getFullName())
    userData = {
      id: req.user.id,
      firstName: req.user.dataValues.firstName,
      lastName: req.user.dataValues.lastName,
      pfp: req.user.dataValues.pfp,
      defaults: req.user.dataValues.defaults
    }
  } 
  //index of detail earthquake
  let earthquakeIndex = req.params.earthquakeIndex;
  //to send back comments
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
        //TODO add username to comment model
        commentData.push(comment.dataValues);
      })
      res.render('details/details', { userData, earthquake: earthquake.dataValues, comments: commentData, mapKey: process.env.MAPBOX_TOKEN })
    })
    //send data
    //(earthquake.dataValues)

  })
  .catch( error => toolbox.errorHandler(error));
  //res.send(`details for ${earthquakeIndex}`);
});



// export router
module.exports = router;