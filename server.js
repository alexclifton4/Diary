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
  let date = new Date(request.body.date).getTime()
  let country = request.body.country
  let place = request.body.place
  let notes = request.body.notes
  let diary = request.body.diary
  
  //make sure fields aren't blank
  if (!(date == "" || country == "" || place == "")) {
    //insert into db
    let sql = `INSERT INTO ${diary} (date, country, place, notes) VALUES ("${date}", "${country}", "${place}", "${notes}");`
    let db = new sqlite.Database('./.data/diary.db')
    db.run(sql, [], (err) => {if (err) throw err});
    db.close()
  }
  
  response.redirect('/')
})

app.get('/edit', function(request, response) {
  response.sendFile(__dirname + '/views/edit.html');
})

app.post('/edit', function(request, response) {
  //get data
  let date = new Date(request.body.date).getTime()
  let country = request.body.country
  let place = request.body.place
  let notes = request.body.notes
  let id = request.body.id
  let diary = request.body.diary
  
  //make sure fields aren't blank
  if (!(date == "" || country == "" || place == "")) {
    //insert into db
    let sql = `UPDATE ${diary} SET date="${date}", country="${country}", place="${place}", notes="${notes}" WHERE rowid="${id}";`
    let db = new sqlite.Database('./.data/diary.db')
    db.run(sql, [], (err) => {if (err) throw err});
    db.close()
  }
  
  response.redirect('/')
})

app.get('/data', function(request, response) {
  let diary = request.query.diary
  //get data from db
  let sql = `SELECT rowid AS id, date, country, place, notes FROM ${diary} ORDER BY date DESC, country ASC, place ASC`
  let db = new sqlite.Database('./.data/diary.db')
  db.all(sql, [], (err, data) => {
    if (err) throw err;
    response.send(data)
  })
db.close()
})

app.get('/single', function(request, response) {
  let id = request.query.id
  let diary = request.query.diary
  //get data from db
  let sql = `SELECT rowid AS id, date, country, place, notes FROM ${diary} WHERE rowid="${id}";`
  let db = new sqlite.Database('./.data/diary.db')
  db.get(sql, [], (err, data) => {
    if (err) throw err;
    response.send(data)
  })
db.close()
})

app.get('/dates', function(request, response) {
  //get dates
  let from = request.query.from
  let to = request.query.to
  let diary = request.query.diary
  
  //get data from db
  let sql = `SELECT rowid AS id, date, country, place, notes FROM ${diary} WHERE date>${from} AND date<${to} ORDER BY date DESC, country ASC, place ASC`
  let db = new sqlite.Database('./.data/diary.db')
  db.all(sql, [], (err, data) => {
    if (err) throw err;
    response.send(data)
  })
db.close()
})

app.get('/search', function(request, response) {
  //get search term
  let country = request.query.country
  let place = request.query.place
  let diary = request.query.diary
  let search
  if (country) {
    search = ' WHERE country LIKE "' + country + '"'
  } else {
    search = ' WHERE place LIKE "%' + place + '%" OR notes LIKE "%' + place + '%"'
  }
  
  //get data from db
  let sql = "SELECT rowid AS id, date, country, place, notes FROM " + diary + search + " ORDER BY date DESC, country ASC, place ASC"
  let db = new sqlite.Database('./.data/diary.db')
  db.all(sql, [], (err, data) => {
    if (err) throw err;
    response.send(data)
  })
db.close()
})

app.get('/delete', function(request, response) {
  let sql = `DELETE FROM ${request.query.diary} WHERE rowid=${request.query.id}`
  let db = new sqlite.Database('./.data/diary.db')
  db.run(sql, [], (err) => {if (err) throw err});
  
  response.redirect('/')
})

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
