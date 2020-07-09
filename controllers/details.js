const express = require('express');
const router = express.Router();
const db = require('../models');
const toolbox = require('../private/toolbox');

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
    })
    .then( user =>{
      //get user's full name
      fullName = user.getFullName();
      //create a comment
      earthquake.createComment({
        text: text,    
        userId: userId,
        userName: fullName
      });
    });
  }).catch(error => errorHandler(error));
  //make comment for this event in databse, redirect to details
  res.redirect(`/details/${earthquakeIndex}`);
});

router.get('/:earthquakeIndex', (req, res) => {
  let userData;
  if(req.user){
    userData = req.user.getPublicData();
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
    //make a pretty date
    earthquake.dataValues.localTime = toolbox.localTimeFormat(earthquake.dataValues.time);
    //find associated comments
    earthquake.getComments().then( comments => {
      //push comments to comment data array
      comments.forEach( comment => {
        //make the created time pretty
        let created = new Date(comment.dataValues.createdAt);
        comment.dataValues.localTime = toolbox.localTimeFormat(created.getTime());
        commentData.push(comment.dataValues);
      })
      res.render('details/details', { userData, earthquake: earthquake.dataValues, comments: commentData, mapKey: process.env.MAPBOX_TOKEN })
    })

  })
  .catch( error => toolbox.errorHandler(error));
});

// export router
module.exports = router;