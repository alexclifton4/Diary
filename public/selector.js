/* globals axios */

var init = function() {
  axios.get('/allDiaries').then((response) => {
    let html;
    if (response.data == "") {
      html = "No diaries"
    } else {
      for (let i in response.data) {
        html += response.data[i].name
      }
    }
    document.getElementById('diaries').innerHTML = html
  })
}

window.newDiary = function() {
  let name = prompt("Enter a name for the diary:")
  axios.get("/newDiary?name=" + name).then((response) => {
    init()
  })
}

window.onload = init