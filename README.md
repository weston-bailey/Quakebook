# Project 2

## Overview

*Quakebook* is the world's first social media network with a community centered around seismic activity.

*Quakebook*'s server collects data from the usgs earthquake API as seismic activity occurs, gives users access to the data in a searchable database, and displays an interactive map of of earthquakes for users to explore. Users can explore the details of a particular earthquake after selecting it from the results of their search.

*Quakebook* users can further engage with the *Quakebook community* by creating a free profile that will allow them to interact with other users by commenting on a particular earthquake.

## MVP

[] Create a database of seismic activity updated from the usgs earthquake catalogue API as earthquakes occur in real time.

[] Plot seismic events on an interactive amp using the mapbox api.

[] display seismic event detail page with just one event on it

[] allow users to securely login and comment on seismic events. 

[] allow users to search and filter results of displayed seismic events. (location, date, magnitude, etc)

[] all registered users viewable from users page 

[] Users have a detail profile page with bio, pfp and comments they have made 

[] Map is usable when not logged in, but comments and users are hidden until login

[] styled with bootstrap

## Stretch

[] users can reply to comments

[] users can save seismic events without commenting them

[] users can edit/delete comments

[] users can edit/delete profile

[] additional ways to display data on map (ie heatmap, map style selection)

[] make it a twitter bot that tweets out new earthquakes

[] password/account recovery

## Routes

HTTP Verb | Route | Request | Response | Auth Required
----------|-------|---------|----------|--------------|
GET | / | route hit | render map view/default search | no
GET | /search | search query | render/redirect map view | no
GET | /data | data query | send data geoJSON | no
GET | /details/:earthquakeIndex | request params | render details | no
||||
GET | /auth/login | route hit | render login | no
POST | /auth/login | request body | validate render profile | no
GET | /auth/register | route hit | render register | no
POST | /auth/register | request body | create new user render profile | no
||||
POST | /details/:earthquakeIndex/comment | request params request body | create new comment redirect /details/:earthquakeIndex | yes
GET | /users | route hit | render users | yes
GET | /users/:userId | request params | render user | yes

### Pitch questions

* best practices for json postgres databases

* best practices for mapbox client data

* best practices for file storage vs cloud storage

### APIs

* [usgs earthquake catalogue](https://earthquake.usgs.gov/fdsnws/event/1/)
* [mapbox](https://www.mapbox.com/)
* [axois client api](https://unpkg.com/axios/dist/axios.min.js)

## Database models

[Database Models](https://drive.google.com/file/d/1Sro1wSSi3B4oBOXUqYn4Z_SLfWl59hPU/view)

## Wireframes 

[Wireframes](https://app.diagrams.net/?libs=general;mockups#G1up9xol3OMxxRLe34gjBcLpUwVfqxfurd)

## Trello

[trello board](https://trello.com/b/zcVCIB7s/p2)

## Technical details

### pseudo code for various aspects of the project

#### Maintaining an updated database of earthquakes

the usgs api will be queried every second or so to check if there are any new earthquakes, and the database will be updated accordingly

```javascript
const axios = require('axios');

let timeoutUsgsQuery;

function getData(){
  axios.get("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.geojson")
    .then(function (response) {
      //check database for 
      for(feature in response.data){
        db.earthquake.findOrCreate({
          //check usgs's id against database
          where: {
            usgsId: feature.properties.id
          },
          //defualt values if not found (only matter if not found)
          defaults: {
            //update accordingly
          }
        })
        .then( ([earthquake, created]) => {
          //check if any data has been updated if not created
          if(!created){
            //check feature.properties.status for update
          }
        })
        .catch( error => {
          // handle error from database
          console.log(error);
        });
      }
    })
    .catch(function (error) {
      // handle error from axios
      console.log(error);
    })
    .finally(function () {
      //callback a another query
      timeoutUsgsQuery = setTimeout(getData, 1000);
    });
}

getData();


```

#### Mapbox client side javascript

mapbox needs be configured from client side javascript (needs more research), and getting complex data from from the server to client using ejs template rendering is difficult/not possible (needs more research). 

My current solution is to pass simple values as search terms (strings, integers) from the server to the client when rendering pages, and so the client can make a fetch request back to the server when DOM content is loaded to get large payloads of geoJSON data for mapbox to use.

```html
<!-- ejs passing search terms/mapbox info to client js with -->

<!-- search terms for mapbox -->
<% var longitude = match.center[1]; %>
<% var latitude = match.center[0]; %>
<!-- api access key -->
<% var mapKey = mapKey; %>
<!-- formated string of database ids for server -->
<% var earthquakeIds = earthquakeIds; %>

<!-- load up a div with data attributes -->
<div id="dataDiv" data-longitude=<%= longitude %> data-latitude=<%= latitude %> data-mapKey=<%= mapKey %> data-earthquakeIds=<%= earthquakeIds %> ></div>

<!-- include axios client api -->
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>

<!-- inlcude client js -->
<script src="/js/map.js"></script>
```

```javascript
//mapbox info
let latitude = document.getElementById('dataDiv').dataset.latitude;
let longitude = document.getElementById('dataDiv').dataset.longitude;
let mapKey = document.getElementById('dataDiv').dataset.mapKey;
//database ids for the server to look up and send back
//example format "1,3,57,34,12,3,4,5"
let earthquakeIds = document.getElementById('dataDiv').dataset.earthquakeIds;

//render map
  mapboxgl.accessToken = mapKey;
  var map = new mapboxgl.Map({
    container: 'map',
    // style: 'mapbox://styles/mapbox/streets-v11',
    style: 'mapbox://styles/mapbox/satellite-v9',
    center: [latitude, longitude],
    zoom: 5
  });

//fetch data from /data route on server
  let geojson;
  axios({
    method: 'get',
    url: '/data',
    params: {
      search: earthquakeIds //search terms would go here
    }
  })
  .then( response => {
    //make an array of the features sent from server
    geojson = Object.entries(response.data.features);

    //interate over array of features and create mapobox marker elements
    geojson.forEach( (marker, index) => {
      //convert milliseconds tp current date
      let time = new Date(marker[1].properties.time);

      //configure DOM for mapbox elements
      let el = document.createElement('img');
      el.class = 'marker';
      el.src = './images/mapbox-icon.png';
      el.style.width = '2vw';
      
      //configue mabox pop up variable
      let popup = new mapboxgl.Popup({ offset: 25 }).setText(
        `${index} ${marker[1].properties.place} \n
        magnitude: ${marker[1].properties.mag} \n
        time: ${time} \n`
      );

      //create new mapbox marker
      new mapboxgl.Marker(el)
      .setLngLat(marker[1].geometry.coordinates)
      .setPopup(popup)
      .addTo(map);
    })
  })

```
```javascript
//server js route for data retrieval
router.get('/data', (req, res) => {
  //do some kind of test on incoming query
  if(req.query.search){
    //parse data from string to array
    let indexArray = req.query.search.split(',');
    //data object in geoJSON foormat to send back
    let responseObject = {
      type: "FeatureCollection",
      title: "Quakebook requested earthquakes"
      features: []
    };

    //itarate over array of requested ids
    indexArray.forEach(id => {
      //look up id in databse
      db.user.findOne({
        where: {
          id: id
        }
      })
      .then(foundFeature => {
        //push feature to response
        responseObject.features.push(foundFeature)
      })
      .catch( error => {
        //handle database errors
        errorHandler(error);
      })
      .finally( () => {
        //send response object back once database operations are complete
        res.send(responseObject);
      });
    });
  }
});

```


