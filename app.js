const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const formatUrl = (resource) => resource.replace(/[^a-z0-9]/gi, '_').toLowerCase();

const createAlbum = (albumName, songNames) => ({ 
  albumName,
  albumSlug: `/${formatUrl(albumName)}`,
  songs: songNames.map(songName => ({ 
    url: `/public/songs/${formatUrl(albumName)}/${formatUrl(songName)}.mp3`,
    metadata: {
      title: songName,
      artist: "Ritual Madness",
      album: albumName
    }
  }))
});

const albums = [
  createAlbum("Ritual Madness", [
    "Mad Scientist",
    "Summer Sun",
    "Black Magic Baby",
    "Paradise",
    "New Machine",
    "Apocalypse Kid",
    "Electric Samurai",
    "Killing Evil Spirits",
    "Felt Like Riffin'",
    "Space Funk",
    "Time Travellin' Space Alien"
  ]),
  createAlbum("Unplugged Cyborg", [
    "Count on You",
    "Down Low",
    "Feels So Good to Me",
    "Wait and See",
    "Satellite"
  ]),
  createAlbum("Winter Warmer", [
    "Jolly",
    "Winter Blues",
    "Winter Night"
  ])
];

const albumData = JSON.stringify(albums);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* BEGIN ROUTING */
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/', (req, res) => res.render('index', { albumData }));
/* END ROUTING */

// catch 404
app.use((req, res) => {
  res.redirect('/');
});

module.exports = app;
