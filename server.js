// required npm libs
require('dotenv').config();
const Express = require('express');
const ejsLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('./config/ppConfig');
const db = require('./models');
const axios = require('axios');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const stringifyBoolean = require('@mapbox/mapbox-sdk/services/service-helpers/stringify-booleans');
const geocodingClient = mbxGeocoding( {accessToken: process.env.MAPBOX_TOKEN});
const methodOverride = require('method-override');
const multer = require('multer');
const cloudinary = require('cloudinary');
const chalk = require('chalk');
const rowdy = require('rowdy-logger');
const isLoggedIn = require('./middleware/isLoggedIn');
const toolbox = require('./private/toolbox');
const { objectIsEmpty } = require('./private/toolbox');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

//api keys and urls
const mapKey = process.env.MAPBOX_TOKEN;

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

// app setup and middlewares
const app = Express();
const rowdyResults = rowdy.begin(app);
const uploads = multer({ dest: './uploads' }); 
app.use(Express.urlencoded({ extended: false }));
app.use(Express.static(__dirname + '/public'));
app.use(Express.static(__dirname + '/private'));
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.use(require('morgan')('dev'));
app.use(helmet());
app.use(methodOverride('_method'));

// create new instance of class SequelizeStore
const sessionStore = new SequelizeStore({
  db: db.sequelize,
  expiration: 1000 * 60 * 30
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: true
}));

sessionStore.sync();

// initialize passport and session info
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(req, res, next){
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;

  next();
});

// controllers
app.use('/auth', require('./controllers/auth'));
app.use('/search', require('./controllers/search'));
app.use('/data', require('./controllers/data'));
app.use('/details', require('./controllers/details'));
app.use('/users', require('./controllers/users'));

// ROUTES
app.get('/', (req, res) => {
  //just magnitude rn
  let searchTerms = {
    mag: {
      type: req.query.magType,
      value: req.query.magValue
    }, 
    time: {
      type: req.query.timeType
    }
  }
  //array of search results
  let searchResults = [];
  
  //handle blank searches
  if(objectIsEmpty(req.query)){
    searchTerms = {
      mag: {
        type: 'greaterThan',
        value: 3.5
      },
      time: {
        type: 'lastMonth'
      }
    } 
  }

  //search database
  db.earthquake.findAll()
  .then(earthquakes => {
    earthquakes.forEach( earthquake => {
      //check search method against db
      let searchTest = earthquake.search(searchTerms);
      if(searchTest){ 
        searchResults.push(earthquake.dataValues);
      }
    })
    //set up map after db operations
    geocodingClient.forwardGeocode({ 
      query: "california"
    })
    .send()
    .then(response => {
      let match = response.body.features[0];
      let matchString = JSON.stringify(match);
      matchString += matchString
      //console.log(matchString);
      //transmit earthquakes and the search parameters
      res.render('index', { match, mapKey: process.env.MAPBOX_TOKEN, searchResults, searchTerms, matchString })
    })
    .catch(error => toolbox.errorHandler(error));
  })
  .catch(error => toolbox.errorHandler(error));
});

function getData(){
  let timeoutUsgsQuery;
  let inc = 0;
  let newEarthquakes = [];
  axios.get(usgsUrls.pastHour.all)
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
            newEarthquakes.push(earthquake.dataValues)
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
  .finally(function () {
    //callback a another query
    timeoutUsgsQuery = setTimeout(getData, 1000);
    if (inc) {
      toolbox.log(`${inc} new earthquakes added to the database`);
      newEarthquakes.forEach( earthquake => {
        toolbox.log(earthquake);
      })
      inc = 0;
      newEarthquakes = [];
    }
  })
}
//uncomment to start api calls
getData();

// initialize app on port
let port = process.env.PORT || 3000;
app.listen(port, () => {
  rowdyResults.print();
  console.log(chalk.black.bgGreen(` ~~~listening on port: ${port}~~~ `)); 
});