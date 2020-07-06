window.addEventListener('DOMContentLoaded', () => { renderMap(); });

let latitude = document.getElementById('dataDiv').dataset.latitude;
let longitude = document.getElementById('dataDiv').dataset.longitude;
let mapKey = document.getElementById('dataDiv').dataset.mapkey;
//search result only magnitude 
let mag = document.getElementById('dataDiv').dataset.mag;
// let jsonData = document.getElementById('dataDiv').dataset.test4;
//for the mapbox
let map;

// console.log(matchCenter0);
// console.log(matchCenter1);
//console.log(mapKey);
// console.log(jsonData.length);
console.log(mag)

function getMethods(obj){
  let methods = [];
  for (let prop in obj) {        
      if (typeof obj[prop] == "function" && obj.hasOwnProperty(prop)) {
          methods.push(prop);
      }
  }
  return methods;
}

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
      zoom: 1
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
    url: '/data',
    params: {
      search: mag
    }
  })
  .then( response => {
    earthquakes = Object.entries(response.data);
    // for(let key in response.data){
    //   earthquakes.push(key);
    // }
    console.log(typeof earthquakes)
    //for making points on the map
    earthquakes.forEach(( marker, index) => {
      console.log('called')
      let time = new Date(marker[1].time);
  
      // let div = document.createElement('div');
      // div.innerHTML =       
      // `<h3>${index} ${marker[1].place} </h3> <br />
      // <b> magnitude: ${marker[1].mag} </b> <br />
      // <i> time: ${time} <i> <br />`;
      // document.body.appendChild(div);
  
      let el = document.createElement('img');
      el.class = 'marker';
      el.src = '/img/mapbox-icon.png';
      el.style.width = '2vw';
  
      var popup = new mapboxgl.Popup({ offset: 25 }).setText(
        `${index} ${marker[1].place} \n
        magnitude: ${marker[1].mag} \n
        time: ${time} \n`
      );
  
      new mapboxgl.Marker(el)
      .setLngLat([marker[1].latitude, marker[1].longitude])
      .setPopup(popup)
      .addTo(map);
    })
  })
}
