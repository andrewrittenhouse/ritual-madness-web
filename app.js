const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const publicPath = `/${process.env.ritualMadnessWebPublicPath ?? 'public'}`;

const getFilename = (title) => title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

const songs = [
  ["Cyborg", [
    "Electric Samurai",
    "Time Travelling Space Alien"
  ]],
  ["Winter Warmer", [
    "Jolly",
    "Winter Night",
    "Winter Blues"
  ]],
  ["Unplugged Cyborg Demo", [
    "Count on You",
    "Down Low"
  ]],
  ["Bad Recordings", [
    "Mad Scientist",
    "Summer Sun",
    "Black Magic Baby",
    "Paradise",
    "Apocalypse Kid",
    "New Machine"
  ]]
].reduce((songs, [albumName, songNames]) => songs.concat(songNames.map(songName => ({ albumName, songName, url: `${publicPath}/songs/${getFilename(albumName)}/${getFilename(songName)}.mp3` }))), [])

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* BEGIN ROUTING */
app.use(publicPath, express.static(path.join(__dirname, 'public')));
app.use('/', (req, res) => res.render('index', { 
  songs: JSON.stringify(songs), 
  publicPath 
}));
/* END ROUTING */

// catch 404
app.use((req, res) => {
  res.redirect('/');
});

module.exports = app;
