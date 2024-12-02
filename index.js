const express = require("express")
const app = express()
const session = require("express-session")
const redisStore = require("connect-redis")(session)
const redis = require("ioredis")
const fs = require("fs")
const axios = require("axios")
require("dotenv").config()

const database = require("./db.js")
const countryDropdown = require("./countryDropdown.js")

// Read the HTML from file and add in the country dropdown
const html = fs.readFileSync(__dirname + "/views/index.html").toString().replace("{countryDropdown}", countryDropdown)

app.use(express.static(__dirname + "/public"))
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.set("trust proxy", 1)

let redisClient = new redis(process.env.REDIS_URL)
app.use(session({
  store: new redisStore({client: redisClient, prefix: "diary:"}),
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false
}))

// Callback url from SSO
app.get("/sso", (req, res) => {
  let url = new URL("https://auth.alexclifton.co.uk/verifyToken")
  url.searchParams.append("token", req.query.token)
  url.searchParams.append("apikey", process.env.SSO_KEY)
  axios.get(url.href).then(response => {
    if (response.data.error) {
      res.send("<h1>Auth error</h1><br>" + response.data.error)
      return
    }
    req.session.user = {
      id: response.data.id,
      name: response.data.name,
    }
    res.redirect("/")
  })
})

// On all requests, verify user is logged in
app.all("*", (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    res.redirect("https://auth.alexclifton.co.uk/login?app=" + process.env.SSO_APP)
  }
})

app.get("/", (req, res) => {
  res.send(html)
})

// Returns the API key for the map on the stats page
// It is expected that this is publicly available - the key usage is restricted to this page
app.get("/mapsApiKey", (req, res) => {
  res.send(process.env.MAPS_API_KEY)
})

// Send all diary entries
app.get("/diary", (req, res) => {
  // Get the names of all the diaries
  let sql = "Select diaries.diaryid, diaries.name, members.write from members inner join diaries on members.diaryid=diaries.diaryid where members.userid = $1;"
  let db = database.connect()
  
  db.query(sql, [req.session.user.id], (err, data) => {
    if (err) throw err
    
    let result = {}
    result.diaries = data.rows
    
    // Get diary entries from the above diaries
    sql = "SELECT rowid, date, country, place, notes, diary FROM entries WHERE diary = ANY($1) ORDER BY date DESC, country ASC, place ASC"
  
    db.query(sql, [result.diaries.map(x => x.diaryid)], (err, data) => {
      if (err) throw err
      result.entries = data.rows
    
      res.send(result)
      db.end()
    })
  })
})

// Add a new entry
app.post("/new", (req, res) => {
  let date = new Date(req.body.date).getTime()
  
  let sql = "INSERT INTO entries (date, country, place, notes, diary) VALUES ($1, $2, $3, $4, $5)"
  let db = database.connect()
  db.query(sql, [date, req.body.country, req.body.place, req.body.notes, req.body.diary], (err) => {
    if (err) throw err
    res.send("ok")
    db.end()
  })
})

// Edit an entry
app.post("/edit", (req, res) => {
  let entry = req.body
  let date = new Date(entry.date).getTime()
  
  let user = req.session.user
  
  let sql = "UPDATE entries SET date = $1, country = $2, place = $3, notes = $4, diary = $5 WHERE rowid = $6"
  let db = database.connect()
  db.query(sql, [date, entry.country, entry.place, entry.notes, entry.diary, entry.id], (err) => {
    if (err) throw err
    res.send("ok")
    db.end()
  })
})

// Delete an entry
app.post("/delete", (req, res) => {
  let user = req.session.user

  let sql = "DELETE FROM entries WHERE rowid = $1"
  let db = database.connect()
  db.query(sql, [req.body.id], (err) => {
    if (err) throw err
    res.send("ok")
    db.end()
  })
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log("Listening on port " + port)
})
