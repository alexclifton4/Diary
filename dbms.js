const fs = require("fs")
const sqlite = require("sqlite3")
const hash = require("password-hash")

let dbFile

//setup function called from app.use
//returns the middleware function
module.exports = function(file) {
  //store the database file location
  dbFile = file
  
  //return the middleware function
  return dbms
}

let dbms = function(req, res, next) {
  //only do something for paths /dbms/*
  if (req.path.split("/")[1] != "dbms") {
    next()
  } else {
    //swap a password for the token
    if (req.path == "/dbms/auth") {
      if (hash.verify(req.body.password, process.env.PASSWORD)) {
        res.send({success: true, token: process.env.TOKEN})
      } else {
        res.send({success: false})
      }
    }
    
    //if token is not sent, or root is requested, send dbms html file
    else if (req.path == "/dbms" || req.header("x-dbms-token") != process.env.TOKEN) {
      res.send(fs.readFileSync(__dirname + "/views/dbms.html", "utf8"))
      console.log("Invalid token - " + req.header("x-"))
    }
    
    else {
      //token is valid, so continue with routing
      //declare db and sql here to make lint happy
      let db, sql
      //do something depending on path
      switch(req.path){
        case "/dbms/allTables":
          //send all table names
          db = new sqlite.Database(dbFile)
          sql = "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
          db.all(sql, [], (err, data) => {
            if (err) throw err
            res.send(data)
          })
          db.close()
          break;
        case "/dbms/table":
          //send contents of the table
          db = new sqlite.Database(dbFile)
          sql = "SELECT rowid, * FROM " + req.query.table
          db.all(sql, [], (err, data) => {
            if (err) throw err
            res.send(data)
          })
          db.close()
          break;
        case "/dbms/new":
          //create an empty record
          db = new sqlite.Database(dbFile)
          sql = "INSERT INTO " + req.body.table + " DEFAULT VALUES"
          db.run(sql, [], (err, data) => {
            if (err) throw err;
            //get id of new record
            sql = "SELECT last_insert_rowid() as id"
            db.get(sql, [], (err, data) => {
              if (err) throw err
              res.send(data.id.toString())
            })
          })
          db.close()
          break;
        case "/dbms/delete":
          //delete an entry
          db = new sqlite.Database(dbFile)
          sql = "DELETE FROM " + req.body.table + " WHERE rowid = ?"
          db.run(sql, [req.body.id], (err, data) => {
            if (err) res.send(err)
            else res.send("ok")
          })
          db.close()
          break;
        case "/dbms/edit":
          //edit an entry
          db = new sqlite.Database(dbFile)
          sql = "UPDATE " + req.body.table + " SET " + req.body.field + " = ? WHERE rowid = ?"
          db.run(sql, [req.body.value, req.body.id], (err, data) => {
            if (err) res.send(err)
            else res.send("ok")
          })
          break;
      }
    }
  }
}