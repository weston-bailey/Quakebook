const db = require('../models');
const axios = require('axios');
const toolbox = require('./toolbox');

module.exports = {
  //earthquake urls
  urls: {
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
  },

//get data from usgs at specified intervals
  getData: function(url, callbackTime){
    getData(url, callbackTime);
  }
}

//get data from usgs at specified intervals
function getData(url, callbackTime){
    let timeoutUsgsQuery;
    axios.get(url)
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
          .then(([earthquake, created]) => {
            //update the database if the status has changed
            if(!created){
              if(earthquake.status != feature.properties.status){
                earthquake.update({
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
                })
                .then( updated => {
                  toolbox.log(`existing earthquake updated in the database!`, `from url: ${url}`, `callback to usgs rescheduled in: ${callbackTime}`, earthquake.dataValues);
                })
                //error from update
                .catch( error => toolbox.errorHandler(error));
              }
            }
            if(created){
              toolbox.log(`new earthquake added to the database!`, url, callbackTime, earthquake.dataValues);
            }
          })
          .catch(function (error) {
            // error from creation
            toolbox.errorHandler(error);
          })
        })
      })
      .catch(function (error) {
        // handle error from axios
        toolbox.errorHandler(error);
        //continue callbacks even if there is an error
        timeoutUsgsQuery = setTimeout( () => getData(url, callbackTime), callbackTime);
      })
      .finally(function () {
      //callback a another query
      timeoutUsgsQuery = setTimeout( () => getData(url, callbackTime), callbackTime);
    });
  }