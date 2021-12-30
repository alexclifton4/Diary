const express = require("express")
const app = express()
const session = require("express-session")
const redisStore = require("connect-redis")(session)
const redis = require("ioredis")
const fs = require("fs")
const axios = require("axios")

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
  store: new redisStore({client: redisClient}),
  secret: "something random",
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
      admin: response.data.admin == "true"
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

// Send all diary entries
app.get("/diary", (req, res) => {
  let sql = "SELECT rowid, date, country, place, notes FROM entries WHERE public = true OR owner = $1 ORDER BY date DESC, country ASC, place ASC"
  let db = database.connect()
  db.query(sql, [req.session.user.id],(err, data) => {
    if (err) throw err
    res.send(data.rows)
    db.end()
  })
})

// Send a single entry
app.get("/entry", (req, res) => {
  let sql = "SELECT date, country, place, public, notes, owner FROM entries WHERE rowid = $1 AND (public = true OR owner = $2)"
  let db = database.connect()
  db.query(sql, [req.query.id, req.session.user.id], (err, data) => {
    if (err) throw err
    
    let entry = data.rows[0]
    // Work out if the user can edit this entry
    entry.canEdit = (req.session.user.id == entry.owner) || req.session.user.admin
    res.send(entry)
    db.end()
  })
})

// Add a new entry
app.post("/new", (req, res) => {
  let date = new Date(req.body.date).getTime()
  
  let sql = "INSERT INTO entries (date, country, place, public, notes, owner) VALUES ($1, $2, $3, $4, $5, $6)"
  let db = database.connect()
  db.query(sql, [date, req.body.country, req.body.place, req.body.public, req.body.notes, req.session.user.id], (err) => {
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
  
  let sql = "UPDATE entries SET date = $1, country = $2, place = $3, notes = $4, public = $5 WHERE rowid = $6 AND (owner = $7 OR $8)"
  let db = database.connect()
  db.query(sql, [date, entry.country, entry.place, entry.notes, entry.public, entry.id, user.id, user.admin], (err) => {
    if (err) throw err
    res.send("ok")
    db.end()
  })
})


// Delete an entry
app.post("/delete", (req, res) => {
  let user = req.session.user

  let sql = "DELETE FROM entries WHERE rowid = $1 AND (owner = $2 OR $3)"
  let db = database.connect()
  db.query(sql, [req.body.id, user.id, user.admin], (err) => {
    if (err) throw err
    res.send("ok")
    db.end()
  })
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log("Listening on port " + port)
})
