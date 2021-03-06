var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// New stuff to add
//---------------------------------------------------
const hbs = require('hbs');
const MongoClient = require('mongodb').MongoClient;
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const authUtils = require('./utils/auth');
const session = require('express-session');
const flash = require('connect-flash');
const fileupload = require('express-fileupload');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
// --------------------------------------------------

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
// var profilesRouter = require('./routes/profiles');

// Add new routes
// --------------------------------------------------
const authRouter = require('./routes/auth');
// upload file path
const FILE_PATH = 'uploads';
// --------------------------------------------------

var app = express();

// Connect to db
// --------------------------------------------------
MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost', { useNewUrlParser: true }, (err, client) => {
  if (err) {
    throw err;
  }
//   ?authSource=admin
//   const db = client.db('lscn-db');

  const db = client.db('heroku_c2wdfmns');
  const users = db.collection('users');
  const profiles = db.collection('profiles');
  app.locals.users = users;
  app.locals.profiles = profiles;
});
// --------------------------------------------------


// Configure passport
// --------------------------------------------------
passport.use(new Strategy(
  (username, password, done) => {
    app.locals.users.findOne({ username }, (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false);
      }

      if (user.password != authUtils.hashPassword(password)) {
        return done(null, false);
      }

      return done(null, user);
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  done(null, { id });
});
// --------------------------------------------------

// configure multer
const upload = multer({
    dest: `${FILE_PATH}/`
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Set partials for handlebars
// --------------------------------------------------
hbs.registerPartials(path.join(__dirname, 'views/partials'));
// --------------------------------------------------

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileupload({
    useTempFiles:true,
    tempFileDir: '/tmp/'
}));
// enable CORS
app.use(cors());
// add other middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));


// Configure session, passport, flash
// --------------------------------------------------
app.use(session({
  secret: 'session secret',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
  res.locals.loggedIn = req.isAuthenticated();
  next();
});
// --------------------------------------------------

app.use('/', indexRouter);
app.use('/users', usersRouter);
// app.use('/profiles', profilesRouter);

// Add new routes
// --------------------------------------------------
app.use('/auth', authRouter);
// --------------------------------------------------

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
