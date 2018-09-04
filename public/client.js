/* globals axios, dateFormat */

var init = function() {
  let html;
  
  //get data from server
  axios.get("/data").then((response) => {
    let data = response.data
    if (data == "") {
      html = "No records"
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

var remove = function(id) {
  axios.get("/delete?id=" + id).then((response) => {
    init()
  })
}

var test = function(x) {
  alert(x.value)
}

window.onload = init