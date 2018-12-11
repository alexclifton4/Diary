/* globals axios */

var init = function() {
  axios.get('/allDiaries').then((response) => {
    let html = "";
    if (response.data == "") {
      html = "No diaries"
    } else {
      for (let i in response.data) {
        let name = response.data[i].name
        html += `<a class="external" href="/diary#${name}">${name}</a>`
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