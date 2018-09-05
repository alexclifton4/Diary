/*globals axios */

var load = function() {
  let id = window.location.hash.substr(1)
  axios.get('/single?id=' + id).then((response) => {
    //fill in form
    document.getElementsByName('date')[0].value = new Date(response.data.date).toJSON().slice(0,10);
    document.getElementsByName('country')[0].value = response.data.country
    document.getElementsByName('place')[0].value = response.data.place
    document.getElementsByName('notes')[0].value = response.data.notes
    document.getElementsByName('id')[0].value = response.data.id
  })
}

window.addEventListener('load',  function () {
  load()
})