let diaryEntries;
let saveMode;
let currentId;
let filters = {}
filters.year = "all"
filters.month = "all"
filters.search = ""
let statChart;

const MAX_ENTRIES = 100

// Show all entries
window.loadDiary = function(openNewView) {
  // Switch to loading page
  switchToView("loading")
  window.statsLoaded = false
  
  // Get the data from the server
  axios.get("/diary").then((response) => {
    diaryEntries = response.data
    populateDiary()
    if (openNewView) {
      showNewView(true)
    } else {
      switchToView("diary")
    }
  })
}

// Populates the diary with data
// Doesn't fetch it from the server
let populateDiary = function() {
    // Construct the table
    let html = ""
    let entriesAdded = 0
    let years = {}
    
    // Loop through responses
    diaryEntries.forEach((entry) => {
      let date = new Date(parseInt(entry.date))
      let year = date.getFullYear().toString()
      
      // Store the year for filter values
      years[year] = true

      // Only carry on if the max no. of rows hasn't been reached
      // Still continue the loop to fill filter values, just don't render anything
      if (entriesAdded >= MAX_ENTRIES) {
        return
      }
      
      // Make sure its not filtered out
      // Year
      if (filters.year != "all" && filters.year != year) {
        return
      }
      // Month
      let month = date.getMonth().toString()
      if (filters.month != "all" && filters.month != month) {
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
      
      // Limit the number of entries added
      entriesAdded++
      if (entriesAdded >= MAX_ENTRIES) {
        // Add a message
        html += `<tr><td colspan="4"><i>Only the first ${MAX_ENTRIES} entries have been displayed.</i></td></tr>`
      }
      return
    })
    
    // Show the content
    document.getElementById("diaryBody").innerHTML = html
    
    // Add filter values
    // First 2 values are header and view all
    let filter = '<option disabled selected value="all">Year</option><option value="all">View All</option>'
    // Add each year
    Object.keys(years).forEach(year => {
      filter += `<option${year == filters.year ? " selected" : ""}>${year}</option>`
    })
    document.getElementById('yearFilter').innerHTML = filter
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
    document.getElementById("editPublic").checked = response.data.public
    document.getElementById("editNotes").value = response.data.notes
    
    saveMode = "edit"
    currentId = id
    
    // Show the entry view - possible with delete and edit buttons
    if (response.data.canEdit) {
      document.getElementById("btnDelete").style.display = ""
      document.getElementById("btnSave").style.display = ""
    } else {
      document.getElementById("btnDelete").style.display = "none"
      document.getElementById("btnSave").style.display = "none"
    }
    switchToView("entry")
    history.pushState({}, "")
  })
}

// Show the new view
window.showNewView = function(retainValues) {
  // Clear the new form
  if (!retainValues) {
    document.getElementById("editDate").value = ""
    document.getElementById("editCountry").value = "United Kingdom"
  }
  document.getElementById("editPlace").value = ""
  document.getElementById("editNotes").value = ""
  
  saveMode = "new"
  
  // Show the view without the delete button
  document.getElementById("btnDelete").style.display = "none"
  document.getElementById("btnSave").style.display = ""
  switchToView("entry")
  history.pushState({}, "")
}

// Year filter changed
window.yearChanged = function(select) {
  // Get the selected year
  filters.year = select.value
  populateDiary()
}

// Month filter changed
window.monthChanged = function(select) {
  // Get the selected month
  filters.month = select.value
  populateDiary()
}

// Search field changed
window.searchChanged = function(search) {
  filters.search = search.value.toLowerCase()
  populateDiary()
}

// Clear all filters
window.clearFilters = function() {
  document.getElementById("yearFilter").value = "all"
  document.getElementById("monthFilter").value = "all"
  document.getElementById("search").value = ""
  filters.year = "all"
  filters.month = "all"
  filters.search = ""
  
  populateDiary()
}

// Callback save button
window.save = function() {
  // Get details from form
  let date = document.getElementById("editDate").value
  let country = document.getElementById("editCountry").value
  let place = document.getElementById("editPlace").value
  let pub = document.getElementById("editPublic").checked
  let notes = document.getElementById("editNotes").value
  // Either update a record or create a new one
  if (saveMode == "edit") {
    editEntry(date, country, place, pub, notes)
  } else {
    newEntry(date, country, place, pub, notes)
  }
}

// Save edits
let editEntry = function(date, country, place, pub, notes) {
  // Send to server
  axios.post("/edit", {id: currentId, date: date, country: country, place: place, public: pub, notes: notes}).then((response) => {
    // Reload the diary
    window.loadDiary()
  })
}

// Save a new entry
let newEntry = function(date, country, place, pub, notes) {
  // Send to server
  axios.post("/new", {date: date, country: country, place: place, public: pub, notes: notes}).then((response) => {
    // Reload the diary
    window.loadDiary(true)
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

// Listen for back events
window.onpopstate = function(e) {
  // Return to the main page
  showDiary()
}

// Show statistics page
window.showStats = function() {
  // Don't recalculate if already done
  if (window.statsLoaded) {
    switchToView("stats")
    return
  }
  
  // Count the entries
  $("#statTotal").html(diaryEntries.length)
  
  let years = {}
  let min = Infinity
  let max = 0
  let countries = {}
  
  // Loop through each entry
  diaryEntries.forEach(entry => {
    // Get the year
    let year = new Date(parseInt(entry.date)).getFullYear()
    
    // Increment count
    years[year] = years[year] ? years[year] + 1 : 1
    
    // Check min and max
    min = year < min ? year : min
    max = year > max ? year : max
    
    // Get the country
    let country = entry.country
    // The google chart API expects 'United States', not 'USA'
    if (country == "United States of America") {
      country = "United States"
    }
    
    // Increment count
    countries[country] = countries[country] ? countries[country] + 1 : 1
  })
  
  // Fill in the gaps
  for (let i = min; i <= max; i++) {
    if (!years[i]) {
      years[i] = 0
    }
  }
  
  // Split into labels and values
  let labels = []
  let values = []
  for (let year in years) {
    labels.push(year)
    values.push(years[year])
  }
  
  // Create the graph
  let config = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: 'rgba(217, 22, 63)',
        borderColor: 'rgba(217, 22, 63)'
      }]
    },
    options: {
      plugins: {
        legend: {
          display: false
        }
      }
    }
  }

  // If there already is a chart, remove it
  if (statChart) {
    statChart.destroy()
  }
  
  statChart = new Chart('statYears', config)
  
  // Convert countries from object to array
  google.countries = Object.keys(countries).map((key) => [key, countries[key]])
  google.countries.unshift(["Country", "Entries"])
  
  // Add a map of countries
  google.charts.load('current', {
    'packages': ['geochart'],
    'mapsApiKey': 'AIzaSyDWNGv3SU6j99CltSq8o80yl89LmmCnIeU'
  })
  google.charts.setOnLoadCallback(drawMap)
  
  window.statsLoaded = true
  switchToView("stats")
}

// Draw the map of countries
let drawMap = function() {
  let data = google.visualization.arrayToDataTable(google.countries)
  let options = {
    colorAxis: {
      colors: ["#008C23", "#008C23"]
    }
  }
  let chart = new google.visualization.GeoChart(document.getElementById('statCountries'))
  chart.draw(data, options)
}

let switchToView = function(view) {
  // Hide all the views
  document.getElementById("loading").style.display = "none"
  document.getElementById("diary").style.display = "none"
  document.getElementById("entry").style.display = "none"
  document.getElementById("stats").style.display = "none"
  
  // Show the correct view
  document.getElementById(view).style.display = "block"
}
