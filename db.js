const { Client } = require('pg');

exports.connect = function(){
  let client = new Client({
     connectionString: process.env.DATABASE_URL,
     ssl: true
  });  
  client.connect()
  return client;
}