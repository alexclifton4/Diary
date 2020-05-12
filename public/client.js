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

// Normal search
var normalSearch = function() {
  let field = document.getElementById("searchField")
  
  if (field.value == "country") {
    getData("/search?country=" + document.getElementById('country').value)
  } else {
    getData("/search?place=" + document.getElementById("searchText").value)
  }
  
  resetSearchForm()
}

// Date search
var dateSearch = function() {
  let field = document.getElementById("searchFieldDate")
  
  if (field.value == "year") {
    let year = document.getElementById("searchYear").value;
    // Get the start and end of the year
    // Plus / minus one is hack because the server uses < and > rather than <= and >=
    let start = new Date(year, 0, 1).getTime() - 1
    let end = new Date(year, 11, 31).getTime() + 1
    getData(`/dates?from=${start}&to=${end}`)
  } else {
    let year = document.getElementById("searchYear").value;
    let month = document.getElementById("searchMonth").value;
    // Get the start and end of the month
    // JS uses 0 based month indexes, so minus one
    let start = new Date(year, month - 1, 1).getTime() - 1;
    let end = new Date(year, month, 1).getTime();
    getData(`/dates?from=${start}&to=${end}`)
  }
  
  resetSearchForm()
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

// Search field changed for date
var searchFieldChangedDate = function(el) {
  //change to the correct search input
  if (el.value == "year") {
    // Remove month field
    document.getElementById("monthWrapper").innerHTML = "";
  } else {
    // Create the month element
    let month = document.getElementById("monthWrapper")
    month.innerHTML = `<li class="item-content item-input">
                       <div class="item-media">Month</div>
                        <div class="item-inner">
                          <div class="item-input-wrap">
                            <select id="searchMonth">
                                <option value="1">January</option>
                                <option value="2">February</option>
                                <option value="3">March</option>
                                <option value="4">April</option>
                                <option value="5">May</option>
                                <option value="6">June</option>
                                <option value="7">July</option>
                                <option value="8">August</option>
                                <option value="9">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                            </select>
                          </div>
                        </div>
                        </li>`
  }
}

var resetSearchForm = function() {
  // Normal search
  let field = document.getElementById("searchField")
  field.value = "other"
  searchFieldChanged(field)
  document.getElementById("searchText").value = ""
  
  // Date search
  field = document.getElementById("searchFieldDate")
  field.value = "year"
  searchFieldChangedDate(field)
  document.getElementById("searchYear").value = ""
}

window.onload = init