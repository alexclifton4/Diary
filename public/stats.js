let statChart;

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

    // Get the API key from the server
    axios.get("/mapsApiKey").then(response => {
      // Add a map of countries
      google.charts.load('current', {
        'packages': ['geochart'],
        'mapsApiKey': response.data
      })
      google.charts.setOnLoadCallback(drawMap)
      
      window.statsLoaded = true
      switchToView("stats")
    })
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