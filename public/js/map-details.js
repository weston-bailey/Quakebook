
window.addEventListener('DOMContentLoaded', () => { renderMap(); });
//all the data from the server
let data = document.getElementById('dataDiv').dataset;
//for the mapbox
let map;

//make a nice looking string out of an epoch timestamp
function localTimeFormat(timeStamp){
  let months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
  let days = [ 'Sun', 'Mon','Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
  let date = new Date(timeStamp);
  let hour = (function() {
    let makeHour = date.getHours() % 12;
    return makeHour === 0 ? 12 : makeHour;
  })();
  let min =  (function() {
    let makeMin = date.getMinutes();
    return makeMin < 10 ? `0${makeMin}` : makeMin;
  })();
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()} ${hour}:${min} ${date.getHours() > 12 ? 'pm' : 'am'}`;
}

//make the mapbox after DOM content loaded
function renderMap(){
  //make a new mapbox
  mapboxgl.accessToken = data.mapkey;
    map = new mapboxgl.Map({
      container: 'map',
      // style: 'mapbox://styles/mapbox/streets-v11',
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [data.latitude, data.longitude],
      // center: [27.2038, 77.5011],
      zoom: 5
  });
  // fetch data after map load
  map.on('load', function() {
    fetchData()
  });
}

//send search terms back to server to get data for map
function fetchData(){
  axios({
    method: 'get',
    url: '/data/details',
    params: {
      search: data.id
    }
  })
  .then( response => {
    detail = response.data;

    let el = document.createElement('img');
    el.class = 'marker';
    el.src = '/img/mapbox-icon.png';
    el.style.width = '4vw';

    var popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h6>${detail.place} </h6> <br />
      <p> <b> mag: ${detail.mag} </b> <br />
      <i> ${localTimeFormat(detail.time)} </i> <br /> `
    );

    new mapboxgl.Marker(el)
    .setLngLat([detail.latitude, detail.longitude])
    .setPopup(popup)
    .addTo(map);
  })
}
