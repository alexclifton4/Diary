// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var sqlite = require('sqlite3')
require('./db.js')()

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}))

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/new', function(request, response) {
  response.sendFile(__dirname + '/views/new.html');
})

app.post('/new', function(request, response) {
  //get data
  let date = request.body.date
  let country = request.body.country
  let place = request.body.place
  let notes = request.body.notes
  
  let x = new Date(date).getValue()
  console.log(x)
  console.log(new Date(x))
  
  response.redirect('/')
})

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
