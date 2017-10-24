var map;
var placeInfo;

var mapOptions = {
  center: {
    lat: 37.3280539,
    lng: -121.893297
  },
  zoom: 12,
};
$(document).ready(function() {
  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  placeInfo = new google.maps.InfoWindow({
    maxWidth: 220
  });
});



//model
var Places = [{
    name: "The Tech Museum of Innovation",
    lat: 37.3314642,
    lng: -121.8903441,
    street: "S Market St",
    city: "San Jose,CA"
  },

  {
    name: "Target",
    lat: 37.3389807,
    lng: -121.9045037,
    street: "Autumn Pkwy",
    city: "San Jose,CA"
  },

  {
    name: "Starbucks Cafe",
    lat: 37.3334056,
    lng: -121.8874031,
    street: "S 2nd St",
    city: "San Jose,CA"
  },

  {
    name: "SUBWAY Restaurants",
    lat: 37.3338961,
    lng: -121.887609,
    street: "S 2nd St",
    city: "San Jose,CA"
  },

  {
    name: "Japanese American Museum of San Jose",
    lat: 37.3475002,
    lng: -121.8937821,
    street: "N 5th St",
    city: "San Jose,CA"
  }

];
//View
var markers = [];

var makeMarker = function(place) {
  var marker;

  marker = new google.maps.Marker({
    map: map,
    position: new google.maps.LatLng(place.lat(), place.lng()),
    animation: google.maps.Animation.DROP,
    title: name,
  });
  //change marker color source(https://stackoverflow.com/questions/7095574/google-maps-api-3-custom-marker-color-for-default-dot-marker)
  marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');

  markers.push(marker);

  marker.addListener('click', function() {
    map.setCenter(marker.getPosition());
    placeInfo.setContent(place.information());
    placeInfo.open(map, marker);
    markers.forEach(function(m) {
      m.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
    });
    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
  });
  return marker;
};


var markerEvent = function(marker, place) {

  map.setCenter(marker.getPosition());
  placeInfo.setContent(place.information());
  placeInfo.open(map, marker);
  markers.forEach(function(m) {
    m.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
  });
  marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
};

//this function return image for a place
var getImgeFormStreetView = function(street, city) {
  return '<img class="streetview" src="http://maps.googleapis.com/maps/api/streetview?size=180x180&location=' + street + ', ' + city + '">';
};


//main ViewModel
var ViewModel = function() {

  var self = this;

  // represent a single place
  self.Place = function(place) {

    var current = this;

    //place info
    current.name = ko.observable(place.name);
    current.lat = ko.observable(place.lat);
    current.lng = ko.observable(place.lng);
    current.street = ko.observable(place.street);
    current.city = ko.observable(place.city);

    //place image
    current.img = ko.observable(getImgeFormStreetView(current.street(), current.city()));

    //wiki links list
    current.wikilist = ko.observable('');

    // wiki API request
    var searchUrl = "http://en.wikipedia.org/w/api.php?action=opensearch&search=" + current.name() + "&format=json&callback=wikiCallBack";
    var listHTML = "<ul>links</ul>";

    $.ajax({
      url: searchUrl,
      dataType: 'jsonp',
      success: function(response) {
        var links = response[1];

        if (links.length === 0) {
          current.wikilist('can not find links');
        } else {
          var listElements = '';
          for (var i = 0; i < links.length; i++) {
            var url = "http://en.Wikipedia.org/wiki/ " + links[i];
            var HTMLurl = '<li><a href="' + url + '">' + links[i] + '</a></li>';
            listElements = listElements.concat(HTMLurl);
            if (i === 3) break;
          }
          listHTML = listHTML.replace('links', listElements);

          current.wikilist(listHTML);
        }
      },
      error: function(err) {
        current.wikilist('request error');
      }
    });


    //compute place information
    current.information = ko.computed(function() {
      var infoHTML = "<div>" + '<h4 class="place-name">' + current.name() + '</h4>' + "<span>" + 'Wikipedia links:<br>' + current.wikilist() + "</span><br> street View image:" + current.img() + "</div>";
      return infoHTML;
    });

    current.marker = makeMarker(current);

    current.showPlaceInfo = function() {
      markerEvent(current.marker, current);
    };
  };

  // represent  all places
  self.myPlaces = [];

  Places.forEach(function(place) {
    self.myPlaces.push(ko.observable(new self.Place(place)));
  });
  //array for all streets
  self.streets = ko.observableArray();
  self.streets.push('select street');
  self.myPlaces.forEach(function(place) {

    if (!self.streets().includes(place().street())) {
      self.streets.push(place().street());
    }

  });
  //selected Street on the dropdown menu
  self.selectedStreet = ko.observable();

  //filter places by street
  self.places = ko.computed(function() {

    var filtered = ko.observableArray();

    self.myPlaces.forEach(function(place) {

      if (place().street() === self.selectedStreet() || self.selectedStreet() === 'select street') {
        place().marker.setVisible(true);
        filtered.push(place());
      } else {
        place().marker.setVisible(false);
      }

    });

    return filtered();
  });

};

$(function() {
  ko.applyBindings(new ViewModel());
});

var googleMapsApiError = function() {
  alert("Ooops Google Maps load error");
};
