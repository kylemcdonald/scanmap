import {get, el} from './util';

const toggleEl = document.getElementById('toggle-helicopters');

let markers = {};

function updateMarkers(map, items) {
  if (items.length == 0) {
    toggleEl.innerHTML = 'No helicopters for this region';
  } else {
    let tails = new Set();
    items.forEach((item) => {
      let coords = [item['lng'], item['lat']];
      let tail = item['tail'];
      tails.add(tail);
      if (!(tail in markers)) {
        // Set up map marker for helicopter first time
        markers[tail] = map.addMarker(coords, {
          element: el({
            tag: 'img',
            src: item.url
          }),
          className: 'marker marker-helicopter',
          popup: {
            maxWidth: 'none'
          }
        });
      } else {
        // update marker for helicopters that already exists
        markers[tail].setLngLat(coords);
      }
    });
    // delete any leftover markers
    // if this code causes problems it can be safely deleted
    // because helicopters land much more rarely than page refreshes
    Object.keys(markers).forEach((tail) => {
      if (!tails.has(tail)) {
        delete markers[tail];
      }
    })
  }
}

function updateHelicopters(map) {
  get('helicopters', (json) => {
    updateMarkers(map, json.helicopters);
  });
}

function removeHelicopters() {
  Object.values(markers).forEach((m) => m.remove());
  markers = {};
}

function setupHelicopters(map) {
  let interval;
  toggleEl.addEventListener('click', (ev) => {
    if (ev.target.checked) {
      updateHelicopters(map);
      interval = setInterval(() => {
        updateHelicopters(map);
      }, 10000); // slightly slower than cache to guarantee update
    } else {
      removeHelicopters();
      if (interval) clearInterval(interval);
    }
  });
}

export default setupHelicopters;
