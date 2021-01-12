const express = require("express")
const app = express()
const redirectToHTTPS = require("express-http-to-https").redirectToHTTPS
const cookieParser = require("cookie-parser")
const hash = require("password-hash")
const fs = require("fs")

const database = require("./db.js")
const countryDropdown = require("./countryDropdown.js")

// Read the HTML from file and add in the country dropdown
const html = fs.readFileSync(__dirname + "/views/index.html").toString().replace("{countryDropdown}", countryDropdown)

app.use(express.static(__dirname + "/public"))
app.use(express.json())
app.use(redirectToHTTPS([/localhost:8080/]))
app.use(cookieParser())

app.post('/login', (req, res) => {
  // Check the password
  if (hash.verify(req.body.password, process.env.PASSWORD)) {
    res.cookie("token", process.env.ACCESS_TOKEN, {maxAge: 2147483647})
    res.redirect("/")
  } else {
    res.send("Incorrect Password")
  }
})

app.all('*', (req, res, next) => {
  // Check if token is valid
  if (req.cookies.token == process.env.ACCESS_TOKEN) {
    next()
  } else {
    res.sendFile(__dirname + "/views/login.html")
  }
})

app.get("/", (req, res) => {
  res.send(html)
})

// Send all diary entries
app.get("/diary", (req, res) => {
  let sql = "SELECT rowid, date, country, place, notes FROM entries ORDER BY date DESC, country ASC, place ASC"
  let db = database.connect()
  db.query(sql, (err, data) => {
    if (err) throw err
    res.send(data.rows)
    db.end()
  })
})

// Send a single entry
app.get("/entry", (req, res) => {
  let sql = "SELECT date, country, place, notes FROM entries WHERE rowid = $1"
  let db = database.connect()
  db.query(sql, [req.query.id], (err, data) => {
    if (err) throw err
    res.send(data.rows[0])
    db.end()
  })
})

// Send unique values for filters
app.get("/filterValues", (req, res) => {
  let db = database.connect()
  
  let sql1 = "SELECT DISTINCT country FROM entries"
  let sql2 = "SELECT DISTINCT EXTRACT(year FROM to_timestamp( CAST( date AS bigint ) / 1000 )) AS year FROM entries ORDER BY year;"
  let query1 = db.query(sql1)
  let query2 = db.query(sql2)
  
  // Wait for all queries to complete
  Promise.all([query1, query2]).then((results) => {
    let filters = {}
    filters.country = results[0].rows.map(x => x.country)
    filters.year = results[1].rows.map(x => x.year)
    
    res.send(filters)
    db.end()
  }).catch((err) => {
    console.error(err)
  })
})

// Add a new entry
app.post("/new", (req, res) => {
  let date = new Date(req.body.date).getTime()
  
  let sql = "INSERT INTO entries (date, country, place, notes) VALUES ($1, $2, $3, $4)"
  let db = database.connect()
  db.query(sql, [date, req.body.country, req.body.place, req.body.notes], (err) => {
    if (err) throw err
    res.send("ok")
    db.end()
  })
})

// Edit an entry
app.post("/edit", (req, res) => {
  let date = new Date(req.body.date).getTime()
  
  let sql = "UPDATE entries SET date = $1, country = $2, place = $3, notes = $4 WHERE rowid = $5"
  let db = database.connect()
  db.query(sql, [date, req.body.country, req.body.place, req.body.notes, req.body.id], (err) => {
    if (err) throw err
    res.send("ok")
    db.end()
  })
})


// Delete an entry
app.post("/delete", (req, res) => {
  let sql = "DELETE FROM entries WHERE rowid = $1"
  let db = database.connect()
  db.query(sql, [req.body.id], (err) => {
    if (err) throw err
    res.send("ok")
    db.end()
  })
})

const port = process.env.port || 8080
app.listen(port, () => {
  console.log("Listening on port " + port)
})