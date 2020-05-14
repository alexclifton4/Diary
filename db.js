const { Client } = require('pg');

exports.connect = function(){
  let client = new Client({
  connectionString: "postgres://wvbdtrwkaodouy:67a2327ace4c1a33285fc60864df3d3590d484def8a39446b1f3a67a24eafa29@ec2-54-75-244-161.eu-west-1.compute.amazonaws.com:5432/d7sh93rseopa3k",
  ssl: {
    rejectUnauthorized: false
  }
});  
  
  client.connect()
  return client;
}