window.addEventListener('DOMContentLoaded', () => { renderMap(); });
//for setting map style
const MAP_STYLE_SELECT = document.getElementById('map-style-select');
const MAP_STYLE_BUTTON = document.getElementById('map-style-button');
MAP_STYLE_BUTTON.addEventListener('click', (e) => { switchLayer(MAP_STYLE_SELECT.value)}) 
//all the data from the server
let data = document.getElementById('dataDiv').dataset;
//for the mapbox
let map;
//build out search terms object
let searchTerms = {
  mag: {
   type: data.magtype,
   value: data.magvalue
  }, 
  time: {
   type: data.timetype
  }
}

let markerImages = ['lightBlue.png', 'blue.png', 'green.png', 'yellowGreen.png', 'yellow.png', 'orange.png', 'redOrange.png', 'red.png', 'deepRed.png', 'black.png']

// good old clamp
function clamp(x, min, max){
  if (x < min){
      x = min;
    } else if (x > max) {
      x = max;
    } else {
      x = x;
    }
  return x;
}

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
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()} ${hour}:${min} ${date.getHours() >= 12 ? 'pm' : 'am'}`;
}

//change mapbox style
function switchLayer(style) {
  map.setStyle(`mapbox://styles/mapbox/${style}`);
}
 

//make the mapbox after DOM content loaded
function renderMap(){
  //make a new mapbox
  mapboxgl.accessToken = data.mapkey;
   map = new mapboxgl.Map({
     container: 'map',
     // style: 'mapbox://styles/mapbox/streets-v11',
     style: 'mapbox://styles/mapbox/satellite-streets-v11',
     center: [data.latitude, data.longitude],
     // center: [27.2038, 77.5011],
     zoom: 1
  });
  // fetch data after map load
  map.on('load', function() {
   fetchData();
  });
}
//send search terms back to server to get data for map
function fetchData(){
  let earthquakes = [];
  axios({
   method: 'get',
   url: '/data',
   params: { searchTerms }
  })
  .then( response => {
   earthquakes = Object.entries(response.data);

   //for making points on the map
   earthquakes.forEach(( marker, index) => {
    //make an array index from magnitude
    let imageIndex = clamp(Math.floor(marker[1].mag), 0, 10);
    let imagePath = `/img/${markerImages[imageIndex]}`;
    let markerSize = (clamp(marker[1].mag, 2, 10) / 10) * 4; //mult by desired max view width 
    markerSize = `${markerSize}vw`

     let el = document.createElement('img');
     el.class = 'marker';
     el.src = imagePath;
     el.style.width = markerSize;
  
     let popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h6>${marker[1].place} </h6> <br />
      <p> <b> mag: ${marker[1].mag} </b> <br />
      <i> ${localTimeFormat(marker[1].time)} </i> <br /> 
      <a href=/details/${marker[1].id} >Details</a> </p>`
     );
  
     new mapboxgl.Marker(el)
     .setLngLat([marker[1].latitude, marker[1].longitude])
     .setPopup(popup)
     .addTo(map);
   })
  })
}
