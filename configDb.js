/*
sequelize model:create --name earthquake --attributes usgsId:string,mag:float,place:string,time:float,url:string,felt:integer,alert:string,status:string,tsunami:integer,sig:integer,title:string,latitude:float,longitude:float,depth:float
sequelize model:create --name comment --attributes userId:integer,earthquakeId:integer,text:text
*/

const axios = require('axios');
const db = require('./models');

function populateDb(){

  axios.get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson')
    .then(function (response) {
      //check database for features
      console.log(response.data.features)
      response.data.features.forEach( feature =>{
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
            latitude: feature.properties.latitude,
            longitude: feature.properties.longitude,
            depth: feature.properties.depth
          }
        })
        .catch(function (error) {
          // handle error from axios
          toolbox.erroorHandler(error);
        })
      })

    })
    .catch(function (error) {
      // handle error from axios
      toolbox.erroorHandler(error);
    })

}

populateDb();