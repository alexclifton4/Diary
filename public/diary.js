let diaries;
let diaryEntries;
let saveMode;
let currentId;
let filters = {}
filters.year = "all"
filters.month = "all"
filters.search = ""
filters.diaries = []

const MAX_ENTRIES = 100

// Fetch entries from the server and display
window.loadDiary = function(openNewView) {
  // Switch to loading page
  switchToView("loading")
  window.statsLoaded = false
  
  // Get the data from the server
  axios.get("/diary").then((response) => {
    // Loop through diaries
    diaries = response.data.diaries
    let filtersSelect = document.getElementById("diaries")
    let editSelect = document.getElementById("editDiary")
    
    // Loop through diaries
    response.data.diaries.forEach(diary => {
      // Add to dropdown in filters
      let option = document.createElement("option")
      option.innerHTML = diary.name
      option.value = diary.diaryid
      option.selected = true
      filtersSelect.appendChild(option)
      
      // Add to dropdown in edit page
      option = document.createElement("option")
      option.innerHTML = diary.name
      option.value = diary.diaryid
      option.disabled = !diary.write
      editSelect.appendChild(option)
    })
    filters.diaries = diaries.map(x => x.diaryid)
    
    // Add the diary entries
    diaryEntries = response.data.entries
    populateDiary()
    
    if (openNewView) {
      showNewView(true) // true retains the date and country
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
    
    // Loop through entries
    diaryEntries.forEach((entry, index) => {
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
      
      // Diaries
      if (!filters.diaries.includes(entry.diary)) {
        return
      }
      
      // Generate the HTML
      html += `<tr onclick="showEntry(${index})">` // Note: array index, not entry ID
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

// Show a single entry
// Note: Array index, not entry ID
window.showEntry = function(index) {
  let entry = diaryEntries[index]

  document.getElementById("editDate").value = new Date(parseInt(entry.date)).toJSON().slice(0,10);
  document.getElementById("editCountry").value = entry.country
  document.getElementById("editPlace").value = entry.place
  document.getElementById("editDiary").value = entry.diary
  document.getElementById("editNotes").value = entry.notes
  
  saveMode = "edit"
  currentId = entry.rowid
  
  // Show the entry view - possibly with delete and edit buttons
  let canEdit = diaries.find(x => x.diaryid == entry.diary).write
  if (canEdit) {
    document.getElementById("btnDelete").style.display = ""
    document.getElementById("btnSave").style.display = ""
  } else {
    document.getElementById("btnDelete").style.display = "none"
    document.getElementById("btnSave").style.display = "none"
  }
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
  // Ignore case and whitespace
  filters.search = search.value.toLowerCase().trim()

  // Hide the keyboard
  document.activeElement.blur()

  populateDiary()
}

// Diaries filter changed
window.diariesChanged = function() {
  let selected = document.querySelectorAll('#diaries option:checked')
  filters.diaries = Array.from(selected).map(x => x.value)
  
  populateDiary()
}

// Clear all filters
window.clearFilters = function() {
  document.getElementById("yearFilter").value = "all"
  document.getElementById("monthFilter").value = "all"
  document.getElementById("search").value = ""
  document.querySelectorAll("#diaries option").forEach(opt => {
    opt.selected = true
  })
  filters.year = "all"
  filters.month = "all"
  filters.search = ""
  filters.diaries = diaries.map(x => x.diaryid)
  
  populateDiary()
}

// Show the new view
// retainValues only applies to the date and country
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

// Callback save button
window.save = function() {
  // Get details from form
  let date = document.getElementById("editDate").value
  let country = document.getElementById("editCountry").value
  let place = document.getElementById("editPlace").value
  let diary = document.getElementById("editDiary").value
  let notes = document.getElementById("editNotes").value
  // Either update a record or create a new one
  if (saveMode == "edit") {
    editEntry(date, country, place, diary, notes)
  } else {
    newEntry(date, country, place, diary, notes)
  }
}

// Save edits
let editEntry = function(date, country, place, diary, notes) {
  // Send to server
  axios.post("/edit", {id: currentId, date: date, country: country, place: place, diary: diary, notes: notes}).then((response) => {
    // Reload the diary
    window.loadDiary()
  })
}

// Save a new entry
let newEntry = function(date, country, place, diary, notes) {
  // Send to server
  axios.post("/new", {date: date, country: country, place: place, diary: diary, notes: notes}).then((response) => {
    // Reload the diary
    window.loadDiary(true) // true to open the new view
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
  document.getElementById("stats").style.display = "none"
  
  // Show the correct view
  document.getElementById(view).style.display = "block"
}

// Listen for back events
window.onpopstate = function(e) {
  // Return to the main page
  switchToView("diary")
}

// On page load
window.onload = function() {
  // Load the service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('ServiceWorker registration failed: ' + err)
    })
  }

  // Received from the service worker when working offline
  navigator.serviceWorker.addEventListener('message', event => {
    // Hide elements
    document.getElementById("addNew").style.display = "none"
    document.getElementById("editButtons").style.display = "none"

    // Show elements
    document.getElementById("offline").style.display = "block"
    document.getElementById("editOffline").style.display = "block"
  });

  // Load the diary
  loadDiary()
}