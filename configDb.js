/*
sequelize model:create --name earthquake --attributes usgsId:string,mag:float,place:string,time:float,url:string,felt:integer,alert:string,status:string,tsunami:integer,sig:integer,title:string,latitude:float,longitude:float,depth:float
sequelize model:create --name comment --attributes userId:integer,earthquakeId:integer,text:text
*/

const axios = require('axios');
const db = require('./models');
const toolbox = require('./private/toolbox');
const { errorHandler } = require('./private/toolbox');

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

  axios.get(usgsUrls.allTime.all)
    .then(function (response) {
      //check database for features
      console.log(response.data.features)
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

}

populateDb();

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

let mockUsers = [
  {
    firstName: 'Jon',
    lastName: 'person',
    bio: 'im just here for the free donuts'
  },
  {
    firstName: 'Sally',
    lastName: 'person',
    bio: 'i love earthquakes'
  },
  {
    firstName: 'abraham',
    lastName: 'lincoln',
    bio: 'lmao just a coincidence, im not the former president'
  },
  {
    firstName: 'russian',
    lastName: 'bot',
    bio: 'vote trump'
  },
  {
    firstName: 'a magic talking dog',
    lastName: 'McBarkerson',
    bio: 'woof woof lmao jk i can talk'
  },
  {
    firstName: 'Super',
    lastName: 'great person',
    bio: 'im the best!!!!!!'
  },
  {
    firstName: 'super',
    lastName: 'awful person',
    bio: 'im the worst!!!!!!!!!!11'
  },
  {
    firstName: 'a regular dog',
    lastName: 'McBarkface',
    bio: 'woof woof woof grrrrrrr'
  },
]

function makeUsers(){
  mockUsers.forEach( (user, index) =>{
    db.user.findOrCreate({
      where: {
        firstName: user.firstName
      },
      defaults: {
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        pfp: "img/defualt-pfp.svg",
        password: 'password',
        email: `tester${index}@test.com`
      }
    })
    .catch( error => errorHandler(error));
  })
}

//makeUsers()