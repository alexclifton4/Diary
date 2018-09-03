const sqlite = require('sqlite3')
const fs = require('fs')

module.exports = function(){
  //to reset, delete db file
  //fs.unlinkSync(__dirname + "/.data/diary.db")
  
  //see if table exists
  let db = new sqlite.Database('./.data/diary.db')
  
  //See if DB exists
  let sql = "SELECT count(*) as 'count' FROM sqlite_master WHERE type='table'"
  db.get(sql, [], (err, result) => {
    if (err) throw err;
    if (result['count'] == 0) {
      //Doesn't exist - create table
      let sql = "CREATE TABLE places ();";
      db.run(sql, [], (err) => {if (err) throw err});
      console.log("Table created")
    }
  });
  db.close();
}