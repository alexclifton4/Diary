let diaryEntries;
let saveMode;
let currentId;
let filters = {}
filters.year = []
filters.month = []
filters.country = []
filters.search = ""

// Show all entries
window.loadDiary = function() {
  // Switch to loading page
  switchToView("loading")
  
  // Get the data from the server
  axios.get("/diary").then((response) => {
    diaryEntries = response.data
    populateDiary()
    switchToView("diary")
  })
  
  // Get values for the filters
  axios.get("/filterValues").then((response) => {
    // Add filter for years
    let yearFilter = document.getElementById("yearFilter")
    response.data.year.forEach((year) => {
      let option = document.createElement("option")
      option.text = year
      option.value = year
      yearFilter.add(option)
    })
  })
}

// Populates the diary with data
// Doesn't fetch it from the server
let populateDiary = function() {
    // Construct the table
    let html = ""
    // Loop through responses
    diaryEntries.forEach((entry) => {
      // Make sure its not filtered out
      // Year
      let date = new Date(parseInt(entry.date))
      let year = date.getFullYear().toString()
      if (filters.year.length != 0 && !filters.year.includes(year)) {
        return
      }
      // Month
      let month = date.getMonth().toString()
      if (filters.month.length != 0 && !filters.month.includes(month)) {
        return
      }
      
      // Search
      let countrySearch = entry.country.toLowerCase().indexOf(filters.search) == -1
      let placeSearch = entry.place.toLowerCase().indexOf(filters.search) == -1
      let notesSearch = entry.notes.toLowerCase().indexOf(filters.search) == -1
      if (filters.search != "" && countrySearch && placeSearch && notesSearch) {
        return
      }
      
      // Generate the HTML
      html += `<tr onclick="showEntry(${entry.rowid})">`
      html += `<td>${dateFormat(parseInt(entry.date), "dS mmm. yyyy")}</td>`
      html += `<td>${entry.country}</td>`
      html += `<td>${entry.place}</td>`
    html += `<td><div class="notes">${entry.notes}</div></td>`
      html += `</tr>`
    })
    
    // Show the content
    document.getElementById("diaryBody").innerHTML = html
}

// Returns to the diary view without reloading it
window.showDiary = function() {
  switchToView("diary")
}

// Show a single entry
window.showEntry = function(id) {
  switchToView("loading")
  
  axios.get("/entry?id=" + id).then((response) => {
    document.getElementById("editDate").value = new Date(parseInt(response.data.date)).toJSON().slice(0,10);
    document.getElementById("editCountry").value = response.data.country
    document.getElementById("editPlace").value = response.data.place
    document.getElementById("editNotes").value = response.data.notes
    
    saveMode = "edit"
    currentId = id
    
    // Show the entry view with the delete button
    document.getElementById("btnDelete").style.display = ""
    switchToView("entry")
  })
}

// Show the new view
window.showNewView = function() {
  // Clear the new form
  document.getElementById("editDate").value = ""
  //document.getElementById("editCountry").value = ""
  document.getElementById("editPlace").value = ""
  document.getElementById("editNotes").value = ""
  
  saveMode = "new"
  
  // Show the view without the delete button
  document.getElementById("btnDelete").style.display = "none"
  switchToView("entry")
}

// Year filter changed
window.yearChanged = function(select) {
  // Get the selected years
  selected = Array.prototype.filter.apply(select.options,[function(o) {return o.selected}]).map((x) => x.value)
  filters.year = selected
  populateDiary()
}

// Month filter changed
window.monthChanged = function(select) {
  // Get the selected years
  selected = Array.prototype.filter.apply(select.options,[function(o) {return o.selected}]).map((x) => x.value)
  filters.month = selected
  populateDiary()
}

// Search field changed
window.searchChanged = function(search) {
  filters.search = search.value.toLowerCase()
  populateDiary()
}

// Clear all filters
window.clearFilters = function() {
  document.getElementById("yearFilter").value = ""
  document.getElementById("monthFilter").value = ""
  document.getElementById("search").value = ""
  filters.year = []
  filters.month = []
  filters.country = []
  filters.search = ""
  
  populateDiary()
}

// Callback save button
window.save = function() {
  // Get details from form
  let date = document.getElementById("editDate").value
  let country = document.getElementById("editCountry").value
  let place = document.getElementById("editPlace").value
  let notes = document.getElementById("editNotes").value
  // Either update a record or create a new one
  if (saveMode == "edit") {
    editEntry(date, country, place, notes)
  } else {
    newEntry(date, country, place, notes)
  }
}

// Save edits
let editEntry = function(date, country, place, notes) {
  // Send to server
  axios.post("/edit", {id: currentId, date: date, country: country, place: place, notes: notes}).then((response) => {
    // Reload the diary
    window.loadDiary()
  })
}

// Save a new entry
let newEntry = function(date, country, place, notes) {
  // Send to server
  axios.post("/new", {date: date, country: country, place: place, notes: notes}).then((response) => {
    // Reload the diary
    window.loadDiary()
  })
}

// Callback delete button
window.deleteEntry = function() {
  // Confirm with the user
  if (confirm("Are you sure?")) {
    axios.post("/delete", {id: currentId}).then((response) => {
      // Reload the diary
      window.loadDiary()
    })
  }
}

let switchToView = function(view) {
  // Hide all the views
  document.getElementById("loading").style.display = "none"
  document.getElementById("diary").style.display = "none"
  document.getElementById("entry").style.display = "none"
  
  // Show the correct view
  document.getElementById(view).style.display = "block"
}