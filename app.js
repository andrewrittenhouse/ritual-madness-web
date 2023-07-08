const express = require('express');
const path = require('path');
const logger = require('morgan');
const { BlockBlobClient } = require('@azure/storage-blob');
const { v4: uuid } = require('uuid');

function errorHandler(err, req, res, next) {
  if (err instanceof SyntaxError) {
    res.sendStatus(400);

    return;
  }

  next();
}

const app = express();

const config = process.env.NODE_ENV === 'production' ? {
  storageConnectionString: process.env.STORAGE_CONNECTION_STRING
} : require('./local-config.json');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

/* BEGIN ROUTING */

app.use('/favicon.ico', express.static('public/favicon.ico'));

app.post('/message', express.json(), errorHandler, async (req, res) => {
  if (!req.body || !req.body.message || req.body.message.length > 2000 || !req.body.hasOwnProperty('contactMethod') || req.body.contactMethod.length > 500 || Object.keys(req.body).some(prop => !['message', 'contactMethod'].includes(prop))) {
    res.sendStatus(400);

    return;
  }

  const blobServiceClient = new BlockBlobClient(config.storageConnectionString, 'messages', uuid() + '.json');

  const blobContents = JSON.stringify(req.body);

  await blobServiceClient.upload(blobContents, blobContents.length);

  res.sendStatus(200);
});

app.get('/robots.txt', (req, res) => {
  res.sendFile(__dirname + '/public/robots.txt');
})

app.get('/video.mp4', async (req, res) => {
  const blobServiceClient = new BlockBlobClient(config.storageConnectionString, 'public-media', 'dead radio.mp4');

  const response = await blobServiceClient.download(0);

  res.setHeader('Content-Type', response.contentType);

  const stream = response.readableStreamBody
  
  stream.pipe(res);

  stream.on('end', () => {
    res.end();
  });
});

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  res.render('index')
});
/* END ROUTING */

// catch 404
app.use((req, res) => {
  res.redirect('/');
});

module.exports = app;
