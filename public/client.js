/* globals axios, dateFormat */
var view = "/data"
var diary = window.location.hash.substr(1)

var init = function() {
  document.getElementById('addAnchor').href = '/new#' + diary
  document.title = diary
  document.getElementById('title').innerHTML = diary
  getData("/data?")
}

//gets all data
var getData = function(path) {
  view = path
  let html;
  
  //get data from server
  axios.get(path + "&diary=" + diary).then((response) => {
    let data = response.data
    if (data == "") {
      html = "No results"
    } else {
      //create top of table
      html = "<table><tr><th>Date</th><th>Country</th><th>Place</th><th>Notes</th><th>Edit</th><th>Delete</th></tr>"
  
      for (let i in data) {
        let x = data[i]
        let date = dateFormat(x.date, "dS mmm. yyyy")
        let buttons = `<div class="row"><button class="button col button-fill button-small" onclick="edit(${x.id})"><i class="material-icons">edit</i></button></td>`
        buttons += `<td><button class="button col button-fill button-small" onclick="remove(${x.id})"><i class="material-icons">delete</i></button></div>`
        let notes = x.notes.replace(/\r\n/g, "<br>")
        html += `<tr><td>${date}</td><td>${x.country}</td><td>${x.place}</td><td>${notes}</td><td>${buttons}</td></tr>`
      }
    }
    
    //update page
    document.getElementById('table').innerHTML = html + "</table>"
  })
}

//deletes this entire diary
var deleteDiary = function(name) {
  if (confirm("Are you sure?\nThis will delete the diary and all its data")){
    axios.get('/deleteDiary?name=' + diary).then((response) => {
      window.location = "/"
    })
  }
}

//deletes a record
var remove = function(id) {
  //confirm
  if (confirm("Are you sure?")) {
    axios.get("/delete?id=" + id + "&diary=" + diary).then((response) => {
      getData(view)
    })
  }
  
  // Valid countries list is now out of date
  window.countriesAreValid = false
}

//edits a record
var edit = function(id) {
  window.location = "/edit#" + id + "." + diary
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

//search for a place
var searchPlace = function() {
  let place = document.getElementById('place').value
  getData("/search?place=" + place)
}

// Normal search
var normalSearch = function() {
  let field = document.getElementById("searchField")
  
  if (field.value == "country") {
    getData("/search?country=" + document.getElementById('country').value)
  } else {
    getData("/search?place=" + document.getElementById("searchText").value)
  }
  
  // Reset the form
  field.value = "other"
  searchFieldChanged(field)
  document.getElementById("searchText").value = ""
}

// Search field changed
var searchFieldChanged = function(el) {
  //change to the correct search input
  if (el.value == "other") {
    // change to text input
    document.getElementById("searchInput").innerHTML = `<input type="text" id="searchText">`
  } else {
    // change to country input
    document.getElementById("searchInput").innerHTML = `<div id="country"></div>`
    window.fillCountryDropdownValid()
  }
}

window.onload = init