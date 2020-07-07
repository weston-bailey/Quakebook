
window.addEventListener('DOMContentLoaded', () => { renderMap(); });

let latitude = document.getElementById('dataDiv').dataset.latitude;
let longitude = document.getElementById('dataDiv').dataset.longitude;
let mapKey = document.getElementById('dataDiv').dataset.mapkey;
//only need the id of one earthquake
let id = document.getElementById('dataDiv').dataset.id;
//for the mapbox
let map;

console.log(latitude);
console.log(longitude);
console.log(mapKey);

console.log(id)

//make the mapbox after DOM content loaded
function renderMap(){
  //make a new mapbox
  mapboxgl.accessToken = mapKey;
    map = new mapboxgl.Map({
      container: 'map',
      // style: 'mapbox://styles/mapbox/streets-v11',
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [latitude, longitude],
      // center: [27.2038, 77.5011],
      zoom: 5
  });
  // fetch data after map load
  map.on('load', function() {
    fetchData()
  });
}

function fetchData(){
  let earthquakes = [];
  axios({
    method: 'get',
    url: '/data/details',
    params: {
      search: id
    }
  })
  .then( response => {
    detail = response.data;
    console.log(detail)

    let time = new Date(detail.time);

    let el = document.createElement('img');
    el.class = 'marker';
    el.src = '/img/mapbox-icon.png';
    el.style.width = '4vw';

    var popup = new mapboxgl.Popup({ offset: 25 }).setText(
      `${detail.place} \n
      magnitude: ${detail.mag} \n
      time: ${time} \n`
    );

    new mapboxgl.Marker(el)
    .setLngLat([detail.latitude, detail.longitude])
    .setPopup(popup)
    .addTo(map);
  })
}
