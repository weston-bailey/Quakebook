// required npm libs
require('dotenv').config();
const Express = require('express');
const ejsLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('./config/ppConfig');
const db = require('./models');
const isLoggedIn = require('./middleware/isLoggedIn');
// want to add link to custom middleware
const SequelizeStore = require('connect-session-sequelize')(session.Store);

// app setup and middlewares
const app = Express();
app.use(Express.urlencoded({ extended: false }));
app.use(Express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.use(require('morgan')('dev'));
app.use(helmet());

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
app.listen(port, () => {console.log(`listening on port ${port}`) });