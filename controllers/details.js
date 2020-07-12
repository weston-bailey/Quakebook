const express = require('express');
const router = express.Router();
const db = require('../models');
const toolbox = require('../private/toolbox');

//go home theres nothing
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
    },
    include: [db.comment, db.reply]
  })
  .then( (earthquake) => {
    //format the data here to avoid squidiebois later
    earthquake.comments.forEach(comment => {
      //make the created time pretty
      let commentCreated = new Date(comment.dataValues.createdAt);
      comment.dataValues.localTime = toolbox.localTimeFormat(commentCreated.getTime());
      //make array in comment object for associated replies
      comment.dataValues.replies = [];
      //find the associated replies
      earthquake.replies.forEach( reply => {
        //we have a winner!
        if(reply.dataValues.commentId === comment.dataValues.id){
        //make the created time pretty...again
        let replyCreated = new Date(reply.dataValues.createdAt);
        reply.dataValues.localTime = toolbox.localTimeFormat(replyCreated.getTime());
        // push it
        comment.dataValues.replies.push(reply.dataValues);
        }
      })
      //i like to push it
      commentData.push(comment.dataValues);
    })
    res.render('details/details', { userData, earthquake: earthquake.dataValues, comments: commentData, mapKey: process.env.MAPBOX_TOKEN })
  })
  .catch( error => toolbox.errorHandler('/:earthquakeIndex', 'db.earthquake.findone', error))
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
      })
      .then( () =>{
        //make comment for this event in databse, redirect to details
        res.redirect(`/details/${earthquakeIndex}`);
      })
      .catch(error => toolbox.errorHandler('/:earthquakeIndex/comment', 'db.earthquake.createComment', error));
    })
    .catch(error => toolbox.errorHandler('/:earthquakeIndex/comment', 'db.user.findOne', error));
  })
  .catch(error => toolbox.errorHandler('/:earthquakeIndex/comment', 'db.earthquake.findOne', error));
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
  db.comment.findOne({
    where: {
      id: commentIndex
    }, 
    include: [db.reply]
  })
  .then( comment => {
    //console.log(comment)
    comment.dataValues.replies.forEach(reply => {
      db.reply.destroy({
        where: {
          id: reply.id
        }
      })
      .catch( error => toolbox.errorHandler('/details/:earthquakeIndex/comment/:commentIndex/delete', 'db.reply.destroy', error));
    })
  })
  .then( () =>{
    db.comment.destroy({
      where: {
        id: commentIndex
      }
    })
    .then( () => {
      res.redirect(`/details/${earthquakeIndex}`)
    })
    .catch( error => toolbox.errorHandler('/details/:earthquakeIndex/comment/:commentIndex/delete', 'db.comment.delete', error));
  })
  .catch( error => toolbox.errorHandler('/details/:earthquakeIndex/comment/:commentIndex/delete', 'db.comment.findOne', error));
});

// adding a reply
router.post('/:earthquakeIndex/comment/:commentIndex/reply', (req, res) => {
  let earthquakeIndex = req.params.earthquakeIndex;
  let commentIndex = req.params.commentIndex;
  let userId = req.user.dataValues.id;
  let text = req.body.text;
  db.comment.findOne({
    where: {
      id: commentIndex
    }
  })
  .then(comment =>{
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
      comment.createReply({
        userId: userId,
        text: text,    
        userName: fullName,
        earthquakeId: earthquakeIndex
      })
      .then( () => {
        res.redirect(`/details/${earthquakeIndex}`);
      })
      .catch(error => toolbox.errorHandler(error));
    })
    .catch(error => toolbox.errorHandler(error));
  })
  .catch(error => toolbox.errorHandler(error));
});

// editing a reply
router.put('/:earthquakeIndex/comment/:commentIndex/reply/:replyIndex/edit', (req, res) => {
  let earthquakeIndex = req.params.earthquakeIndex;
  let replyIndex = req.params.replyIndex;
  let text = req.body.replyTextEdit;
  toolbox.log(text)
  db.reply.update({
    text: text
  }, {
    where: {
      id: replyIndex
    }
  })
  .then( () => {
    res.redirect(`/details/${earthquakeIndex}`)
  })
  .catch( error => toolbox.errorHandler('/:earthquakeIndex/comment/:commentIndex/reply/:replyIndex/edit', 'db.reply.update', error));
});

// delete a reply
router.delete('/:earthquakeIndex/comment/:commentIndex/reply/:replyIndex/delete', (req, res) => {
  let earthquakeIndex = req.params.earthquakeIndex;
  let replyIndex = req.params.replyIndex;
  db.reply.destroy({
    where: {
      id: replyIndex
    }
  })
  .then( () => {
    res.redirect(`/details/${earthquakeIndex}`);
  })
  .catch( error => toolbox.errorHandler('/:earthquakeIndex/comment/:commentIndex/reply/:replyIndex/delete', 'db.reply.destroy', error));
  
});

// export router
module.exports = router;