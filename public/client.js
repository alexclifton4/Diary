/* globals axios, dateFormat */
var view = "/data"

var init = function() {
  getData("/data")
}

//gets all data
var getData = function(path) {
  view = path
  let html;
  
  //get data from server
  axios.get(path).then((response) => {
    let data = response.data
    if (data == "") {
      html = "No results"
    } else {
      //create top of table
      html = "<table><tr><th>Date</th><th>Country</th><th>Place</th><th>Notes</th><th>Delete</th></tr>"
  
      for (let i in data) {
        let x = data[i]
        let y = dateFormat(x.date, "dS mmm. yyyy")
        let z = `<button onclick="remove(${x.id})">X</button>`
        html += `<tr><td>${y}</td><td>${x.country}</td><td>${x.place}</td><td>${x.notes}</td><td>${z}</td></tr>`
      }
    }
    
    //update page
    document.getElementById('table').innerHTML = html + "</table>"
  })
}

//deletes a record
var remove = function(id) {
  axios.get("/delete?id=" + id).then((response) => {
    getData(view)
  })
}

//show records between dates
var viewDates = function() {
  //get dates
  let from = new Date(document.getElementById('fromDate').value).getTime()
  let to = new Date(document.getElementById('toDate').value).getTime()
  getData("/dates?from=" + from + "&to=" + to)
}

//search for a country
var searchCountry = function() {
  let country = document.getElementById('country').value
  getData("/search?country=" + country)
}

window.onload = init