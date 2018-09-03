/* globals axios, dateFormat */

var init = function() {
  //create top of table
  let html = "<table><tr><th>Date</th><th>Country</th><th>Place</th><th>Notes</th><th>Delete</th></tr>"
  
  //get data from server
  axios.get("/data").then((response) => {
    let data = response.data
    alert(data)
    for (let i in data) {
      let x = data[i]
      let y = dateFormat(x.date, "dS mmm. yyyy")
      html += `<tr><td>${y}</td><td>${x.country}</td><td>${x.place}</td><td>${x.notes}</td><td><a href="/delete?id=${x.id}">X</a></td></tr>`
    }
    
    //update page
    document.getElementById('table').innerHTML = html + "</table>"
  })
}

window.onload = init