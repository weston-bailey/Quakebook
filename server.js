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
const methodOverride = require('method-override');
const chalk = require('chalk');
const rowdy = require('rowdy-logger');
const isLoggedIn = require('./middleware/isLoggedIn');
// want to add link to custom middleware
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
app.use(Express.urlencoded({ extended: false }));
app.use(Express.static(__dirname + '/public'));
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

// ROUTES
app.get('/', (req, res) => {
  //check is user is logged in
  res.render('index');
});

app.get('/profile', isLoggedIn, function(req, res){
  res.render('profile');
});

// include auth controller
app.use('/auth', require('./controllers/auth'));

// initialize app on port
let port = process.env.PORT || 3000;
app.listen(port, () => {
  rowdyResults.print();
  console.log(chalk.black.bgGreen(` ~~~listening on port: ${port}~~~ `)); 
});