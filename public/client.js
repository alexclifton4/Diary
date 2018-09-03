/* globals axios */

var init = function() {
  //create top of table
  let html = "<table><tr><th>id</th><th>Date</th><th>Country</th><th>Place</th><th>Notes</th></tr>"
  
  //get data from server
  axios.get("/data").then((response) => {
    let data = response.data
    for (let i in data) {
      let x = data[i]
      let y = new Date(x.date)
      let z = `y.getDate()`
      html += `<tr><td>${x.id}</td><td>${z}</td><td>${x.country}</td><td>${x.place}</td><td>${x.notes}</td></tr>`
    }
    
    //update page
    document.getElementById('table').innerHTML = html + "</table>"
  })
}

window.onload = init