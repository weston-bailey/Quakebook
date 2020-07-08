/*
sequelize model:create --name earthquake --attributes usgsId:string,mag:float,place:string,time:float,url:string,felt:integer,alert:string,status:string,tsunami:integer,sig:integer,title:string,latitude:float,longitude:float,depth:float
sequelize model:create --name comment --attributes userId:integer,earthquakeId:integer,text:text
*/

const axios = require('axios');
const db = require('./models');
const toolbox = require('./private/toolbox');
const beautify = require("json-beautify");

const usgsUrls = {
  pastHour: {
    all: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
    mag1: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_hour.geojson',
    mag2: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.geojson',
    mag4: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_hour.geojson'
  }, 
  allTime: {
    all: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson',
    mag1: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson',
    mag2: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson',
    mag4: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson'
  }
}


function populateDb(){
  let inc = 0;
  let newEeathquakes = [];
  axios.get(usgsUrls.allTime.all)
    .then(function (response) {
      //check database for features
      response.data.features.forEach( feature =>{
        //console.log(feature.properties.geometry.coordinates[0])
        db.earthquake.findOrCreate({
          where: {
            usgsId: feature.id
          }, defaults: {
            usgsId: feature.id,
            mag: feature.properties.mag,
            place: feature.properties.place,
            time: feature.properties.time,
            url: feature.properties.url,
            felt: feature.properties.felt,
            alert: feature.properties.alert,
            status: feature.properties.status,
            tsunami: feature.properties.tsunami,
            sig: feature.properties.sig,
            title: feature.properties.title,
            latitude: feature.geometry.coordinates[0],
            longitude: feature.geometry.coordinates[1],
            depth: feature.geometry.coordinates[2]
          }
        })
        .then((earthquake, created) => {
          if(created){
            inc++;
            newEeathquakes.push(earthquake.dataValues)
          }
        })
        .catch(function (error) {
          // handle error from axios
          toolbox.errorHandler(error);
        })
      })
    })
    .catch(function (error) {
      // handle error from axios
      toolbox.errorHandler(error);
    })
    .finally( () => {
      newEeathquakes.forEach( earthquake => {
        console.log(earthquake);
      });
      console.log(`${inc} new earthquakes added to the database`);
      inc = 0;
    })
}

//populateDb();

function checkAlerts(){
  db.earthquake.findAll().then( earthquakes => {
    earthquakes.forEach( earthquake => {
      if(earthquake.dataValues.alert === 'orange'){
        console.log(earthquake.dataValues)
      }
    })
  })
}

//checkAlerts();

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
    type: 'greaterThan', 
    //magnitude value to test
    value: 7
  }
}

searchTest(searchTerms);