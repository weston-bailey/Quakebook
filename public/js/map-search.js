window.addEventListener('DOMContentLoaded', () => { renderMap(); });
//all the data from the server
let data = document.getElementById('dataDiv').dataset;
//for the mapbox
let map;
let searchTerms = {
  mag: {
    type: data.magtype,
    value: data.magvalue
  }, 
  time: {
    type: data.timetype
  }
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
    params: { searchTerms }
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
