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
const uploads = multer({ dest: './uploads' }); //todo factor in upload route
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
  let search = parseInt(req.query.mag)
  //array of search results
  let searchResults = [];
  //handle blank searches
  if(!search){
    search = 3;
  }
  //
  db.earthquake.findAll()
  .then(earthquakes => {
    earthquakes.forEach( earthquake => {
      //check search method against db
      let searchTest = earthquake.searchMagGreaterThan(search);
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
      console.log(matchString);
      //transmit earthquakes and the search parameters
      res.render('index', { match, mapKey: process.env.MAPBOX_TOKEN, searchResults, search, matchString })
    })
    .catch(error => toolbox.errorHandler(error));
  })
  .catch(error => toolbox.errorHandler(error));
});

//will be deprecated
app.get('/profile', isLoggedIn, function(req, res){
  res.render('profile');
});

function getData(){
  let timeoutUsgsQuery;
  axios.get(usgsUrls.pastHour.all)
    .then(function (response) {
      //check database for features
    })
    .catch(function (error) {
      // handle error from axios
      toolbox.errorHandler(error);
    })
    .finally(function () {
      //callback a another query
      timeoutUsgsQuery = setTimeout(getData, 1000);
    });
}
//uncomment to start api calls
//getData();

// initialize app on port
let port = process.env.PORT || 3000;
app.listen(port, () => {
  rowdyResults.print();
  console.log(chalk.black.bgGreen(` ~~~listening on port: ${port}~~~ `)); 
});