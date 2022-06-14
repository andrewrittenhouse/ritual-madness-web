var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const publicPath = '/' + (process.env.ritualMadnessWebPublicPath ?? 'public');

console.log('public path', publicPath);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* BEGIN ROUTING */
app.use(publicPath, express.static(path.join(__dirname, 'public')));
app.use('/', (req, res) => res.render('index', { publicPath }));
/* END ROUTING */

// catch 404
app.use((req, res) => {
  res.redirect('/');
});

module.exports = app;
