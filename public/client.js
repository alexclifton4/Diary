/* globals axios, dateFormat */

var init = function() {
  //create top of table
  let html = "<table><tr><th>id</th><th>Date</th><th>Country</th><th>Place</th><th>Notes</th></tr>"
  
  //get data from server
  axios.get("/data").then((response) => {
    let data = response.data
    for (let i in data) {
      let x = data[i]
      let y = dateFormat(x.date, "dS mmmm yyyy")
      html += `<tr><td>${x.id}</td><td>${y}</td><td>${x.country}</td><td>${x.place}</td><td>${x.notes}</td></tr>`
    }
    
    //update page
    document.getElementById('table').innerHTML = html + "</table>"
  })
}

window.onload = init