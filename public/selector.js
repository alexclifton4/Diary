/* globals axios */

var init = function() {
  axios.get('/allDiaries').then((response) => {
    let html = "";
    if (response.data == "") {
      html = "No diaries"
    } else {
      for (let i in response.data) {
        if (i != 0) {
          html += "<hr>"
        }
        let name = response.data[i].name
        html += `<button onclick="load('${name}')" class="button button-fill">${name}</button>`
      }
    }
    document.getElementById('diaries').innerHTML = html
  })
}

window.newDiary = function() {
  let name = prompt("Enter a name for the diary:")
  axios.get("/newDiary?name=" + name).then((response) => {
    window.load(name)
  })
}

window.load = function(name) {
  window.location = "/diary#" + name
}

window.onload = init