const express = require('express');
const router = express.Router();
const db = require('../models');
const toolbox = require('../private/toolbox');

//go home
router.get('/', (req, res) => {
  res.redirect('/');
});

//display details
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

// making a comment
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
  }).catch(error => toolbox.errorHandler(error));
  //make comment for this event in databse, redirect to details
  res.redirect(`/details/${earthquakeIndex}`);
});

// editing a comment
router.put('/:earthquakeIndex/comment/:commentIndex/edit', (req, res) => {
  let earthquakeIndex = req.params.earthquakeIndex;
  let commentIndex = req.params.commentIndex;
  let text = req.body.commentTextEdit;
  db.comment.update({
    text: text
  }, {
    where: {
      id: commentIndex
    }
  })
  .then( () => {
    res.redirect(`/details/${earthquakeIndex}`)
  })
  .catch( error => toolbox.errorHandler('/details/:earthquakeIndex/comment/:commentIndex/edit', 'db.update', error));
});

// deleting a comment
router.delete('/:earthquakeIndex/comment/:commentIndex/delete', (req, res) => {
  let earthquakeIndex = req.params.earthquakeIndex;
  let commentIndex = req.params.commentIndex;
  db.comment.destroy({
    where: {
      id: commentIndex
    }
  })
  .then( () => {
    res.redirect(`/details/${earthquakeIndex}`)
  })
  .catch( error => toolbox.errorHandler('/details/:earthquakeIndex/comment/:commentIndex/delete', 'db.delete', error));
});

// adding a reply
router.post('/:earthquakeIndex/comment/:commentIndex/reply', (req, res) => {
  let earthquakeIndex = req.params.earthquakeIndex;
  let commentIndex = req.params.commentIndex;
  res.send(`<h2>making reply on comment ${commentIndex} on earthquake ${earthquakeIndex}</h2>`);
});

// editing a reply
router.put('/:earthquakeIndex/comment/:commentIndex/reply/:replyIndex/edit', (req, res) => {
  let earthquakeIndex = req.params.earthquakeIndex;
  let commentIndex = req.params.commentIndex;
  let replyIndex = req.params.replyIndex;
  res.send(`<h2>editing reply ${replyIndex} on comment ${commentIndex} on earthquake ${earthquakeIndex}</h2>`);
});

// delete a reply
router.delete('/:earthquakeIndex/comment/:commentIndex/reply/:replyIndex/delete', (req, res) => {
  let earthquakeIndex = req.params.earthquakeIndex;
  let commentIndex = req.params.commentIndex;
  let replyIndex = req.params.replyIndex;
  res.send(`<h2>deleting reply ${replyIndex} on comment ${commentIndex} on earthquake ${earthquakeIndex}</h2>`);
});

// export router
module.exports = router;