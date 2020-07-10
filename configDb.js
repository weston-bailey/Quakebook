/*
sequelize model:create --name earthquake --attributes usgsId:string,mag:float,place:string,time:float,url:string,felt:integer,alert:string,status:string,tsunami:integer,sig:integer,title:string,latitude:float,longitude:float,depth:float
sequelize model:create --name comment --attributes userId:integer,earthquakeId:integer,userName:string,text:text
sequelize model:create --name reply --attributes userId:integer,earthquakeId:integer,commentId:integer,userName:string,text:text
*/

const axios = require('axios');
const db = require('./models');
const toolbox = require('./private/toolbox');
const beautify = require("json-beautify");

function getUsers(){
  let userData = [];
  axios.get('https://randomuser.me/api/?results=100', {
    headers: {
      dataType: 'json'
    }
  })
  .then(function (response) {
    //check database for features
    console.log(beautify(response.data, null, 2, 80));
    userData = response.data.results;
  })
  .catch(function (error) {
    // handle error from axios
    toolbox.errorHandler(error);
  })
  .finally(function () {
    userData.forEach( (user, index) =>{
      db.user.findOrCreate({
        where: {
          email: user.email
        },
        defaults: {
          firstName: user.name.first,
          lastName: user.name.last,
          bio: 'I love earthquakes',
          pfp: user.picture.large,
          password: 'password',
        }
      })
      .catch( error => toolbox.errorHandler(error));
    })
  });
}

//getUsers();

function searchTest(search){
  //data array to send back
  let transmitData = [];
  console.log('data request recieved, searching database');
  let responseTimeout;
  let responseInc = 0;
  responseTimeout = setInterval( () => {
    responseInc += 1;
  }, 1);
  //check if there even is a search
  db.earthquake.findAll()
  .then( earthquakes => {
    earthquakes.forEach( earthquake => {
      //boolean test for search query
      let searchTest = earthquake.search(search);
      if(searchTest){ 
        transmitData.push(earthquake);
      }
    })
    console.log(transmitData);
    //for response time test
    clearTimeout(responseTimeout);
    console.log('data response time:', responseInc);
    //tranmist data
  })
  .catch(error => toolbox.errorHandler(error));
  
}
//search terms object
let searchTerms = {
  //magnitude search terms
  mag: {
    //'greaterThan', 'equalTo' 'lessThan', 'all'
    type: 'all', 
    //magnitude value to test
    value: 7
  }, 
  time: {
    type: 'lastHour'
  }
}

//searchTest(searchTerms);


