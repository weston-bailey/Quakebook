// required npm libs
require('dotenv').config();
const Express = require('express');
const ejsLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('./config/ppConfig');
const db = require('./models');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const stringifyBoolean = require('@mapbox/mapbox-sdk/services/service-helpers/stringify-booleans');
const geocodingClient = mbxGeocoding( {accessToken: process.env.MAPBOX_TOKEN});
const methodOverride = require('method-override');
const chalk = require('chalk');
const rowdy = require('rowdy-logger');
const toolbox = require('./private/toolbox');
const usgsApiService = require('./private/usgsApiService');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

//api keys and urls
const mapKey = process.env.MAPBOX_TOKEN;

// app setup and middlewares
const app = Express();
const rowdyResults = rowdy.begin(app);
app.use(Express.urlencoded({ extended: false }));
app.use(Express.static(__dirname + '/public'));
app.use(Express.static(__dirname + '/private/'));
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
app.use('/data', require('./controllers/data'));
app.use('/details', require('./controllers/details'));
app.use('/users', require('./controllers/users'));

// ROUTES
app.get('/', (req, res) => {
  //create search term arguments object from req body
  let searchTerms = {
    mag: {
      type: req.query.magType,
      value: req.query.magValue
    }, 
    time: {
      type: req.query.timeType
    }
  }
  //array of search results to be sent back 
  let searchResults = [];
  
  //handle blank searches (user just landed on page)
  if(toolbox.objectIsEmpty(req.query)){
    searchTerms = {
      mag: {
        type: 'greaterThan',
        value: 1
      },
      time: {
        type: 'lastWeek'
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
        earthquake.dataValues.localTime = toolbox.localTimeFormat(earthquake.dataValues.time);
        searchResults.push(earthquake.dataValues);
      }
    })
    //set up map after db operations
   let match = { center: [ -119.699375153073, 20] };
   //limit results to 1500
   if(searchResults.length > 2000) {
    searchResults = searchResults.splice(0, 2000)
   }
   res.render('index/index', { match, mapKey: process.env.MAPBOX_TOKEN, searchResults, searchTerms });
    /* not needing geocoding right now
    geocodingClient.forwardGeocode({ 
      query: "california"
    })
    .send()
    .then(response => {
      let match = response.body.features[0];
      console.log(match)
      //transmit earthquakes and the search parameters
      res.render('index', { match, mapKey: process.env.MAPBOX_TOKEN, searchResults, searchTerms })
    })
    .catch(error => toolbox.errorHandler(error));
    */
  })
  .catch(error => toolbox.errorHandler(error));
});

//timeout so heroku doesn't hang on inital page load
setTimeout( () => {
  usgsApiService.getData(usgsApiService.urls.pastHour.all, toolbox.mSec.min);
}, toolbox.mSec.min);

//commented out for heroku
//usgsApiService.getData(usgsApiService.urls.pastHour.all, toolbox.mSec.min);
//usgsApiService.getData(usgsApiService.urls.allTime.all, toolbox.mSec.hour);

// initialize app on port
let port = process.env.PORT || 3000;
app.listen(port, () => {
  rowdyResults.print();
  console.log(chalk.black.bgYellow(` ~~~listening on port: ${port}~~~ `)); 
});